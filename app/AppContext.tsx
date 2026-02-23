"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  Trade,
  DailySummary,
  Strategy,
  Account,
  User,
  DateRange,
  Filters,
  TradeSide,
  TradeStatus,
  AccountType,
  UserRole,
  AuthResult,
  AuthTokens,
} from "@/types";
import { authApi } from "@/lib/api/auth";

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<AuthResult>;
  
  // State
  user: User | null;
  trades: Trade[];
  strategies: Strategy[];
  accounts: Account[];
  selectedAccount: Account;
  dateRange: DateRange;
  filters: Filters;
  currency: string;
  filteredTrades: Trade[];
  dailySummaries: Record<string, DailySummary>;

  // Actions
  setUser: (user: User | null) => void;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;

  setStrategies: (strategies: Strategy[]) => void;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (strategy: Strategy) => void;
  deleteStrategy: (id: string) => void;

  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account) => void;
  setDateRange: (range: DateRange) => void;
  setFilters: (filters: Filters) => void;
  setCurrency: (currency: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);



// Accounts with full database fields
const ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    userId: "user-1",
    brokerName: "Demo Broker",
    baseCurrency: "USD",
    name: "Demo account",
    type: AccountType.DEMO,
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "acc-2",
    userId: "user-1",
    brokerName: "FTMO",
    baseCurrency: "USD",
    name: "Live Prop #1",
    type: AccountType.PROP,
    createdAt: "2024-02-15T00:00:00Z"
  },
  {
    id: "acc-3",
    userId: "user-1",
    brokerName: "Binance",
    baseCurrency: "USDT",
    name: "Binance Spot",
    type: AccountType.LIVE,
    createdAt: "2024-03-01T00:00:00Z"
  },
];

const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: "strat-1",
    accountId: "acc-1",
    name: "Bullish Breakout",
    color: "#5e5ce6",
    entryRules: [
      "Above previous day high",
      "Volume > 2x average",
      "5m candle close above level",
    ],
    exitRules: ["1:2 RR Target", "Trailing stop below EMA"],
    riskRules: ["Max 1% risk per trade", "No news within 30m"],
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "strat-2",
    accountId: "acc-1",
    name: "Mean Reversion",
    color: "#10b981",
    entryRules: ["RSI Oversold < 30", "Touch of lower Bollinger Band"],
    exitRules: ["Touch of VWAP", "5m divergence on MACD"],
    riskRules: ["Max 0.5% risk", "Scalp only"],
    createdAt: "2024-01-15T00:00:00Z",
  },
];

