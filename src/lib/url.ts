const localhostUrl = "http://localhost:3000";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getPublicAppUrl() {
  if (process.env.NEXTAUTH_URL) return trimTrailingSlash(process.env.NEXTAUTH_URL);
  if (process.env.AUTH_URL) return trimTrailingSlash(process.env.AUTH_URL);
  if (process.env.VERCEL_URL) return `https://${trimTrailingSlash(process.env.VERCEL_URL)}`;
  return localhostUrl;
}

export function getMetadataBase() {
  return new URL(getPublicAppUrl());
}

export function buildShareUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicAppUrl()}${normalizedPath}`;
}

export function buildInviteUrl(code: string) {
  return buildShareUrl(`/invite/${encodeURIComponent(code)}`);
}

export function sameUrlHost(left: string, right: string) {
  try {
    return new URL(left).host === new URL(right).host;
  } catch {
    return false;
  }
}

