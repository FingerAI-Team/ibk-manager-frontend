import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import type { ChatData } from '@/app/api/chat';

interface ChatDetailProps {
  selectedChat: ChatData | null;
}

export const ChatDetail: React.FC<ChatDetailProps> = ({ selectedChat }) => {
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 정보 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              대화 상세 정보
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {selectedChat.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={selectedChat.isStock ? <CheckCircleIcon /> : <CancelIcon />}
            label={selectedChat.isStock ? '종목 관련' : '일반 질문'}
            color={selectedChat.isStock ? 'primary' : 'default'}
            size="small"
          />
          <Chip
            label={formatDateTime(selectedChat.timestamp)}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 질문 내용 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          질문 내용
        </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {selectedChat.question}
          </Typography>
        </Paper>
      </Box>

      {/* 답변 내용 */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          답변 내용
        </Typography>
        <Paper
          sx={{
            p: 3,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            height: '500px',
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