const INITIAL_TRADES: Trade[] = [
  {
    id: "1",
    accountId: "acc-1",
    date: "2024-06-28",
    time: "09:30",
    symbol: "GBPUSD",
    side: TradeSide.LONG,
    entryPrice: 1.265,
    exitPrice: 1.268,
    closePrice: 1.268,
    quantity: 100000,
    pnl: 300.0,
    duration: "1h 30m",
    tradeType: "Day Trade",
    executionType: "Market",
    status: TradeStatus.WIN,
    stopLoss: 1.263,
    takeProfit: 1.27,
    commission: 7.0,
    swap: 0,
    setups: ["Bullish Breakout"],
    generalTags: ["Trend"],
    exitTags: ["Target Hit"],
    processTags: ["Followed Plan"],
    executedAt: "2024-06-28T09:30:00Z",
  },
  {
    id: "2",
    accountId: "acc-1",
    date: "2024-06-28",
    time: "14:15",
    symbol: "GBPUSD",
    side: TradeSide.SHORT,
    entryPrice: 1.269,
    exitPrice: 1.27,
    closePrice: 1.27,
    quantity: 50000,
    pnl: -50.0,
    duration: "45m",
    tradeType: "Scalp",
    executionType: "Market",
    status: TradeStatus.LOSS,
    stopLoss: 1.271,
    takeProfit: 1.265,
    commission: 3.5,
    swap: 0,
    setups: ["Bullish Breakout"],
    generalTags: ["Counter-trend"],
    exitTags: ["Stop Loss Hit"],
    processTags: ["Emotional"],
    executedAt: "2024-06-28T14:15:00Z",
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<Account>(ACCOUNTS[0]);
  const [dateRange, setDateRange] = useState<DateRange>({
    label: "All Time",
    start: "2000-01-01",
    end: "2030-12-31",
  });
  const [filters, setFilters] = useState<Filters>({ symbols: [], sides: [] });
  const [currency, setCurrency] = useState("USD");

  // Check auth on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Auth functions
  const login = async (email: string, password: string, twoFactorCode?: string) => {
    const result = await authApi.login({ username: email, password, twoFactorCode });
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await authApi.register(email, password, name);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const matchAccount = t.accountId === selectedAccount.id;
      const matchDate = t.date >= dateRange.start && t.date <= dateRange.end;
      const matchSide =
        filters.sides.length === 0 || filters.sides.includes(t.side);
      const matchSymbol =
        filters.symbols.length === 0 || filters.symbols.includes(t.symbol);
      return matchAccount && matchDate && matchSide && matchSymbol;
    });
  }, [trades, selectedAccount, dateRange, filters]);
  
  const dailySummaries = useMemo(() => {
    const summaries: Record<string, DailySummary> = {};
    
    filteredTrades.forEach((trade) => {
      if (!summaries[trade.date]) {
        // Initialize with all required fields from database model
        summaries[trade.date] = {
          accountId: trade.accountId,
          date: trade.date,
          totalPnL: 0,
          totalTrades: 0,
          missedTrades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          profitFactor: 0,
          averageWin: 0,
          averageLoss: 0,
          averageRR: 0,
          bestWin: 0,
          worstLoss: 0,
          averageTradeDuration: '0',
          avgWinStreak: 0,
          maxWinStreak: 0,
          avgLossStreak: 0,
          maxLossStreak: 0,
          recoveryFactor: 0,
          maxDrawdown: 0,
          totalVolume: 0,
          totalCommission: 0,
          zellaScore: 0,
          winRateScore: 0,
          profitFactorScore: 0,
          avgWinLossScore: 0,
          recoveryFactorScore: 0,
          maxDrawdownScore: 0,
          tradeIds: [],
          totalComments: 0,
        };
      }
      
      const summary = summaries[trade.date];
      summary.totalPnL += trade.pnl;
      summary.totalTrades += 1;
      summary.tradeIds.push(trade.id);
      
      if (trade.pnl > 0) {
        summary.wins += 1;
        if (trade.pnl > summary.bestWin) {
          summary.bestWin = trade.pnl;
        }
      } else if (trade.pnl < 0) {
        summary.losses += 1;
        if (trade.pnl < summary.worstLoss) {
          summary.worstLoss = trade.pnl;
        }
      }
      
      summary.totalCommission += trade.commission;
      summary.totalVolume += trade.quantity * trade.entryPrice;
    });
    
    // Calculate derived fields
    Object.values(summaries).forEach((summary) => {
      const { wins, losses, totalTrades, totalPnL } = summary;
      
      // Win rate
      summary.winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      
      // Profit factor
      const winsTotal = filteredTrades
        .filter(t => t.date === summary.date && t.pnl > 0)
        .reduce((acc, t) => acc + t.pnl, 0);
      const lossesTotal = Math.abs(filteredTrades
        .filter(t => t.date === summary.date && t.pnl < 0)
        .reduce((acc, t) => acc + t.pnl, 0));
      summary.profitFactor = lossesTotal > 0 ? winsTotal / lossesTotal : winsTotal > 0 ? 100 : 0;
      
      // Average win/loss
      summary.averageWin = wins > 0 ? winsTotal / wins : 0;
      summary.averageLoss = losses > 0 ? lossesTotal / losses : 0;
      
      // Average RR
      summary.averageRR = summary.averageLoss > 0
        ? Math.abs(summary.averageWin / summary.averageLoss)
        : 0;
    });
    
    return summaries;
  }, [filteredTrades]);

  const contextValue: AppContextType = {
    // Auth
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    
    // State
    user,
    trades,
    strategies,
    accounts,
    selectedAccount,
    dateRange,
    filters,
    currency,
    filteredTrades,
    dailySummaries,

    setUser,
    setTrades,
    addTrade: (trade) => setTrades((prev) => [...prev, trade]),
    updateTrade: (trade) =>
      setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t))),
    deleteTrade: (id) =>
      setTrades((prev) => prev.filter((t) => t.id !== id)),

    setStrategies,
    addStrategy: (strategy) => setStrategies((prev) => [...prev, strategy]),
    updateStrategy: (strategy) =>
      setStrategies((prev) =>
        prev.map((s) => (s.id === strategy.id ? strategy : s)),
      ),
    deleteStrategy: (id) =>
      setStrategies((prev) => prev.filter((s) => s.id !== id)),

    setAccounts,
    setSelectedAccount,
    setDateRange,
    setFilters,
    setCurrency,
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
