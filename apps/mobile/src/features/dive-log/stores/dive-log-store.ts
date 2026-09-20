import { create } from 'zustand';

import type { DiveComputerInfo, DiveImportPayload, DiveLog } from '@/src/features/dive-log/types';

function sortDives(dives: DiveLog[]): DiveLog[] {
  return [...dives].sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

type DiveLogStoreState = {
  dives: DiveLog[];
  device: DiveComputerInfo | null;
  lastImportedAt: string | null;
  lastSourceFile: string | null;
  mergeImport: (payload: DiveImportPayload) => {
    importedCount: number;
    updatedCount: number;
    skippedCount: number;
  };
  clearImportedLogs: () => void;
};

export const useDiveLogStore = create<DiveLogStoreState>((set, get) => ({
  dives: [],
  device: null,
  lastImportedAt: null,
  lastSourceFile: null,

  mergeImport: (payload) => {
    const existingById = new Map(get().dives.map((dive) => [dive.id, dive]));
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const dive of payload.dives) {
      const existing = existingById.get(dive.id);
      if (!existing) {
        existingById.set(dive.id, dive);
        importedCount += 1;
        continue;
      }

      if (existing.importedAt === dive.importedAt && existing.startedAt === dive.startedAt) {
        skippedCount += 1;
        continue;
      }

      existingById.set(dive.id, dive);
      updatedCount += 1;
    }

    set({
      dives: sortDives([...existingById.values()]),
      device: payload.device,
      lastImportedAt: payload.meta.importedAt,
      lastSourceFile: payload.meta.sourceFile,
    });

    return { importedCount, updatedCount, skippedCount };
  },

  clearImportedLogs: () => {
    set({
      dives: [],
      device: null,
      lastImportedAt: null,
      lastSourceFile: null,
    });
  },
}));
