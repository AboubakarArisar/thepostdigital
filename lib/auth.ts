import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import type { AdminRole, AdminUser } from "./types";

const SESSION_COOKIE = "post_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;
const MAX_APPROVED_ADMINS = 5;
const userStorePath = path.join(process.cwd(), "data", "admin-users.json");

export const seededAdmin = {
  email: process.env.ADMIN_EMAIL || "admin@post.local",
  password: process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!",
  name: process.env.ADMIN_NAME || "Super Admin",
};

export type AdminSession = {
  email: string;
  role: AdminRole;
};

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-newsclient-admin-secret";
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

async function writeAdminUsers(users: AdminUser[]) {
  await mkdir(path.dirname(userStorePath), { recursive: true });
  await writeFile(userStorePath, JSON.stringify(users, null, 2), "utf8");
}

function seededSuperAdmin(): AdminUser {
  const now = new Date().toISOString();
  return {
    email: seededAdmin.email.toLowerCase(),
    name: seededAdmin.name,
    passwordHash: hashPassword(seededAdmin.password),
    role: "super_admin",
    status: "approved",
    createdAt: now,
    verifiedAt: now,
    verifiedBy: seededAdmin.email.toLowerCase(),
  };
}

export async function getAdminUsers() {
  let users: AdminUser[];

  try {
    users = JSON.parse(await readFile(userStorePath, "utf8")) as AdminUser[];
  } catch {
    users = [seededSuperAdmin()];
    await writeAdminUsers(users);
    return users;
  }

  const superEmail = seededAdmin.email.toLowerCase();
  const existingSuper = users.find((user) => user.email === superEmail);

  if (!existingSuper) {
    users = [seededSuperAdmin(), ...users];
    await writeAdminUsers(users);
  } else if (
    existingSuper.role !== "super_admin" ||
    existingSuper.status !== "approved"
  ) {
    users = users.map((user) =>
      user.email === superEmail
        ? { ...user, role: "super_admin", status: "approved" }
        : user,
    );
    await writeAdminUsers(users);
  }

  return users;
}

export async function validateAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();
  const user = (await getAdminUsers()).find((item) => item.email === normalizedEmail);

  if (!user || user.status !== "approved") return null;

  const isValid =
    normalizedEmail === seededAdmin.email.toLowerCase()
      ? password === seededAdmin.password || verifyPassword(password, user.passwordHash)
      : verifyPassword(password, user.passwordHash);

  if (!isValid) return null;

  return { email: user.email, role: user.role };
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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [email, role, issuedAt, signature] = token.split("|");
  if (!email || !role || !issuedAt || !signature) return null;
  if (role !== "super_admin" && role !== "admin") return null;

  if (!safeEqual(signature, sign(`${email}|${role}|${issuedAt}`))) return null;

  const user = (await getAdminUsers()).find((item) => item.email === email);
  if (!user || user.status !== "approved" || user.role !== role) return null;

  return { email, role };
}

export function isSuperAdmin(session: AdminSession | null) {
  return session?.role === "super_admin";
}
