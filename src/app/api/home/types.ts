import { ApiResponse, DateRangeParams } from '../types'

// 단일 날짜 파라미터
export interface DailyStatsParams {
  date: string;
}

// 응답 타입들
export interface DailyStats {
  chatCount: number;
  chatCountDiff: number;  // 전일 대비 증감률
  userCount: number;
  userCountDiff: number;
  mediaRatio: {
    mts: { count: number; ratio: number; };
    iOneBank: { count: number; ratio: number; };
  };
  predictionStats: {
    correct: number;
    incorrect: number;
    accuracy: number;
  };
}

export type DailyStatsResponse = ApiResponse<DailyStats>; 