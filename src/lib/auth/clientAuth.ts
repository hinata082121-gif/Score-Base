"use client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  displayName: string;
  image: string;
  emailVerified: string;
  createdAt: string;
  updatedAt: string;
};

type StoredAuthUser = AuthUser & {
  passwordHash: string;
};

export type WorkspaceContext =
  | { type: "personal"; label: string }
  | { type: "team"; teamId: string; label: string };

const usersKey = "score-base:auth:users";
const sessionKey = "score-base:auth:session";
const contextKey = "score-base:auth:workspace-context";
const authChangedEvent = "score-base:auth-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T) {
  if (!isBrowser()) return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(authChangedEvent));
}

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function hashPassword(password: string) {
  const text = `score-base:${password}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(text)));
}

function publicUser(user: StoredAuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    displayName: user.displayName,
    image: user.image,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function loadAuthUsers() {
  return read<StoredAuthUser[]>(usersKey, []);
}

export function loadCurrentUser(): AuthUser | null {
  const session = read<{ userId: string } | null>(sessionKey, null);
  if (!session?.userId) return null;
  const user = loadAuthUsers().find((item) => item.id === session.userId);
  return user ? publicUser(user) : null;
}

export function onAuthChanged(callback: () => void) {
  if (!isBrowser()) return () => undefined;
  window.addEventListener(authChangedEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(authChangedEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export async function registerUser(input: { email: string; password: string; name: string }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0] || "Score Base User";
  const users = loadAuthUsers();
  if (users.some((user) => user.email.toLowerCase() === email)) {
    return { ok: false as const, error: "このメールアドレスは登録済みです。" };
  }
  const now = new Date().toISOString();
  const user: StoredAuthUser = {
    id: uid("user"),
    email,
    name,
    displayName: name,
    image: "",
    emailVerified: "",
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };
  write(usersKey, [user, ...users]);
  write(sessionKey, { userId: user.id });
  return { ok: true as const, user: publicUser(user) };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = loadAuthUsers().find((item) => item.email.toLowerCase() === email);
  if (!user || user.passwordHash !== await hashPassword(input.password)) {
    return { ok: false as const, error: "メールアドレスまたはパスワードが正しくありません。" };
  }
  write(sessionKey, { userId: user.id });
  return { ok: true as const, user: publicUser(user) };
}

export function logoutUser() {
  if (!isBrowser()) return;
  localStorage.removeItem(sessionKey);
  localStorage.removeItem(contextKey);
  window.dispatchEvent(new Event(authChangedEvent));
}

export function updateCurrentUser(input: Partial<Pick<AuthUser, "name" | "displayName" | "image">>) {
  const current = loadCurrentUser();
  if (!current) return null;
  const users = loadAuthUsers();
  const next = users.map((user) => user.id === current.id ? { ...user, ...input, updatedAt: new Date().toISOString() } : user);
  write(usersKey, next);
  return loadCurrentUser();
}

export function loadWorkspaceContext(): WorkspaceContext {
  return read<WorkspaceContext>(contextKey, { type: "personal", label: "個人ワークスペース" });
}

export function saveWorkspaceContext(context: WorkspaceContext) {
  write(contextKey, context);
}
