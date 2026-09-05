"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, setAdminSession, removeAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAdminAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return { error: "Invalid admin email or password." };
    }

    const isValid = verifyPassword(password, admin.password);
    if (!isValid) {
      return { error: "Invalid admin email or password." };
    }

    const token = createSessionToken(admin.id, admin.email);
    await setAdminSession(token);
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: "An unexpected error occurred." };
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await removeAdminSession();
  redirect("/admin/login");
}
