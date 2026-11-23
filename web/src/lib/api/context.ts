import { createContext } from 'svelte';
import type { AuxideApi } from './auxide-api.ts';

export const [getAuxideApi, setAuxideApi, hasAuxideApi] = createContext<AuxideApi>();
