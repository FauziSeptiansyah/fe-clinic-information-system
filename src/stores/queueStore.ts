import { create } from "zustand";
import { Queue } from "@/types";

/**
 * A thin, reactive cache of the queue list — NOT the source of truth for status
 * transitions. All transitions (call/start/complete/cancel/no-show) go through
 * `queueService` (the single place a queue number is minted and its status moves),
 * then callers refresh this cache via `setQueues`/`updateQueue`.
 */
interface QueueState {
  queues: Queue[];
  setQueues: (queues: Queue[]) => void;
  addQueue: (queue: Queue) => void;
  updateQueue: (queue: Queue) => void;
  getWaitingCount: (departmentId?: string) => number;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queues: [],

  setQueues: (queues: Queue[]) => set({ queues }),

  addQueue: (queue: Queue) => {
    set((state) => ({ queues: [queue, ...state.queues] }));
  },

  updateQueue: (queue: Queue) => {
    set((state) => ({
      queues: state.queues.map((q) => (q.id === queue.id ? queue : q)),
    }));
  },

  getWaitingCount: (departmentId?: string) => {
    const { queues } = get();
    return queues.filter((q) => {
      const isWaiting = q.status === "WAITING" || q.status === "CALLED";
      return departmentId ? isWaiting && q.departmentId === departmentId : isWaiting;
    }).length;
  },
}));
