import { Card, CardContent, Typography } from "@mui/material"
import { SearchFilters } from './search-filters'
import { ChatTable } from './chat-table'
import { useState, useRef } from 'react'
import type { SearchFilters as SearchFiltersType } from './search-filters'
import './styles.css'

export function ChatContent() {
  const tableRef = useRef<{ loadChatData: (filters: SearchFiltersType) => void }>(null);

  const handleSearch = (filters: SearchFiltersType) => {
    tableRef.current?.loadChatData(filters);
  };

  return (
    <div className="chat-content-container">
      <Card>
        <CardContent>
          <div className="chat-content-header">
            <Typography variant="h6" className="content-title">대화 내용 조회</Typography>
            <SearchFilters onSearch={handleSearch} />
          </div>
          <ChatTable ref={tableRef} />
        </CardContent>
      </Card>
    </div>
  )
} 