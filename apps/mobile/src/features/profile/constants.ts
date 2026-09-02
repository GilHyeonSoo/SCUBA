import type {
  DivingDiscipline,
  FreedivingLevel,
  ScubaLevel,
} from '@/src/features/profile/types';

type LevelTone = 'default' | 'primary' | 'success' | 'warning';

type LevelConfig = {
  label: string;
  shortLabel: string;
  tone: LevelTone;
};

export const disciplineOptions: Array<{ value: DivingDiscipline; label: string }> = [
  { value: 'scuba', label: '스킨스쿠버' },
  { value: 'freediving', label: '프리다이빙' },
  { value: 'both', label: '둘 다' },
];

export const scubaLevelOptions: Array<{ value: ScubaLevel; label: string }> = [
  { value: 'try', label: '체험 다이빙' },
  { value: 'ow', label: 'Open Water' },
  { value: 'aow', label: 'Advanced OW' },
  { value: 'rescue', label: 'Rescue Diver' },
  { value: 'divemaster', label: 'Divemaster' },
  { value: 'instructor', label: 'Instructor' },
];

export const freedivingLevelOptions: Array<{ value: FreedivingLevel; label: string }> = [
  { value: 'intro', label: '입문' },
  { value: 'l1', label: 'Level 1' },
  { value: 'l2', label: 'Level 2' },
  { value: 'l3', label: 'Level 3' },
  { value: 'l4', label: 'Level 4' },
  { value: 'instructor', label: 'Instructor' },
];

export const scubaLevelConfig: Record<ScubaLevel, LevelConfig> = {
  try: { label: '체험 다이빙', shortLabel: 'TRY', tone: 'default' },
  ow: { label: 'Open Water', shortLabel: 'OW', tone: 'primary' },
  aow: { label: 'Advanced OW', shortLabel: 'AOW', tone: 'primary' },
  rescue: { label: 'Rescue Diver', shortLabel: 'RESCUE', tone: 'success' },
  divemaster: { label: 'Divemaster', shortLabel: 'DM', tone: 'warning' },
  instructor: { label: 'Instructor', shortLabel: 'INST', tone: 'warning' },
};

export const freedivingLevelConfig: Record<FreedivingLevel, LevelConfig> = {
  intro: { label: '입문', shortLabel: 'INTRO', tone: 'default' },
  l1: { label: 'Level 1', shortLabel: 'L1', tone: 'primary' },
  l2: { label: 'Level 2', shortLabel: 'L2', tone: 'primary' },
  l3: { label: 'Level 3', shortLabel: 'L3', tone: 'success' },
  l4: { label: 'Level 4', shortLabel: 'L4', tone: 'warning' },
  instructor: { label: 'Instructor', shortLabel: 'INST', tone: 'warning' },
};
