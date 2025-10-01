import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import type { ChatData } from '@/app/api/chat/types';

interface ChatDetailProps {
  selectedChat: ChatData | null;
}

export const ChatDetail: React.FC<ChatDetailProps> = ({ selectedChat }) => {
  const formatAnswer = (answer: string) => {
    // 마크다운 형식의 답변을 HTML로 변환 (간단한 처리)
    return answer
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)(<br>|$)/g, '<h3 style="margin-top: 20px; margin-bottom: 10px; color: #000000;">$1</h3>')
      .replace(/## (.*?)(<br>|$)/g, '<h2 style="margin-top: 20px; margin-bottom: 10px; color: #000000;">$1</h2>')
      .replace(/# (.*?)(<br>|$)/g, '<h1 style="margin-top: 20px; margin-bottom: 10px; color: #000000;">$1</h1>');
  };

  if (!selectedChat) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary'
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          대화를 선택해주세요
        </Typography>
        <Typography variant="body2">
          왼쪽 목록에서 대화를 클릭하면 상세 내용을 확인할 수 있습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 메타 정보 */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {new Date(selectedChat.timestamp).toLocaleString('ko-KR')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          사용자: {selectedChat.userId}
        </Typography>
        <Box sx={{ 
          display: 'inline-block',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          color: '#1976d2',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          border: '1px solid rgba(25, 118, 210, 0.2)'
        }}>
          {selectedChat.media || '전체'}
        </Box>
        <Box sx={{ 
          display: 'inline-block',
          backgroundColor: selectedChat.isStock ? 'rgba(25, 118, 210, 0.1)' : 'rgba(102, 102, 102, 0.1)',
          color: selectedChat.isStock ? '#1976d2' : '#666666',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          border: `1px solid ${selectedChat.isStock ? 'rgba(25, 118, 210, 0.2)' : 'rgba(102, 102, 102, 0.2)'}`
        }}>
          종목 {selectedChat.isStock ? 'O' : 'X'}
        </Box>
      </Box>

      {/* 질문 내용 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
          질문
        </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            minHeight: '80px',
            maxHeight: '150px',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
            // Firefox용 스크롤바
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {selectedChat.question}
          </Typography>
        </Paper>
      </Box>

      {/* 답변 내용 */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
         <Typography variant="h6" sx={{ mb: 0.5, color: 'primary.main', fontWeight: 'bold' }}>
           답변
         </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            flex: 1,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 400px)', // 높이를 더 줄임 (300px → 400px)
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              border: '1px solid #f1f1f1',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
            // Firefox용 스크롤바
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
          }}
        >
          {selectedChat.answer ? (
             <Box
               sx={{
                 '& h1, & h2, & h3': {
                   marginTop: '20px',
                   marginBottom: '10px',
                   color: '#000000'
                 },
                 '& p': {
                   marginBottom: '10px',
                   lineHeight: 1.6,
                   color: '#000000'
                 },
                 '& strong': {
                   fontWeight: 'bold',
                   color: '#000000'
                 },
                 '& em': {
                   fontStyle: 'italic',
                   color: '#000000'
                 }
               }}
              dangerouslySetInnerHTML={{
                __html: `<p>${formatAnswer(selectedChat.answer)}</p>`
              }}
            />
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              답변 내용을 찾을 수 없습니다.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
