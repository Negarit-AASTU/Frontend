"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/auth/auth-provider";
import type { ApplicantProfile, Application, Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function CandidateDashboardPage() {
  const { api } = useAuth();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [resumeStatus, setResumeStatus] = useState<{ parseStatus: string; resumeScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [p, a, j, rs] = await Promise.all([
        api.applicant.me(),
        api.applicant.myApplications({ page: 1, limit: 10 }),
        api.jobs.list({ page: 1, limit: 10 }),
        api.applicant.resumeStatus().catch(() => null),
      ]);
      setProfile(p);
      setApps(a.data);
      setJobs(j.data);
      if (rs) setResumeStatus({ parseStatus: rs.parseStatus, resumeScore: rs.resumeScore });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load applicant dashboard.");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUploadResume(file: File) {
    setError(null);
    try {
      await api.applicant.uploadResume(file);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Resume upload failed.");
    }
  }

  async function apply() {
    if (!selectedJobId) return;
    setError(null);
    try {
      await api.applicant.apply(selectedJobId, { coverLetter: coverLetter || undefined });
      setCoverLetter("");
      setSelectedJobId("");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to apply.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applicant Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your real profile, resume status, jobs, and applications.</p>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-sm font-semibold text-gray-900">{profile?.full_name ?? "—"}</div>
            <div className="text-xs text-gray-500">{profile?.email ?? "—"}</div>
            <div className="text-xs text-gray-500">Completeness: {profile ? `${profile.completeness}%` : "—"}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800">Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-gray-500">Parse status: {resumeStatus?.parseStatus ?? "—"}</div>
            <div className="text-xs text-gray-500">Resume score: {typeof resumeStatus?.resumeScore === "number" ? `${resumeStatus.resumeScore}%` : "—"}</div>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUploadResume(f);
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800">Apply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border border-gray-200 rounded-md h-9 px-3 text-sm bg-white"
            >
              <option value="">Select a job</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.recruiter?.companyName ?? "Company"}
                </option>
              ))}
            </select>
            <Input value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Cover letter (optional)" />
            <Button onClick={() => void apply()} disabled={!selectedJobId} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Apply
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-800">My Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.job.title}</TableCell>
                  <TableCell className="text-gray-600">{a.job.company}</TableCell>
                  <TableCell className="text-gray-700 font-semibold">{a.status}</TableCell>
                  <TableCell className="text-gray-700 font-semibold">{a.matchScore}%</TableCell>
                  <TableCell className="text-gray-600">{new Date(a.appliedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray-500 p-6 text-center">
                    No applications yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
