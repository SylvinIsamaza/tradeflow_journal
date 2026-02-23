import { TradeSide } from "../types";
import ExcelJS from "exceljs";

export interface ParsedTrade {
  symbol: string;
  side: string; // BUY or SELL
  entry: number;
  exit: number;
  quantity: number;
  entryDate: string;
  exitDate: string;
  profitLoss: number;
  commission?: number;
  swap?: number;
}

/**
 * Convert BUY/SELL to LONG/SHORT enum
 */
export const mapSideToTradeSide = (side: string): TradeSide => {
  const normalizedSide = side.toUpperCase().trim();

  if (
    normalizedSide === "BUY" ||
    normalizedSide === "LONG" ||
    normalizedSide === "IN"
  ) {
    return TradeSide.LONG;
  }

  return TradeSide.SHORT;
};

/**
 * ============================
 * HTML PARSER (MT5 Report)
 * ============================
 * Parses Positions table from MT5 HTML report
 * Handles UTF-8, UTF-16, and other encodings
 */
export const parseMetaTrader5HTML = (html: string): ParsedTrade[] => {
  const trades: ParsedTrade[] = [];

  try {
    // Parse HTML to find Positions section
    // Look for text containing "Positions" in <b> or <th> tags
    const positionsMatch = html.match(
      /(?:<b>|<th[^>]*>)[\s\S]*?Positions[\s\S]*?(?:<\/b>|<\/th>)/i,
    );

    if (!positionsMatch) {
      throw new Error("Positions section header not found");
    }

    // Extract the section between "Positions" and "Orders"
    const positionIndex = html.indexOf(positionsMatch[0]);
    const ordersMatch = html.match(/<b>[\s\S]*?Orders[\s\S]*?<\/b>/i);
    const ordersIndex = ordersMatch ? html.indexOf(ordersMatch[0], positionIndex) : -1;
    
    const endIndex = ordersIndex > positionIndex ? ordersIndex : html.length;
    const positionsSection = html.substring(positionIndex, endIndex);

    // Extract all table rows (data rows with td elements)
    const rowMatches = positionsSection.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi);

    const getText = (cellHtml: string): string => {
      // Remove all HTML tags and decode entities
      return cellHtml
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .trim();
    };

    const getNumber = (cellHtml: string): number => {
      const text = getText(cellHtml)
        .replace(/\s+/g, "") // Remove all whitespace
        .replace(/,/g, "."); // Handle comma as decimal in some locales
      return parseFloat(text) || 0;
    };

    for (const rowMatch of rowMatches) {
      const row = rowMatch[0];

      // Skip header rows (contain <th>)
      if (row.includes("<th")) continue;

      // Extract all td cells
      const cellMatches = Array.from(row.matchAll(/<td[^>]*>[\s\S]*?<\/td>/gi));

      // Filter out hidden cells
      const cells = cellMatches
        .filter((match) => !match[0].includes('class="hidden"'))
        .map((match) => match[0]);

      if (cells.length < 13) continue; // Need at least 13 columns

      try {
        // Extract values based on column index (matching MT5 export format)
        // [0]=open_time, [1]=position, [2]=symbol, [3]=type, [4]=volume, [5]=open_price,
        // [6]=stop_loss, [7]=take_profit, [8]=close_time, [9]=close_price,
        // [10]=commission, [11]=swap, [12]=profit

        const entryTime = getText(cells[0]);
        const symbol = getText(cells[2]).toUpperCase();
        const type = getText(cells[3]).toLowerCase();
        const volume = getNumber(cells[4]);
        const entryPrice = getNumber(cells[5]);
        const exitTime = getText(cells[8]);
        const exitPrice = getNumber(cells[9]);
        const commission = getNumber(cells[10]);
        const swap = getNumber(cells[11]);
        const profitLoss = getNumber(cells[12]);

        // Validate trade data
        if (!symbol || !entryPrice || !exitPrice || !volume || !exitTime) {
          continue;
        }

        trades.push({
          symbol,
          side: type === "buy" || type === "in" ? "BUY" : "SELL",
          entry: entryPrice,
          exit: exitPrice,
          quantity: volume,
          entryDate: convertMT5DateFormat(entryTime),
          exitDate: convertMT5DateFormat(exitTime),
          profitLoss,
          commission,
          swap,
        });
      } catch (error) {
        // Skip malformed rows
        continue;
      }
    }

    if (trades.length === 0) {
      throw new Error("No valid trades found in Positions section");
    }

    return trades;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse MetaTrader 5 HTML report");
  }
};

/**
 * ============================
 * EXCEL PARSER (MT5 XLSX)
 * ============================
 * Parses Positions section from MT5 Excel (.xlsx) report
 * Detects header row and extracts data until Orders section
 */
