import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import type { ChatData } from '@/app/api/chat';

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
      .replace(/### (.*?)(<br>|$)/g, '<h3 style="margin-top: 20px; margin-bottom: 10px; color: #1976d2;">$1</h3>')
      .replace(/## (.*?)(<br>|$)/g, '<h2 style="margin-top: 20px; margin-bottom: 10px; color: #1976d2;">$1</h2>')
      .replace(/# (.*?)(<br>|$)/g, '<h1 style="margin-top: 20px; margin-bottom: 10px; color: #1976d2;">$1</h1>');
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
            overflow: 'auto'
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {selectedChat.question}
          </Typography>
        </Paper>
      </Box>

      {/* 답변 내용 */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
          답변
        </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            flex: 1,
            overflow: 'auto'
          }}
        >
          {selectedChat.answer ? (
            <Box
              sx={{
                '& h1, & h2, & h3': {
                  marginTop: '20px',
                  marginBottom: '10px',
                  color: '#1976d2'
                },
                '& p': {
                  marginBottom: '10px',
                  lineHeight: 1.6
                },
                '& strong': {
                  fontWeight: 'bold'
                },
                '& em': {
                  fontStyle: 'italic'
                }
              }}
              dangerouslySetInnerHTML={{
                __html: `<p>${formatAnswer(selectedChat.answer)}</p>`
              }}
            />
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              답변 내용이 없습니다.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
