// ============================================
// TradeZella Clone - Frontend Type Definitions
// Complete coverage of database models
// ============================================

// --------------------------------------------
// 1. Users (model.md section 1)
// --------------------------------------------
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  
  // Authentication
  passwordHash?: string;
  isTwoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  passwordResetToken?: string;
  passwordResetExpires?: string;
  lastPasswordReset?: string;
  failedLoginAttempts?: number;
  lockUntil?: string;
  
  // Profile fields
  name?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  avatarUrl?: string;
}

// Auth-related types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface PasswordResetRequest {
  email?: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  code: string;
  backupCode?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  requiresTwoFactor?: boolean;
  error?: string;
}

// --------------------------------------------
// 2. Accounts (model.md section 2)
// --------------------------------------------
export enum AccountType {
  DEMO = 'DEMO',
  LIVE = 'LIVE',
  PROP = 'PROP'
}

export interface Account {
  id: string;
  userId: string;
  brokerName: string;
  baseCurrency: string;
  name: string; // display name
  type: AccountType;
  createdAt: string;
}

// --------------------------------------------
// 3. Trades (model.md section 3)
// --------------------------------------------
export enum TradeSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum TradeStatus {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BE = 'BE' // Break Even
}

export enum TradeType {
  DAY_TRADE = 'Day Trade',
  SCALP = 'Scalp',
  SWING = 'Swing',
  POSITION = 'Position'
}

export enum ExecutionType {
  MARKET = 'Market',
  LIMIT = 'Limit',
  STOP = 'Stop',
  STOP_LIMIT = 'Stop Limit'
}

export interface Trade {
  id: string;
  accountId: string;
  symbol: string; // Trading pair
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  closePrice: number;
  quantity: number;
  pnl: number; // Profit/Loss
  commission: number;
  swap: number;
  duration: string; // e.g., "1h 30m"
  tradeType: string;
  executionType: string;
  status: TradeStatus;
  stopLoss: number;
  takeProfit: number;
  setups: string[]; // Linked strategies
  generalTags: string[];
  exitTags: string[];
  processTags: string[];
  notes?: string;
  executedAt: string; // Execution timestamp
  closedAt?: string; // Close timestamp (when trade was closed)
  date: string; // ISO string YYYY-MM-DD
  time?: string; // HH:mm
  closeTime?: string; // HH:mm when trade was closed
}

// --------------------------------------------
// 4. Summary Tables (model.md section 4)
// --------------------------------------------

// 4.1 Account Daily Stats
export interface DailySummary {
  // Primary key
  accountId: string;
  date: string;
  
  // Core metrics
  totalPnL: number;
  totalTrades: number;
  missedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  
  // Win/Loss metrics
  averageWin: number;
  averageLoss: number;
  averageRR: number; // Average Risk Reward ratio
  bestWin: number;
  worstLoss: number;
  
  // Duration
  averageTradeDuration: string;
  
  // Streaks
  avgWinStreak: number;
  maxWinStreak: number;
  avgLossStreak: number;
  maxLossStreak: number;
  
  // Risk metrics
  recoveryFactor: number;
  maxDrawdown: number;
  
  // Volume & fees
  totalVolume: number;
  totalCommission: number;
  
  // Zella Scores (0-100)
  zellaScore: number;
  winRateScore: number;
  profitFactorScore: number;
  avgWinLossScore: number;
  recoveryFactorScore: number;
  maxDrawdownScore: number;
  
  // Relations
  tradeIds: string[];
  totalComments: number;
  
  // Display helpers (optional - computed)
  hasDailyComment?: boolean;
  hasWeeklyComment?: boolean;
  tradeCount?: number; // Alias for totalTrades
}

// 4.2 Account Monthly Stats
export interface MonthStats {
  // Primary key
  accountId: string;
  month: string; // YYYY-MM (first day of month)
  
