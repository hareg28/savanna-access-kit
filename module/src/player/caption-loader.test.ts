import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCaptionUrl,
  isTrustedApiEndpoint,
  isStaticMediaUrl,
  shouldSendApiKey,
  fetchCaptionTrack,
  formatPackSize,
} from './caption-loader.ts';

test('caption-loader: URL Resolution - absolute HTTP/HTTPS URLs pass through', () => {
  const url1 = 'https://cdn.example.com/subtitles/en.vtt';
  assert.equal(resolveCaptionUrl({ urlPath: url1 }), url1);

  const url2 = 'http://localhost:4010/media/en.vtt';
  assert.equal(resolveCaptionUrl({ urlPath: url2 }), url2);
});

test('caption-loader: URL Resolution - rejects invalid/dangerous protocols', () => {
  assert.throws(
    () => resolveCaptionUrl({ urlPath: 'javascript:alert(1)' }),
    /Invalid caption URL protocol/
  );

  assert.throws(
    () => resolveCaptionUrl({ urlPath: 'file:///etc/passwd' }),
    /Invalid caption URL protocol/
  );

  assert.throws(
    () => resolveCaptionUrl({ urlPath: 'data:text/vtt;base64,VEVTVF9DQUxM' }),
    /Invalid caption URL protocol/
  );
});

test('caption-loader: URL Resolution - relative paths with and without leading slashes against apiBase', () => {
  // With trailing slash on apiBase
  assert.equal(
    resolveCaptionUrl({ urlPath: '/media/en.vtt', apiBase: 'http://localhost:4010/' }),
    'http://localhost:4010/media/en.vtt'
  );
  assert.equal(
    resolveCaptionUrl({ urlPath: 'media/en.vtt', apiBase: 'http://localhost:4010/' }),
    'http://localhost:4010/media/en.vtt'
  );

  // Without trailing slash on apiBase
  assert.equal(
    resolveCaptionUrl({ urlPath: '/media/en.vtt', apiBase: 'http://localhost:4010' }),
    'http://localhost:4010/media/en.vtt'
  );
  assert.equal(
    resolveCaptionUrl({ urlPath: 'media/en.vtt', apiBase: 'http://localhost:4010' }),
    'http://localhost:4010/media/en.vtt'
  );

  // Subpath on apiBase
  assert.equal(
    resolveCaptionUrl({ urlPath: 'media/am.vtt', apiBase: 'https://api.savanna.org/v1/' }),
    'https://api.savanna.org/v1/media/am.vtt'
  );
});

test('caption-loader: URL Resolution - falls back to documentOrigin when apiBase is absent', () => {
  assert.equal(
    resolveCaptionUrl({ urlPath: '/media/en.vtt', documentOrigin: 'https://school.savanna.edu' }),
    'https://school.savanna.edu/media/en.vtt'
  );
});

test('caption-loader: URL Resolution - throws when both apiBase and documentOrigin are missing in headless env', () => {
  assert.throws(
    () => resolveCaptionUrl({ urlPath: '/media/en.vtt' }),
    /No API base configured and no browser origin available/
  );
});

test('caption-loader: Credential Isolation - shouldSendApiKey rules', () => {
  const apiBase = 'https://api.savanna.org';
  const apiKey = 'test-secret-key-123';

  // 1. Trusted API endpoint receives key
  assert.equal(
    shouldSendApiKey('https://api.savanna.org/v1/lessons/L-102/captions/en.vtt', apiKey, apiBase),
    true
  );

  // 2. Static media on the same host does NOT receive key
  assert.equal(
    shouldSendApiKey('https://api.savanna.org/media/en.vtt', apiKey, apiBase),
    false
  );

  // 3. External CDN does NOT receive key
  assert.equal(
    shouldSendApiKey('https://cdn.savanna.org/media/en.vtt', apiKey, apiBase),
    false
  );

  // 4. Missing API key returns false
  assert.equal(
    shouldSendApiKey('https://api.savanna.org/v1/lessons/L-102/captions/en.vtt', '', apiBase),
    false
  );

  // 5. Missing apiBase returns false
  assert.equal(
    shouldSendApiKey('https://api.savanna.org/v1/lessons/L-102/captions/en.vtt', apiKey, undefined),
    false
  );
});

