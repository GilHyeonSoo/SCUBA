import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  formatImportResultMessage,
  importDiveLogFile,
} from '@/src/features/dive-log/services/dive-import.service';
import type { DiveImportFormat } from '@/src/features/dive-log/types';

export function useDiveImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const openImportSheet = useCallback(() => {
    setIsSheetVisible(true);
  }, []);

  const closeImportSheet = useCallback(() => {
    if (!isImporting) {
      setIsSheetVisible(false);
    }
  }, [isImporting]);

  const pickAndImport = useCallback(
    async (preferredFormat?: DiveImportFormat) => {
      if (isImporting) {
        return;
      }

      setIsImporting(true);
      try {
        const result = await importDiveLogFile(preferredFormat);
        if (!result) {
          return;
        }

        setIsSheetVisible(false);
        Alert.alert('가져오기 완료', formatImportResultMessage(result));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '다이빙 로그를 가져오지 못했습니다.';
        Alert.alert('가져오기 실패', message);
      } finally {
        setIsImporting(false);
      }
    },
    [isImporting],
  );

  return {
    isImporting,
    isSheetVisible,
    openImportSheet,
    closeImportSheet,
    pickAndImport,
  };
}