  // Core metrics
  totalPnL: number;
  totalTrades: number;
  missedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  
  // Win/Loss metrics
  averageWin: number;
  averageLoss: number;
  averageRR: number;
  bestWin: number;
  worstLoss: number;
  
  // Duration
  averageTradeDuration: string;
  
  // Streaks
  avgWinStreak: number;
  maxWinStreak: number;
  avgLossStreak: number;
  maxLossStreak: number;
  
  // Risk metrics
  recoveryFactor: number;
  maxDrawdown: number;
  
  // Volume & fees
  totalVolume: number;
  totalCommission: number;
  
  // Zella Scores
  zellaScore: number;
  winRateScore: number;
  profitFactorScore: number;
  avgWinLossScore: number;
  recoveryFactorScore: number;
  maxDrawdownScore: number;
  
  // Relations
  tradeIds: string[];
  totalComments: number;
  
  // Display helpers
  winningDays?: number;
  losingDays?: number;
}

// 4.3 Account All-Time Stats
export interface AllTimeStats {
  accountId: string;
  totalPnL: number;
  totalTrades: number;
  missedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  averageRR: number;
  bestWin: number;
  worstLoss: number;
  averageTradeDuration: string;
  avgWinStreak: number;
  maxWinStreak: number;
  avgLossStreak: number;
  maxLossStreak: number;
  recoveryFactor: number;
  maxDrawdown: number;
  totalVolume: number;
  totalCommission: number;
  zellaScore: number;
  winRateScore: number;
  profitFactorScore: number;
  avgWinLossScore: number;
  recoveryFactorScore: number;
  maxDrawdownScore: number;
  updatedAt: string;
}

// --------------------------------------------
// 5. Comments (model.md section 5)
// --------------------------------------------
export type CommentType = 'daily' | 'weekly';

