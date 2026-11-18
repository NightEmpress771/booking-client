import { useEffect, useEffectEvent } from 'react';
import { socket } from '@/services/socket';

export function useSocketEvent<T>(event: string, handler: (payload: T) => void) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    const listener = (payload: T) => onEvent(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}