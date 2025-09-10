import { Card, CardContent, Typography } from "@mui/material"
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
      <Card>
        <CardContent>
          <div className="chat-content-header">
            <Typography variant="h6" className="content-title">대화 내용 조회</Typography>
            <SearchFilters onSearch={handleSearch} onExcelDownload={handleExcelDownload} isExporting={isExporting} />
          </div>
          <ChatTable ref={tableRef} />
        </CardContent>
      </Card>
    </div>
  )
} 