"use client";

import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * Read a browser-only value (window.location, localStorage, ...) without a hydration
 * mismatch: the server render and hydration pass use `serverValue`, then the client
 * value takes over. `read` must return a primitive so snapshots compare equal.
 */
export function useBrowserValue<T extends string | number | boolean | null>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNever, read, () => serverValue);
}

/**
 * Where to send the user after signing in or registering (`?redirect=` or `?returnUrl=`).
 */
export function getPostAuthRedirect(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || params.get("returnUrl") || "/dashboard";
}
