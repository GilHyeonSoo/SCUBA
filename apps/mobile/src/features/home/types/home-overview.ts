import type { DiveProfileSample } from '@/src/features/dive-log/types';
import type { HomeBuddy, HomeMaintenance, HomeTour } from '@/src/features/home/mock-data';

export type HomeOverviewRecentPanel = {
  type: 'recent';
  site: string;
  date: string;
  maxDepth: number;
  durationMin: number;
  waterTempC: number;
  profile: DiveProfileSample[];
};

export type HomeOverviewBuddyPanel = {
  type: 'buddy';
  count: number;
  buddies: HomeBuddy[];
};

export type HomeOverviewGearPanel = {
  type: 'gear';
  maintenance: HomeMaintenance | null;
};

export type HomeOverviewTourPanel = {
  type: 'tour';
  tour: HomeTour;
  filledSeats: number;
  totalSeats: number;
};

export type HomeOverviewPanel =
  | HomeOverviewRecentPanel
  | HomeOverviewBuddyPanel
  | HomeOverviewGearPanel
  | HomeOverviewTourPanel;
