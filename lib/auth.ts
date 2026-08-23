import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { dbGetAdminUsers, dbReplaceAdminUsers, hasDatabase } from "./db";
import type { AdminRole, AdminUser } from "./types";

const SESSION_COOKIE = "post_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;
const MAX_APPROVED_ADMINS = 5;
const DEFAULT_SESSION_SECRET = "dev-only-newsclient-admin-secret";
const DEFAULT_ADMIN_PASSWORD = "ChangeMeAdmin123!";

function productionAuthConfigError() {
  if (process.env.NODE_ENV !== "production") return null;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret === DEFAULT_SESSION_SECRET) {
    return "ADMIN_SESSION_SECRET must be set to a non-default value in production.";
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password || password === DEFAULT_ADMIN_PASSWORD) {
    return "ADMIN_PASSWORD must be set to a non-default value in production.";
  }

  return null;
}

function assertProductionAuthConfig() {
  const error = productionAuthConfigError();
  if (error) {
    throw new Error(error);
  }
}

const bundledDataPath = path.join(process.cwd(), "data");
const runtimeDataPath =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join("/tmp", "newsclient-data") : bundledDataPath);
const userStorePath = path.join(runtimeDataPath, "admin-users.json");
const bundledUserStorePath = path.join(bundledDataPath, "admin-users.json");

export const seededAdmin = {
  email: process.env.ADMIN_EMAIL || "admin@post.local",
  password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME || "Super Admin",
};

const seededSuperAdmins = [
  seededAdmin,
  {
    email: "hydershar22003@gmail.com",
    password: "thepostdigital!",
    name: "Hyder Shar",
  },
];

export type AdminSession = {
  email: string;
  role: AdminRole;
};

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt);
  return safeEqual(candidate, storedHash);
}

function seededPasswordMatches(user: AdminUser, password: string) {
  const seededMatch = seededSuperAdmins.find(
    (admin) => admin.email.toLowerCase() === user.email,
  );

  return Boolean(seededMatch) && password === seededMatch?.password;
}

async function writeAdminUsers(users: AdminUser[]) {
  if (hasDatabase) return dbReplaceAdminUsers(users);

  await mkdir(path.dirname(userStorePath), { recursive: true });
  await writeFile(userStorePath, JSON.stringify(users, null, 2), "utf8");
}

async function readBundledAdminUsers() {
  if (bundledUserStorePath === userStorePath) return null;

  try {
    return JSON.parse(await readFile(bundledUserStorePath, "utf8")) as AdminUser[];
  } catch {
    return null;
  }
}

function seededSuperAdmin(admin = seededAdmin): AdminUser {
  const now = new Date().toISOString();
  return {
    email: admin.email.toLowerCase(),
    name: admin.name,
    passwordHash: hashPassword(admin.password),
    role: "super_admin",
    status: "approved",
    createdAt: now,
    verifiedAt: now,
    verifiedBy: admin.email.toLowerCase(),
  };
}

function ensureSeededSuperAdmins(users: AdminUser[]) {
  let changed = false;
  let nextUsers = users;

  for (const admin of seededSuperAdmins) {
    const email = admin.email.toLowerCase();
    const existing = nextUsers.find((user) => user.email === email);

    if (!existing) {
      nextUsers = [seededSuperAdmin(admin), ...nextUsers];
      changed = true;
    } else if (existing.role !== "super_admin" || existing.status !== "approved") {
      nextUsers = nextUsers.map((user) =>
        user.email === email
          ? { ...user, role: "super_admin", status: "approved" }
          : user,
      );
      changed = true;
    }
  }

  return { users: nextUsers, changed };
}

export async function getAdminUsers() {
  let users: AdminUser[];

  if (hasDatabase) {
    users = await dbGetAdminUsers();

    if (users.length === 0) {
      users = seededSuperAdmins.map((admin) => seededSuperAdmin(admin));
      await writeAdminUsers(users);
    }
  } else {
    try {
      users = JSON.parse(await readFile(userStorePath, "utf8")) as AdminUser[];
    } catch {
      users =
        (await readBundledAdminUsers()) ??
        seededSuperAdmins.map((admin) => seededSuperAdmin(admin));
      await writeAdminUsers(users);
    }
  }

  const ensured = ensureSeededSuperAdmins(users);
  users = ensured.users;
  if (ensured.changed) {
    await writeAdminUsers(users);
  }

  return users;
}

