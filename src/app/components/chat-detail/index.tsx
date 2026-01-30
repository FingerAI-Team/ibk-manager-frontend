import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { ChatList } from './chat-list';
import { ChatDetail } from './chat-detail';
import { fetchChatList } from '@/app/api/chat';
import type { ChatData } from '@/app/api/chat/types';

export const ChatDetailTab: React.FC = () => {
  const [chatList, setChatList] = useState<ChatData[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set()); // 로드된 페이지 캐시
  const [pageCache, setPageCache] = useState<Map<number, ChatData[]>>(new Map()); // 페이지별 데이터 캐시
  const pageSize = 10; // 한 페이지당 10개

  // 초기 데이터 로드 (전체 대화 내역)
  useEffect(() => {
    loadAllChats();
  }, []);

  // 페이지 변경 시 데이터 로드 (캐시 확인)
  useEffect(() => {
    loadPageData(currentPage);
  }, [currentPage]);

  const loadAllChats = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 API 호출: 대화 내역 로드 (페이지:', currentPage + 1, ')');
      
      // 전체 대화 내역 로드 (9월 17일부터 오늘까지)
      const today = new Date();
      const startDate = '2025-09-17'; // 9월 17일부터
      const endDate = today.toISOString().split('T')[0]; // 오늘
      
      console.log('📅 사용할 기간:', startDate, '~', endDate);
      console.log('📄 페이지:', currentPage, ', 페이지 크기:', pageSize);
      
      const response = await fetchChatList({
        startDate, // 9월 17일부터
        endDate,   // 오늘까지
        isStock: 'all',
        media: 'all',
        userId: '',
        keyword: ''
      }, currentPage, pageSize); // 현재 페이지, 10개씩
      
      console.log('✅ API 응답:', response.items.length, '개 대화 내역 로드됨');
      console.log('📊 전체 개수:', response.total);
      console.log('🔍 첫 번째 대화 데이터:', response.items[0]);
      console.log('🔍 첫 번째 대화 timestamp:', response.items[0]?.timestamp);
      
      setChatList(response.items);
      setTotalCount(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
      
      // 캐시에 저장
      setPageCache(prev => new Map(prev.set(currentPage, response.items)));
      setLoadedPages(prev => new Set(prev.add(currentPage)));
      
      // 첫 번째 페이지이고 데이터가 있으면 첫 번째 항목 선택
      if (currentPage === 0 && response.items.length > 0) {
        setSelectedChat(response.items[0]);
        console.log('📋 첫 번째 대화 선택:', response.items[0].id);
      }
    } catch (error) {
      console.error('❌ 대화 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPageData = async (page: number) => {
    console.log('🔍 페이지 데이터 로드 요청:', page + 1, '캐시 상태:', loadedPages.has(page));
    
    // 캐시된 데이터가 있으면 사용
    if (loadedPages.has(page) && pageCache.has(page)) {
      console.log('💾 캐시된 데이터 사용 (페이지:', page + 1, ')');
      const cachedData = pageCache.get(page)!;
      console.log('🔍 캐시된 데이터:', cachedData);
      console.log('🔍 캐시된 첫 번째 대화 timestamp:', cachedData[0]?.timestamp);
      setChatList(cachedData);
      
      // 첫 번째 항목 자동 선택
      if (cachedData.length > 0) {
        setSelectedChat(cachedData[0]);
        console.log('📋 캐시된 첫 번째 대화 선택:', cachedData[0].id);
      }
      return;
    }

    // 첫 번째 페이지는 loadAllChats에서 이미 로드했으므로 중복 로드 방지
    if (page === 0 && chatList.length > 0) {
      console.log('💾 첫 번째 페이지 이미 로드됨');
      return;
    }

    // 캐시된 데이터가 없으면 API 호출
    console.log('🔄 새 데이터 로드 (페이지:', page + 1, ')');
    const today = new Date();
    const startDate = '2025-09-17'; // 9월 17일부터
    const endDate = today.toISOString().split('T')[0];
    
    try {
      setLoading(true);
      const response = await fetchChatList({
        startDate,
        endDate,
        isStock: 'all',
        media: 'all',
        userId: '',
        keyword: ''
      }, page, pageSize);
      
      console.log('🔍 페이지', page + 1, 'API 응답 데이터:', response.items);
      console.log('🔍 첫 번째 대화 timestamp:', response.items[0]?.timestamp);
      
      setChatList(response.items);
      
      // 캐시에 저장
      setPageCache(prev => new Map(prev.set(page, response.items)));
      setLoadedPages(prev => new Set(prev.add(page)));
      
      console.log('💾 페이지', page + 1, '캐시에 저장됨');
      
      // 첫 번째 항목 자동 선택
      if (response.items.length > 0) {
        setSelectedChat(response.items[0]);
        console.log('📋 새 데이터 첫 번째 대화 선택:', response.items[0].id);
      }
    } catch (error) {
      console.error('❌ 페이지 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat: ChatData) => {
    console.log('🖱️ 대화 선택됨:', chat.id, '-', chat.question.substring(0, 30) + '...');
    setSelectedChat(chat);
  };

  const handlePageChange = (newPage: number) => {
    console.log('📄 페이지 변경:', currentPage + 1, '→', newPage + 1);
    setCurrentPage(newPage);
    // 선택 해제하지 않고 loadPageData에서 자동으로 첫 번째 항목 선택
  };

  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 140px)' }}>
        {/* 왼쪽: 대화 내역 리스트 */}
        <Grid item xs={4}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              대화 내역
            </Typography>
            <ChatList
              chatList={chatList}
              selectedChat={selectedChat}
              onChatSelect={handleChatSelect}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              loadedPages={loadedPages}
            />
          </Paper>
        </Grid>

        {/* 오른쪽: 상세 내용 */}
        <Grid item xs={8}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <ChatDetail selectedChat={selectedChat} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
