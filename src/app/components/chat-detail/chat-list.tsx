import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Pagination,
  Stack
} from '@mui/material';
import type { ChatData } from '@/app/api/chat/types';

interface ChatListProps {
  chatList: ChatData[];
  selectedChat: ChatData | null;
  onChatSelect: (chat: ChatData) => void;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  loadedPages: Set<number>;
}

export const ChatList: React.FC<ChatListProps> = ({
  chatList,
  selectedChat,
  onChatSelect,
  loading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  loadedPages
}) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (chatList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Typography color="text.secondary">대화 내역이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 대화 내역 리스트 */}
      <List sx={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
        {chatList.map((chat) => (
          <ListItem key={chat.id} disablePadding>
            <ListItemButton
              selected={selectedChat?.id === chat.id}
              onClick={() => onChatSelect(chat)}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 1.5,
                px: 2,
                borderBottom: '1px solid #f0f0f0',
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                },
              }}
            >
              {/* 상단: 날짜와 종목 여부 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(chat.timestamp)}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: chat.isStock ? '#1976d2' : '#666666',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                >
                  종목 {chat.isStock ? 'O' : 'X'}
                </Typography>
              </Box>

              {/* 하단: 질문 내용 */}
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.9rem',
                      lineHeight: 1.3,
                      color: 'text.primary',
                      wordBreak: 'break-word'
                    }}
                  >
                    {truncateText(chat.question)}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* 페이지네이션 */}
      <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid #e0e0e0' }}>
        <Stack spacing={0.3} alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {currentPage * 10 + 1}-{Math.min((currentPage + 1) * 10, totalCount)} / 전체 {totalCount}개
          </Typography>
          {/* 디버깅 정보 추가 */}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            총 페이지: {totalPages}개
          </Typography>
          {totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={currentPage + 1}
              onChange={(event, page) => {
                const targetPage = page - 1;
                console.log('🖱️ 페이지 클릭:', targetPage + 1, '캐시됨:', loadedPages.has(targetPage));
                onPageChange(targetPage);
              }}
              size="small"
              color="primary"
              showFirstButton
              showLastButton
              disabled={loading}
              sx={{
                '& .MuiPaginationItem-root': {
                  minWidth: '28px',
                  height: '28px',
                  fontSize: '0.8rem'
                }
              }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              페이지가 1개뿐입니다
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
