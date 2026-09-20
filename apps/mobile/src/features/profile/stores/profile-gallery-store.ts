import { create } from 'zustand';

import { mockProfileGalleryImages } from '@/src/features/profile/mock-data/profile-gallery-mock-data';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import { CURRENT_USER_ID } from '@/src/features/social/constants';

type ProfileGalleryState = {
  images: ProfileGalleryImage[];
  setImages: (images: ProfileGalleryImage[]) => void;
  addImage: (uri: string) => void;
  removeImage: (id: string) => void;
  resetGallery: () => void;
};

function createGalleryImage(uri: string): ProfileGalleryImage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    uri,
    createdAt: Date.now(),
    userId: CURRENT_USER_ID,
  };
}

const initialImages = mockProfileGalleryImages.map((image) => ({
  ...image,
  userId: CURRENT_USER_ID,
}));

export const useProfileGalleryStore = create<ProfileGalleryState>((set) => ({
  images: initialImages,

  setImages: (images) => {
    set({ images });
  },

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
    set({ images: initialImages });
  },
}));
