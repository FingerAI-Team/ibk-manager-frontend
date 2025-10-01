import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress } from "@mui/material"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { fetchChatList, fetchAllChatData } from '@/app/api/chat'
import { SearchFilters } from './search-filters'
import type { ChatData } from '@/app/api/chat/types'
import { exportChatContentToExcel } from '@/utils/excel'

export const ChatTable = forwardRef<
  { 
    loadChatData: (filters: SearchFilters) => void;
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

  const loadChatData = useCallback(async (filters: SearchFilters, pageNum = 0, pageSize = rowsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      console.log('🔄 데이터 로딩 시작:', { pageNum, pageSize, filters });
      
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
      
      setTotal(response.total || 0);
      setPage(pageNum); // 현재 페이지도 업데이트
      
      // 디버깅을 위한 페이지네이션 정보 출력
      console.log('📊 페이지네이션 정보:', {
        currentPage: pageNum,
        totalItems: response.total,
        itemsPerPage: pageSize,
        totalPages: Math.ceil((response.total || 0) / pageSize),
        currentItems: response.items.length
      });
      
      // 매체 구분 데이터 디버깅
      if (response.items.length > 0) {
        console.log('📱 매체 구분 데이터 샘플:', response.items.slice(0, 3).map(item => ({
          id: item.id,
          media: item.media,
          tenantId: item.tenantId,
          userId: item.userId,
          selectedMedia: filters.media,
          hasMedia: 'media' in item,
          hasTenantId: 'tenantId' in item
        })));
        console.log('📱 백엔드 매핑 정보:', {
          'all': 'None (모든 tenant_id)',
          'MTS': 'ibks',
          'i-One Bank': 'ibk'
        });
      }
      
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
  }, [currentFilters, total, chatData]);

  useImperativeHandle(ref, () => ({
    loadChatData: (filters: SearchFilters) => {
      setPage(0); // 새로운 검색시 첫 페이지로
      loadChatData(filters, 0, rowsPerPage);
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

  return (
    <TableContainer component={Paper} className="chat-table-container">
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
                <TableCell>{row.userId}</TableCell>
                <TableCell>{row.question}</TableCell>
                <TableCell>
                  <div className="media-badge">
                    {row.media || '전체'}
                  </div>
                </TableCell>
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
              <TableCell colSpan={5} align="center">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

ChatTable.displayName = 'ChatTable';