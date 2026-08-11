import { useState } from "react";
import {
  Users2, TrendingUp, ClipboardCheck, AlertTriangle, CheckCircle2,
  MessageSquare, Eye, FileText, Download, ThumbsUp, UserX,
  BookOpen, Plus, Edit3, Send, Clock,
} from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { PageHeader, StatCard, EmptyState } from "./shared";
import { students, submissions, progressSeries } from "../data/mock";
import { cn } from "./ui/utils";
import { useStore } from "../store/Store";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const riskBadge = (risk: string) => {
  const map: Record<string, string> = { low: "bg-green-50 text-success", medium: "bg-amber-50 text-warning", high: "bg-red-50 text-destructive" };
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", map[risk])}>{risk === "high" ? "At risk" : risk === "medium" ? "Perhatian" : "Sehat"}</span>;
};

export function MentorDashboard() {
  const atRisk = students.filter((s) => s.risk !== "low");
  const perf = students.map((s) => ({ name: s.name.split(" ")[0], score: s.score }));
  return (
    <div>
      <PageHeader title="Dashboard Mentor" subtitle="Monitor dan dukung pelajar yang kamu bimbing" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pelajar aktif" value={String(students.length)} icon={<Users2 className="size-5" />} />
        <StatCard label="Rata-rata selesai" value={students.length ? Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length) + "%" : "0%"} icon={<TrendingUp className="size-5" />} tone="success" />
        <StatCard label="Review pending" value={String(submissions.filter((s) => s.status === "Pending").length)} icon={<ClipboardCheck className="size-5" />} tone="warning" />
        <StatCard label="Perlu perhatian" value={String(atRisk.length)} icon={<AlertTriangle className="size-5" />} tone="neutral" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Performa pelajar</CardTitle></CardHeader>
          <CardContent>
            {perf.length === 0 ? (
              <EmptyState icon={<Users2 className="size-6" />} title="Belum ada data pelajar" description="Data performa akan tampil setelah ada pelajar yang ditugaskan." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={perf}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Perlu perhatian</CardTitle></CardHeader>
          <CardContent>
            {atRisk.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="size-6" />} title="Semua pelajar oke!" description="Tidak ada pelajar yang berisiko saat ini." />
            ) : (
              <div className="space-y-3">
                {atRisk.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Avatar className="size-9"><AvatarFallback className="bg-accent text-primary">{s.name[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.progress}% · {s.course}</p></div>
                    {riskBadge(s.risk)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function StudentAnalytics() {
  return (
    <div>
      <PageHeader title="Analitik Pelajar" subtitle="Tren pembelajaran dan keterlibatan kohort" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tingkat keterlibatan" value={students.length ? "–" : "0%"} icon={<TrendingUp className="size-5" />} tone="success" />
        <StatCard label="Rata-rata skor kuis" value={students.length ? String(Math.round(students.reduce((a, s) => a + s.score, 0) / students.length)) : "0"} icon={<ClipboardCheck className="size-5" />} />
        <StatCard label="Tugas/minggu" value={String(submissions.length)} icon={<FileText className="size-5" />} tone="warning" />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Progress kohort dari waktu ke waktu</CardTitle></CardHeader>
        <CardContent>
          {progressSeries.length === 0 ? (
            <EmptyState icon={<TrendingUp className="size-6" />} title="Belum ada data analitik" description="Data akan muncul setelah pelajar mulai menyelesaikan modul." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={progressSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                <Tooltip />
                <Line type="monotone" dataKey="xp" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function StudentMonitoring() {
  return (
    <div>
      <PageHeader title="Monitoring Pelajar" subtitle="Lacak progress individu dan berikan mentoring" />
      {students.length === 0 ? (
        <EmptyState
          icon={<UserX className="size-7" />}
          title="Belum ada pelajar ditugaskan"
          description="Admin akan menugaskan pelajar ke akunmu. Coba lagi nanti."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelajar</TableHead><TableHead>Kursus</TableHead><TableHead>Progress</TableHead>
                <TableHead>Skor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><div className="flex items-center gap-2"><Avatar className="size-8"><AvatarFallback>{s.name[0]}</AvatarFallback></Avatar><span className="font-medium">{s.name}</span></div></TableCell>
                  <TableCell className="text-muted-foreground">{s.course}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={s.progress} className="h-1.5 w-24" /><span className="text-xs text-muted-foreground">{s.progress}%</span></div></TableCell>
                  <TableCell><span className="font-medium">{s.score}</span></TableCell>
                  <TableCell>{riskBadge(s.risk)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><MessageSquare className="size-4" /></Button>
                    <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
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

export function ReviewQueue({ kind = "assignment" }: { kind?: "assignment" | "project" }) {
  const isProject = kind === "project";
  const list = submissions.filter((s) => (isProject ? s.type === "Project" : s.type === "Assignment"));
  const [active, setActive] = useState(list[0]?.id);
  const item = list.find((s) => s.id === active) ?? list[0];

  return (
    <div>
      <PageHeader
        title={isProject ? "Review Project" : "Review Tugas"}
        subtitle={`${list.filter((s) => s.status === "Pending").length} submission menunggu review`}
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="size-7" />}
          title={isProject ? "Belum ada project dikumpulkan" : "Belum ada tugas dikumpulkan"}
          description="Submission dari pelajar akan muncul di sini untuk kamu review."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            {list.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={cn("w-full rounded-xl border p-3 text-left transition-colors", active === s.id ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/40")}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-secondary">{s.student}</span>
                  <Badge variant={s.status === "Pending" ? "default" : "secondary"}>{s.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.course} · {s.submitted}</p>
              </button>
            ))}
          </div>
          <Card className="lg:col-span-2 p-6">
            {item && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="size-11"><AvatarFallback className="bg-primary text-white">{item.student[0]}</AvatarFallback></Avatar>
                  <div><h3 className="text-secondary">{item.title}</h3><p className="text-sm text-muted-foreground">{item.student} · {item.course}</p></div>
                </div>
                <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm"><FileText className="size-4 text-primary" /> submission-final.zip <span className="ml-auto text-muted-foreground">–</span></div>
                  <Button variant="outline" size="sm" className="mt-3"><Download className="size-4" /> Download file</Button>
                </div>
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium">Skor (dari 100)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={100} defaultValue={0} className="flex-1 accent-[var(--primary)]" />
                    <span className="w-12 text-lg font-bold text-primary">0</span>
                  </div>
                </div>
                <div className="mt-4"><label className="mb-2 block text-sm font-medium">Feedback</label><Textarea rows={3} placeholder="Berikan feedback konstruktif…" /></div>
                <div className="mt-4 flex gap-3">
                  <Button><CheckCircle2 className="size-4" /> Setujui & nilai</Button>
                  <Button variant="outline"><ThumbsUp className="size-4" /> Minta revisi</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

import { CourseEditor } from "./CourseEditor";

/* ─── Mentor Course Management ──────────────────────────────────────────────── */

export function MentorCourseManagement() {
  const { state, actions } = useStore();
  const currentMentorName = `${state.profile.firstName} ${state.profile.lastName}`.trim() || 'Mentor';
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', subtitle: '', category: 'Programming', level: 'Beginner' as const,
    description: '', summary: '', language: 'Bahasa Indonesia',
  });

  if (editingCourseId) {
    return <CourseEditor courseId={editingCourseId} onBack={() => setEditingCourseId(null)} />;
  }
  
  // Filter courses belonging to this mentor
  const myCourses = state.courses.filter(
    c => c.mentorName?.toLowerCase() === currentMentorName.toLowerCase() ||
         c.mentorId?.toLowerCase() === currentMentorName.toLowerCase()
  );

  const handlePropose = () => {
    actions.addCourse({
      ...form,
      thumbnail: '',
      mentorId: currentMentorName,
      mentorName: currentMentorName,
      mentorBio: '',
      rating: 0,
      learners: 0,
      hours: 0,
      objectives: [],
      prerequisites: [],
      targetAudience: '',
      curriculum: [],
      price: 0,
      discountPercent: 0,
      status: 'draft',
      certificateEnabled: false,
      enrollmentLimit: 0,
      tags: [],
      mentorProposalStatus: 'pending_approval',
    });
    setShowNewForm(false);
    setForm({ title: '', subtitle: '', category: 'Programming', level: 'Beginner', description: '', summary: '', language: 'Bahasa Indonesia' });
  };

  const statusBadge = (status?: string) => {
    const map: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels: Record<string, string> = {
      draft: 'Draft', pending_approval: 'Menunggu Persetujuan', approved: 'Disetujui', rejected: 'Ditolak',
    };
    return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', map[status || 'draft'])}>{labels[status || 'draft']}</span>;
  };

  return (
    <div>
      <PageHeader title="Manajemen Kursus Saya" subtitle="Ajukan, edit, dan kelola kursus yang kamu buat" />
      
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="size-4 mr-1.5" /> Ajukan Kursus Baru
        </Button>
      </div>

      {showNewForm && (
        <Card className="mb-6 p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-base">Ajukan Kursus Baru</CardTitle></CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Judul Kursus</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Judul kursus" className="mt-1" /></div>
              <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder="Subtitle" className="mt-1" /></div>
              <div><Label>Kategori</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Kategori" className="mt-1" /></div>
              <div>
                <Label>Level</Label>
                <select value={form.level} onChange={e => setForm({...form, level: e.target.value as any})} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Capstone</option>
                </select>
              </div>
            </div>
            <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Deskripsi kursus" className="mt-1" /></div>
            <div className="flex gap-3">
              <Button onClick={handlePropose}><Send className="size-4 mr-1.5" /> Ajukan ke Admin</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {myCourses.length === 0 ? (
        <EmptyState icon={<BookOpen className="size-6" />} title="Belum ada kursus" description="Kamu belum memiliki kursus. Ajukan kursus baru untuk memulai." />
      ) : (
        <div className="space-y-3">
          {myCourses.map(course => (
            <Card key={course.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate">{course.title || 'Untitled'}</h3>
                    {statusBadge(course.mentorProposalStatus)}
                    {course.status === 'published' && <Badge variant="outline" className="text-green-600 border-green-300">Published</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{course.subtitle || course.description || 'Tidak ada deskripsi'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="size-3 inline mr-1" />
                    {course.curriculum?.length || 0} modul · {course.learners || 0} pelajar
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => setEditingCourseId(course.id)}>
                    <Edit3 className="size-3.5 mr-1" /> Edit
                  </Button>
                </div>
              </div>
              
              {editCourseId === course.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Judul</Label><Input defaultValue={course.title} onChange={e => actions.updateCourse({ id: course.id, title: e.target.value })} className="mt-1" /></div>
                    <div><Label className="text-xs">Subtitle</Label><Input defaultValue={course.subtitle} onChange={e => actions.updateCourse({ id: course.id, subtitle: e.target.value })} className="mt-1" /></div>
                  </div>
                  <div><Label className="text-xs">Deskripsi</Label><Textarea defaultValue={course.description} onChange={e => actions.updateCourse({ id: course.id, description: e.target.value })} rows={3} className="mt-1" /></div>
                  <Button size="sm" variant="outline" onClick={() => setEditCourseId(null)}>Selesai Edit</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

