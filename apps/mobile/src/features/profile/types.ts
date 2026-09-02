export type DivingDiscipline = 'scuba' | 'freediving' | 'both';

export type ScubaLevel = 'try' | 'ow' | 'aow' | 'rescue' | 'divemaster' | 'instructor';

export type FreedivingLevel = 'intro' | 'l1' | 'l2' | 'l3' | 'l4' | 'instructor';

export type DiverProfile = {
  displayName: string;
  bio: string;
  profileImageUrl: string | null;
  discipline: DivingDiscipline;
  scubaLevel: ScubaLevel | null;
  freedivingLevel: FreedivingLevel | null;
  totalDives: number;
};

export type DiverProfileDraft = Omit<DiverProfile, 'totalDives'> & {
  totalDives: string;
};
