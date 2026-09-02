import { create } from 'zustand';

import { mockMeetings } from '@/src/features/tour/mock-data';
import type { DiveMeeting } from '@/src/features/tour/types';

type MeetingStoreState = {
  meetings: DiveMeeting[];
  addMeeting: (meeting: DiveMeeting) => void;
  getMeetingById: (id: string) => DiveMeeting | undefined;
};

export const useMeetingStore = create<MeetingStoreState>((set, get) => ({
  meetings: mockMeetings,

  addMeeting: (meeting) => {
    set((state) => ({
      meetings: [meeting, ...state.meetings],
    }));
  },

  getMeetingById: (id) => get().meetings.find((meeting) => meeting.id === id),
}));
