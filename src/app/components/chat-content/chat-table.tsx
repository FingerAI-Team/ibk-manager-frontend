import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, LinearProgress } from "@mui/material"
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { fetchChatList, fetchAllChatData, fetchAllChatDataWithProgress } from '@/app/api/chat'
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
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, message: '' });
  const [userIdDialog, setUserIdDialog] = useState<{ open: boolean; userId: string }>({ open: false, userId: '' });
  
  // 데이터 캐싱을 위한 상태
  const [cachedData, setCachedData] = useState<ChatData[]>([]);
  const [isDataCached, setIsDataCached] = useState(false);
  const [cacheKey, setCacheKey] = useState<string>('');

  // 캐시 키 생성 함수
  const generateCacheKey = (filters: SearchFilters): string => {
    return JSON.stringify({
      startDate: filters.startDate,
      endDate: filters.endDate,
      isStock: filters.isStock,
      media: filters.media,
      userId: filters.userId,
      keyword: filters.keyword
    });
  };

  const loadChatData = useCallback(async (filters: SearchFilters, pageNum = 0, pageSize = rowsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setRowsPerPage(pageSize);
      
      const newCacheKey = generateCacheKey(filters);
      console.log('🔄 데이터 로딩 시작:', { pageNum, pageSize, filters, cacheKey: newCacheKey, isDataCached });
      
      // 캐시된 데이터가 있고 같은 필터인 경우
      if (isDataCached && cacheKey === newCacheKey) {
        console.log('💾 캐시된 데이터 사용');
        const startIndex = pageNum * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = cachedData.slice(startIndex, endIndex);
        
        setChatData(pageData);
        setTotal(cachedData.length);
        setPage(pageNum);
        setLoading(false);
        return;
      }
      
      // 캐시된 데이터가 없거나 다른 필터인 경우 - 전체 데이터 로드
      console.log('🔄 전체 데이터 로드 시작...');
      setExportProgress({ current: 0, total: 100, message: '전체 데이터 로드 중...' });
      
      // 먼저 총 개수 확인
      const firstPageResponse = await fetchChatList(filters, 0, 1);
      const totalCount = firstPageResponse.total;
      
      if (totalCount === 0) {
        setChatData([]);
        setTotal(0);
        setCachedData([]);
        setIsDataCached(false);
        setLoading(false);
        return;
      }
      
      // 전체 데이터 로드
      const allData = await fetchAllChatDataWithProgress(filters, totalCount, (current, total, message) => {
        setExportProgress({ current, total, message });
      });
      
      // 캐시에 저장
      setCachedData(allData);
      setIsDataCached(true);
      setCacheKey(newCacheKey);
      
      // 현재 페이지 데이터 표시
      const startIndex = pageNum * pageSize;
      const endIndex = startIndex + pageSize;
      const pageData = allData.slice(startIndex, endIndex);
      
      setChatData(pageData);
      setTotal(allData.length);
      setPage(pageNum);
      
      console.log('✅ 전체 데이터 로드 완료:', { 
        totalLoaded: allData.length, 
        currentPageData: pageData.length,
        pageNum,
        pageSize 
      });
      
    } catch (error) {
      console.error('❌ 데이터 로딩 실패:', error);
      setError(error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.');
      setChatData([]);
      setTotal(0);
      setCachedData([]);
      setIsDataCached(false);
    } finally {
      setLoading(false);
      setExportProgress({ current: 0, total: 0, message: '' });
    }
  }, [isDataCached, cacheKey, cachedData]);

  const exportToExcel = useCallback(async () => {
    console.log('🔍 디버깅 정보:', { currentFilters, total, chatData: chatData.length, isDataCached, cachedDataLength: cachedData.length });
    
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
      
      // 캐시된 데이터가 있으면 바로 사용
      if (isDataCached && cachedData.length > 0) {
        console.log('💾 캐시된 데이터로 엑셀 다운로드');
        setExportProgress({ current: 100, total: 100, message: '엑셀 파일 생성 중...' });
        
        exportChatContentToExcel(cachedData, currentFilters);
        alert(`✅ 캐시된 ${cachedData.length}건의 데이터가 다운로드되었습니다!`);
        
        setIsExporting(false);
        setExportProgress({ current: 0, total: 0, message: '' });
        return;
      }
      
      // 캐시된 데이터가 없으면 전체 데이터 로드
      console.log('🔄 캐시된 데이터가 없어서 전체 데이터 로드 후 다운로드');
      setExportProgress({ current: 0, total: total, message: '데이터 조회 중...' });
      
      const allData = await fetchAllChatDataWithProgress(currentFilters, total, (current, total, message) => {
        setExportProgress({ current, total, message });
      });
      
      console.log(`전체 데이터 ${allData.length}건 조회 완료`);
      
      if (allData.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }
      
      setExportProgress({ current: total, total: total, message: '엑셀 파일 생성 중...' });
      
      // 엑셀 다운로드
      exportChatContentToExcel(allData, currentFilters);
      alert(`✅ 전체 ${allData.length}건의 데이터가 다운로드되었습니다!`);
      
    } catch (error) {
      console.error('데이터 다운로드 실패:', error);
      alert('❌ 데이터 다운로드에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0, message: '' });
    }
  }, [currentFilters, total, isDataCached, cachedData]);

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
    
    // 캐시된 데이터가 있으면 바로 사용
    if (isDataCached && cachedData.length > 0) {
      console.log('💾 캐시된 데이터로 페이지 변경');
      const startIndex = newPage * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const pageData = cachedData.slice(startIndex, endIndex);
      
      setChatData(pageData);
      setPage(newPage);
      return;
    }
    
    // 캐시된 데이터가 없으면 API 호출
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

  const handleUserIdClick = (userId: string) => {
    setUserIdDialog({ open: true, userId });
  };

  const handleCloseDialog = () => {
    setUserIdDialog({ open: false, userId: '' });
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
      
      {/* 사용자 ID 팝업 다이얼로그 */}
      <Dialog 
        open={userIdDialog.open} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            padding: '8px'
          }
        }}
      >
        <DialogTitle sx={{ 
          padding: '16px 16px 0px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          전체 사용자 ID
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              minWidth: 'auto',
              padding: '4px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#666',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                color: '#333'
              }
            }}
            >
              X
            </Button>
        </DialogTitle>
        <DialogContent sx={{ 
          padding: '0px 16px 16px 16px !important',
          '&.MuiDialogContent-root': { 
            padding: '0px 16px 16px 16px !important' 
          }
        }}>
          <Typography variant="body1" sx={{ 
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            wordBreak: 'break-all',
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            margin: '0px !important',
            marginTop: '0px !important'
          }}>
            {userIdDialog.userId}
          </Typography>
        </DialogContent>
      </Dialog>
      
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
              {exportProgress.message}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(exportProgress.current / exportProgress.total) * 100} 
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
              {exportProgress.current} / {exportProgress.total} ({Math.round((exportProgress.current / exportProgress.total) * 100)}%)
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </TableContainer>
  );
});

ChatTable.displayName = 'ChatTable';