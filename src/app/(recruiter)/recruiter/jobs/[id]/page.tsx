"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job, Application, AppStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

type AnyApplication = Application;

function statusBadge(status: string) {
  const color =
    status === "REJECTED"
      ? "border-red-200 text-red-600 bg-red-50"
      : status === "OFFERED"
        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
        : "border-orange-200 text-orange-600 bg-orange-50";
  return (
    <Badge variant="outline" className={`${color} gap-1.5 shadow-none rounded-md px-2.5`}>
      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {status}
    </Badge>
  );
}

export default function JobApplicationsPage({ params }: { params: { id: string } }) {
  const { api } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<AnyApplication[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [j, list] = await Promise.all([
          api.jobs.get(params.id),
          api.recruiter.candidatesForJob(params.id, { page: 1, limit: 50 }),
        ]);
        if (cancelled) return;
        setJob(j);
        setApps((list.data ?? []) as Application[]);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load applications.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, params.id]);

  const filtered = apps.filter((a) => {
    if (!q.trim()) return true;
    const hay = `${a.id ?? ""} ${a.status ?? ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  async function move(applicationId: string, status: AppStatus) {
    try {
      await api.recruiter.moveStage(applicationId, { status });
      const list = await api.recruiter.candidatesForJob(params.id, { page: 1, limit: 50 });
      setApps((list.data ?? []) as Application[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update status.");
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage applications for this job.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-xl overflow-hidden text-white bg-[#2c1d8c]">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-l-red-400 border-t-red-400"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{job?.title ?? "Loading..."}</h2>
              <p className="text-indigo-200 mb-2 font-medium">{job?.location ?? "—"}</p>
              <div className="flex items-center gap-4 text-sm font-medium text-white/90">
                <span>{apps.length} applicants</span>
              </div>
            </div>
          </div>
          <Button disabled className="font-bold text-[#2c1d8c] bg-white hover:bg-gray-100 rounded-lg px-8">
            Edit (API not available)
          </Button>
        </CardContent>
      </Card>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Applicants</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by application id / status" className="pl-9 h-9 border-gray-200" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-500">#</TableHead>
                <TableHead className="font-semibold text-gray-500 min-w-[260px]">Application ID</TableHead>
                <TableHead className="font-semibold text-gray-500">Applied At</TableHead>
                <TableHead className="font-semibold text-gray-500">Match</TableHead>
                <TableHead className="font-semibold text-gray-500">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a, idx) => (
                <TableRow key={a.id} className="hover:bg-gray-50/30">
                  <TableCell className="text-gray-500 font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{a.id}</TableCell>
                  <TableCell className="text-gray-600 font-medium">{a.appliedAt ? new Date(a.appliedAt).toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-gray-700 font-semibold">{typeof a.matchScore === "number" ? `${a.matchScore}%` : "—"}</TableCell>
                  <TableCell>{statusBadge(a.status ?? "—")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 bg-transparent flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-100 shadow-lg">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => move(a.id, "REVIEWED")}>Move to REVIEWED</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => move(a.id, "SHORTLISTED")}>Move to SHORTLISTED</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => move(a.id, "INTERVIEW")}>Move to INTERVIEW</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => move(a.id, "OFFERED")}>Move to OFFERED</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={() => move(a.id, "REJECTED")}>
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-gray-500 p-6 text-center">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
