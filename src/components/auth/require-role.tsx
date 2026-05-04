"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/lib/api/types";
import { roleHome, useAuth } from "./auth-provider";

export function RequireRole({
  role,
  requireVerified,
  children,
}: {
  role: Role;
  requireVerified?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthed, user } = useAuth();

  const problem = useMemo(() => {
    if (!isAuthed || !user) return "not_authed";
    if (user.role !== role) return "wrong_role";
    if (requireVerified && !user.isVerified) return "not_verified";
    return null;
  }, [isAuthed, role, requireVerified, user]);

  useEffect(() => {
    if (!problem) return;
    if (problem === "not_authed") {
      router.replace(`/?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    router.replace(roleHome(user?.role ?? "APPLICANT"));
  }, [problem, pathname, router, user?.role]);

  if (problem) return null;
  return <>{children}</>;
}

