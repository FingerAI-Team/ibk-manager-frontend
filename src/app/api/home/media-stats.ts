import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ibkai.fingerservice.co.kr/api';

export interface MediaStats {
  mts: {
    count: number;
    ratio: number;
  };
  iOneBank: {
    count: number;
    ratio: number;
  };
}

export interface MediaStatsResponse {
  success: boolean;
  data: MediaStats;
}

export const mediaStatsApi = {
  // 매체별 통계 데이터 조회
  getMediaStats: async (date: string): Promise<MediaStats> => {
    try {
      console.log('Requesting media stats for date:', date);
      const response = await axios.get<MediaStatsResponse>(
        `${BASE_URL}/home/media-stats`,
        { params: { date } }
      );
      console.log('Media stats response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Media stats API Error:', error);
      // 기본값 반환
      return {
        mts: { count: 0, ratio: 0 },
        iOneBank: { count: 0, ratio: 0 }
      };
    }
  },
};

