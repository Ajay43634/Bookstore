const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api/v1";

export interface AuthorMe { id: number; name: string; email: string; bio: string | null; profile_picture: string | null; nationality: string | null; }
export interface TokenResponse { access_token: string; token_type: string; author: AuthorMe; }

export async function apiRegister(name: string, email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? "Registration failed"); }
  return res.json();
}

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? "Login failed"); }
  return res.json();
}

export async function apiLogout(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<AuthorMe | null> {
  const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}
