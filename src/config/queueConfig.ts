/** How long (in minutes) the system waits after calling a queue number before re-calling it. */
export const QUEUE_CALL_TIMEOUT_MINUTES = 2;

/** How many times a number is called (including the first call) before it's auto-skipped if unanswered. */
export const QUEUE_MAX_CALL_ATTEMPTS = 3;
