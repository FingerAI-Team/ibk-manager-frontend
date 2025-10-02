import { Card, CardContent, Typography, TablePagination } from "@mui/material"
import { SearchFilters } from './search-filters'
import { ChatTable } from './chat-table'
import React, { useState, useRef } from 'react'
import type { SearchFilters as SearchFiltersType } from './search-filters'
import './styles.css'

export function ChatContent() {
  const [isExporting, setIsExporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const tableRef = useRef<{ 
    loadChatData: (filters: SearchFiltersType) => void;
    exportToExcel: () => void;
    isExporting: boolean;
    // 페이지네이션 관련 상태와 함수들
    page: number;
    total: number;
    rowsPerPage: number;
    handleChangePage: (event: unknown, newPage: number) => void;
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }>(null);

  const handleSearch = (filters: SearchFiltersType) => {
    tableRef.current?.loadChatData(filters);
  };

  const handleExcelDownload = () => {
    tableRef.current?.exportToExcel();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    // 테이블에서 페이지 변경 로직 실행
    if (tableRef.current) {
      // 현재 필터로 새 페이지 로드
      // 이 부분은 ChatTable에서 처리
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // 페이지를 첫 페이지로 리셋
  };

  // isExporting 상태를 실시간으로 업데이트
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (tableRef.current) {
        setIsExporting(tableRef.current.isExporting);
        // 페이지네이션 상태도 업데이트
        if (tableRef.current.total !== undefined) {
          setTotal(tableRef.current.total);
        }
        if (tableRef.current.page !== undefined) {
          setPage(tableRef.current.page);
        }
        if (tableRef.current.rowsPerPage !== undefined) {
          setRowsPerPage(tableRef.current.rowsPerPage);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chat-content-container">
      <Card sx={{ border: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}>
        <CardContent sx={{ padding: 0 }}>
          <div className="chat-content-header">
            <div className="title-container">
              <Typography variant="h6" className="content-title">대화 내용 조회</Typography>
              <Typography variant="caption" className="required-notice">* 시작일과 종료일은 필수 입력 항목입니다.</Typography>
            </div>
            <SearchFilters onSearch={handleSearch} onExcelDownload={handleExcelDownload} isExporting={isExporting} />
          </div>
          <ChatTable ref={tableRef} />
        </CardContent>
      </Card>
      
      {/* 페이지네이션을 Card 바깥으로 이동 (박스 없이) */}
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
        sx={{
          marginTop: 0.5, /* marginTop을 줄여서 페이지네이션을 위로 */
          padding: 0,
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  )
} 