test('caption-loader: fetchCaptionTrack - sends X-Savanna-Key only to API endpoints', async () => {
  let capturedHeaders: Record<string, string> = {};
  const mockFetch: typeof fetch = async (input, init) => {
    capturedHeaders = (init?.headers as Record<string, string>) || {};
    return new Response('WEBVTT\n\n00:00.000 --> 00:02.000\nHello world', {
      status: 200,
      headers: { 'Content-Type': 'text/vtt' },
    });
  };

  // Case A: Trusted API endpoint -> Key is sent
  await fetchCaptionTrack({
    url: 'https://api.savanna.org/v1/lessons/L-102/captions/en.vtt',
    apiKey: 'my-secret-key',
    apiBase: 'https://api.savanna.org',
    fetchFn: mockFetch,
  });
  assert.equal(capturedHeaders['X-Savanna-Key'], 'my-secret-key');

  // Case B: Static media endpoint -> Key is omitted
  capturedHeaders = {};
  await fetchCaptionTrack({
    url: 'https://api.savanna.org/media/en.vtt',
    apiKey: 'my-secret-key',
    apiBase: 'https://api.savanna.org',
    fetchFn: mockFetch,
  });
  assert.equal(capturedHeaders['X-Savanna-Key'], undefined);
});

test('caption-loader: fetchCaptionTrack - safely strips credentials on cross-origin redirect', async () => {
  const requestLog: Array<{ url: string; headers: Record<string, string> }> = [];

  const mockFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    const headers = (init?.headers as Record<string, string>) || {};
    requestLog.push({ url, headers });

    if (url === 'https://api.savanna.org/v1/lessons/L-102/captions/en.vtt') {
      // 302 Redirect to external CDN
      return new Response(null, {
        status: 302,
        headers: {
          location: 'https://storage.googleapis.com/savanna-assets/en.vtt',
        },
      });
    }

    if (url === 'https://storage.googleapis.com/savanna-assets/en.vtt') {
      return new Response('WEBVTT\n\n00:00.000 --> 00:02.000\nRedirected cue', {
        status: 200,
        headers: { 'Content-Type': 'text/vtt' },
      });
    }

    return new Response('Not found', { status: 404 });
  };

  const result = await fetchCaptionTrack({
    url: 'https://api.savanna.org/v1/lessons/L-102/captions/en.vtt',
    apiKey: 'my-secret-key',
    apiBase: 'https://api.savanna.org',
    fetchFn: mockFetch,
  });

  assert.match(result.text, /Redirected cue/);
  assert.equal(requestLog.length, 2);

  // Initial request carried the key
  assert.equal(requestLog[0].headers['X-Savanna-Key'], 'my-secret-key');
  // Redirected request MUST NOT carry the key
  assert.equal(requestLog[1].headers['X-Savanna-Key'], undefined);
});

test('caption-loader: fetchCaptionTrack - handles authentication failure (401/403) and 404', async () => {
  const mockFetch401: typeof fetch = async () =>
    new Response('Unauthorized', { status: 401 });

  await assert.rejects(
    () =>
      fetchCaptionTrack({
        url: 'https://api.savanna.org/v1/lessons/L-102/captions/en.vtt',
        apiKey: 'bad-key',
        apiBase: 'https://api.savanna.org',
        fetchFn: mockFetch401,
      }),
    /Authentication failed for caption request: HTTP 401/
  );

  const mockFetch404: typeof fetch = async () =>
    new Response('Not Found', { status: 404 });

  await assert.rejects(
    () =>
      fetchCaptionTrack({
        url: 'https://api.savanna.org/media/nonexistent.vtt',
        apiBase: 'https://api.savanna.org',
        fetchFn: mockFetch404,
      }),
    /Failed to load caption file: HTTP 404/
  );
});

test('caption-loader: formatPackSize - formats dynamic sizes without hardcoding', () => {
  assert.equal(formatPackSize(undefined), '');
  assert.equal(formatPackSize(0), '');
  assert.equal(formatPackSize(-500), '');
  assert.equal(formatPackSize(512), '512 B');
  assert.equal(formatPackSize(1024), '1.0 KB');
  assert.equal(formatPackSize(1536), '1.5 KB');
  assert.equal(formatPackSize(1800000), '1.72 MB');
  assert.equal(formatPackSize(10485760), '10.00 MB');
});
