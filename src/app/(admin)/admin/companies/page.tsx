import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-sm text-slate-500">Browse recruiter organizations and profile details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Directory</CardTitle>
          <CardDescription>
            Company management UI is not wired to a backend endpoint yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            This route now exists to prevent 404s from the admin sidebar link.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
