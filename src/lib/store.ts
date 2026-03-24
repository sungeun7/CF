import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "node:crypto";
import type { Store, StyleRequest, Recommendation } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "store.json");

function readFileUtf8(path: string): string {
  const buf = readFileSync(path);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString("utf-8");
  }
  return buf.toString("utf-8");
}

function emptyStore(): Store {
  return { requests: [], recommendations: [], userPoints: [], users: [], sessions: [] };
}

function asText(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** 디스크 권한·경로 오류 등으로 실패해도 페이지가 500이 나지 않도록 항상 유효한 Store를 돌려줍니다. */
export function readStore(): Store {
  try {
    ensureDataDir();
    if (!existsSync(STORE_PATH)) {
      const s = emptyStore();
      writeFileSync(STORE_PATH, JSON.stringify(s, null, 2), "utf-8");
      return s;
    }
    const raw = readFileUtf8(STORE_PATH);
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || typeof parsed !== "object") return emptyStore();
    if (!Array.isArray(parsed.requests)) parsed.requests = [];
    if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
    if (!Array.isArray(parsed.userPoints)) parsed.userPoints = [];
    if (!Array.isArray(parsed.users)) parsed.users = [];
    if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
    parsed.requests = parsed.requests.filter((r) => r != null && typeof r === "object");
    parsed.recommendations = parsed.recommendations.filter((r) => r != null && typeof r === "object");
    parsed.userPoints = parsed.userPoints.filter((x) => x != null && typeof x === "object");
    parsed.users = parsed.users.filter((u) => u != null && typeof u === "object");
    parsed.sessions = parsed.sessions.filter((s) => s != null && typeof s === "object");
    parsed.requests = parsed.requests.map((r) => {
      const raw = r as Record<string, unknown>;
      const productTagsIn = Array.isArray(raw.productTags) ? raw.productTags : [];
      const productTags: StyleRequest["productTags"] = productTagsIn
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          id:
            typeof t.id === "string" && t.id.trim()
              ? t.id.trim().slice(0, 80)
              : randomUUID(),
          label: asText(t.label).slice(0, 60),
          url: asText(t.url).slice(0, 500),
          price: typeof t.price === "string" ? t.price.slice(0, 30) : undefined,
          x: typeof t.x === "number" && Number.isFinite(t.x) ? Math.min(100, Math.max(0, t.x)) : 0,
          y: typeof t.y === "number" && Number.isFinite(t.y) ? Math.min(100, Math.max(0, t.y)) : 0,
        }))
        .filter((t) => t.label.length > 0 && t.url.length > 0);

      return {
        id:
          typeof raw.id === "string" && raw.id.trim()
            ? String(raw.id).trim()
            : randomUUID(),
        title: asText(raw.title).slice(0, 120),
        bodyType: asText(raw.bodyType).slice(0, 500),
        stylePreference: asText(raw.stylePreference).slice(0, 500),
        imagePath:
          raw.imagePath === null || typeof raw.imagePath === "string"
            ? (raw.imagePath as string | null)
            : null,
        photoTags: Array.isArray(raw.photoTags)
          ? raw.photoTags.map((p) => asText(p)).filter(Boolean).slice(0, 30)
          : [],
        productTags,
        acceptedRecommendationId:
          typeof raw.acceptedRecommendationId === "string" ? raw.acceptedRecommendationId : null,
        authorName: asText(raw.authorName).slice(0, 60),
        createdAt:
          typeof raw.createdAt === "string" && !Number.isNaN(Date.parse(raw.createdAt))
            ? raw.createdAt
            : new Date().toISOString(),
      };
    });
    parsed.recommendations = parsed.recommendations.map((r) => {
      const raw = r as Record<string, unknown>;
      return {
        id:
          typeof raw.id === "string" && raw.id.trim()
            ? raw.id.trim()
            : randomUUID(),
        requestId: asText(raw.requestId),
        authorName: asText(raw.authorName).slice(0, 60),
        content: asText(raw.content).slice(0, 2000),
        imagePath:
          raw.imagePath === null || typeof raw.imagePath === "string"
            ? (raw.imagePath as string | null)
            : null,
        photoTags: Array.isArray(raw.photoTags)
          ? raw.photoTags.map((p) => asText(p)).filter(Boolean).slice(0, 30)
          : [],
        linkUrl:
          raw.linkUrl === null || typeof raw.linkUrl === "string"
            ? (raw.linkUrl as string | null)
            : null,
        createdAt:
          typeof raw.createdAt === "string" && !Number.isNaN(Date.parse(raw.createdAt))
            ? raw.createdAt
            : new Date().toISOString(),
      };
    });
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function writeStore(store: Store) {
  ensureDataDir();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function addRequest(req: Omit<StyleRequest, "id" | "createdAt">): StyleRequest {
  const store = readStore();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const full: StyleRequest = {
    ...req,
    id,
    createdAt,
  };
  store.requests.unshift(full);

  // 요청 글 작성 보상: 로그인 사용자에게 +10P
  const author = full.authorName.trim();
  if (author && author !== "익명" && author !== "(탈퇴회원)") {
    const row = store.userPoints.find((p) => typeof p?.userName === "string" && p.userName === author);
    if (row) row.points += 10;
    else store.userPoints.push({ userName: author, points: 10 });
  }

  writeStore(store);
  return full;
}

export function getRequest(id: string): StyleRequest | undefined {
  return readStore().requests.find((r) => r?.id === id);
}

export function addRecommendation(
  rec: Omit<Recommendation, "id" | "createdAt">
): Recommendation {
  const store = readStore();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const full: Recommendation = { ...rec, id, createdAt };
  store.recommendations.push(full);

  // 추천 작성 보상: 로그인 사용자에게 +5P
  const author = full.authorName.trim();
  if (author && author !== "익명" && author !== "(탈퇴회원)") {
    const row = store.userPoints.find((p) => typeof p?.userName === "string" && p.userName === author);
    if (row) row.points += 5;
    else store.userPoints.push({ userName: author, points: 5 });
  }

  writeStore(store);
  return full;
}

export function createUser(userName: string, password: string) {
  const store = readStore();
  const name = userName.trim();
  if (!name || !password.trim()) {
    return { ok: false as const, reason: "invalid_input" as const };
  }
  if (store.users.some((u) => typeof u?.userName === "string" && u.userName === name)) {
    return { ok: false as const, reason: "duplicate_user" as const };
  }
  const user = {
    id: randomUUID(),
    userName: name,
    password,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  writeStore(store);
  return { ok: true as const, user };
}

export function authenticateUser(userName: string, password: string) {
  const store = readStore();
  const user = store.users.find(
    (u) =>
      typeof u?.userName === "string" &&
      typeof u?.password === "string" &&
      u.userName === userName.trim() &&
      u.password === password
  );
  return user ?? null;
}

export function createSession(userName: string) {
  const store = readStore();
  const token = randomUUID();
  store.sessions.push({ token, userName, createdAt: new Date().toISOString() });
  writeStore(store);
  return token;
}

export function getSessionUser(token: string) {
  const store = readStore();
  const s = store.sessions.find((x) => typeof x?.token === "string" && x.token === token);
  return typeof s?.userName === "string" ? s.userName : null;
}

export function deleteSession(token: string) {
  const store = readStore();
  const before = store.sessions.length;
  store.sessions = store.sessions.filter((s) => typeof s?.token !== "string" || s.token !== token);
  if (store.sessions.length !== before) {
    writeStore(store);
  }
}

export function getRecommendationsForRequest(requestId: string): Recommendation[] {
  return readStore()
    .recommendations.filter((r) => r?.requestId === requestId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function adoptRecommendation(requestId: string, recommendationId: string) {
  const store = readStore();
  const reqIdx = store.requests.findIndex((r) => r?.id === requestId);
  if (reqIdx < 0) return { ok: false as const, reason: "request_not_found" as const };

  const req = store.requests[reqIdx];
  if (req.acceptedRecommendationId) {
    return { ok: false as const, reason: "already_adopted" as const };
  }

  const rec = store.recommendations.find(
    (r) => r?.id === recommendationId && r?.requestId === requestId
  );
  if (!rec) return { ok: false as const, reason: "recommendation_not_found" as const };

  req.acceptedRecommendationId = recommendationId;

  const name = rec.authorName.trim() || "익명";
  const p = store.userPoints.find((x) => typeof x?.userName === "string" && x.userName === name);
  if (p) p.points += 100;
  else store.userPoints.push({ userName: name, points: 100 });

  writeStore(store);
  return { ok: true as const, adoptedRecommendationId: recommendationId, awardedTo: name };
}

export function getUserPoints(userName: string) {
  const name = userName.trim();
  if (!name) return 0;
  const p = readStore().userPoints.find((x) => typeof x?.userName === "string" && x.userName === name);
  return typeof p?.points === "number" && Number.isFinite(p.points) ? p.points : 0;
}

/** 포인트 높은 순, 동점이면 닉네임 순 (손상된 userPoints 항목은 무시) */
export function getPointsLeaderboard(limit = 30): { userName: string; points: number }[] {
  const rows = (readStore().userPoints ?? [])
    .map((x) => ({
      userName: typeof x?.userName === "string" ? x.userName.trim() : "",
      points:
        typeof x?.points === "number" && Number.isFinite(x.points) ? Math.max(0, x.points) : 0,
    }))
    .filter((x) => x.userName.length > 0);

  return [...rows]
    .sort((a, b) => b.points - a.points || a.userName.localeCompare(b.userName, "ko"))
    .slice(0, Math.max(0, limit));
}

export function getUserByName(userName: string) {
  const name = userName.trim();
  if (!name) return null;
  const user = readStore().users.find((u) => typeof u?.userName === "string" && u.userName === name);
  return user ?? null;
}

export function updateUserProfile(input: {
  currentUserName: string;
  currentPassword: string;
  newUserName?: string;
  newPassword?: string;
}) {
  const store = readStore();
  const currentName = input.currentUserName.trim();
  const user = store.users.find((u) => typeof u?.userName === "string" && u.userName === currentName);
  if (!user) return { ok: false as const, reason: "user_not_found" as const };
  if (user.password !== input.currentPassword) {
    return { ok: false as const, reason: "wrong_password" as const };
  }

  const nextName = (input.newUserName ?? currentName).trim();
  if (!nextName || nextName.length < 2 || nextName.length > 30) {
    return { ok: false as const, reason: "invalid_username" as const };
  }
  if (nextName !== currentName && store.users.some((u) => typeof u?.userName === "string" && u.userName === nextName)) {
    return { ok: false as const, reason: "duplicate_username" as const };
  }

  const nextPassword = input.newPassword?.trim() ? input.newPassword.trim() : user.password;
  if (nextPassword.length < 4 || nextPassword.length > 100) {
    return { ok: false as const, reason: "invalid_password" as const };
  }

  user.userName = nextName;
  user.password = nextPassword;

  if (nextName !== currentName) {
    store.sessions = store.sessions.map((s) =>
      s?.userName === currentName ? { ...s, userName: nextName } : s
    );
    store.requests = store.requests.map((r) =>
      r?.authorName === currentName ? { ...r, authorName: nextName } : r
    );
    store.recommendations = store.recommendations.map((r) =>
      r?.authorName === currentName ? { ...r, authorName: nextName } : r
    );
    store.userPoints = store.userPoints.map((p) =>
      p?.userName === currentName ? { ...p, userName: nextName } : p
    );
  }

  writeStore(store);
  return { ok: true as const, userName: nextName };
}

export function deleteUserAccount(userName: string, password: string) {
  const store = readStore();
  const name = userName.trim();
  const idx = store.users.findIndex((u) => typeof u?.userName === "string" && u.userName === name);
  if (idx < 0) return { ok: false as const, reason: "user_not_found" as const };
  if (store.users[idx].password !== password) {
    return { ok: false as const, reason: "wrong_password" as const };
  }

  store.users.splice(idx, 1);
  store.sessions = store.sessions.filter((s) => typeof s?.userName !== "string" || s.userName !== name);
  store.userPoints = store.userPoints.filter((p) => typeof p?.userName !== "string" || p.userName !== name);
  store.requests = store.requests.map((r) =>
    r?.authorName === name ? { ...r, authorName: "(탈퇴회원)" } : r
  );
  store.recommendations = store.recommendations.map((r) =>
    r?.authorName === name ? { ...r, authorName: "(탈퇴회원)" } : r
  );
  writeStore(store);
  return { ok: true as const };
}
