import { create } from 'zustand';

interface CalendarState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
