// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 날짜 필터 타입
export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

// 채팅 분석 관련 타입들
export interface ChatAnalyticsParams extends DateRangeParams {
  period?: 'daily' | 'weekly' | 'monthly';
  displayCount?: number;
}

// 클릭 분석 관련 타입들
export interface ClickAnalyticsParams extends DateRangeParams {
  sortBy?: 'clicks' | 'chats';
}

// 채팅 내용 조회 관련 타입들
export interface ChatContentParams extends DateRangeParams {
  userId?: string;
  isStock?: boolean;
  keyword?: string;
  page?: number;
  rowsPerPage?: number;
} 