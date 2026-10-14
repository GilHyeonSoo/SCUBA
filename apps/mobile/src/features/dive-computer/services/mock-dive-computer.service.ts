import { generateMockDiveImportPayload, generateMockDivePreviews } from '@/src/features/dive-computer/adapters/mock/generate-import-payload';
import { MOCK_DIVE_COMPUTER_DEVICES } from '@/src/features/dive-computer/constants/mock-devices';
import type {
  MockDiveComputerDevice,
  MockDiveImportResult,
  MockDivePreview,
} from '@/src/features/dive-computer/types';
import { useDiveLogStore } from '@/src/features/dive-log/stores/dive-log-store';

const MOCK_CONNECT_DELAY_MS = 2600;

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export const mockDiveComputerService = {
  listDevices(brandId: string): MockDiveComputerDevice[] {
    return MOCK_DIVE_COMPUTER_DEVICES.filter((device) => device.brandId === brandId);
  },

  async scanAndConnect(_device: MockDiveComputerDevice): Promise<void> {
    await wait(MOCK_CONNECT_DELAY_MS);
  },

  listPendingDives(device: MockDiveComputerDevice): MockDivePreview[] {
    return generateMockDivePreviews(device);
  },

  async importSelectedDives(
    device: MockDiveComputerDevice,
    diveIds: string[],
  ): Promise<MockDiveImportResult> {
    if (diveIds.length === 0) {
      throw new Error('가져올 다이빙 로그를 하나 이상 선택해 주세요.');
    }

    const payload = await generateMockDiveImportPayload(device.brandId, device, diveIds);
    const { importedCount, updatedCount, skippedCount } = useDiveLogStore
      .getState()
      .mergeImport(payload);

    return {
      fileName: `mock-ble://${device.id}`,
      importedCount,
      updatedCount,
      skippedCount,
      device: payload.device,
      summary: payload.summary,
      cloudSynced: false,
      importFormat: 'mock-ble',
    };
  },
};
