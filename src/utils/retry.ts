export async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 800): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (e) { lastError = e; if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs)); }
  }
  throw lastError;
}