export interface JournalComment {
  id: string;
  accountId: string;
  tradeId?: string; // Optional trade link
  userId: string;
  parentId?: string; // For replies
  date: string;
  type: CommentType;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// 5.2 Comments Daily Summary
export interface CommentsDailySummary {
  accountId: string;
  date: string;
  totalComments: number;
}

// 5.3 Comments Monthly Summary
export interface CommentsMonthlySummary {
  accountId: string;
  month: string;
  totalComments: number;
}

// --------------------------------------------
// 6. Files (model.md section 6)
// --------------------------------------------
export interface File {
  id: string;
  accountId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string; // MIME type
  uploadedAt: string;
}

// --------------------------------------------
// 7. Notifications (model.md section 7)
// --------------------------------------------
export enum NotificationType {
  TRADE = 'TRADE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  INSIGHT = 'INSIGHT',
  SYSTEM = 'SYSTEM',
  IMPORT = 'IMPORT'
}

export interface Notification {
  id: string;
  accountId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// --------------------------------------------
// 8. Background Jobs (model.md section 8)
// --------------------------------------------
export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum JobType {
  AGGREGATE_DAILY_STATS = 'AGGREGATE_DAILY_STATS',
  AGGREGATE_MONTHLY_STATS = 'AGGREGATE_MONTHLY_STATS',
  IMPORT_TRADES = 'IMPORT_TRADES',
  GENERATE_REPORT = 'GENERATE_REPORT',
  SYNC_BROKER = 'SYNC_BROKER'
}

export interface BackgroundJob {
  id: string;
  jobType: JobType;
  payload?: Record<string, any>;
  status: JobStatus;
  scheduledAt?: string;
  finishedAt?: string;
}

// --------------------------------------------
// 9. Strategies (model.md section 9)
// --------------------------------------------
export interface Strategy {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  entryRules: string[];
  exitRules: string[];
  riskRules: string[];
  color: string;
  createdAt: string;
}

// --------------------------------------------
// 10. Notes (model.md section 10)
// --------------------------------------------
export interface Folder {
  id: string;
  accountId: string;
  name: string;
  createdAt: string;
}

export interface Note {
  id: string;
  accountId: string;
  folderId: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  createdAt: string;
  updatedAt?: string;
}

// --------------------------------------------
// 11. AI Insights (model.md section 11)
// --------------------------------------------
export enum InsightType {
  PERFORMANCE = 'PERFORMANCE',
  PSYCHOLOGY = 'PSYCHOLOGY',
  STRATEGY = 'STRATEGY'
}

export interface AIInsight {
  id: string;
  accountId: string;
  date: string;
  title: string;
  content: string;
  type: InsightType;
  createdAt: string;
}

// --------------------------------------------
// 12. Tags (model.md section 12)
// --------------------------------------------
export enum TagType {
  SETUP = 'SETUP',
  GENERAL = 'GENERAL',
  EXIT = 'EXIT',
  PROCESS = 'PROCESS'
}

export interface Tag {
  id: string;
  accountId: string;
  name: string;
  type: TagType;
  strategyId?: string; // For SETUP type
  color?: string;
  createdAt: string;
}

// --------------------------------------------
// 13. Session Analytics (model.md section 13)
// --------------------------------------------
export enum SessionName {
  LONDON = 'LONDON',
  NEW_YORK = 'NEW_YORK',
  ASIA = 'ASIA',
  OTHER = 'OTHER'
}

// 13.1 Trading Sessions
export interface TradingSession {
  id: string;
  accountId: string;
  name: SessionName;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
}

// 13.2 Daily Session Stats
export interface DailySessionStats {
  accountId: string;
  date: string;
  sessionName: SessionName;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  tradeIds: string[];
}

// 13.3 Monthly Session Stats
export interface MonthlySessionStats {
  accountId: string;
  month: string;
  sessionName: SessionName;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
}

// --------------------------------------------
// 14. Streak Analytics (model.md section 14)
// --------------------------------------------
export interface StreakRecord {
  id: string;
  accountId: string;
  date: string;
  currentWinStreak: number;
  maxWinStreak: number;
  currentLossStreak: number;
  maxLossStreak: number;
  averageWinStreak: number;
  averageLossStreak: number;
}

// --------------------------------------------
// 15. Time-Based Analytics (model.md section 15)
// --------------------------------------------

// 15.1 P&L By Time Interval
export interface PnLByTimeInterval {
  id: string;
  accountId: string;
  date: string;
  intervalStart: string; // HH:mm
  intervalEnd: string; // HH:mm
  totalPnL: number;
  totalTrades: number;
}

// 15.2 P&L By Day of Week
export interface PnLByDayOfWeek {
  accountId: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
}

// 15.3 P&L By Time Held
export interface PnLByTimeHeld {
  accountId: string;
  durationRange: string; // e.g., "0-30m", "30m-1h"
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
}

// --------------------------------------------
// 16. Weekly Analytics (model.md section 16)
// --------------------------------------------
export interface WeeklyStats {
  id: string;
  accountId: string;
  weekStart: string; // Monday date
  weekNumber: number;
  year: number;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  tradeIds: string[];
}

// --------------------------------------------
// 17. Strategy Analytics (model.md section 17)
// --------------------------------------------

// 17.1 Strategy Daily Stats
export interface StrategyDailyStats {
  id: string;
  accountId: string;
  strategyId: string;
  date: string;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  tradeIds: string[];
}

// 17.2 Strategy Monthly Stats
export interface StrategyMonthlyStats {
  id: string;
  accountId: string;
  strategyId: string;
  month: string;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  tradeIds: string[];
}

// 17.3 Strategy All-Time Stats
export interface StrategyAllTimeStats {
  id: string;
  accountId: string;
  strategyId: string;
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  updatedAt: string;
}

// --------------------------------------------
// Utility Types
// --------------------------------------------
export interface DateRange {
  start: string;
  end: string;
  label: string;
}

export interface Filters {
  symbols: string[];
  sides: TradeSide[];
}

export type ReportTab = 'Time' | 'Day' | 'Month' | 'Symbol' | 'Tags' | 'Setups';

export interface Message {
  role: 'user' | 'model';
  text: string;
}