export async function validateAdminCredentials(email: string, password: string) {
  assertProductionAuthConfig();

  const normalizedEmail = email.toLowerCase();
  const user = (await getAdminUsers()).find((item) => item.email === normalizedEmail);
  if (!user || user.status !== "approved") return null;

  const isValid =
    verifyPassword(password, user.passwordHash) ||
    seededPasswordMatches(user, password);

  if (!isValid) return null;

  return { email: user.email, role: user.role };
}

export async function changeAdminPassword({
  email,
  currentPassword,
  newPassword,
}: {
  email: string;
  currentPassword: string;
  newPassword: string;
}) {
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const normalizedEmail = email.toLowerCase();
  const users = await getAdminUsers();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user || user.status !== "approved") {
    throw new Error("Admin account was not found.");
  }

  const currentIsValid =
    verifyPassword(currentPassword, user.passwordHash) ||
    seededPasswordMatches(user, currentPassword);

  if (!currentIsValid) {
    throw new Error("Current password is incorrect.");
  }

  await writeAdminUsers(
    users.map((item) =>
      item.email === normalizedEmail
        ? { ...item, passwordHash: hashPassword(newPassword) }
        : item,
    ),
  );
}

export async function createPendingAdminAccount({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getAdminUsers();

  if (!normalizedEmail || !name.trim() || password.length < 8) {
    throw new Error("Name, valid email, and an 8 character password are required.");
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An admin account already exists for this email.");
  }

  const approvedAdmins = users.filter(
    (user) => user.role === "admin" && user.status === "approved",
  ).length;
  const pendingAdmins = users.filter(
    (user) => user.role === "admin" && user.status === "pending",
  ).length;

  if (approvedAdmins + pendingAdmins >= MAX_APPROVED_ADMINS) {
    throw new Error("The newsroom already has the maximum number of admin accounts.");
  }

  const account: AdminUser = {
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: hashPassword(password),
    role: "admin",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await writeAdminUsers([...users, account]);
  return account;
}

export async function verifyAdminAccount(
  email: string,
  status: "approved" | "rejected",
  verifierEmail: string,
) {
  const normalizedEmail = email.toLowerCase();
  const users = await getAdminUsers();
  const approvedAdmins = users.filter(
    (user) =>
      user.role === "admin" &&
      user.status === "approved" &&
      user.email !== normalizedEmail,
  ).length;

  if (status === "approved" && approvedAdmins >= MAX_APPROVED_ADMINS) {
    throw new Error("The newsroom already has the maximum number of admin accounts.");
  }

  const nextUsers = users.map((user) =>
    user.email === normalizedEmail && user.role === "admin"
      ? {
          ...user,
          status,
          verifiedAt: new Date().toISOString(),
          verifiedBy: verifierEmail,
        }
      : user,
  );

  await writeAdminUsers(nextUsers);
  return nextUsers.find((user) => user.email === normalizedEmail) ?? null;
}

export async function removeAdminAccount(email: string) {
  const normalizedEmail = email.toLowerCase();
  const users = await getAdminUsers();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user) return null;

  if (user.role === "super_admin") {
    throw new Error("The super admin account cannot be removed.");
  }

  const nextUsers = users.filter((item) => item.email !== normalizedEmail);
  await writeAdminUsers(nextUsers);
  return user;
}

export async function createAdminSession(session: AdminSession) {
  assertProductionAuthConfig();

  const issuedAt = Date.now().toString();
  const value = `${session.email}|${session.role}|${issuedAt}`;
  const token = `${value}|${sign(value)}`;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminSession() {
  return Boolean(await getAdminSession());
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (productionAuthConfigError()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [email, role, issuedAt, signature] = token.split("|");
  if (!email || !role || !issuedAt || !signature) return null;
  if (role !== "super_admin" && role !== "admin") return null;

  const issuedAtMs = Number(issuedAt);
  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > SESSION_MAX_AGE * 1000) {
    return null;
  }

  if (!safeEqual(signature, sign(`${email}|${role}|${issuedAt}`))) return null;

  const user = (await getAdminUsers()).find((item) => item.email === email);
  if (!user || user.status !== "approved" || user.role !== role) return null;

  return { email, role };
}

export function isSuperAdmin(session: AdminSession | null) {
  return session?.role === "super_admin";
}
