// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 일별 차트 타입
export interface DailyChartData {
  date: string;
  chats: number;
  users: number;
}

export interface DailyChartResponse {
  data: DailyChartData[];
}

// 시간대별 차트 타입
export interface HourlyChartData {
  hour: string;
  chats: number;
}

export interface HourlyChartResponse {
  data: HourlyChartData[];
}

// 요일별 차트 타입
export interface WeekdayChartData {
  day: string;
  chats: number;
  users: number;
}

export interface WeekdayChartResponse {
  data: WeekdayChartData[];
}

// 사용자 랭킹 타입
export interface UserRankingData {
  userId: string;
  userName: string;
  chats: number;
}

export interface UserRankingResponse {
  data: UserRankingData[];
} 