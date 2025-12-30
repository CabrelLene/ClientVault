import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  timeout?: number; // ms
};

function uid() {
  return crypto.randomUUID?.() ?? String(Date.now() + Math.random());
}

const toasts = writable<Toast[]>([]);

function push(type: ToastType, message: string, timeout = 2800) {
  const id = uid();
  const t: Toast = { id, type, message, timeout };
  toasts.update((arr) => [t, ...arr]);

  if (timeout > 0) {
    setTimeout(() => {
      toasts.update((arr) => arr.filter((x) => x.id !== id));
    }, timeout);
  }
}

function remove(id: string) {
  toasts.update((arr) => arr.filter((x) => x.id !== id));
}

export const toast = {
  subscribe: toasts.subscribe,
  success: (m: string, ms?: number) => push('success', m, ms),
  error: (m: string, ms?: number) => push('error', m, ms),
  info: (m: string, ms?: number) => push('info', m, ms),
  remove
};
