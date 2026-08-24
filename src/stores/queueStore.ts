import { create } from "zustand";
import { Queue, QueueStatus } from "@/types";

interface QueueState {
  queues: Queue[];
  currentServing: Record<string, Queue | null>; // departmentId -> Queue
  setQueues: (queues: Queue[]) => void;
  addQueue: (queue: Queue) => void;
  updateQueueStatus: (queueId: string, status: QueueStatus) => void;
  callQueue: (queueId: string) => void;
  startService: (queueId: string) => void;
  completeQueue: (queueId: string) => void;
  skipQueue: (queueId: string) => void;
  cancelQueue: (queueId: string) => void;
  getWaitingCount: (departmentId?: string) => number;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queues: [],
  currentServing: {},

  setQueues: (queues: Queue[]) => {
    const currentServing: Record<string, Queue | null> = {};
    queues.forEach((q) => {
      if (q.status === "IN_SERVICE" || q.status === "CALLED") {
        currentServing[q.departmentId] = q;
      }
    });
    set({ queues, currentServing });
  },

  addQueue: (queue: Queue) => {
    set((state) => ({
      queues: [queue, ...state.queues],
    }));
  },

  updateQueueStatus: (queueId: string, status: QueueStatus) => {
    set((state) => {
      const updatedQueues = state.queues.map((q) => {
        if (q.id === queueId) {
          const now = new Date().toISOString();
          return {
            ...q,
            status,
            calledAt: status === "CALLED" ? now : q.calledAt,
            serviceStartedAt: status === "IN_SERVICE" ? now : q.serviceStartedAt,
            completedAt: status === "COMPLETED" ? now : q.completedAt,
          };
        }
        return q;
      });

      const currentServing = { ...state.currentServing };
      const updatedQueue = updatedQueues.find((q) => q.id === queueId);
      if (updatedQueue) {
        if (status === "CALLED" || status === "IN_SERVICE") {
          currentServing[updatedQueue.departmentId] = updatedQueue;
        } else if (status === "COMPLETED" || status === "SKIPPED" || status === "CANCELLED") {
          if (currentServing[updatedQueue.departmentId]?.id === queueId) {
            currentServing[updatedQueue.departmentId] = null;
          }
        }
      }

      return { queues: updatedQueues, currentServing };
    });
  },

  callQueue: (queueId: string) => {
    get().updateQueueStatus(queueId, "CALLED");
  },

  startService: (queueId: string) => {
    get().updateQueueStatus(queueId, "IN_SERVICE");
  },

  completeQueue: (queueId: string) => {
    get().updateQueueStatus(queueId, "COMPLETED");
  },

  skipQueue: (queueId: string) => {
    get().updateQueueStatus(queueId, "SKIPPED");
  },

  cancelQueue: (queueId: string) => {
    get().updateQueueStatus(queueId, "CANCELLED");
  },

  getWaitingCount: (departmentId?: string) => {
    const { queues } = get();
    return queues.filter((q) => {
      const isWaiting = q.status === "WAITING" || q.status === "CALLED";
      return departmentId ? isWaiting && q.departmentId === departmentId : isWaiting;
    }).length;
  },
}));
