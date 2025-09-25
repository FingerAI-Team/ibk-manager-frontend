import { NextRequest, NextResponse } from 'next/server';
import { logQAMapping, logConvData } from '@/utils/logger';
import { ChatData, ChatResponse } from '../chat/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ibkai.fingerservice.co.kr/api';

// QA 매핑 시뮬레이션 함수 (실제 구현에서는 AI/ML 모델 사용)
function simulateQAMapping(question: string): {
  status: 'success' | 'failed' | 'partial';
  details?: {
    matchedKeywords: string[];
    confidence: number;
    source: string;
  };
} {
  const startTime = Date.now();
  
  // 간단한 키워드 매칭 시뮬레이션
  const stockKeywords = ['삼성전기', '주가', '영업이익', '매출', '배당', '종목'];
  const matchedKeywords = stockKeywords.filter(keyword => 
    question.includes(keyword)
  );
  
  const processingTime = Date.now() - startTime;
  
  if (matchedKeywords.length >= 2) {
    return {
      status: 'success',
      details: {
        matchedKeywords,
        confidence: Math.min(0.9, matchedKeywords.length * 0.3),
        source: 'keyword_matching'
      }
    };
  } else if (matchedKeywords.length === 1) {
    return {
      status: 'partial',
      details: {
        matchedKeywords,
        confidence: 0.5,
        source: 'keyword_matching'
      }
    };
  } else {
    return {
      status: 'failed',
      details: {
        matchedKeywords: [],
        confidence: 0.1,
        source: 'keyword_matching'
      }
    };
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // 외부 API 호출
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      startDate,
      endDate
    });
    
    const apiUrl = `${API_BASE_URL}/chats?${queryParams}`;
    console.log('🔗 외부 API 호출:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    const data: ChatResponse = await response.json();
    const processingTime = Date.now() - startTime;
    
    // 각 대화 데이터에 대해 QA 매핑 및 로깅
    for (const chatItem of data.items) {
      // QA 매핑 시뮬레이션
      const mappingResult = simulateQAMapping(chatItem.question);
      
      // QA 매핑 로그 기록
      logQAMapping({
        chatId: chatItem.id,
        userId: chatItem.userId,
        question: chatItem.question,
        answer: chatItem.answer,
        isStock: chatItem.isStock,
        mappingStatus: mappingResult.status,
        mappingDetails: mappingResult.details,
        processingTime: Math.random() * 100 + 50 // 시뮬레이션된 처리시간
      });
      
      // 대화 로그 기록
      logConvData({
        chatId: chatItem.id,
        userId: chatItem.userId,
        question: chatItem.question,
        answer: chatItem.answer,
        isStock: chatItem.isStock,
        requestParams: {
          startDate,
          endDate,
          page,
          pageSize
        },
        responseMetadata: {
          totalCount: data.total,
          currentPage: page,
          hasMore: (page + 1) * pageSize < data.total
        }
      });
    }
    
    console.log(`✅ 로깅 완료: ${data.items.length}개 대화 처리`);
    
    return NextResponse.json({
      ...data,
      metadata: {
        processingTime,
        loggedAt: new Date().toISOString(),
        qaMappingApplied: true
      }
    });
    
  } catch (error) {
    console.error('❌ API 에러:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