export const parseMetaTrader5Excel = async (
  file: File,
): Promise<ParsedTrade[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const trades: ParsedTrade[] = [];

    // Use first worksheet or find one with data
    let worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error("No worksheet found in Excel file");

    let headerRowIndex = -1;
    let headerRow: Record<string, number> = {};

    // Find "Positions" header row (scan first 20 rows)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 20) return;
      if (headerRowIndex !== -1) return; // Already found
      
      let rowText = "";
      row.eachCell((cell) => {
        rowText += String(cell.value || "") + " ";
      });
      
      if (rowText.toLowerCase().includes("positions")) {
        // Found "Positions" - next row is headers
        headerRowIndex = rowNumber + 1;
      }
    });

    // If no "Positions" header found, use row 1
    if (headerRowIndex === -1) {
      headerRowIndex = 1;
    }

    // Extract header row mapping (column name -> column number)
    const headerRow_ = worksheet.getRow(headerRowIndex);
    headerRow_.eachCell((cell, colNumber) => {
      const header = String(cell.value || "")
        .toLowerCase()
        .trim();
      if (header) {
        headerRow[header] = colNumber;
      }
    });

    if (Object.keys(headerRow).length === 0) {
      throw new Error("Could not find header row in Excel file");
    }

    const getCellValue = (
      row: ExcelJS.Row,
      keys: string[],
    ): string | number | null => {
      for (const key of keys) {
        const col = headerRow[key];
        if (col) {
          const val = row.getCell(col).value;
          if (val === null || val === undefined) continue;

          // Handle ExcelJS union type
          if (typeof val === "string" || typeof val === "number") {
            return val;
          }
          // Convert other types (boolean, Date, etc) to string
          return String(val);
        }
      }
      return null;
    };

    // Extract data rows (starting after header)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= headerRowIndex) return;

      // Check if row is empty or starts a new section
      const firstCell = row.getCell(1).value;
      if (!firstCell) return;

      const firstCellText = String(firstCell).toLowerCase();

      // Stop at "Orders" section
      if (firstCellText.includes("orders")) return;

      // Skip header-like rows
      if (firstCellText.includes("symbol") || firstCellText.includes("type")) {
        return;
      }

      try {
        const symbol = String(
          getCellValue(row, ["symbol", "pair", "instrument", "ticket"]),
        ).toUpperCase();

        if (!symbol || symbol === "NULL" || symbol === "UNDEFINED") return;

        const type = String(
          getCellValue(row, ["type", "direction", "side"]),
        ).toLowerCase();

        const volume =
          parseFloat(
            String(getCellValue(row, ["volume", "lot", "size", "qty"])),
          ) || 0;

        const entryPrice =
          parseFloat(
            String(
              getCellValue(row, [
                "open price",
                "entry price",
                "price",
                "openprice",
              ]),
            ),
          ) || 0;

        const exitPrice =
          parseFloat(
            String(
              getCellValue(row, ["close price", "exit price", "closeprice"]),
            ),
          ) || 0;

        const entryTime = getCellValue(row, [
          "open time",
          "time",
          "opentime",
          "date",
        ]);
        const exitTime = getCellValue(row, [
          "close time",
          "exit time",
          "closetime",
        ]);

        const profitLoss =
          parseFloat(String(getCellValue(row, ["profit", "p&l", "pnl"]))) || 0;

        const commission =
          parseFloat(String(getCellValue(row, ["commission", "fee"]))) || 0;

        const swap = parseFloat(String(getCellValue(row, ["swap"]))) || 0;

        // Skip invalid or open trades
        if (!symbol || !entryPrice || !exitPrice || !volume || !exitTime) {
          return;
        }

        trades.push({
          symbol,
          side: type === "buy" || type === "in" ? "BUY" : "SELL",
          entry: entryPrice,
          exit: exitPrice,
          quantity: volume,
          entryDate: convertMT5DateFormat(String(entryTime)),
          exitDate: convertMT5DateFormat(String(exitTime)),
          profitLoss,
          commission,
          swap,
        });
      } catch (error) {
        // Skip malformed rows
      }
    });

    if (trades.length === 0) {
      throw new Error("No valid trades found in Excel file");
    }

    return trades;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to parse MetaTrader 5 Excel file");
  }
};

/**
 * ============================
 * DATE FORMATTER
 * ============================
 */
const convertMT5DateFormat = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0];

  const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  return new Date().toISOString().split("T")[0];
};

/**
 * ============================
 * FINAL VALIDATION
 * ============================
 */
export const validateTrades = (trades: ParsedTrade[]): ParsedTrade[] => {
  return trades.filter((trade) => {
    return (
      trade.symbol &&
      trade.entry > 0 &&
      trade.exit > 0 &&
      trade.quantity > 0 &&
      trade.entryDate &&
      trade.exitDate
    );
  });
};
