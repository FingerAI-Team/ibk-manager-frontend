import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Avatar, CircularProgress } from "@mui/material"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onExcelDownload: () => void;
  isExporting?: boolean;
}

export interface SearchFilters {
  startDate: string | null;
  endDate: string | null;
  isStock: string;
  media: string;
  userId: string;
  keyword: string;
}

export function SearchFilters({ onSearch, onExcelDownload, isExporting = false }: SearchFiltersProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isStock, setIsStock] = useState('all');
  const [media, setMedia] = useState('all');
  const [userId, setUserId] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    const searchData = {
      startDate: startDate?.format('YYYY-MM-DD') || null,
      endDate: endDate?.format('YYYY-MM-DD') || null,
      isStock,
      media,
      userId,
      keyword
    };
    
    console.log('🔍 검색 필터 데이터:', searchData);
    console.log('📱 매체 구분 선택값:', { media, mediaType: typeof media, isAll: media === 'all' });
    onSearch(searchData);
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
      
      <FormControl size="small" className="search-form-control" data-field="isStock" sx={{ minWidth: '90px' }}>
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

      <FormControl size="small" className="search-form-control">
        <InputLabel>매체 구분</InputLabel>
        <Select 
          label="매체 구분" 
          value={media}
          onChange={(e) => setMedia(e.target.value)}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="MTS">MTS</MenuItem>
          <MenuItem value="i-One Bank">i-One Bank</MenuItem>
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
        sx={{
          minWidth: '70px',
          height: '40px',
          padding: '0 12px',
          fontSize: '0.8rem'
        }}
      >
        검색
      </Button>

      <Button
        variant="outlined"
        onClick={onExcelDownload}
        disabled={isExporting}
        sx={{ 
          minWidth: '36px',
          height: '40px',
          padding: '6px',
          borderRadius: '6px',
          borderColor: '#d0d0d0',
          '&:hover': {
            borderColor: '#a0a0a0',
            backgroundColor: '#f8f8f8'
          },
          '&:disabled': {
            borderColor: '#e0e0e0',
            backgroundColor: '#f5f5f5'
          }
        }}
        title={isExporting ? "다운로드 중..." : "전체 데이터 엑셀 다운로드"}
      >
        {isExporting ? (
          <CircularProgress size={18} />
        ) : (
          <Avatar
            src="/excel.png"
            alt="Excel"
            sx={{ 
              width: 22, 
              height: 22,
              backgroundColor: 'transparent'
            }}
          />
        )}
      </Button>
    </div>
  )
} 