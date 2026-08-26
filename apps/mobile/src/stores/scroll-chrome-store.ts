import { create } from 'zustand';

type ScrollChromeState = {
  chromeVisible: boolean;
  setChromeVisible: (visible: boolean) => void;
  resetChrome: () => void;
};

export const useScrollChromeStore = create<ScrollChromeState>((set) => ({
  chromeVisible: true,
  setChromeVisible: (visible) => set({ chromeVisible: visible }),
  resetChrome: () => set({ chromeVisible: true }),
}));
