import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useState, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'  // 한국어 로케일 추가

interface DateSelectorProps {
  onDateChange: (date: Dayjs) => void
}

export function getBusinessDay(date: Dayjs = dayjs()): Dayjs {
  let checkDate = date
  while (checkDate.day() === 0 || checkDate.day() === 6) {
    checkDate = checkDate.subtract(1, 'day')
  }
  return checkDate
}

export function DateSelector({ onDateChange }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(getBusinessDay(dayjs()))

  // 영업일 체크 함수
  const isBusinessDay = (date: Dayjs) => {
    return date.day() !== 0 && date.day() !== 6
  }

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      // const businessDay = getBusinessDay(newDate) 자동 영업일 선택
      // setSelectedDate(businessDay)
      setSelectedDate(newDate)
    }
  }

  useEffect(() => {
    onDateChange(selectedDate)
  }, [selectedDate, onDateChange])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <DatePicker
        className="date-picker"
        label="날짜 선택"
        value={selectedDate}
        onChange={handleDateChange} 
        maxDate={dayjs()} // 오늘 날짜까지 선택 가능
        // shouldDisableDate={(date) => !isBusinessDay(date)} 주말만 선택
        format="YYYY-MM-DD (ddd)"
      />
    </LocalizationProvider>
  )
} 