/** Resolve app-root paths under the deployment prefix and preserve explicit external URLs. */
export function publicAssetUrl(path: string): string {
  if (path.startsWith('/') && !path.startsWith('//')) {
    return import.meta.env.BASE_URL + path.slice(1);
  }
  return path;
}
