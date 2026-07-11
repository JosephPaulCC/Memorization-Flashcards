import { useSyncExternalStore } from 'react'
import { store } from './flashcardsStore'

export function useStore() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
