import {
  freedivingLevelConfig,
  scubaLevelConfig,
} from '@/src/features/profile/constants';
import type {
  DiverProfile,
  FreedivingLevel,
  ScubaLevel,
} from '@/src/features/profile/types';

export type ProfileLevelBadge = {
  key: string;
  shortLabel: string;
  label: string;
  tone: 'default' | 'primary' | 'success' | 'warning';
};

export function getProfileLevelBadges(profile: DiverProfile): ProfileLevelBadge[] {
  const badges: ProfileLevelBadge[] = [];

  if ((profile.discipline === 'scuba' || profile.discipline === 'both') && profile.scubaLevel) {
    const config = scubaLevelConfig[profile.scubaLevel];
    badges.push({
      key: `scuba-${profile.scubaLevel}`,
      shortLabel: config.shortLabel,
      label: config.label,
      tone: config.tone,
    });
  }

  if (
    (profile.discipline === 'freediving' || profile.discipline === 'both') &&
    profile.freedivingLevel
  ) {
    const config = freedivingLevelConfig[profile.freedivingLevel];
    badges.push({
      key: `freediving-${profile.freedivingLevel}`,
      shortLabel: config.shortLabel,
      label: config.label,
      tone: config.tone,
    });
  }

  return badges;
}

export function getDefaultLevelForDiscipline(
  discipline: DiverProfile['discipline'],
): Pick<DiverProfile, 'scubaLevel' | 'freedivingLevel'> {
  switch (discipline) {
    case 'scuba':
      return { scubaLevel: 'ow', freedivingLevel: null };
    case 'freediving':
      return { scubaLevel: null, freedivingLevel: 'l1' };
    case 'both':
      return { scubaLevel: 'ow', freedivingLevel: 'l1' };
  }
}

export function normalizeScubaLevel(level: ScubaLevel | null): ScubaLevel {
  return level ?? 'ow';
}

export function normalizeFreedivingLevel(level: FreedivingLevel | null): FreedivingLevel {
  return level ?? 'l1';
}

export function formatProfileGreeting(displayName: string): string {
  const name = displayName.trim() || '다이버';
  return `안녕하세요, ${name}님`;
}
