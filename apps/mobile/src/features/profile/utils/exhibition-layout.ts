import { Dimensions } from 'react-native';

import { spacing } from '@/src/constants';

export const EXHIBITION_PAGINATION_HEIGHT = 36;
export const EXHIBITION_META_RESERVE = 84;
export const EXHIBITION_PHOTO_META_GAP = spacing.sm;
export const EXHIBITION_CARD_SIDE_INSET = spacing.lg;

/** Profile row + icon tab bar above the gallery stage (approximate). */
const GALLERY_TOP_CHROME = 188;

const SLIDE_MIN_HEIGHT = 320;
const SLIDE_MAX_HEIGHT = 420;

type ExhibitionLayoutInput = {
  screenHeight?: number;
  topInset: number;
  bottomTabInset: number;
};

export type ExhibitionLayout = {
  slideHeight: number;
  stageHeight: number;
  cardHeight: number;
  cardSideInset: number;
  metaReserve: number;
};

export function getExhibitionLayout({
  screenHeight = Dimensions.get('window').height,
  topInset,
  bottomTabInset,
}: ExhibitionLayoutInput): ExhibitionLayout {
  const visibleBudget = screenHeight - topInset - bottomTabInset - GALLERY_TOP_CHROME;
  const slideHeight = Math.round(
    Math.min(Math.max(visibleBudget * 0.9, SLIDE_MIN_HEIGHT), SLIDE_MAX_HEIGHT),
  );
  const cardHeight = slideHeight - EXHIBITION_META_RESERVE - EXHIBITION_PHOTO_META_GAP;

  return {
    slideHeight,
    stageHeight: slideHeight + EXHIBITION_PAGINATION_HEIGHT,
    cardHeight,
    cardSideInset: EXHIBITION_CARD_SIDE_INSET,
    metaReserve: EXHIBITION_META_RESERVE,
  };
}
