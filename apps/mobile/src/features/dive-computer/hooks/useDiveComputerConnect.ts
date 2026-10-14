import { useCallback, useRef, useState } from 'react';

import { mockDiveComputerService } from '@/src/features/dive-computer/services/mock-dive-computer.service';
import type {
  ConnectStep,
  MockDiveComputerDevice,
  MockDiveImportResult,
  MockDivePreview,
} from '@/src/features/dive-computer/types';

const CONNECTED_CHECK_DURATION_MS = 650;

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export function useDiveComputerConnect() {
  const [step, setStep] = useState<ConnectStep>('brand');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<MockDiveComputerDevice | null>(null);
  const [pendingDives, setPendingDives] = useState<MockDivePreview[]>([]);
  const [selectedDiveIds, setSelectedDiveIds] = useState<string[]>([]);
  const [connectionComplete, setConnectionComplete] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const connectionAttemptRef = useRef(0);

  const reset = useCallback(() => {
    connectionAttemptRef.current += 1;
    setStep('brand');
    setSelectedBrandId(null);
    setSelectedDevice(null);
    setPendingDives([]);
    setSelectedDiveIds([]);
    setConnectionComplete(false);
    setIsImporting(false);
    setErrorMessage(null);
  }, []);

  const selectBrand = useCallback((brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedDevice(null);
    setPendingDives([]);
    setSelectedDiveIds([]);
    setErrorMessage(null);
    setStep('device');
  }, []);

  const connectDevice = useCallback(async (device: MockDiveComputerDevice) => {
    const attemptId = connectionAttemptRef.current + 1;
    connectionAttemptRef.current = attemptId;
    setSelectedDevice(device);
    setConnectionComplete(false);
    setErrorMessage(null);
    setStep('connecting');

    try {
      await mockDiveComputerService.scanAndConnect(device);
      if (connectionAttemptRef.current !== attemptId) {
        return;
      }

      setConnectionComplete(true);
      await wait(CONNECTED_CHECK_DURATION_MS);
      if (connectionAttemptRef.current !== attemptId) {
        return;
      }

      const dives = mockDiveComputerService.listPendingDives(device);
      setPendingDives(dives);
      setSelectedDiveIds(dives.map((dive) => dive.id));
      setStep('sync');
    } catch {
      if (connectionAttemptRef.current !== attemptId) {
        return;
      }

      setConnectionComplete(false);
      setErrorMessage('기기와 연결하지 못했습니다. 다시 시도해 주세요.');
    }
  }, []);

  const goBack = useCallback(() => {
    setErrorMessage(null);

    if (step === 'device') {
      setSelectedBrandId(null);
      setStep('brand');
      return;
    }

    if (step === 'connecting' || step === 'sync') {
      connectionAttemptRef.current += 1;
      setSelectedDevice(null);
      setPendingDives([]);
      setSelectedDiveIds([]);
      setConnectionComplete(false);
      setStep('device');
    }
  }, [step]);

  const toggleDive = useCallback((diveId: string) => {
    setSelectedDiveIds((current) =>
      current.includes(diveId)
        ? current.filter((selectedId) => selectedId !== diveId)
        : [...current, diveId],
    );
  }, []);

  const toggleAllDives = useCallback(() => {
    setSelectedDiveIds((current) =>
      current.length === pendingDives.length ? [] : pendingDives.map((dive) => dive.id),
    );
  }, [pendingDives]);

  const importSelectedDives = useCallback(async (): Promise<MockDiveImportResult | null> => {
    if (!selectedDevice || selectedDiveIds.length === 0 || isImporting) {
      return null;
    }

    setIsImporting(true);
    setErrorMessage(null);
    try {
      return await mockDiveComputerService.importSelectedDives(selectedDevice, selectedDiveIds);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '다이빙 로그를 가져오지 못했습니다.',
      );
      return null;
    } finally {
      setIsImporting(false);
    }
  }, [isImporting, selectedDevice, selectedDiveIds]);

  return {
    step,
    selectedBrandId,
    selectedDevice,
    pendingDives,
    selectedDiveIds,
    connectionComplete,
    isImporting,
    errorMessage,
    reset,
    selectBrand,
    connectDevice,
    goBack,
    toggleDive,
    toggleAllDives,
    importSelectedDives,
  };
}
