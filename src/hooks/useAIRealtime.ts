import { useEffect } from 'react';
import { createAISocket } from '@/services/aiAnalysis';
import { useAIStore, useWalletStore } from '@/store';

/**
 * Subscribes to the AI WebSocket stream for the connected wallet. Newly pushed
 * recommendations are prepended to the store (feeding the feed, timeline, and
 * alert count) without a page refresh. The socket is torn down on unmount or
 * when the account changes. Streaming is skipped while notifications are
 * disabled in settings.
 */
export const useAIRealtime = () => {
  const publicKey = useWalletStore((s) => s.account?.publicKey ?? null);
  const notificationsEnabled = useAIStore(
    (s) => s.settings.notificationsEnabled,
  );
  const addRecommendation = useAIStore((s) => s.addRecommendation);
  const setWsConnected = useAIStore((s) => s.setWsConnected);
  const wsConnected = useAIStore((s) => s.wsConnected);

  useEffect(() => {
    if (!publicKey || !notificationsEnabled) {
      setWsConnected(false);
      return;
    }

    const dispose = createAISocket(
      publicKey,
      (message) => addRecommendation(message.recommendation),
      (connected) => setWsConnected(connected),
    );

    return () => {
      setWsConnected(false);
      dispose();
    };
  }, [publicKey, notificationsEnabled, addRecommendation, setWsConnected]);

  return { connected: wsConnected };
};

export default useAIRealtime;
