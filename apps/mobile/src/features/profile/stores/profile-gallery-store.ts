import { create } from 'zustand';

import { mockProfileGalleryImages } from '@/src/features/profile/mock-data/profile-gallery-mock-data';
import type { ProfileGalleryImage } from '@/src/features/profile/types';

type ProfileGalleryState = {
  images: ProfileGalleryImage[];
  addImage: (uri: string) => void;
  removeImage: (id: string) => void;
  resetGallery: () => void;
};

function createGalleryImage(uri: string): ProfileGalleryImage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    uri,
    createdAt: Date.now(),
  };
}

export const useProfileGalleryStore = create<ProfileGalleryState>((set) => ({
  images: mockProfileGalleryImages,

  addImage: (uri) => {
    set((state) => ({
      images: [createGalleryImage(uri), ...state.images],
    }));
  },

  removeImage: (id) => {
    set((state) => ({
      images: state.images.filter((image) => image.id !== id),
    }));
  },

  resetGallery: () => {
    set({ images: mockProfileGalleryImages });
  },
}));
