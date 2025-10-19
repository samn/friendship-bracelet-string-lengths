export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle proxy requests for BraceletBook
    if (url.pathname === '/api/proxy' && request.method === 'GET') {
      return handleProxy(request, url, ctx);
    }
  },
};

/**
 * Handles proxying requests to braceletbook.com with caching
 * Only allows requests to fetch pattern SVG files
 */
async function handleProxy(request, url, ctx) {
  const targetUrl = url.searchParams.get('url');

  // Validate that we have a URL
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const target = new URL(targetUrl);

    // Security: Only allow braceletbook.com
    if (target.hostname !== 'www.braceletbook.com' && target.hostname !== 'braceletbook.com') {
      return new Response(JSON.stringify({ error: 'Only braceletbook.com is allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Security: Only allow pattern.svg files in media/patterns path
    if (!target.pathname.includes('/media/patterns/') || !target.pathname.endsWith('pattern.svg')) {
      return new Response(JSON.stringify({ error: 'Only pattern.svg files are allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a cache key request - use GET method for cache consistency
    const cacheRequest = new Request(targetUrl, { method: 'GET' });
    const cache = caches.default;

    // Check if response is already cached
    let cachedResponse = await cache.match(cacheRequest);
    if (cachedResponse) {
      // Clone the cached response and add cache hit header
      const clonedResponse = new Response(cachedResponse.body, cachedResponse);
      clonedResponse.headers.set('X-Cache', 'hit');
      return clonedResponse;
    }

    // Fetch from BraceletBook
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'BraceletBookStringLengthCalculator/1.0',
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch from BraceletBook: ${response.status}` }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Clone the response and add CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET');
    newResponse.headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    newResponse.headers.set('Content-Type', 'image/svg+xml; charset=utf-8');
    newResponse.headers.set('X-Cache', 'miss');

    // Store the successful response in Cloudflare Cache
    ctx.waitUntil(cache.put(cacheRequest, newResponse.clone()));

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
