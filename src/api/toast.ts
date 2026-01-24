type ToastType = 'error' | 'success' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  status?: number;
}

type ToastListener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let nextId = 1;
const listeners: Set<ToastListener> = new Set();

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function subscribe(fn: ToastListener): () => void {
  listeners.add(fn);
  fn([...toasts]);
  return () => listeners.delete(fn);
}

export function showToast(type: ToastType, message: string, status?: number) {
  const id = nextId++;
  const toast: Toast = { id, type, message, status };
  toasts = [...toasts, toast];
  notify();

  setTimeout(() => {
    dismissToast(id);
  }, 5000);

  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function showError(message: string, status?: number) {
  return showToast('error', message, status);
}

export function showSuccess(message: string) {
  return showToast('success', message);
}

export { type Toast, type ToastType };
