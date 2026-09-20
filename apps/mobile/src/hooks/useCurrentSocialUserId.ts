import { useEffect, useState } from 'react';

import { CURRENT_USER_ID } from '@/src/features/social/constants';
import { getCurrentUserId, useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

export function useCurrentSocialUserId() {
  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isRemoteSocialEnabled) {
      setUserId(CURRENT_USER_ID);
      return;
    }

    let mounted = true;

    getCurrentUserId().then((id) => {
      if (mounted) {
        setUserId(id);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isRemoteSocialEnabled]);

  return {
    userId: isRemoteSocialEnabled ? userId : CURRENT_USER_ID,
    isLoading: isRemoteSocialEnabled && userId == null,
  };
}
