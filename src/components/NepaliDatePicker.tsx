import React, { useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { toNepaliDigits } from '../utils/numberFormat';

interface NepaliCalendarApi {
  getCurrentDate: () => string;
  convertADtoBS: (date: string) => string;
  convertBStoAD: (date: string) => string;
  UI: {
    createCalendar: (
      inputElement: HTMLInputElement,
      options: { initialDate: string; onSelect: (date: string) => void },
    ) => void;
  };
}

declare global {
  interface Window {
    NepaliCalendar: NepaliCalendarApi;
  }
}

interface NepaliDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'नेपाली मिति छान्नुहोस्',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openCalendar = () => {
    if (!inputRef.current || !window.NepaliCalendar) return;

    window.NepaliCalendar.UI.createCalendar(inputRef.current, {
      initialDate: value || window.NepaliCalendar.getCurrentDate(),
      onSelect: (date) => onChange(date),
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value ? toNepaliDigits(value) : ''}
        placeholder={placeholder}
        onClick={openCalendar}
        className={`${className} cursor-pointer pr-10`}
        aria-label="नेपाली मिति"
      />
      <CalendarDays className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
