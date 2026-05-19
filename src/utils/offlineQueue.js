// Offline mutation queue — persisted in localStorage.
//
// Architecture note:
// - When the device is offline, write mutations (POST/PUT/DELETE) are stored here.
// - On reconnect (window 'online' event), the queue is drained in FIFO order.
// - The server must be idempotent for these operations (use client-generated IDs).
//
// In production this queue feeds into:
//   1. Local SQLite (via Capacitor sqlite plugin or wa-sqlite WASM)
//   2. Cloud sync endpoint: POST /sync/batch
// The cloud DB (PostgreSQL) is the source of truth; SQLite is the offline replica.
// Conflict strategy: last-write-wins on `updatedAt` timestamp.

const QUEUE_KEY = 'vetrural_offline_queue';

export function enqueue(request) {
  const queue = getQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    method: request.method,
    url: request.url,
    data: request.data,
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function getQueueLength() {
  return getQueue().length;
}

// Intenta procesar la cola cuando vuelve la conexión.
// Llama a esta función en el listener 'online' de window.
export async function processQueue(apiInstance) {
  const queue = getQueue();
  if (queue.length === 0) return;

  const failed = [];
  for (const item of queue) {
    try {
      await apiInstance({ method: item.method, url: item.url, data: item.data });
    } catch {
      failed.push(item);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
  return { sent: queue.length - failed.length, failed: failed.length };
}
