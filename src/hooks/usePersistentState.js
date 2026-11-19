import { useEffect, useState } from 'react';
import { read, store } from '../lib/storage';

/** useState that loads from and saves to localStorage under `key`. */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  useEffect(() => { store(key, value); }, [key, value]);
  return [value, setValue];
}
