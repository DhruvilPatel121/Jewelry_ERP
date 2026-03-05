import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, RotateCcw } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getYear, getMonth } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface CalendarFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  onPresetChange: (preset: string) => void;
  onClearAll?: () => void;
  loading?: boolean;
}

export default function CalendarFilter({ onDateRangeChange, onPresetChange, onClearAll, loading = false }: CalendarFilterProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years from 2020 to current year + 2
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 3 - 2020 }, (_, i) => 2020 + i);

  const presets = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 6 Months', value: '6months' },
    { label: 'This Year', value: 'year' },
  ];

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(parseInt(monthIndex));
    setCurrentMonth(newMonth);
  };

  const handleYearChange = (year: string) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(parseInt(year));
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (date < selectedStartDate) {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(date);
        onDateRangeChange({ startDate: selectedStartDate, endDate: date });
      }
    }
  };

  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (preset) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'week':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case '3months':
        startDate = subMonths(today, 3);
        break;
      case '6months':
        startDate = subMonths(today, 6);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    onDateRangeChange({ startDate, endDate });
    onPresetChange(preset);
  };

  const handleClearAll = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setCurrentMonth(new Date());
    setShowCalendar(false);
    if (onClearAll) {
      onClearAll();
    }
  };

  const formatDateRange = () => {
    if (!selectedStartDate) return 'Select date range';
    if (!selectedEndDate) return format(selectedStartDate, 'MMM dd, yyyy');
    return `${format(selectedStartDate, 'MMM dd, yyyy')} - ${format(selectedEndDate, 'MMM dd, yyyy')}`;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateSelected = (date: Date) => {
    return (selectedStartDate && isSameDay(date, selectedStartDate)) || 
           (selectedEndDate && isSameDay(date, selectedEndDate));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Filter
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {formatDateRange()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showCalendar && (
        <CardContent className="space-y-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.value)}
                disabled={loading}
                className="text-xs h-8"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="border rounded-lg p-4">
            {/* Calendar Header with Month/Year Selectors */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousMonth}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                {/* Month Selector */}
                <Select
                  value={getMonth(currentMonth).toString()}
                  onValueChange={handleMonthChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month.slice(0, 3)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Selector */}
                <Select
                  value={getYear(currentMonth).toString()}
                  onValueChange={handleYearChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-20 sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                disabled={loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((date) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected = isDateSelected(date);
                const isInRange = isDateInRange(date);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    disabled={loading}
                    className={`
                      p-2 text-sm rounded-md transition-colors
                      ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                      ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                      ${isInRange && !isSelected ? 'bg-primary/20' : ''}
                      ${isTodayDate && !isSelected ? 'bg-accent' : ''}
                      ${!isSelected && !isInRange ? 'hover:bg-accent' : ''}
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
