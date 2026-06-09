import { createContext, useContext } from 'react'

export const ScanGroupCtx = createContext(null)

export function useScanGroup() {
  return useContext(ScanGroupCtx)
}
