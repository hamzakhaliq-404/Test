export interface LeaderboardEntry {
  username: string;
  maxRate: number;
  averageRate: number;
  date: string;
  dataPoints: number;
}

export interface UserScore {
  rate: number;
  timestamp: number;
}