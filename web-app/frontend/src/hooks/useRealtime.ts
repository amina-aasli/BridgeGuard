import { useCallback, useEffect, useRef } from 'react';
import { subscribeSensors } from '../services/supabase';

/** Polling + Supabase realtime — lecture seule des données externes */
export function useRealtime(refresh: () => void, intervalMs = 3000) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const stableRefresh = useCallback(() => {
    refreshRef.current();
  }, []);

  useEffect(() => {
    const interval = setInterval(stableRefresh, intervalMs);
    const channel = subscribeSensors(() => stableRefresh());

    return () => {
      clearInterval(interval);
      channel?.unsubscribe();
    };
  }, [stableRefresh, intervalMs]);
}
