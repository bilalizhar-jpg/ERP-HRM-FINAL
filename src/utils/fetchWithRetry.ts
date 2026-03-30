export const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 5, delay = 1000): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    
    // Check if the response is HTML (Vite fallback) when we expect an API response
    const contentType = res.headers.get("content-type");
    if (res.ok && url.startsWith('/api/') && contentType && contentType.includes("text/html")) {
      throw new Error(`Received HTML instead of JSON for API request: ${url}`);
    }

    if (!res.ok) {
      const text = await res.text();
      if (text.includes("Rate exceeded") && retries > 0) {
        console.warn(`Rate exceeded for ${url}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      if (res.status === 429 && retries > 0) {
        console.warn(`429 Too Many Requests for ${url}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`Failed to fetch ${url}: ${res.status} ${text}`);
    }
    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch error for ${url}, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};
