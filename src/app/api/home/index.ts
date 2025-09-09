import axios from 'axios';
import { DailyStatsParams, DailyStatsResponse, DailyStats } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ibkai.fingerservice.co.kr/api';

export const homeApi = {
  // 일일 통계 데이터 조회
  getDailyStats: async (params: DailyStatsParams): Promise<DailyStats> => {
    try {
      console.log('Requesting URL:', `${BASE_URL}/home/daily-stats`, 'with params:', params);  // 요청 URL과 파라미터 로깅
      const response = await axios.get<DailyStatsResponse>(
        `${BASE_URL}/home/daily-stats`,
        { params }
      );
      console.log('Response:', response.data);  // 응답 데이터 로깅
      return response.data.data;  // ApiResponse의 data 필드를 반환
    } catch (error) {
      console.error('API Error details:', error);  // 상세 에러 로깅
      throw error;
    }
  },
}; 