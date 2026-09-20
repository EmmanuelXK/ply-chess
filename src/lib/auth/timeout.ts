export const AUTH_PROXY_TIMEOUT_MS = 1500;
export const AUTH_HYDRATE_TIMEOUT_MS = 2000;
export const AUTH_OAUTH_START_TIMEOUT_MS = 2000;

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

/** Reject if `promise` has not settled before `ms`. Does not cancel the work. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new TimeoutError(ms)), ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(id);
        reject(error);
      },
    );
  });
}
