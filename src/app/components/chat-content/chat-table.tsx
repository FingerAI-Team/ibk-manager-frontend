import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress } from "@mui/material"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { fetchChatList, fetchAllChatData } from '@/app/api/chat'
import { SearchFilters } from './search-filters'
import type { ChatData } from '@/app/api/chat'
import { exportChatContentToExcel } from '@/utils/excel'

export const ChatTable = forwardRef<
  { 
    loadChatData: (filters: SearchFilters) => void;
    exportToExcel: () => void;
    isExporting: boolean;
  },
  Record<string, never>
>((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadChatData = useCallback(async (filters: SearchFilters, pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      const response = await fetchChatList(filters, pageNum, rowsPerPage);
      setChatData(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
      setError('데이터 조회에 실패했습니다. 조회 기간을 확인해 주세요.');
      setChatData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  const exportToExcel = useCallback(async () => {
    if (!currentFilters) {
      alert('먼저 검색 조건을 설정하고 검색을 실행해주세요.');
      return;
    }

    try {
      setIsExporting(true);
      console.log('전체 데이터 다운로드 시작...');
      
      // 전체 데이터 조회
      const allData = await fetchAllChatData(currentFilters, total);
      console.log(`전체 데이터 ${allData.length}건 조회 완료`);
      
      if (allData.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }
      
      // 엑셀 다운로드
      exportChatContentToExcel(allData, currentFilters);
      alert(`✅ 전체 ${allData.length}건의 데이터가 다운로드되었습니다!`);
      
    } catch (error) {
      console.error('전체 데이터 다운로드 실패:', error);
      alert('❌ 데이터 다운로드에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  }, [currentFilters]);

  useImperativeHandle(ref, () => ({
    loadChatData: (filters: SearchFilters) => {
      setPage(0); // 새로운 검색시 첫 페이지로
      loadChatData(filters, 0);
    },
    exportToExcel,
    isExporting
  }));

  const handleChangePage = (event: unknown, newPage: number) => {
    if (!currentFilters) return;
    setPage(newPage);
    loadChatData(currentFilters, newPage); // 현재 필터와 새 페이지 번호로 데이터 로드
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFilters) return;
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadChatData(currentFilters, 0); // 페이지 크기 변경시 첫 페이지로
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '2rem',
        color: '#d32f2f'
      }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <TableContainer component={Paper} className="chat-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell>사용자 ID</TableCell>
              <TableCell>질문 내용</TableCell>
              <TableCell>종목 여부</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chatData.length > 0 ? (
              chatData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.timestamp}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.question}</TableCell>
                  <TableCell>
                    <div className={`stock-badge stock-badge-${row.isStock}`}>
                      {row.isStock ? (
                        <>
                          <CheckCircleIcon fontSize="small" />
                          <span>종목</span>
                        </>
                      ) : (
                        <>
                          <CancelIcon fontSize="small" />
                          <span>일반</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="table-footer">
        <div className="required-notice">* 조회 기간은 필수 입력 항목입니다.</div>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / 전체 ${count}`
          }
        />
      </div>
    </>
  );
});

ChatTable.displayName = 'ChatTable';