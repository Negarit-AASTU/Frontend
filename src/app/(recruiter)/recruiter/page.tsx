"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/metric-card";
import { FileText, Users, CheckCircle, Briefcase } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PostJobDialog } from "@/components/recruiter/post-job-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job, RecruiterProfile } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function RecruiterDashboard() {
  const { api } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalApplicants = useMemo(() => jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0), [jobs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, myJobs] = await Promise.all([api.recruiter.me(), api.recruiter.myJobs({ page: 1, limit: 5 })]);
        if (cancelled) return;
        setProfile(p);
        setJobs(myJobs.data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load recruiter dashboard.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile ? `Company: ${profile.companyName}` : "Overview of your job posts and applications."}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <PostJobDialog
            trigger={
              <Button className="flex-1 sm:flex-none bg-[#4238b8] hover:bg-[#342c94] text-white">
                + Post Job
              </Button>
            }
          />
        </div>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Job Posts" value={profile ? String(profile.activeJobs) : "—"} icon={<Briefcase size={20} />} trend="" isPositive={true} />
        <MetricCard title="Total Applicants" value={String(totalApplicants)} icon={<Users size={20} />} trend="" isPositive={true} />
        <MetricCard title="Total Hires" value={profile ? String(profile.totalHires) : "—"} icon={<CheckCircle size={20} />} trend="" isPositive={true} />
        <MetricCard title="Recent Jobs Loaded" value={String(jobs.length)} icon={<FileText size={20} />} trend="" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-50 select-none flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Recent Job Posts</CardTitle>
            <Link href="/recruiter/jobs" className="text-sm font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-gray-500 font-medium">Job Title</TableHead>
                  <TableHead className="text-gray-500 font-medium">Applicants</TableHead>
                  <TableHead className="text-gray-500 font-medium">Type</TableHead>
                  <TableHead className="text-gray-500 font-medium text-right">Posted On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium text-gray-900">
                      <Link href={`/recruiter/jobs/${j.id}`} className="hover:text-indigo-600">
                        {j.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">{j.applicantCount}</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 shadow-none">{j.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-gray-700">
                      {new Date(j.postedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-gray-500 p-6 text-center">
                      No jobs yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
