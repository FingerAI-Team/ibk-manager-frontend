import * as XLSX from 'xlsx';

// 엑셀 다운로드 유틸리티 함수들
export const downloadExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 파일명에 현재 날짜 추가
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const finalFilename = `${filename}_${dateStr}.xlsx`;
  
  XLSX.writeFile(workbook, finalFilename);
};

// 일별 차트 데이터를 엑셀로 변환
export const exportDailyChartToExcel = (data: any[], startDate: string, endDate: string, media?: string) => {
  const excelData = data.map(item => ({
    '날짜': item.date,
    '대화 수': item.chats,
    '사용자 수': item.users,
    '매체': media || '전체' // 선택된 매체 값 사용
  }));
  
  const filename = media ? `일별_대화활동_${media}_${startDate}_${endDate}` : `일별_대화활동_${startDate}_${endDate}`;
  downloadExcel(excelData, filename, '일별 대화활동');
};

// 시간대별 차트 데이터를 엑셀로 변환
export const exportHourlyChartToExcel = (data: any[], dateType: string, startDate?: string, endDate?: string, media?: string) => {
  const excelData = data.map(item => ({
    '시간': `${item.hour}시`,
    '대화 수': item.chats,
    '매체': media || '전체' // 선택된 매체 값 사용
  }));
  
  let filename = dateType === 'custom' && startDate && endDate 
    ? `시간대별_대화활동_${startDate}_${endDate}`
    : `시간대별_대화활동_${dateType}`;
    
  if (media) {
    filename = filename.replace('시간대별_대화활동', `시간대별_대화활동_${media}`);
  }
    
  downloadExcel(excelData, filename, '시간대별 대화활동');
};

// 요일별 차트 데이터를 엑셀로 변환
export const exportWeekdayChartToExcel = (data: any[], year: number, month: number, media?: string) => {
  const excelData = data.map(item => ({
    '요일': item.day,
    '대화 수': item.chats,
    '사용자 수': item.users,
    '매체': media || '전체' // 선택된 매체 값 사용
  }));
  
  const filename = media ? `요일별_대화활동_${media}_${year}년${month}월` : `요일별_대화활동_${year}년${month}월`;
  downloadExcel(excelData, filename, '요일별 대화활동');
};

// 사용자 랭킹 데이터를 엑셀로 변환
export const exportUserRankingToExcel = (data: any[], period: string, displayCount: number, startDate?: string, endDate?: string, media?: string) => {
  const excelData = data.map((item, index) => ({
    '순위': index + 1,
    '사용자 ID': item.userId,
    '사용자명': item.userName,
    '대화 횟수': item.chats,
    '매체': media || '전체' // 선택된 매체 값 사용
  }));
  
  let filename = `사용자_랭킹_${period}_TOP${displayCount}`;
  if (period === 'custom' && startDate && endDate) {
    filename += `_${startDate}_${endDate}`;
  }
  if (media) {
    filename = filename.replace('사용자_랭킹', `사용자_랭킹_${media}`);
  }
  
  downloadExcel(excelData, filename, '사용자 랭킹');
};

// 대화 내용 데이터를 엑셀로 변환
export const exportChatContentToExcel = (data: any[], filters: any) => {
  const excelData = data.map((item) => ({
    '일시': item.timestamp,
    '사용자 ID': item.userId,
    '질문 내용': item.question,
    '답변 내용': item.answer || '답변 내용 없음',
    '종목 여부': item.isStock ? '종목' : '일반'
  }));
  
  let filename = '대화내용_분석';
  if (filters.startDate && filters.endDate) {
    filename += `_${filters.startDate}_${filters.endDate}`;
  }
  if (filters.userId) {
    filename += `_${filters.userId}`;
  }
  if (filters.isStock && filters.isStock !== 'all') {
    filename += `_${filters.isStock === 'stock' ? '종목' : '일반'}`;
  }
  
  downloadExcel(excelData, filename, '대화 내용 분석');
};
