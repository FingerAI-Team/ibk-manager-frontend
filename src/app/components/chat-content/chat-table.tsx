import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, Box, LinearProgress } from "@mui/material"
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { fetchChatList, fetchAllChatData, fetchAllChatDataForDownload, downloadChatDataStream } from '@/app/api/chat'
import { SearchFilters } from './search-filters'
import type { ChatData } from '@/app/api/chat/types'
import { exportChatContentToExcel } from '@/utils/excel'

export const ChatTable = forwardRef<
  { 
    loadChatData: (filters: SearchFilters, page?: number, pageSize?: number) => void;
    exportToExcel: () => void;
    isExporting: boolean;
    // 페이지네이션 관련 상태와 함수들
    page: number;
    total: number;
    rowsPerPage: number;
    handleChangePage: (event: unknown, newPage: number) => void;
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  },
  {}
>((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 100, message: '' });
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const loadChatData = useCallback(async (filters: SearchFilters, pageNum = 0, pageSize = rowsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setRowsPerPage(pageSize); // 페이지 크기 상태 업데이트
      console.log('🔄 데이터 로딩 시작:', { pageNum, pageSize, filters, currentRowsPerPage: rowsPerPage });
      
      const response = await fetchChatList(filters, pageNum, pageSize);
      console.log('✅ 데이터 로딩 완료:', { items: response.items.length, total: response.total });
      
      // 상태 업데이트를 즉시 처리 (setTimeout 제거)
      setChatData(response.items);
      
      // total 값 설정 전후 로깅
      console.log('🔢 Total 값 설정 전:', { 
        receivedTotal: response.total, 
        totalType: typeof response.total,
        willSetTotal: response.total || 0 
      });
      
      // total 값이 0이거나 없으면 첫 번째 페이지를 다시 호출해서 확인
      let totalValue = response.total;
      if (!totalValue || totalValue === 0) {
        console.log('🔄 Total 값이 없어서 첫 페이지를 다시 호출...');
        const firstPageResponse = await fetchChatList(filters, 0, pageSize);
        totalValue = firstPageResponse.total;
        console.log('🔄 첫 페이지 재호출 결과:', { total: totalValue });
      }
      
      const finalTotal = totalValue || response.items.length;
      setTotal(finalTotal);
      setPage(pageNum); // 현재 페이지도 업데이트
      
      console.log('🎯 최종 Total 설정:', {
        finalTotal,
        totalValue,
        itemsLength: response.items.length,
        willSetTotal: finalTotal
      });
      
      // 디버깅을 위한 페이지네이션 정보 출력
      console.log('📊 페이지네이션 정보:', {
        currentPage: pageNum,
        totalItems: totalValue,
        finalTotalValue: totalValue,
        itemsPerPage: pageSize,
        totalPages: Math.ceil((totalValue || 0) / pageSize),
        currentItems: response.items.length,
        willSetTotal: totalValue || response.items.length
      });
    } catch (error) {
      console.error('❌ 데이터 로딩 실패:', error);
      setError('데이터 조회에 실패했습니다. 조회 기간을 확인해 주세요.');
      setChatData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToExcel = useCallback(async () => {
    console.log('🔍 디버깅 정보:', { currentFilters, total, chatData: chatData.length });
    if (!currentFilters) {
      alert('먼저 검색 조건을 설정하고 검색을 실행해주세요.');
      return;
    }
    if (total === 0) {
      alert('조회된 데이터가 없습니다. 검색 조건을 확인해주세요.');
      return;
    }
    try {
      setIsExporting(true);
      setDownloadProgress({ current: 0, total: 100, message: '데이터 조회 중...' });
      console.log('🚀 스트리밍 다운로드 시작...');
      
      let allData: ChatData[] = [];
      
      // 스트리밍 다운로드 시작
      const eventSource = downloadChatDataStream(
        currentFilters,
        // 진행률 업데이트 콜백
        (progress, processed, total) => {
          setDownloadProgress({ 
            current: Math.round(progress), 
            total: 100, 
            message: `데이터 수신 중... (${processed}/${total})` 
          });
        },
        // 데이터 청크 수신 콜백
        (chunkData) => {
          allData = [...allData, ...chunkData];
        },
        // 완료 콜백
        (completeData) => {
          console.log(`✅ 스트리밍 다운로드 완료! 총 ${completeData.length}건`);
          
          if (completeData.length === 0) {
            alert('다운로드할 데이터가 없습니다.');
            setIsExporting(false);
            setDownloadProgress({ current: 0, total: 100, message: '' });
            return;
          }
          
          // 엑셀 파일 생성
          setDownloadProgress({ current: 100, total: 100, message: '엑셀 파일 생성 중...' });
          exportChatContentToExcel(completeData, currentFilters);
          
          // 완료 후 잠시 대기 후 다이얼로그 닫기
          setTimeout(() => {
            setIsExporting(false);
            setDownloadProgress({ current: 0, total: 100, message: '' });
            alert(`✅ 전체 ${completeData.length}건의 데이터가 다운로드되었습니다!`);
          }, 1000);
        },
        // 오류 콜백
        (errorMessage) => {
          console.error('❌ 스트리밍 다운로드 오류:', errorMessage);
          alert(`❌ 데이터 다운로드에 실패했습니다: ${errorMessage}`);
          setIsExporting(false);
          setDownloadProgress({ current: 0, total: 100, message: '' });
        }
      );
      
    } catch (error) {
      console.error('❌ 다운로드 시작 실패:', error);
      alert('❌ 데이터 다운로드에 실패했습니다. 백엔드 API를 확인해주세요.');
      setIsExporting(false);
      setDownloadProgress({ current: 0, total: 100, message: '' });
    }
  }, [currentFilters, total, chatData]);

  useImperativeHandle(ref, () => ({
    loadChatData: (filters: SearchFilters, pageNum = 0, pageSize = rowsPerPage) => {
      loadChatData(filters, pageNum, pageSize);
    },
    exportToExcel,
    isExporting,
    // 페이지네이션 관련 값들 노출
    page,
    total,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage
  }));

  const handleChangePage = (event: unknown, newPage: number) => {
    if (!currentFilters) return;
    console.log('📄 페이지 변경:', newPage);
    setPage(newPage);
    loadChatData(currentFilters, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFilters) return;
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('📊 페이지 크기 변경:', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadChatData(currentFilters, 0, newRowsPerPage);
  };

  const handleUserIdClick = async (userId: string) => {
    try {
      // 클립보드 API 사용 가능 여부 확인
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(userId);
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      } else {
        // 클립보드 API가 지원되지 않는 경우 대체 방법
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setShowCopyMessage(true);
          setTimeout(() => setShowCopyMessage(false), 2000);
        }
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 최종 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = userId;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      }
    }
  };

  return (
    <TableContainer className="chat-table-container">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>날짜</TableCell>
            <TableCell>사용자 ID</TableCell>
            <TableCell>질문 내용</TableCell>
            <TableCell>매체 구분</TableCell>
            <TableCell>종목 여부</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ padding: '2rem' }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ padding: '2rem', color: '#d32f2f' }}>
                {error}
              </TableCell>
            </TableRow>
          ) : chatData.length > 0 ? (
            chatData.map((row, index) => (
              <TableRow key={`${row.id}-${index}`}>
                <TableCell>{row.timestamp}</TableCell>
                <TableCell 
                  onClick={() => handleUserIdClick(row.userId)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {row.userId}
                </TableCell>
                <TableCell>{row.question}</TableCell>
                <TableCell>
                  <div className="media-badge">
                    {row.mediaName || '전체'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`stock-badge stock-badge-${row.isStock}`}>
                    {row.isStock ? '종목' : '일반'}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* 복사 완료 안내문구 */}
      {showCopyMessage && (
        <Box
          sx={{
            textAlign: 'center',
            padding: '8px 0'
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #c8e6c9',
              borderRadius: '4px'
            }}
          >
            사용자 ID가 복사되었습니다
          </Box>
        </Box>
      )}
      
      {/* 다운로드 진행률 다이얼로그 */}
      <Dialog 
        open={isExporting} 
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            padding: '8px'
          }
        }}
      >
        <DialogTitle sx={{ 
          padding: '16px 16px 8px 16px',
          textAlign: 'center'
        }}>
          데이터 다운로드 중...
        </DialogTitle>
        <DialogContent sx={{ padding: '8px 16px 16px 16px' }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              {downloadProgress.message}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(downloadProgress.current / downloadProgress.total) * 100} 
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
              {downloadProgress.current} / {downloadProgress.total} ({Math.round((downloadProgress.current / downloadProgress.total) * 100)}%)
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </TableContainer>
  );
});

ChatTable.displayName = 'ChatTable';