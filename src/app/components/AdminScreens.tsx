import { useState } from "react";
import {
  Users, BookOpen, Building2, Award, TrendingUp, Sparkles, Briefcase, Plus,
  Search, Star, CheckCircle2, ClipboardCheck, UserX, DollarSign,
  Server, GraduationCap, Trash2, X, Pencil, KeyRound, Upload,
  CalendarDays, MessageSquare, FolderGit2, Pin, ExternalLink, Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CourseEditor } from "./CourseEditor";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { PageHeader, StatCard, EmptyState, ConfirmDeleteModal } from "./shared";
import { useStore, type Course, type Institution } from "../store/Store";
import { categories, revenueSeries, enrollmentByCategory } from "../data/mock";
import { cn } from "./ui/utils";
import { toast } from "sonner";

const PIE = ["#2563eb", "#16a34a", "#8b5cf6", "#f59e0b", "#dc2626", "#64748b"];

/* ─── Shared Dashboard (Admin + Super Admin) ─────────────────────────────── */
export function SharedAdminDashboard({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const { state } = useStore();
  const { courses, users, institutions, certificates } = state;

  return (
    <div>
      <PageHeader
        title={isSuperAdmin ? "Dashboard Global" : "Dashboard Admin"}
        subtitle={isSuperAdmin ? "Ringkasan ekosistem di seluruh institusi mitra" : "Ringkasan platform dan manajemen"}
        actions={<Button><Plus className="size-4" /> Tambah cepat</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total pengguna" value={String(users.length)} icon={<Users className="size-5" />} />
        <StatCard label="Kursus aktif" value={String(courses.filter(c => c.status === "published").length)} icon={<BookOpen className="size-5" />} tone="success" />
        <StatCard label="Institusi" value={String(institutions.length)} icon={<Building2 className="size-5" />} tone="warning" />
        {isSuperAdmin
          ? <StatCard label="ARR" value="$0" icon={<DollarSign className="size-5" />} tone="neutral" />
          : <StatCard label="Sertifikat diterbitkan" value={String(certificates.length)} icon={<Award className="size-5" />} tone="neutral" />}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Pertumbuhan platform</CardTitle></CardHeader>
          <CardContent>
            {revenueSeries.length === 0
              ? <EmptyState icon={<TrendingUp className="size-6" />} title="Belum ada data pertumbuhan" description="Data akan muncul setelah pengguna mulai aktif di platform." />
              : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueSeries}>
                    <defs>
                      <linearGradient id="grad-shared-admin-growth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" name="Pengguna baru (k)" stroke="#2563eb" strokeWidth={2.5} fill="url(#grad-shared-admin-growth)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Enrollment per kategori</CardTitle></CardHeader>
          <CardContent>
            {enrollmentByCategory.length === 0
              ? <EmptyState icon={<BookOpen className="size-6" />} title="Belum ada data enrollment" description="Data akan muncul setelah pelajar mulai enroll kursus." />
              : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={enrollmentByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {enrollmentByCategory.map((_, i) => <Cell key={`cell-${i}`} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5 flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-xl bg-accent text-primary shrink-0"><GraduationCap className="size-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total pelajar terdaftar</p>
            <p className="text-xl font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>
              {users.filter(u => u.role === "Student").length}
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-xl bg-green-50 text-success shrink-0"><Award className="size-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Sertifikat diterbitkan</p>
            <p className="text-xl font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>{certificates.length}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-warning shrink-0"><Server className="size-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Uptime sistem</p>
            <p className="text-xl font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>–</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return <SharedAdminDashboard isSuperAdmin={false} />;
}

/* ─── Modal wrapper ──────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg p-6 my-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        {children}
      </Card>
    </div>
  );
}

/* ─── Account Management ─────────────────────────────────────────────────── */
function AddUserModal({ onClose, isSuperAdmin }: { onClose: () => void; isSuperAdmin: boolean }) {
  const { state, actions } = useStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const roleOptions = isSuperAdmin
    ? ["Student", "Mentor", "Admin", "Super Admin"]
    : ["Student", "Mentor", "Admin"];

  return (
    <Modal title="Tambah akun pengguna" onClose={onClose}>
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Nama lengkap</label><Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nama lengkap" /></div>
        <div><label className="text-sm font-medium">Email</label><Input className="mt-1" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="user@institusi.id" /></div>
        <div>
          <label className="text-sm font-medium">Password sementara</label>
          <div className="relative mt-1">
            <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 8 karakter" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.role} onChange={e => set("role", e.target.value)}>
            {roleOptions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Institusi</label>
          {state.institutions.length === 0 ? (
            <p className="text-xs text-amber-600 mt-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              ⚠️ Belum ada institusi terdaftar. Tambahkan di Manajemen Institusi terlebih dahulu.
            </p>
          ) : (
            <div className="mt-1.5 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {state.institutions.map(inst => (
                <label key={inst.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={(selectedInstitutions || []).includes(inst.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInstitutions([...(selectedInstitutions || []), inst.name]);
                      } else {
                        setSelectedInstitutions((selectedInstitutions || []).filter(n => n !== inst.name));
                      }
                    }}
                    className="rounded"
                  />
                  {inst.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => {
          if (!form.name || !form.email) { toast.error("Nama dan email wajib diisi."); return; }
          if (form.password && form.password.length < 6) { toast.error("Password minimal 6 karakter."); return; }
          actions.addUser({ 
            name: form.name, 
            email: form.email, 
            password: form.password, 
            role: form.role, 
            institutions: selectedInstitutions, 
            institution: selectedInstitutions[0] || "", 
            status: "Active" 
          });
          toast.success(`Akun ${form.name} berhasil dibuat!`);
          onClose();
        }}>Buat akun</Button>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, onClose }: { user: import("../store/Store").AppUser; onClose: () => void }) {
  const { state, actions } = useStore();
  const { role: authRole } = useAuth();
  const isSuperAdmin = authRole === "superadmin";
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: user.password || "",
    role: user.role,
    status: user.status,
  });
  // @ts-ignore
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>(user.institutions || (user.institution ? [user.institution] : []));
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const roleOptions = isSuperAdmin
    ? ["Student", "Mentor", "Admin", "Super Admin"]
    : ["Student", "Mentor", "Admin"];

  return (
    <Modal title="Edit akun pengguna" onClose={onClose}>
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Nama lengkap</label><Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Email</label><Input className="mt-1" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
        <div>
          <label className="text-sm font-medium">Password Baru / Ubah Password</label>
          <div className="relative mt-1">
            <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Password baru akun" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.role} onChange={e => set("role", e.target.value)}>
            {roleOptions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Institusi</label>
          {state.institutions.length === 0 ? (
            <p className="text-xs text-amber-600 mt-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              ⚠️ Belum ada institusi terdaftar. Tambahkan di Manajemen Institusi terlebih dahulu.
            </p>
          ) : (
            <div className="mt-1.5 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {state.institutions.map(inst => (
                <label key={inst.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={(selectedInstitutions || []).includes(inst.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInstitutions([...(selectedInstitutions || []), inst.name]);
                      } else {
                        setSelectedInstitutions((selectedInstitutions || []).filter(n => n !== inst.name));
                      }
                    }}
                    className="rounded"
                  />
                  {inst.name}
                </label>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => {
          if (!form.name || !form.email) { toast.error("Nama dan email wajib diisi."); return; }
          actions.updateUser({
            id: user.id,
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            institutions: selectedInstitutions,
            institution: selectedInstitutions[0] || "",
            status: form.status as "Active" | "Suspended",
          });
          toast.success("Akun & Password berhasil diperbarui.");
          onClose();
        }}>Simpan</Button>
      </div>
    </Modal>
  );
}

export function UserManagement() {
  const { state, actions } = useStore();
  const { role: authRole } = useAuth();
  const isSuperAdmin = authRole === "superadmin";
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<import("../store/Store").AppUser | null>(null);

  const filterRoles = isSuperAdmin
    ? ["Semua", "Student", "Mentor", "Admin", "Super Admin"]
    : ["Semua", "Student", "Mentor", "Admin"];

  const list = state.users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = (u?.name || "").toLowerCase().includes(q) || (u?.email || "").toLowerCase().includes(q);
    const matchR = roleFilter === "Semua" || u.role === roleFilter;
    return matchQ && matchR;
  });

  const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);

  return (
    <div>
      <ConfirmDeleteModal
        isOpen={!!deletingUser}
        title="Hapus Akun Pengguna"
        itemName={deletingUser?.name}
        description="Apakah Anda yakin ingin menghapus akun pengguna ini? Seluruh data profil dan riwayat pengguna ini akan terhapus."
        onConfirm={() => {
          if (deletingUser) {
            actions.deleteUser(deletingUser.id);
            toast.success(`Akun "${deletingUser.name}" berhasil dihapus.`);
          }
        }}
        onClose={() => setDeletingUser(null)}
      />
      {showAdd && <AddUserModal isSuperAdmin={isSuperAdmin} onClose={() => setShowAdd(false)} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
      <PageHeader
        title="Manajemen Akun"
        subtitle={isSuperAdmin ? "Kelola semua akun pengguna platform" : "Kelola pelajar, mentor, dan admin"}
        actions={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Tambah akun</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna…" className="pl-9" />
        </div>
        {filterRoles.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors",
              roleFilter === r ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
            {r}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<UserX className="size-7" />} title="Belum ada pengguna"
          description="Buat akun pertama untuk memulai. Hanya Admin yang bisa menambah akun baru."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Tambah akun</Button>} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                <TableHead>Institusi</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8"><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{u.institution || "–"}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        actions.updateUser({ id: u.id, status: u.status === "Active" ? "Suspended" : "Active" });
                        toast.success("Status pengguna diperbarui.");
                      }}
                      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                        u.status === "Active" ? "bg-green-50 text-success hover:bg-green-100" : "bg-red-50 text-destructive hover:bg-red-100")}>
                      {u.status}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingUser(u)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-primary transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => setDeletingUser({ id: u.id, name: u.name })}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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

/* ─── Institution Management ─────────────────────────────────────────────── */
function AddInstitutionModal({ onClose }: { onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<Omit<Institution, "id" | "createdAt">>({
    name: "", type: "High School", region: "", plan: "Free", status: "Active", students: 0, teachers: 0,
  });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title="Tambah institusi" onClose={onClose}>
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Nama institusi</label><Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="cth: SMAN 1 Jakarta" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Tipe</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.type} onChange={e => set("type", e.target.value)}>
              {["High School", "Vocational", "University", "Other"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Plan</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.plan} onChange={e => set("plan", e.target.value)}>
              {["Free", "Pro", "Enterprise"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div><label className="text-sm font-medium">Wilayah</label><Input className="mt-1" value={form.region} onChange={e => set("region", e.target.value)} placeholder="cth: DKI Jakarta" /></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => {
          if (!form.name) { toast.error("Nama institusi wajib diisi."); return; }
          actions.addInstitution(form);
          toast.success(`Institusi ${form.name} berhasil ditambahkan!`);
          onClose();
        }}>Tambah</Button>
      </div>
    </Modal>
  );
}

function EditInstitutionModal({ institution, onClose }: { institution: Institution; onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<Institution>({ ...institution });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={`Kelola Institusi — ${institution.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nama institusi</label>
          <Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="cth: 3ITC Digital Education" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Tipe Institusi</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.type} onChange={e => set("type", e.target.value)}>
              {["High School", "Vocational", "University", "Bootcamp", "Company", "Other"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Plan</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.plan} onChange={e => set("plan", e.target.value)}>
              {["Free", "Pro", "Enterprise"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Wilayah / Kota</label>
            <Input className="mt-1" value={form.region} onChange={e => set("region", e.target.value)} placeholder="cth: Jakarta" />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
              {["Active", "Pending", "Suspended"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Jumlah Pelajar</label>
            <Input type="number" className="mt-1" value={form.students} onChange={e => set("students", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm font-medium">Jumlah Pengajar</label>
            <Input type="number" className="mt-1" value={form.teachers} onChange={e => set("teachers", Number(e.target.value))} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => {
          if (!form.name) { toast.error("Nama institusi wajib diisi."); return; }
          actions.updateInstitution(form);
          toast.success(`Institusi ${form.name} berhasil diperbarui!`);
          onClose();
        }}>Simpan Perubahan</Button>
      </div>
    </Modal>
  );
}

export function InstitutionManagement() {
  const { state, actions } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [deletingInstitution, setDeletingInstitution] = useState<{ id: string; name: string } | null>(null);

  return (
    <div>
      <ConfirmDeleteModal
        isOpen={!!deletingInstitution}
        title="Hapus Institusi"
        itemName={deletingInstitution?.name}
        description="Apakah Anda yakin ingin menghapus institusi ini dari platform?"
        onConfirm={() => {
          if (deletingInstitution) {
            actions.deleteInstitution(deletingInstitution.id);
            toast.success(`Institusi "${deletingInstitution.name}" berhasil dihapus.`);
          }
        }}
        onClose={() => setDeletingInstitution(null)}
      />
      {showAdd && <AddInstitutionModal onClose={() => setShowAdd(false)} />}
      {editingInstitution && <EditInstitutionModal institution={editingInstitution} onClose={() => setEditingInstitution(null)} />}
      <PageHeader title="Manajemen Institusi" subtitle="Sekolah dan universitas di platform"
        actions={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Tambah institusi</Button>} />
      {state.institutions.length === 0 ? (
        <EmptyState icon={<Building2 className="size-7" />} title="Belum ada institusi terdaftar"
          description="Tambah institusi atau minta Super Admin untuk mendaftarkan mitra baru."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Tambah institusi</Button>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {state.institutions.map(inst => (
            <Card key={inst.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-accent text-primary"><Building2 className="size-5" /></div>
                  <div><h3 className="text-secondary">{inst.name}</h3><p className="text-sm text-muted-foreground">{inst.type} · {inst.region}</p></div>
                </div>
                <Badge variant={inst.status === "Active" ? "default" : "secondary"}>{inst.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted p-3"><p className="font-bold text-secondary">{inst.students}</p><p className="text-xs text-muted-foreground">Pelajar</p></div>
                <div className="rounded-lg bg-muted p-3"><p className="font-bold text-secondary">{inst.teachers}</p><p className="text-xs text-muted-foreground">Pengajar</p></div>
                <div className="rounded-lg bg-muted p-3"><p className="font-bold text-secondary">{inst.plan}</p><p className="text-xs text-muted-foreground">Plan</p></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingInstitution(inst)}>Kelola</Button>
                <button onClick={() => setDeletingInstitution({ id: inst.id, name: inst.name })}
                  className="flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5 transition-colors">
                  <Trash2 className="size-3.5" /> Hapus
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Course Management ──────────────────────────────────────────────────── */
function AddCourseModal({ onClose }: { onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<Omit<Course, "id" | "createdAt" | "updatedAt">>({
    title: "", subtitle: "", category: categories[0].name, level: "Beginner",
    language: "Bahasa Indonesia", thumbnail: "",
    mentorId: "", mentorName: "", mentorBio: "",
    hours: 0, rating: 0, learners: 0,
    summary: "", description: "", objectives: [], prerequisites: [],
    targetAudience: "", curriculum: [],
    price: "Free", status: "draft",
    certificateEnabled: true, enrollmentLimit: 0, tags: [],
  });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title="Tambah kursus baru" onClose={onClose}>
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Judul kursus</label><Input className="mt-1" value={form.title} onChange={e => set("title", e.target.value)} placeholder="cth: Full-Stack Web Development" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Kategori</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.category} onChange={e => set("category", e.target.value)}>
              {categories.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Level</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.level} onChange={e => set("level", e.target.value)}>
              {["Beginner", "Intermediate", "Advanced", "Capstone"].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div><label className="text-sm font-medium">Nama mentor</label><Input className="mt-1" value={form.mentorName} onChange={e => set("mentorName", e.target.value)} placeholder="cth: Dr. Anita Rahman" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm font-medium">Jam belajar</label><Input className="mt-1" type="number" min={0} value={form.hours || ""} onChange={e => set("hours", Number(e.target.value))} placeholder="0" /></div>
          <div><label className="text-sm font-medium">Jumlah modul</label><Input className="mt-1" type="number" min={0} value={form.modules || ""} onChange={e => set("modules", Number(e.target.value))} placeholder="0" /></div>
          <div>
            <label className="text-sm font-medium">Harga</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.price} onChange={e => set("price", e.target.value)}>
              {["Free", "Rp 99k", "Rp 199k", "Rp 299k"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Ringkasan</label>
          <textarea className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Deskripsi singkat kursus…" />
        </div>
        <div>
          <label className="text-sm font-medium">Status awal</label>
          <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => {
          if (!form.title || !form.mentorName) { toast.error("Judul dan nama mentor wajib diisi."); return; }
          actions.addCourse(form);
          toast.success(`Kursus "${form.title}" berhasil ditambahkan!`);
          onClose();
        }}><BookOpen className="size-4" /> Tambah kursus</Button>
      </div>
    </Modal>
  );
}

export function CourseManagement() {
  const { state, actions } = useStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("Semua");
  const [deletingCourse, setDeletingCourse] = useState<{ id: string; title: string } | null>(null);

  // Tampilkan editor jika ada course yang sedang diedit
  if (editingId) {
    return <CourseEditor courseId={editingId} onBack={() => setEditingId(null)} />;
  }

  const list = (state.courses || []).filter(c => {
    if (!c) return false;
    const title = c.title || "";
    const category = c.category || "";
    const matchSearch = title.toLowerCase().includes((search || "").toLowerCase()) ||
                        category.toLowerCase().includes((search || "").toLowerCase());
    const matchFilter = filterType === "Semua" 
                        ? (c.mentorProposalStatus !== "pending_approval") 
                        : (c.mentorProposalStatus === "pending_approval");
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <ConfirmDeleteModal
        isOpen={!!deletingCourse}
        title="Hapus Kursus"
        itemName={deletingCourse?.title}
        description="Apakah Anda yakin ingin menghapus kursus ini? Semua data kurikulum dan enrollments siswa pada kursus ini akan terhapus."
        onConfirm={() => {
          if (deletingCourse) {
            actions.deleteCourse(deletingCourse.id);
            toast.success(`Kursus "${deletingCourse.title}" berhasil dihapus.`);
          }
        }}
        onClose={() => setDeletingCourse(null)}
      />
      {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} />}
      <PageHeader title="Manajemen Kursus" subtitle="Buat dan kelola konten pembelajaran"
        actions={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Kursus baru</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kursus…" className="pl-9" />
        </div>
        {["Semua", "Menunggu Persetujuan"].map(f => (
          <button key={f} onClick={() => setFilterType(f)}
            className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors",
              filterType === f ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
            {f} {f === "Menunggu Persetujuan" && (state.courses || []).filter(c => c && c.mentorProposalStatus === "pending_approval").length > 0 && 
              <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0 min-h-4">
                {(state.courses || []).filter(c => c && c.mentorProposalStatus === "pending_approval").length}
              </Badge>
            }
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<BookOpen className="size-7" />} title="Belum ada kursus"
          description="Buat kursus pertama untuk mulai membagikan materi pembelajaran."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="size-4" /> Buat kursus</Button>} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kursus</TableHead><TableHead>Kategori</TableHead><TableHead>Mentor</TableHead>
                <TableHead>Sesi</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {c.thumbnail && <img src={c.thumbnail} alt="" className="size-9 shrink-0 rounded-lg object-cover" />}
                      <div>
                        <p className="font-medium">{c.title}</p>
                        {c.subtitle && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.subtitle}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{c.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{c.mentorName}</TableCell>
                  <TableCell>{c.curriculum?.length ?? 0} sesi</TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        actions.updateCourse({ id: c.id, status: c.status === "published" ? "draft" : "published" });
                        toast.success("Status kursus diperbarui.");
                      }}
                      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                        c.status === "published" ? "bg-green-50 text-success hover:bg-green-100" :
                        c.status === "archived" ? "bg-slate-100 text-muted-foreground" :
                        "bg-amber-50 text-warning hover:bg-amber-100")}>
                      {c.status === "published" ? "Published" : c.status === "archived" ? "Archived" : "Draft"}
                    </button>
                  </TableCell>
                  <TableCell>
                    {c.mentorProposalStatus === 'pending_approval' ? (
                      <div className="flex gap-2">
                        <Button size="sm" className="h-8" onClick={() => {
                          actions.updateCourse({ id: c.id, status: 'published', mentorProposalStatus: 'approved' });
                          actions.addNotification({ targetUserKey: (c.mentorName || c.mentorId || "").toLowerCase(), title: "Kursus Disetujui", message: `Proposal kursus "${c.title}" telah disetujui dan dipublikasikan.`, type: "system", read: false });
                          toast.success("Kursus disetujui & dipublikasikan.");
                        }}>
                          <CheckCircle2 className="size-3.5 mr-1" /> Setujui
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => {
                          actions.updateCourse({ id: c.id, status: 'draft', mentorProposalStatus: 'rejected' });
                          actions.addNotification({ targetUserKey: (c.mentorName || c.mentorId || "").toLowerCase(), title: "Kursus Ditolak", message: `Proposal kursus "${c.title}" ditolak.`, type: "system", read: false });
                          toast.success("Kursus ditolak.");
                        }}>
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingId(c.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-primary transition-colors">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => setDeletingCourse({ id: c.id, title: c.title })}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
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

/* ─── Assessment Management ──────────────────────────────────────────────── */
export function AssessmentManagement() {
  const { state, actions } = useStore();
  const assessments = state.assessments || [];

  const [showModal, setShowModal] = useState(false);
  const [editingAss, setEditingAss] = useState<any | null>(null);
  const [deletingAss, setDeletingAss] = useState<{ id: string; title: string } | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Quiz" | "Assignment" | "Project" | "Peer Review">("Quiz");
  const [courseId, setCourseId] = useState("");
  const [passingScore, setPassingScore] = useState(75);
  const [dueDate, setDueDate] = useState("");

  const handleOpenCreate = () => {
    setEditingAss(null);
    setTitle("");
    setType("Quiz");
    setCourseId(state.courses[0]?.id || "");
    setPassingScore(75);
    setDueDate("");
    setShowModal(true);
  };

  const handleOpenEdit = (ass: any) => {
    setEditingAss(ass);
    setTitle(ass.title || "");
    setType(ass.type || "Quiz");
    setCourseId(ass.courseId || "");
    setPassingScore(ass.passingScore || 75);
    setDueDate(ass.dueDate || "");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Judul asesmen wajib diisi.");
      return;
    }
    const selectedCourse = state.courses.find(c => c.id === courseId);
    const payload = {
      title: title.trim(),
      type,
      courseId,
      courseTitle: selectedCourse?.title || "Umum",
      passingScore: Number(passingScore),
      dueDate: dueDate || undefined,
    };

    if (editingAss) {
      actions.updateAssessment({ id: editingAss.id, ...payload });
      toast.success("Asesmen berhasil diperbarui!");
    } else {
      actions.addAssessment(payload);
      toast.success("Asesmen baru berhasil ditambahkan!");
    }
    setShowModal(false);
  };

  return (
    <div>
      <ConfirmDeleteModal
        isOpen={!!deletingAss}
        title="Hapus Asesmen"
        itemName={deletingAss?.title}
        description="Apakah Anda yakin ingin menghapus asesmen ini?"
        onConfirm={() => {
          if (deletingAss) {
            actions.deleteAssessment(deletingAss.id);
            toast.success(`Asesmen "${deletingAss.title}" berhasil dihapus.`);
            setDeletingAss(null);
          }
        }}
        onClose={() => setDeletingAss(null)}
      />

      <PageHeader
        title="Manajemen Asesmen"
        subtitle="Kuis, tugas, project & peer review"
        actions={<Button onClick={handleOpenCreate}><Plus className="size-4" /> Asesmen baru</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total asesmen" value={String(assessments.length)} icon={<ClipboardCheck className="size-5" />} />
        <StatCard label="Rata-rata skor KKM" value="75%" icon={<TrendingUp className="size-5" />} tone="success" />
        <StatCard label="Menunggu nilai" value="0" icon={<CheckCircle2 className="size-5" />} tone="warning" />
        <StatCard label="Peer review" value={String(assessments.filter(a => a.type === "Peer Review").length)} icon={<Users className="size-5" />} tone="neutral" />
      </div>

      <div className="mt-6">
        {assessments.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="size-7" />}
            title="Belum ada asesmen dibuat"
            description="Buat kuis, tugas, atau project untuk mengevaluasi pelajar."
            action={<Button onClick={handleOpenCreate}><Plus className="size-4" /> Buat asesmen</Button>}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Asesmen</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kursus</TableHead>
                  <TableHead>KKM Score</TableHead>
                  <TableHead>Tenggat</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map(ass => (
                  <TableRow key={ass.id}>
                    <TableCell className="font-medium">{ass.title}</TableCell>
                    <TableCell><Badge variant="secondary">{ass.type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{ass.courseTitle || "Umum"}</TableCell>
                    <TableCell><Badge variant="outline">{ass.passingScore || 75} Poin</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{ass.dueDate || "Tidak ada"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(ass)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-primary transition-colors">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => setDeletingAss({ id: ass.id, title: ass.title })} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingAss ? "Edit Asesmen" : "Tambah Asesmen Baru"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="size-4" /></Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Asesmen</label>
                <Input placeholder="cth: Kuis Dasar TypeScript Module 1" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tipe Asesmen</label>
                <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={type} onChange={e => setType(e.target.value as any)}>
                  <option value="Quiz">Quiz (Kuis)</option>
                  <option value="Assignment">Assignment (Tugas)</option>
                  <option value="Project">Project Akhir</option>
                  <option value="Peer Review">Peer Review</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Terkait Kursus</label>
                <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={courseId} onChange={e => setCourseId(e.target.value)}>
                  <option value="">Umum (Semua Kursus)</option>
                  {state.courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nilai KKM (Passing)</label>
                  <Input type="number" min={0} max={100} value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tenggat Waktu</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
              <Button onClick={handleSave}>{editingAss ? "Simpan Perubahan" : "Buat Asesmen"}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Certificate Management ─────────────────────────────────────────────── */
export function CertificateManagement() {
  const { state } = useStore();
  const certs = state.certificates;
  return (
    <div>
      <PageHeader title="Manajemen Sertifikat" subtitle="Terbitkan, template, dan verifikasi kredensial" actions={<Button><Plus className="size-4" /> Template baru</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Diterbitkan (total)" value={String(certs.length)} icon={<Award className="size-5" />} tone="success" />
        <StatCard label="Bulan ini" value="0" icon={<TrendingUp className="size-5" />} />
        <StatCard label="Template" value="0" icon={<BookOpen className="size-5" />} tone="neutral" />
      </div>
      <div className="mt-6">
        {certs.length === 0
          ? <EmptyState icon={<Award className="size-7" />} title="Belum ada sertifikat diterbitkan"
              description="Sertifikat akan diterbitkan otomatis saat pelajar menyelesaikan learning path." />
          : (
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Kursus</TableHead><TableHead>Pelajar</TableHead>
                  <TableHead>Credential ID</TableHead><TableHead>Diterbitkan</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {certs.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.courseTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{c.userId}</TableCell>
                      <TableCell><Badge variant="outline">{c.credentialId}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString("id-ID")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
      </div>
    </div>
  );
}

/* ─── Talent Pool ────────────────────────────────────────────────────────── */
export function TalentPoolManagement() {
  return (
    <div>
      <PageHeader title="Talent Pool" subtitle="Pelajar terkurasi siap untuk peluang karier" />
      <EmptyState icon={<Sparkles className="size-7" />} title="Talent pool masih kosong"
        description="Pelajar yang menyelesaikan learning path dan mendapat skill score tinggi akan muncul di sini." />
    </div>
  );
}

/* ─── Recruitment ────────────────────────────────────────────────────────── */
export function RecruitmentRecommendation() {
  return (
    <div>
      <PageHeader title="Rekomendasi Rekrutmen" subtitle="Kandidat yang dicocokkan AI untuk peran mitra" actions={<Badge variant="secondary">Beta</Badge>} />
      <EmptyState icon={<Briefcase className="size-7" />} title="Belum ada kandidat tersedia"
        description="Rekomendasi rekrutmen akan muncul setelah talent pool memiliki pelajar yang memenuhi syarat." />
    </div>
  );
}

/* ─── Analytics ──────────────────────────────────────────────────────────── */
export function AnalyticsDashboard() {
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Analitik" subtitle="Wawasan mendalam performa platform" />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total pengguna" value={String(state.users.length)} icon={<Users className="size-5" />} />
        <StatCard label="Kursus aktif" value={String(state.courses.filter(c => c.status === "published").length)} icon={<CheckCircle2 className="size-5" />} tone="success" />
        <StatCard label="Institusi" value={String(state.institutions.length)} icon={<TrendingUp className="size-5" />} tone="warning" />
        <StatCard label="Sertifikat" value={String(state.certificates.length)} icon={<Star className="size-5" />} tone="neutral" />
      </div>
      <div className="mt-6">
        <EmptyState icon={<TrendingUp className="size-6" />} title="Belum ada data analitik"
          description="Data akan muncul setelah platform aktif digunakan." />
      </div>
    </div>
  );
}

/* ─── Landing Content Manager ─────────────────────────────────────────────── */
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { type LandingContent, type LandingFeature, type LandingPartner, type LandingTestimonial, type LandingBannerSlide, type LandingCategory } from "../store/Store";

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

export function LandingContentManager() {
  const { state, actions } = useStore();
  const lc = state.landingContent;
  const [tab, setTab] = useState("hero");

  // Local draft state for inline editing
  const [heroHeadline, setHeroHeadline] = useState(lc.hero?.headline || "");
  const [heroTagline, setHeroTagline] = useState(lc.hero?.tagline || "");
  const [heroCtaText, setHeroCtaText] = useState(lc.hero?.ctaText || "");
  const [heroStats, setHeroStats] = useState(lc.hero?.stats || []);

  const [bannerSlides, setBannerSlides] = useState<LandingBannerSlide[]>(lc.bannerSlides || []);
  const [categories, setCategories] = useState<LandingCategory[]>(lc.categories || []);
  const [features, setFeatures] = useState<LandingFeature[]>(lc.features || []);
  const [partners, setPartners] = useState(lc.partners || []);
  const [testimonials, setTestimonials] = useState(lc.testimonials || []);
  const [platformStats, setPlatformStats] = useState(lc.platformStats || []);
  const [ctaHeadline, setCtaHeadline] = useState(lc.ctaSection?.headline || "");
  const [ctaDesc, setCtaDesc] = useState(lc.ctaSection?.description || "");
  const [ctaBtn, setCtaBtn] = useState(lc.ctaSection?.buttonText || "");

  const saveAll = () => {
    actions.updateLanding({
      hero: { headline: heroHeadline, tagline: heroTagline, ctaText: heroCtaText, stats: heroStats },
      bannerSlides,
      categories,
      features,
      partners,
      testimonials,
      platformStats,
      ctaSection: { headline: ctaHeadline, description: ctaDesc, buttonText: ctaBtn },
    });
    toast.success("Landing page berhasil disimpan!");
  };

  return (
    <div>
      <PageHeader
        title="Kelola Landing Page"
        subtitle="Atur konten yang tampil di halaman publik landing page"
        actions={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline"><Search className="size-4" /> Preview</Button>
            </a>
            <Button onClick={saveAll}><CheckCircle2 className="size-4" /> Simpan Semua</Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="slides">Banner Slides</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
          <TabsTrigger value="features">Fitur</TabsTrigger>
          <TabsTrigger value="partners">Mitra</TabsTrigger>
          <TabsTrigger value="testimonials">Testimoni</TabsTrigger>
          <TabsTrigger value="stats">Statistik</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
        </TabsList>

        {/* ── Hero ── */}
        <TabsContent value="hero">
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0"><CardTitle>Hero Section</CardTitle></CardHeader>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Headline</label>
              <Input value={heroHeadline} onChange={e => setHeroHeadline(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tagline</label>
              <Textarea rows={3} value={heroTagline} onChange={e => setHeroTagline(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Teks Tombol CTA</label>
              <Input value={heroCtaText} onChange={e => setHeroCtaText(e.target.value)} />
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium">Statistik Hero (maks 4)</label>
              <div className="space-y-2">
                {heroStats.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Label" value={s.label} onChange={e => { const n = [...heroStats]; n[i] = { ...s, label: e.target.value }; setHeroStats(n); }} className="flex-1" />
                    <Input placeholder="Nilai" value={s.value} onChange={e => { const n = [...heroStats]; n[i] = { ...s, value: e.target.value }; setHeroStats(n); }} className="w-32" />
                    <Button variant="ghost" size="sm" onClick={() => setHeroStats(heroStats.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                ))}
                {heroStats.length < 4 && (
                  <Button variant="outline" size="sm" onClick={() => setHeroStats([...heroStats, { label: "", value: "" }])}>
                    <Plus className="size-4" /> Tambah Stat
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Banner Slides ── */}
        <TabsContent value="slides">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Banner Slides / Foto Carousel</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {bannerSlides.map((slide, i) => (
                <div key={slide.id} className="rounded-xl border border-border p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-primary">Slide #{i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => setBannerSlides(bannerSlides.filter((_, j) => j !== i))}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Badge (cth: 🔥 EVENT UNGULAN)"
                      value={slide.badge}
                      onChange={e => { const n = [...bannerSlides]; n[i] = { ...slide, badge: e.target.value }; setBannerSlides(n); }}
                    />
                    <Input
                      placeholder="Judul Slide"
                      value={slide.title}
                      onChange={e => { const n = [...bannerSlides]; n[i] = { ...slide, title: e.target.value }; setBannerSlides(n); }}
                    />
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Deskripsi Singkat / Subtitle"
                    value={slide.subtitle}
                    onChange={e => { const n = [...bannerSlides]; n[i] = { ...slide, subtitle: e.target.value }; setBannerSlides(n); }}
                  />
                  <div className="grid gap-4 sm:grid-cols-4 items-center pt-2">
                    <div className="sm:col-span-1">
                      {slide.imageUrl ? (
                        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          Belum ada foto
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
                          <Upload className="size-3.5" /> Pilih Foto Lokal (1920x1080)
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const dataUrl = event.target?.result as string;
                                if (dataUrl) {
                                  const n = [...bannerSlides];
                                  n[i] = { ...slide, imageUrl: dataUrl };
                                  setBannerSlides(n);
                                  toast.success("Foto slide berhasil di-upload!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <span className="text-xs text-muted-foreground">atau masukkan URL langsung di bawah</span>
                      </div>

                      <Input
                        placeholder="URL Gambar (https://... atau data:image/...)"
                        value={slide.imageUrl}
                        onChange={e => { const n = [...bannerSlides]; n[i] = { ...slide, imageUrl: e.target.value }; setBannerSlides(n); }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 pt-1">
                    <Input
                      placeholder="Link Tombol (cth: #event atau /login)"
                      value={slide.linkUrl}
                      onChange={e => { const n = [...bannerSlides]; n[i] = { ...slide, linkUrl: e.target.value }; setBannerSlides(n); }}
                    />
                    <Input
                      placeholder="Teks Tombol (cth: Daftar)"
                      value={slide.buttonText}
                      onChange={e => { const n = [...bannerSlides]; n[i] = { ...slide, buttonText: e.target.value }; setBannerSlides(n); }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setBannerSlides([
                  ...bannerSlides,
                  {
                    id: uid(),
                    title: "Event / Program Baru",
                    subtitle: "Deskripsi singkat event atau promo baru.",
                    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
                    linkUrl: "#event",
                    badge: "✨ BARU",
                    buttonText: "Lihat Detail",
                  }
                ])}
              >
                <Plus className="size-4" /> Tambah Banner Slide
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Categories ── */}
        <TabsContent value="categories">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Kategori Pembelajaran & Pop-up Detail</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={cat.id || i} className="rounded-xl border border-border p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-primary">Kategori #{i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => setCategories(categories.filter((_, j) => j !== i))}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Nama Kategori</label>
                      <Input
                        placeholder="cth: Programming"
                        value={cat.name}
                        onChange={e => { const n = [...categories]; n[i] = { ...cat, name: e.target.value }; setCategories(n); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Icon Lucide / Image URL</label>
                      <Input
                        placeholder="cth: Code atau https://..."
                        value={cat.icon}
                        onChange={e => { const n = [...categories]; n[i] = { ...cat, icon: e.target.value }; setCategories(n); }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Penjelasan Detail (Pop-up Slide)</label>
                    <Textarea
                      rows={2}
                      placeholder="Penjelasan lengkap saat kartu kategori diklik..."
                      value={cat.description || ""}
                      onChange={e => { const n = [...categories]; n[i] = { ...cat, description: e.target.value }; setCategories(n); }}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4 items-center pt-1">
                    <div className="sm:col-span-1">
                      {cat.detailImageUrl ? (
                        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={cat.detailImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                          Foto Banner Pop-up
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
                          <Upload className="size-3.5" /> Upload Foto Banner Pop-up
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const dataUrl = evt.target?.result as string;
                                if (dataUrl) {
                                  const n = [...categories];
                                  n[i] = { ...cat, detailImageUrl: dataUrl };
                                  setCategories(n);
                                  toast.success("Foto banner kategori di-upload!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      <Input
                        placeholder="URL Foto Banner Pop-up"
                        value={cat.detailImageUrl || ""}
                        onChange={e => { const n = [...categories]; n[i] = { ...cat, detailImageUrl: e.target.value }; setCategories(n); }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Point Keunggulan / Highlights (Pisahkan dengan Koma)</label>
                    <Input
                      placeholder="cth: Kurikulum 2026, Project Real-World, Code Review 1-on-1"
                      value={Array.isArray(cat.highlights) ? cat.highlights.join(", ") : ""}
                      onChange={e => {
                        const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                        const n = [...categories];
                        n[i] = { ...cat, highlights: arr };
                        setCategories(n);
                      }}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setCategories([
                  ...categories,
                  {
                    id: uid(),
                    name: "Kategori Baru",
                    icon: "Sparkles",
                    description: "Penjelasan detail kategori baru.",
                    detailImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
                    highlights: ["Pembelajaran Interaktif", "Mentor Praktisi Industry", "Sertifikasi Resmi"]
                  }
                ])}
              >
                <Plus className="size-4" /> Tambah Kategori Baru
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Features ── */}
        <TabsContent value="features">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Fitur Unggulan & Pop-up Detail</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={f.id} className="rounded-xl border border-border p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-primary">Fitur #{i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => setFeatures(features.filter((_, j) => j !== i))}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Judul Fitur</label>
                      <Input
                        placeholder="cth: Kurikulum Terstruktur"
                        value={f.title}
                        onChange={e => { const n = [...features]; n[i] = { ...f, title: e.target.value }; setFeatures(n); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Icon Lucide / Image URL</label>
                      <Input
                        placeholder="cth: GraduationCap atau https://..."
                        value={f.icon}
                        onChange={e => { const n = [...features]; n[i] = { ...f, icon: e.target.value }; setFeatures(n); }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Deskripsi Ringkas (Tampil di Card)</label>
                    <Input
                      placeholder="Deskripsi ringkas..."
                      value={f.description}
                      onChange={e => { const n = [...features]; n[i] = { ...f, description: e.target.value }; setFeatures(n); }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Penjelasan Detail (Pop-up Slide)</label>
                    <Textarea
                      rows={2}
                      placeholder="Penjelasan lengkap saat kartu fitur diklik..."
                      value={f.fullContent || f.description || ""}
                      onChange={e => { const n = [...features]; n[i] = { ...f, fullContent: e.target.value }; setFeatures(n); }}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4 items-center pt-1">
                    <div className="sm:col-span-1">
                      {f.detailImageUrl ? (
                        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={f.detailImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                          Foto Banner Pop-up
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
                          <Upload className="size-3.5" /> Upload Foto Banner Pop-up
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const dataUrl = evt.target?.result as string;
                                if (dataUrl) {
                                  const n = [...features];
                                  n[i] = { ...f, detailImageUrl: dataUrl };
                                  setFeatures(n);
                                  toast.success("Foto banner fitur di-upload!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      <Input
                        placeholder="URL Foto Banner Pop-up"
                        value={f.detailImageUrl || ""}
                        onChange={e => { const n = [...features]; n[i] = { ...f, detailImageUrl: e.target.value }; setFeatures(n); }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Point Keunggulan / Highlights (Pisahkan dengan Koma)</label>
                    <Input
                      placeholder="cth: Materi Terupdate 2026, Studi Kasus Perusahaan, Akses Seumur Hidup"
                      value={Array.isArray(f.highlights) ? f.highlights.join(", ") : ""}
                      onChange={e => {
                        const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                        const n = [...features];
                        n[i] = { ...f, highlights: arr };
                        setFeatures(n);
                      }}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setFeatures([
                  ...features,
                  {
                    id: uid(),
                    icon: "Star",
                    title: "Fitur Unggulan Baru",
                    description: "Deskripsi ringkas fitur baru.",
                    fullContent: "Penjelasan lengkap fitur baru saat pop-up dibuka.",
                    detailImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
                    highlights: ["Kemudahan Akses 24/7", "Dukungan Komunitas", "Sertifikasi Resmi"]
                  }
                ])}
              >
                <Plus className="size-4" /> Tambah Fitur Baru
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Partners ── */}
        <TabsContent value="partners">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4"><CardTitle>Mitra / Partner</CardTitle></CardHeader>
            <div className="space-y-3">
              {partners.map((p, i) => (
                <div key={p.id} className="flex gap-3 items-center rounded-xl border border-border p-4">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt="" className="size-10 object-contain shrink-0 rounded-lg border border-border bg-muted p-1" />
                  ) : (
                    <div className="size-10 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0 font-medium">
                      Logo
                    </div>
                  )}
                  <Input placeholder="Nama institusi" value={p.name} onChange={e => { const n = [...partners]; n[i] = { ...p, name: e.target.value }; setPartners(n); }} className="flex-1" />
                  
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium transition-colors shrink-0">
                    <Upload className="size-3.5" /> {p.logoUrl ? "Ganti Logo" : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const dataUrl = evt.target?.result as string;
                          if (dataUrl) {
                            const n = [...partners];
                            n[i] = { ...p, logoUrl: dataUrl };
                            setPartners(n);
                            toast.success("Logo mitra berhasil di-upload!");
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <Button variant="ghost" size="sm" onClick={() => setPartners(partners.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => setPartners([...partners, { id: uid(), name: "", logoUrl: "" }])}>
                <Plus className="size-4" /> Tambah Mitra
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Testimonials ── */}
        <TabsContent value="testimonials">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4"><CardTitle>Testimoni</CardTitle></CardHeader>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={t.id} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input placeholder="Nama" value={t.name} onChange={e => { const n = [...testimonials]; n[i] = { ...t, name: e.target.value }; setTestimonials(n); }} />
                    <Input placeholder="Jabatan" value={t.role} onChange={e => { const n = [...testimonials]; n[i] = { ...t, role: e.target.value }; setTestimonials(n); }} />
                    <Input placeholder="Institusi / Perusahaan" value={t.institution} onChange={e => { const n = [...testimonials]; n[i] = { ...t, institution: e.target.value }; setTestimonials(n); }} />
                  </div>
                  <Textarea rows={2} placeholder="Kutipan testimoni..." value={t.quote} onChange={e => { const n = [...testimonials]; n[i] = { ...t, quote: e.target.value }; setTestimonials(n); }} />
                  <div className="flex items-center gap-3 pt-1">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt="" className="size-9 rounded-full object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                        {t.name?.[0] || "U"}
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium transition-colors">
                      <Upload className="size-3.5" /> {t.avatarUrl ? "Ganti Foto Profil" : "Upload Foto Profil"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const dataUrl = evt.target?.result as string;
                            if (dataUrl) {
                              const n = [...testimonials];
                              n[i] = { ...t, avatarUrl: dataUrl };
                              setTestimonials(n);
                              toast.success("Foto testimoni di-upload!");
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setTestimonials([...testimonials, { id: uid(), name: "", role: "", institution: "", quote: "", avatarUrl: "" }])}>
                <Plus className="size-4" /> Tambah Testimoni
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Platform Stats ── */}
        <TabsContent value="stats">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4"><CardTitle>Statistik Platform</CardTitle></CardHeader>
            <div className="space-y-3">
              {platformStats.map((s, i) => (
                <div key={i} className="flex gap-3 items-center rounded-xl border border-border p-4">
                  <Input placeholder="Label" value={s.label} onChange={e => { const n = [...platformStats]; n[i] = { ...s, label: e.target.value }; setPlatformStats(n); }} className="flex-1" />
                  <Input placeholder="Nilai" value={s.value} onChange={e => { const n = [...platformStats]; n[i] = { ...s, value: e.target.value }; setPlatformStats(n); }} className="w-32" />
                  <Input placeholder="Icon" value={s.icon} onChange={e => { const n = [...platformStats]; n[i] = { ...s, icon: e.target.value }; setPlatformStats(n); }} className="w-32" />
                  <Button variant="ghost" size="sm" onClick={() => setPlatformStats(platformStats.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => setPlatformStats([...platformStats, { label: "", value: "", icon: "Star" }])}>
                <Plus className="size-4" /> Tambah Statistik
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── CTA Section ── */}
        <TabsContent value="cta">
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0"><CardTitle>Call-to-Action Section</CardTitle></CardHeader>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Headline CTA</label>
              <Input value={ctaHeadline} onChange={e => setCtaHeadline(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Deskripsi CTA</label>
              <Textarea rows={2} value={ctaDesc} onChange={e => setCtaDesc(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Teks Tombol</label>
              <Input value={ctaBtn} onChange={e => setCtaBtn(e.target.value)} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Event & Webinar Management ────────────────────────────────────────── */
export function EventManagement() {
  const { state, actions } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"Webinar" | "Community" | "Event">("Webinar");
  const [speaker, setSpeaker] = useState("");
  const [seats, setSeats] = useState(100);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [gformUrl, setGformUrl] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");

  const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawResult = reader.result as string;
        const compressed = await compressImage(rawResult, 1000, 500, 0.8);
        setImageUrl(compressed);
        toast.success("Banner foto event berhasil diunggah!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setTime("19:00 WIB");
    setType("Webinar");
    setSpeaker("");
    setSeats(100);
    setImageUrl("");
    setDescription("");
    setMeetingUrl("");
    setGformUrl("");
    setThankYouMessage("Terima kasih sudah mendaftar event ini! Silakan bergabung ke sesi live melalui link Zoom di bawah ini.");
    setShowModal(true);
  };

  const handleOpenEdit = (evt: any) => {
    setEditingId(evt.id);
    setTitle(evt.title || "");
    setDate(evt.date || "");
    setTime(evt.time || "19:00 WIB");
    setType(evt.type || "Webinar");
    setSpeaker(evt.speaker || "");
    setSeats(evt.seats || 100);
    setImageUrl(evt.imageUrl || "");
    setDescription(evt.description || "");
    setMeetingUrl(evt.meetingUrl || "");
    setGformUrl(evt.gformUrl || "");
    setThankYouMessage(evt.thankYouMessage || "Terima kasih sudah mendaftar event ini! Silakan bergabung ke sesi live melalui link Zoom di bawah ini.");
    setShowModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      toast.error("Judul dan Tanggal event wajib diisi!");
      return;
    }

    const payload = {
      title,
      date,
      time: time || "19:00 WIB",
      type,
      speaker: speaker || "Praktisi Industri",
      seats: Number(seats) || 100,
      imageUrl,
      description,
      meetingUrl,
      gformUrl,
      thankYouMessage,
    };

    if (editingId) {
      actions.updateEvent({ id: editingId, ...payload });
      toast.success("Event berhasil diperbarui!");
    } else {
      actions.addEvent(payload);
      toast.success("Event baru berhasil dibuat!");
    }

    setShowModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Kelola Event & Webinar"
        subtitle="Jadwalkan dan kelola webinar, workshop, serta acara komunitas"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="size-4" /> Buat Event Baru
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Total Event" value={String(state.events.length)} icon={<CalendarDays className="size-5" />} />
        <StatCard label="Total Peserta Pendaftar" value={String(state.events.reduce((acc, e) => acc + (e.registrations || 0), 0))} icon={<Users className="size-5" />} tone="success" />
        <StatCard label="Webinar Mendatang" value={String(state.events.filter(e => e.type === "Webinar").length)} icon={<Sparkles className="size-5" />} tone="warning" />
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Daftar Event Terjadwal</CardTitle>
        </CardHeader>

        {state.events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-8" />}
            title="Belum Ada Event"
            description="Klik tombol 'Buat Event Baru' untuk membuat webinar atau workshop pertama Anda."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Event & Webinar</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Pembicara</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kapasitas / Pendaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.events.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell>
                    {evt.imageUrl ? (
                      <img src={evt.imageUrl} alt={evt.title} className="w-14 h-9 object-cover rounded-lg border border-border" />
                    ) : (
                      <div className="w-14 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold">
                        {evt.type ? evt.type[0] : "W"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{evt.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={evt.type === "Webinar" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200"}>
                      {evt.type || "Webinar"}
                    </Badge>
                  </TableCell>
                  <TableCell>{evt.speaker}</TableCell>
                  <TableCell>{evt.date} ({evt.time})</TableCell>
                  <TableCell>{evt.registrations || 0} / {evt.seats} Kursi</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(evt)}
                      >
                        <Pencil className="size-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          actions.deleteEvent(evt.id);
                          toast.success("Event berhasil dihapus!");
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl p-6 bg-card max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingId ? "Edit Event / Webinar" : "Buat Event / Webinar Baru"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="size-4" /></Button>
            </div>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Event</label>
                <Input placeholder="cth: Workshop AI & Machine Learning 2026" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              {/* Image Input (File upload local) */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">Banner Foto Event (Upload File)</label>
                {imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black/5 mb-2">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                  <span className="inline-flex flex-col items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Upload className="size-5 text-primary mb-1" /> {imageUrl ? "Klik untuk ganti gambar dari komputer" : "Klik untuk upload gambar banner event"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipe Event</label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                  >
                    <option value="Webinar">Webinar</option>
                    <option value="Event">Workshop / Hands-on</option>
                    <option value="Community">Gathering Komunitas</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Pembicara / Mentor</label>
                  <Input placeholder="cth: Dr. Irfan Pratama" value={speaker} onChange={e => setSpeaker(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tanggal</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Waktu</label>
                  <Input placeholder="19:00 WIB" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Kuota Kursi</label>
                  <Input type="number" value={seats} onChange={e => setSeats(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Deskripsi Event</label>
                <Textarea rows={3} placeholder="Jelaskan topik yang dipelajari, silabus singkat, serta benefit mengikuti event ini..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Link Zoom / Google Meet</label>
                  <Input placeholder="https://zoom.us/j/..." value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Link Google Form (Pendaftaran)</label>
                  <Input placeholder="https://forms.gle/..." value={gformUrl} onChange={e => setGformUrl(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Pesan Kustom Setelah Mendaftar (Thank You Note)</label>
                <Textarea
                  rows={2}
                  placeholder="cth: Terima kasih sudah mendaftar! Silakan gabung ke WhatsApp Group..."
                  value={thankYouMessage}
                  onChange={e => setThankYouMessage(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground mt-1">💡 Link Zoom/GMeet dan pesan kustom ini baru akan terbuka di layar siswa SETELAH siswa mendaftar event.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit">{editingId ? "Simpan Perubahan" : "Terbitkan Event"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Forum Moderation ─────────────────────────────────────────────────── */
export function ForumModeration() {
  const { state, actions } = useStore();
  const [search, setSearch] = useState("");

  const filteredThreads = state.forumThreads.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Moderasi Forum Diskusi"
        subtitle="Pantau dan moderasi topik diskusi komunitas pelajar & mentor"
      />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari topik diskusi..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Topik Diskusi Komunitas ({filteredThreads.length})</CardTitle>
        </CardHeader>

        {filteredThreads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="size-8" />}
            title="Tidak Ada Diskusi Ditemukan"
            description="Belum ada topik diskusi di forum."
          />
        ) : (
          <div className="space-y-3">
            {filteredThreads.map(thread => (
              <div key={thread.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{thread.title}</h4>
                      <Badge variant="secondary">{thread.category}</Badge>
                      {thread.pinned && <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200"><Pin className="size-3 mr-1" /> Pinned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Oleh <span className="font-medium">{thread.authorName}</span> · {thread.replies || 0} Balasan · {thread.createdAt}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    actions.deleteForumThread(thread.id);
                    toast.success("Diskusi berhasil dihapus!");
                  }}
                >
                  <Trash2 className="size-4 text-destructive" /> Hapus
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── Student Projects Management ────────────────────────────────────────── */
export function ProjectManagement() {
  const { state } = useStore();
  const projects = state.portfolioProjects || [];

  return (
    <div>
      <PageHeader
        title="Kelola Project & Portfolio Student"
        subtitle="Daftar capstone project dan karya portfolio yang dikirimkan oleh siswa"
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Total Portfolio Submitted" value={String(projects.length)} icon={<FolderGit2 className="size-5" />} />
        <StatCard label="Siswa Berportfolio" value={String(new Set(projects.map(p => p.userId)).size)} icon={<Users className="size-5" />} tone="success" />
        <StatCard label="Kesiapan Karier" value="88%" icon={<Sparkles className="size-5" />} tone="warning" />
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Daftar Portfolio Project</CardTitle>
        </CardHeader>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderGit2 className="size-8" />}
            title="Belum Ada Portfolio Project"
            description="Project yang dikirimkan siswa akan muncul di sini."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="font-bold text-base">{p.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {p.tags?.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t text-xs">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><ExternalLink className="size-3" /> Live App</a>}
                  {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:underline flex items-center gap-1"><FolderGit2 className="size-3" /> Repository</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── Badge Management ───────────────────────────────────────────────────── */
export function BadgeManagement() {
  const { state, actions } = useStore();
  const badges = state.badges || [];
  const [showAdd, setShowAdd] = useState(false);
  const [editingBadge, setEditingBadge] = useState<AppBadge | null>(null);
  const [awardingBadge, setAwardingBadge] = useState<AppBadge | null>(null);
  const [targetUserId, setTargetUserId] = useState<string>("");

  const [form, setForm] = useState({ name: "", description: "", category: "Skill", iconUrl: "" });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(prev => ({ ...prev, iconUrl: event.target?.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBadge = () => {
    if (!form.name || !form.iconUrl) {
      toast.error("Nama dan ikon badge wajib diisi.");
      return;
    }

    if (editingBadge) {
      actions.updateBadge({
        id: editingBadge.id,
        name: form.name,
        description: form.description,
        category: form.category,
        iconUrl: form.iconUrl,
      });
      toast.success(`Badge "${form.name}" berhasil diperbarui!`);
      setEditingBadge(null);
    } else {
      actions.addBadge({
        name: form.name,
        description: form.description,
        category: form.category,
        iconUrl: form.iconUrl,
      });
      toast.success(`Badge "${form.name}" berhasil ditambahkan!`);
      setShowAdd(false);
    }
    setForm({ name: "", description: "", category: "Skill", iconUrl: "" });
  };

  const openEdit = (badge: AppBadge) => {
    setEditingBadge(badge);
    setForm({
      name: badge.name || "",
      description: badge.description || "",
      category: badge.category || "Skill",
      iconUrl: badge.iconUrl || "",
    });
  };

  const handleAward = () => {
    if (!awardingBadge || !targetUserId) {
      toast.error("Pilih pengguna terlebih dahulu.");
      return;
    }
    const u = state.users.find(u => u.id === targetUserId);
    if (u) {
      const userKey = (u.name || u.email || u.id || "").toLowerCase();
      actions.awardUserBadge(awardingBadge.id, userKey);
      actions.addNotification({
        targetUserKey: userKey,
        title: "Selamat! Badge Baru Didapatkan",
        message: `Kamu mendapatkan badge "${awardingBadge.name}". Pajang di profilmu!`,
        type: "badge_earned",
        read: false,
      });
      toast.success(`Badge "${awardingBadge.name}" berhasil dianugerahkan ke ${u.name}!`);
    }
    setAwardingBadge(null);
    setTargetUserId("");
  };

  const [deletingBadge, setDeletingBadge] = useState<{ id: string; name: string } | null>(null);

  return (
    <div>
      <ConfirmDeleteModal
        isOpen={!!deletingBadge}
        title="Hapus Badge"
        itemName={deletingBadge?.name}
        description="Apakah Anda yakin ingin menghapus badge pencapaian ini?"
        onConfirm={() => {
          if (deletingBadge) {
            actions.deleteBadge(deletingBadge.id);
            toast.success(`Badge "${deletingBadge.name}" berhasil dihapus.`);
          }
        }}
        onClose={() => setDeletingBadge(null)}
      />
      <PageHeader
        title="Manajemen Badge"
        subtitle="Kelola badge pencapaian dan kompetensi untuk pelajar"
        actions={<Button onClick={() => {
          setEditingBadge(null);
          setForm({ name: "", description: "", category: "Skill", iconUrl: "" });
          setShowAdd(true);
        }}><Plus className="size-4" /> Tambah Badge</Button>}
      />

      {badges.length === 0 ? (
        <EmptyState
          icon={<Award className="size-8" />}
          title="Belum Ada Badge"
          description="Tambahkan badge pertama untuk mulai memberikan penghargaan."
          action={<Button onClick={() => {
            setEditingBadge(null);
            setForm({ name: "", description: "", category: "Skill", iconUrl: "" });
            setShowAdd(true);
          }}><Plus className="size-4" /> Tambah Badge</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map(badge => (
            <Card key={badge.id} className="p-4 flex flex-col items-center text-center relative group">
              <img src={badge.iconUrl} alt={badge.name} className="size-16 mb-3 object-contain" />
              <h4 className="font-semibold text-sm">{badge.name}</h4>
              <Badge variant="secondary" className="mt-1 mb-2 text-[10px]">{badge.category}</Badge>
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{badge.description}</p>
              
              <div className="flex gap-1.5 w-full mt-4">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => {
                  setAwardingBadge(badge);
                  setTargetUserId(state.users[0]?.id || "");
                }}>
                  <Award className="size-3.5 mr-1" /> Award
                </Button>
                <Button variant="outline" size="sm" className="px-2.5" onClick={() => openEdit(badge)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive px-2" onClick={() => setDeletingBadge({ id: badge.id, name: badge.name })}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Badge Form */}
      {(showAdd || editingBadge) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingBadge ? "Edit Badge" : "Tambah Badge Baru"}</h3>
              <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setEditingBadge(null); }}><X className="size-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama Badge</label>
                <Input placeholder="cth: React Expert" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Kategori</label>
                <Input placeholder="cth: Skill, Mastery, Achievement" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Deskripsi</label>
                <textarea 
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" 
                  rows={3} 
                  placeholder="Deskripsi pencapaian badge..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Ikon / Gambar Badge (Upload)</label>
                {form.iconUrl && (
                  <div className="mb-2 p-2 bg-muted/30 border border-border rounded-lg flex justify-center">
                    <img src={form.iconUrl} alt="Preview" className="size-16 object-contain" />
                  </div>
                )}
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <span className="inline-flex flex-col items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    {isUploading ? "Memproses..." : (
                      <>
                        <Upload className="size-5 mb-1" /> Klik untuk pilih gambar dari komputer
                      </>
                    )}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} disabled={isUploading} />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setEditingBadge(null); }}>Batal</Button>
                <Button onClick={handleSaveBadge}>{editingBadge ? "Simpan Perubahan" : "Tambah Badge"}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Award Badge to User */}
      {awardingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Anugerahkan Badge</h3>
              <Button variant="ghost" size="sm" onClick={() => setAwardingBadge(null)}><X className="size-4" /></Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
              <img src={awardingBadge.iconUrl} alt="" className="size-12 object-contain shrink-0" />
              <div>
                <p className="font-bold text-sm">{awardingBadge.name}</p>
                <p className="text-xs text-muted-foreground">{awardingBadge.category}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Pilih Pengguna / Siswa</label>
              <select
                value={targetUserId}
                onChange={e => setTargetUserId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {state.users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAwardingBadge(null)}>Batal</Button>
              <Button onClick={handleAward}><Award className="size-4 mr-1.5" /> Berikan Badge</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
