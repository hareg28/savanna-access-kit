/**
 * Caption Loader & URL Normalizer for Savanna Access Kit (Contract C1 / C6).
 * Handles secure caption track URL resolution, origin-isolated authentication,
 * redirect safety, and Object URL lifecycle management.
 */

export interface ResolveCaptionUrlOptions {
  urlPath: string;
  apiBase?: string;
  documentOrigin?: string;
}

/**
 * Resolves and validates a caption URL against the configured API base or page origin.
 *
 * Rules:
 * 1. Absolute URLs (http/https) are validated and returned as-is.
 * 2. Relative paths resolve against apiBase if provided, otherwise against documentOrigin.
 * 3. In non-browser environments without an explicit base, throws an error rather than guessing localhost.
 * 4. Strictly validates and permits only HTTP and HTTPS protocols.
 */
export function resolveCaptionUrl(options: ResolveCaptionUrlOptions): string {
  const { urlPath, apiBase, documentOrigin } = options;
  if (!urlPath || typeof urlPath !== 'string') {
    throw new Error('Caption path must be a non-empty string');
  }

  const trimmedPath = urlPath.trim();

  // 1. Check if already an absolute URL
  try {
    const parsed = new URL(trimmedPath);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Invalid caption URL protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
    }
    return parsed.href;
  } catch (err: any) {
    if (err.message && err.message.includes('Only HTTP and HTTPS')) {
      throw err;
    }
    // Relative URL; proceed to resolution against base
  }

  // 2. Determine base origin/path
  let base = apiBase?.trim();
  if (!base) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      base = window.location.origin;
    } else if (documentOrigin?.trim()) {
      base = documentOrigin.trim();
    }
  }

  if (!base) {
    throw new Error(
      `Cannot resolve relative caption path "${trimmedPath}": No API base configured and no browser origin available.`
    );
  }

  // Validate base protocol
  try {
    const parsedBase = new URL(base);
    if (parsedBase.protocol !== 'http:' && parsedBase.protocol !== 'https:') {
      throw new Error(`Base URL protocol "${parsedBase.protocol}" must be HTTP or HTTPS.`);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('must be HTTP or HTTPS')) throw err;
    throw new Error(`Invalid base URL "${base}": ${err.message}`);
  }

  if (!base.endsWith('/')) {
    base += '/';
  }

  // 3. Resolve relative path
  const cleanPath = trimmedPath.startsWith('/') ? trimmedPath.slice(1) : trimmedPath;
  const resolved = new URL(cleanPath, base);

  if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
    throw new Error(`Resolved caption URL "${resolved.href}" must use HTTP or HTTPS.`);
  }

  return resolved.href;
}

/**
 * Checks whether a URL is an authenticated API endpoint on the configured API base.
 */
export function isTrustedApiEndpoint(url: string, apiBase?: string): boolean {
  if (!apiBase) return false;
  try {
    const target = new URL(url);
    const api = new URL(apiBase);
    if (target.origin !== api.origin) return false;
    // API routes typically start with /v1/ or the API base pathname
    return target.pathname.startsWith('/v1/') && !target.pathname.startsWith('/media/');
  } catch {
    return false;
  }
}

/**
 * Checks whether a URL points to static media (which does not require API key).
 */
export function isStaticMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/media/') || parsed.pathname.includes('/static/');
  } catch {
    return false;
  }
}

/**
 * Determines whether the API key should be sent with the request.
 * Never sends credentials to static media, CDN URLs, or external origins.
 */
export function shouldSendApiKey(url: string, apiKey?: string, apiBase?: string): boolean {
  if (!apiKey || !apiKey.trim()) return false;
  if (isStaticMediaUrl(url)) return false;
  return isTrustedApiEndpoint(url, apiBase);
}

/**
 * Formats a byte count dynamically into a human-readable string without hardcoded values.
 */
export function formatPackSize(bytes?: number): string {
  if (typeof bytes !== 'number' || bytes <= 0 || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface FetchCaptionOptions {
  url: string;
  apiKey?: string;
  apiBase?: string;
  createBlobUrl?: boolean;
  fetchFn?: typeof fetch;
}

export interface FetchCaptionResult {
  text: string;
  blobUrl?: string;
}

/**
 * Fetches a WebVTT caption track securely:
 * - Sends X-Savanna-Key ONLY to trusted API endpoints.
 * - Prevents automatic forwarding of credentials on cross-origin redirects.
 * - Optionally generates an in-memory Blob URL for native <track> elements.
 */
export async function fetchCaptionTrack(options: FetchCaptionOptions): Promise<FetchCaptionResult> {
  const { url, apiKey, apiBase, createBlobUrl = false, fetchFn = fetch } = options;

  const mustAuthenticate = shouldSendApiKey(url, apiKey, apiBase);
  const headers: Record<string, string> = {};

  if (mustAuthenticate && apiKey) {
    headers['X-Savanna-Key'] = apiKey;
  }

  // When authenticating, use redirect: 'manual' to prevent credential leakage
  const response = await fetchFn(url, {
    headers,
    redirect: mustAuthenticate ? 'manual' : 'follow',
  });

  // Handle redirect responses safely
  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    const location = response.headers.get('location');
    if (location) {
      // Re-resolve target URL without sending auth headers
      const targetUrl = resolveCaptionUrl({ urlPath: location, apiBase });
      const targetResponse = await fetchFn(targetUrl, {
        headers: {}, // Do NOT forward API key to redirect target
        redirect: 'follow',
      });
      if (!targetResponse.ok) {
        throw new Error(`Failed to fetch redirected caption file: HTTP ${targetResponse.status}`);
      }
      const text = await targetResponse.text();
      return processCaptionText(text, createBlobUrl);
    }
    // Browser opaque redirect where location header cannot be read
    throw new Error(
      'Authenticated caption endpoint returned an opaque redirect. Direct caption streaming or same-origin endpoint required.'
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(`Authentication failed for caption request: HTTP ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to load caption file: HTTP ${response.status}`);
  }

  const text = await response.text();
  return processCaptionText(text, createBlobUrl);
}

function processCaptionText(text: string, createBlobUrl: boolean): FetchCaptionResult {
  let blobUrl: string | undefined;
  if (createBlobUrl && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof Blob !== 'undefined') {
    try {
      const blob = new Blob([text], { type: 'text/vtt' });
      blobUrl = URL.createObjectURL(blob);
    } catch {
      // Gracefully fall back if Blob creation fails in non-browser env
    }
  }
  return { text, blobUrl };
}
