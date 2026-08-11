import type { Provider, ServiceRequestResult } from "./api";

const KEY = "amigo.lastRequest";
const PROVIDER_KEY = "amigo.selectedProvider";

export type StoredRequest = { message: string; result: ServiceRequestResult };

export const requestStore = {
  save(value: StoredRequest) {
    if (typeof window !== "undefined") sessionStorage.setItem(KEY, JSON.stringify(value));
  },
  load(): StoredRequest | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredRequest;
    } catch {
      return null;
    }
  },
  saveProvider(p: Provider) {
    if (typeof window !== "undefined") sessionStorage.setItem(PROVIDER_KEY, JSON.stringify(p));
  },
  loadProvider(): Provider | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(PROVIDER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Provider;
    } catch {
      return null;
    }
  },
};
