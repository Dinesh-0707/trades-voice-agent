"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createDashboardSessionToken, COOKIE_NAME } from "@/lib/dashboardAuth";

export async function loginToDispatch(_state: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!process.env.DASHBOARD_PASSWORD) {
    return { error: "DASHBOARD_PASSWORD is not configured on the server." };
  }
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return { error: "Incorrect password." };
  }

  const token = await createDashboardSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/dispatch");
}

export async function logoutOfDispatch() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/dispatch/login");
}

export async function markJobComplete(id: string) {
  await prisma.job.update({ where: { id }, data: { status: "COMPLETED" } });
  revalidatePath("/dispatch");
}
