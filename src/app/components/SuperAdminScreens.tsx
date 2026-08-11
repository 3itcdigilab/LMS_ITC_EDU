import {
  Building2, Users, DollarSign, TrendingUp, Network, ShieldCheck,
  Plus, Handshake, Server, CreditCard, Wallet,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { PageHeader, StatCard, EmptyState } from "./shared";
import { revenueSeries } from "../data/mock";
import { SharedAdminDashboard } from "./AdminScreens";
import { useStore } from "../store/Store";
import { cn } from "./ui/utils";
import { toast } from "sonner";

export function GlobalDashboard() {
  return <SharedAdminDashboard isSuperAdmin={true} />;
}

export function PartnerInstitutions() {
  const { state, actions } = useStore();
  return (
    <div>
      <PageHeader title="Institusi Mitra" subtitle="Onboard, kelola, dan cabut akses institusi"
        actions={<Button><Plus className="size-4" /> Buat institusi</Button>} />
      {state.institutions.length === 0 ? (
        <EmptyState icon={<Building2 className="size-7" />} title="Belum ada institusi mitra"
          description="Tambah institusi pertama untuk mulai mengembangkan ekosistem 3ITC."
          action={<Button><Plus className="size-4" /> Tambah institusi</Button>} />
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Institusi</TableHead><TableHead>Tipe</TableHead><TableHead>Wilayah</TableHead>
              <TableHead>Pelajar</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.institutions.map(inst => (
                <TableRow key={inst.id}>
                  <TableCell><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-lg bg-accent text-primary"><Building2 className="size-4" /></div><span className="font-medium">{inst.name}</span></div></TableCell>
                  <TableCell className="text-muted-foreground">{inst.type}</TableCell>
                  <TableCell className="text-muted-foreground">{inst.region}</TableCell>
                  <TableCell>{inst.students.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary">{inst.plan}</Badge></TableCell>
                  <TableCell><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", inst.status === "Active" ? "bg-green-50 text-success" : "bg-amber-50 text-warning")}>{inst.status}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive"
                      onClick={() => { actions.updateInstitution({ id: inst.id, status: "Suspended" }); toast.success("Akses dicabut."); }}>
                      Cabut akses
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

export function FinancialDashboard() {
  return (
    <div>
      <PageHeader title="Dashboard Keuangan" subtitle="Revenue, langganan, dan penagihan" />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="MRR" value="$0" icon={<Wallet className="size-5" />} tone="success" />
        <StatCard label="ARR" value="$0" icon={<DollarSign className="size-5" />} />
        <StatCard label="Langganan aktif" value="0" icon={<CreditCard className="size-5" />} tone="warning" />
        <StatCard label="Churn" value="–" icon={<TrendingUp className="size-5" />} tone="neutral" />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Revenue bulanan (juta)</CardTitle></CardHeader>
        <CardContent>
          {revenueSeries.length === 0 ? (
            <EmptyState icon={<DollarSign className="size-6" />} title="Belum ada data revenue" description="Data keuangan akan muncul setelah ada transaksi dari institusi mitra." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                <Tooltip /><Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function EcosystemAnalytics() {
  return (
    <div>
      <PageHeader title="Analitik Ekosistem" subtitle="Pembelajaran lintas institusi dan hasil karier" />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Sertifikat diterbitkan" value="0" icon={<Users className="size-5" />} tone="success" />
        <StatCard label="Penempatan talent" value="0" icon={<Handshake className="size-5" />} />
        <StatCard label="Capstone selesai" value="0" icon={<Network className="size-5" />} tone="warning" />
        <StatCard label="Perusahaan mitra" value="0" icon={<Building2 className="size-5" />} tone="neutral" />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Pertumbuhan pelajar per bulan</CardTitle></CardHeader>
        <CardContent>
          {revenueSeries.length === 0 ? (
            <EmptyState icon={<TrendingUp className="size-6" />} title="Belum ada data analitik ekosistem" description="Data akan muncul setelah institusi mitra onboard dan pelajar mulai aktif." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueSeries}>
                <defs><linearGradient id="grad-superadmin-ecosystem-growth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                <Tooltip /><Area type="monotone" dataKey="users" name="Pelajar (k)" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#grad-superadmin-ecosystem-growth)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SystemSettings() {
  const toggles = [
    ["Talent pool & career matching", "Aktifkan rekomendasi karier berbasis AI", true],
    ["Peer review assessments", "Izinkan pelajar saling review pekerjaan", true],
    ["Portfolio publik", "Biarkan pelajar publikasikan portfolio secara eksternal", true],
    ["Mode maintenance", "Nonaktifkan akses sementara untuk semua pengguna", false],
    ["Fitur beta", "Rilis fitur eksperimental di seluruh platform", false],
  ] as const;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi ekosistem & kemitraan" />
      <Card className="p-6">
        <h3 className="text-secondary">Fitur platform</h3>
        <div className="mt-4 space-y-4">
          {toggles.map(([t, d, on]) => (
            <div key={t} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
              <div><p className="font-medium text-secondary">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
              <Switch defaultChecked={on} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h3 className="text-secondary">Keamanan & akses</h3></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["Wajib 2FA untuk admin", "Single sign-on (SSO)", "Data residency: Asia", "Audit logging"].map((s) => (
            <div key={s} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm">{s}</span><Switch defaultChecked />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
