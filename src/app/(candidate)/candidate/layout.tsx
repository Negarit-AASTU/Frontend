"use client";

import { ReactNode } from "react";
import { RequireRole } from "@/components/auth/require-role";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="APPLICANT">
      <div className="flex min-h-screen">
        <div className="flex flex-col flex-1">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
