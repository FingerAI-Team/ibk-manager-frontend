import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Avatar } from "@mui/material"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onExcelDownload: () => void;
}

export interface SearchFilters {
  startDate: string | null;
  endDate: string | null;
  isStock: string;
  userId: string;
  keyword: string;
}

export function SearchFilters({ onSearch, onExcelDownload }: SearchFiltersProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isStock, setIsStock] = useState('all');
  const [userId, setUserId] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    onSearch({
      startDate: startDate?.format('YYYY-MM-DD') || null,
      endDate: endDate?.format('YYYY-MM-DD') || null,
      isStock,
      userId,
      keyword
    });
  };

  return (
    <div className="search-filters">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker 
          label="시작일" 
          value={startDate}
          onChange={setStartDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker 
          label="종료일"
          value={endDate}
          onChange={setEndDate}
          slotProps={{ textField: { size: 'small' } }}
        />
      </LocalizationProvider>
      
      <FormControl size="small" className="search-form-control">
        <InputLabel>종목 여부</InputLabel>
        <Select 
          label="종목 여부" 
          value={isStock}
          onChange={(e) => setIsStock(e.target.value)}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="stock">종목</MenuItem>
          <MenuItem value="non-stock">일반</MenuItem>
        </Select>
      </FormControl>

      <TextField 
        label="사용자 ID" 
        size="small" 
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="사용자 ID 입력"
        className="search-user-input"
      />

      <TextField 
        label="키워드 검색" 
        size="small" 
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="검색어 입력"
      />

      <Button 
        variant="contained" 
        startIcon={<SearchIcon />}
        className="search-button"
        onClick={handleSearch}
      >
        검색
      </Button>

      <Button
        variant="outlined"
        onClick={onExcelDownload}
        sx={{ 
          minWidth: '45px',
          height: '45px',
          padding: '8px',
          borderRadius: '6px',
          borderColor: '#d0d0d0',
          '&:hover': {
            borderColor: '#a0a0a0',
            backgroundColor: '#f8f8f8'
          }
        }}
        title="엑셀 다운로드"
      >
        <Avatar
          src="/excel.png"
          alt="Excel"
          sx={{ 
            width: 28, 
            height: 28,
            backgroundColor: 'transparent'
          }}
        />
      </Button>
    </div>
  )
} 