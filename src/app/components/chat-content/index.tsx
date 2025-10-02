import { Card, CardContent, Typography, TablePagination } from "@mui/material"
import { SearchFilters } from './search-filters'
import { ChatTable } from './chat-table'
import React, { useState, useRef } from 'react'
import type { SearchFilters as SearchFiltersType } from './search-filters'
import './styles.css'

export function ChatContent() {
  const [isExporting, setIsExporting] = useState(false);
  
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

  // isExporting 상태를 실시간으로 업데이트
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (tableRef.current) {
        setIsExporting(tableRef.current.isExporting);
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
        count={tableRef.current?.total || 0}
        page={tableRef.current?.page || 0}
        onPageChange={tableRef.current?.handleChangePage || (() => {})}
        rowsPerPage={tableRef.current?.rowsPerPage || 10}
        onRowsPerPageChange={tableRef.current?.handleChangeRowsPerPage || (() => {})}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="페이지당 행 수:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} / 전체 ${count}`
        }
        sx={{
          marginTop: 1,
          padding: 0,
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  )
} 