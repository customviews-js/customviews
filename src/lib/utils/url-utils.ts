/**
 * Helper function to prepend baseUrl to a path
 * @param path The path to prepend the baseUrl to
 * @param baseUrl The base URL to prepend
 * @returns The full URL with baseUrl prepended if applicable
 */
export function prependBaseUrl(path: string, baseUrl: string): string {
  if (!baseUrl) return path;
  
  // Don't prepend if the path is already absolute (starts with http:// or https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure baseUrl doesn't end with / and path starts with /
  const cleanbaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  return cleanbaseUrl + cleanPath;
}
