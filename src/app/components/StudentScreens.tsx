import { useState, useEffect } from "react";
import {
  Clock, Award, TrendingUp, Play, Star, Users, CheckCircle2, Lock,
  ChevronRight, Search, Filter, BookOpen, FileText, Video, Download, Upload,
  MessageSquare, Pin, CalendarDays, MapPin, ThumbsUp, ArrowLeft, ExternalLink,
  Plus, Trophy, GraduationCap, FolderOpen, ScrollText, Inbox, X, Sparkles, Check, Send, Pencil, Trash2,
  Share2, Heart, UserPlus, UserCheck, Image as ImageIcon, Briefcase, Building2, Repeat, Quote,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PageHeader, StatCard, LevelBadge, EmptyState, ConfirmDeleteModal } from "./shared";
import {
  categories, learningPath, skills, progressSeries, certificates,
  badges, portfolioProjects, quiz, forumThreads, events, unsplash,
} from "../data/mock";
import { useStore, getUserEnrollments, type Course, type Enrollment, type CourseModule, type AppFeedPost } from "../store/Store";
import { UserProfileModal, type UserProfileModalData } from "./UserProfileModal";
import { toast } from "sonner";
import { cn } from "./ui/utils";

/* ---------------- Dashboard ---------------- */
export function StudentDashboard({ onNavigate }: { onNavigate: (k: string) => void }) {
  const { state } = useStore();
  const active = state.courses.filter((c) => c.status === "published").slice(0, 3);
  const userName = `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "Siswa 3ITC";
  const userInitials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2);

  const currentUserKey = (state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();
  const userEnrollments = getUserEnrollments(state.enrollments, currentUserKey);

  const completedCoursesCount = userEnrollments.filter(e => e.progress === 100).length;
  const totalCertificates = Math.max(completedCoursesCount, (state.certificates || []).length);
  const activeLessonsCount = userEnrollments.reduce((acc, e) => acc + (e.completedLessons?.length || 0), 0);
  const dayStreak = activeLessonsCount > 0 ? Math.min(30, Math.max(1, Math.floor(activeLessonsCount / 2) + 1)) : 1;

  const enrolledCount = userEnrollments.length;
  const earnedBadgesCount = (state.profile?.earnedBadges || []).length;

  const totalHoursLearned = userEnrollments.reduce((acc, e) => {
    const c = (state.courses || []).find(x => x.id === e.courseId);
    if (!c) return acc;
    const courseHours = c.hours || 2;
    const progressRatio = (e.progress || 0) / 100;
    return acc + Math.round(courseHours * progressRatio * 10) / 10;
  }, 0);
  const hoursFormatted = `${totalHoursLearned > 0 ? totalHoursLearned : (enrolledCount > 0 ? 1 : 0)}h`;

  const enrolledCourses = userEnrollments
    .map(e => state.courses.find(c => c.id === e.courseId))
    .filter((c): c is Course => !!c);
  const activeToDisplay = enrolledCourses.length > 0 ? enrolledCourses.slice(0, 3) : active;

  // Dynamic Learning Path Progression
  const beginnerDone = userEnrollments.some(e => {
    const c = state.courses.find(x => x.id === e.courseId);
    return c?.level === "Beginner" && e.progress === 100;
  });
  const interDone = userEnrollments.some(e => {
    const c = state.courses.find(x => x.id === e.courseId);
    return c?.level === "Intermediate" && e.progress === 100;
  });
  const advDone = userEnrollments.some(e => {
    const c = state.courses.find(x => x.id === e.courseId);
    return c?.level === "Advanced" && e.progress === 100;
  });
  const capstoneDone = userEnrollments.some(e => {
    const c = state.courses.find(x => x.id === e.courseId);
    return c?.level === "Capstone" && e.progress === 100;
  });
  const certDone = totalCertificates > 0;

  const dynamicLearningPath = [
    {
      level: "Beginner",
      desc: "Fundamentals & core concepts",
      status: beginnerDone ? "done" : "current",
    },
    {
      level: "Intermediate",
      desc: "Applied skills & tools",
      status: interDone ? "done" : (beginnerDone ? "current" : "locked"),
    },
    {
      level: "Advanced",
      desc: "Specialization & depth",
      status: advDone ? "done" : (interDone ? "current" : "locked"),
    },
    {
      level: "Capstone Project",
      desc: "Real-world build",
      status: capstoneDone ? "done" : (advDone ? "current" : "locked"),
    },
    {
      level: "Certification",
      desc: "Verified credential",
      status: certDone ? "done" : (capstoneDone ? "current" : "locked"),
    },
  ];

  return (
    <div>
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white sm:p-8 border border-white/10 shadow-xl">
        {state.profile?.bannerUrl ? (
          <img src={state.profile.bannerUrl} alt="Banner" className="absolute inset-0 size-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        ) : (
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 size-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        )}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 border-2 border-white/20 shadow-md shrink-0 mt-1">
              {state.profile?.avatarUrl ? (
                <img src={state.profile.avatarUrl} alt={userName} className="size-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">{userInitials}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-blue-400">Selamat datang kembali 👋</p>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {userName}
              </h1>
              <p className="mt-1.5 max-w-lg text-sm text-slate-300 leading-relaxed">
                {state.profile?.headline || "Jelajahi kursus, selesaikan modul, dan raih sertifikat untuk membangun karier impianmu."}
              </p>
              <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md gap-2" onClick={() => onNavigate("catalog")}>
                <BookOpen className="size-4" /> Jelajahi kursus
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 rounded-xl bg-white/5 p-4 backdrop-blur border border-white/10 min-w-[180px]">
            <div className="text-center">
              <p className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1" style={{ fontFamily: "var(--font-display)" }}>
                🔥 {dayStreak}
              </p>
              <p className="text-xs text-slate-400 font-medium">Day streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {totalCertificates}
              </p>
              <p className="text-xs text-slate-400 font-medium">Sertifikat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Kursus diikuti" value={String(enrolledCount)} icon={<BookOpen className="size-5" />} />
        <StatCard label="Jam belajar" value={hoursFormatted} icon={<Clock className="size-5" />} tone="success" />
        <StatCard label="Badge diraih" value={String(earnedBadgesCount)} icon={<Award className="size-5" />} tone="neutral" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Lanjutkan belajar</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("catalog")}>
                Lihat semua <ChevronRight className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {activeToDisplay.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="size-6" />}
                  title="Belum ada kursus aktif"
                  description="Enroll kursus pertamamu dan mulai belajar sekarang."
                  action={<Button onClick={() => onNavigate("catalog")}>Jelajahi kursus</Button>}
                />
              ) : (
                <div className="space-y-4">
                  {activeToDisplay.map((c) => (
                    <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border p-3">
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {c.thumbnail
                          ? <img src={c.thumbnail} alt={c.title} className="size-full object-cover" />
                          : <div className="size-full grid place-items-center"><BookOpen className="size-6 text-muted-foreground/30" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><LevelBadge level={c.level} /><span className="text-xs text-muted-foreground">{c.category}</span></div>
                        <p className="mt-1 truncate font-medium text-secondary">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.mentorName}</p>
                      </div>
                      <Button size="sm" onClick={() => onNavigate("learn")}><Play className="size-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Progress XP mingguan</CardTitle></CardHeader>
            <CardContent>
              {progressSeries.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="size-6" />}
                  title="Belum ada data progress"
                  description="Selesaikan modul pertamamu untuk mulai melacak XP."
                />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={progressSeries}>
                    <defs>
                      <linearGradient id="grad-student-xp-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                    <Tooltip />
                    <Area type="monotone" dataKey="xp" stroke="#2563eb" strokeWidth={2.5} fill="url(#grad-student-xp-area)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Learning path</span>
                <span className="text-xs font-normal text-muted-foreground">Otomatis Terbuka</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {dynamicLearningPath.map((p, i) => (
                <div
                  key={p.level}
                  onClick={() => {
                    if (p.status !== "locked") {
                      onNavigate("catalog");
                    } else {
                      toast.info(`Selesaikan tahap ${dynamicLearningPath[i - 1]?.level || "sebelumnya"} untuk membuka level ini! 🔒`);
                    }
                  }}
                  className={cn(
                    "flex gap-3 group p-1.5 rounded-xl transition-colors cursor-pointer",
                    p.status !== "locked" ? "hover:bg-muted/60" : "opacity-75 cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <div className={cn("grid size-8 place-items-center rounded-full text-xs transition-all shadow-sm",
                      p.status === "done" ? "bg-emerald-600 text-white font-bold" : p.status === "current" ? "bg-primary text-white ring-4 ring-primary/20 animate-pulse font-bold" : "bg-muted text-muted-foreground/60 border border-border")}>
                      {p.status === "done" ? <CheckCircle2 className="size-4" /> : p.status === "current" ? <Sparkles className="size-3.5" /> : <Lock className="size-3.5" />}
                    </div>
                    {i < dynamicLearningPath.length - 1 && <div className="my-1 w-px flex-1 bg-border/80" />}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn("text-xs font-bold truncate",
                        p.status === "done" ? "text-emerald-600 dark:text-emerald-400" : p.status === "current" ? "text-primary" : "text-muted-foreground")}>
                        {p.level}
                      </p>
                      {p.status === "done" && <span className="text-[10px] text-emerald-600 font-semibold">✓ Selesai</span>}
                      {p.status === "current" && <span className="text-[10px] text-primary font-semibold">⚡ Aktif</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{p.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skill radar</CardTitle></CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="size-6" />}
                  title="Belum ada skill"
                  description="Selesaikan kursus untuk mendapatkan skill score."
                />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={skills}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" fontSize={10} />
                    <Radar dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Price display helpers ────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return `Rp ${price.toLocaleString("id-ID")}`;
}

function discountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}

function PriceDisplay({ price, discountPercent, size = "sm" }: { price: number; discountPercent: number; size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  if (price === 0) {
    return <span className={cn("font-bold text-success", isLg ? "text-3xl" : "text-sm")}>Gratis</span>;
  }
  if (discountPercent > 0) {
    const final = discountedPrice(price, discountPercent);
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn("text-muted-foreground line-through", isLg ? "text-base" : "text-xs")}>
          Rp {price.toLocaleString("id-ID")}
        </span>
        <span className={cn("font-bold text-primary", isLg ? "text-3xl" : "text-sm")}>
          Rp {final.toLocaleString("id-ID")}
        </span>
        <span className="rounded-full bg-red-100 dark:bg-red-950 px-1.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          -{discountPercent}%
        </span>
      </div>
    );
  }
  return (
    <span className={cn("font-bold text-secondary", isLg ? "text-3xl" : "text-sm")}>
      Rp {price.toLocaleString("id-ID")}
    </span>
  );
}

// ─── Sequential session unlock helper ────────────────────────────────────────
function isModuleUnlocked(moduleIdx: number, completedLessons: string[], curriculum: CourseModule[]): boolean {
  if (moduleIdx === 0) return true;
  const prev = curriculum[moduleIdx - 1];
  if (!prev) return true;
  return (prev.lessons ?? []).every(l => completedLessons.includes(l.id));
}

/* ---------------- Course Catalog + Detail ---------------- */
export function CourseCatalog({ onNavigate }: { onNavigate: (k: string) => void }) {
  const { state } = useStore();
  const [selected, setSelected] = useState<Course | null>(null);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

const hasCourseAccess = (course: Course, userProfile: any, userRole: string) => {
  if (['admin', 'superadmin', 'mentor'].includes(userRole)) return true;
  if (!course.allowedInstitutions || course.allowedInstitutions.length === 0) return true;
  const userInsts = [userProfile?.institution, ...(userProfile?.institutions || [])].filter(Boolean);
  return course.allowedInstitutions.some(inst => userInsts.includes(inst));
};

  // Hanya tampilkan kursus yang sudah dipublish oleh admin
  const published = state.courses.filter(c => c.status === "published");
  const list = published.filter(c => {
    const matchCat = cat === "All" || c.category === cat;
    const matchQ   = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.mentorName.toLowerCase().includes(search.toLowerCase());
    const matchAccess = hasCourseAccess(c, state.profile, state.userRole || "student");
    return matchCat && matchQ && matchAccess;
  });

  if (selected) return <CourseDetail course={selected} onBack={() => setSelected(null)} onNavigate={onNavigate} />;

  return (
    <div>
      <PageHeader title="Katalog Kursus"
        subtitle={`${published.length} kursus tersedia · Jelajahi dari berbagai kategori`}
        actions={<Button variant="outline"><Filter className="size-4" /> Filter</Button>} />

      <div className="relative mb-4 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kursus, skill, mentor…" className="pl-9" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...categories.map((c) => c.name)].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              cat === c ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:border-primary/40")}>
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-7" />}
          title={published.length === 0 ? "Belum ada kursus tersedia" : "Kursus tidak ditemukan"}
          description={published.length === 0
            ? "Admin belum mempublish kursus. Coba lagi nanti."
            : "Coba ubah kata kunci atau filter kategori."}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Card key={c.id} className="group cursor-pointer overflow-hidden pt-0 transition-shadow hover:shadow-lg" onClick={() => setSelected(c)}>
              <div className="relative h-40 overflow-hidden bg-muted">
                {c.thumbnail
                  ? <img src={c.thumbnail} alt={c.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                  : <div className="size-full grid place-items-center"><BookOpen className="size-10 text-muted-foreground/30" /></div>}
                <div className="absolute left-3 top-3"><LevelBadge level={c.level} /></div>
                <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  {(c.price ?? 0) === 0 ? "Gratis" : (c.discountPercent ?? 0) > 0 ? `Rp ${discountedPrice(c.price, c.discountPercent).toLocaleString("id-ID")}` : `Rp ${c.price.toLocaleString("id-ID")}`}
                </span>
              </div>
              <CardContent className="pt-1">
                <p className="text-xs text-primary">{c.category}</p>
                <h3 className="mt-1 line-clamp-2 text-secondary">{c.title}</h3>
                {c.subtitle && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.subtitle}</p>}
                <p className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-1 flex-wrap">
                  <span>{c.mentorName}</span>
                  <span>·</span>
                  <span className="text-primary font-semibold flex items-center gap-0.5"><Building2 className="size-3" />{c.providerInstitution || "3ITC Digital Education"}</span>
                </p>
                {c.courseBadgeId && (() => {
                  const badge = (state.badges || []).find(b => b.id === c.courseBadgeId);
                  if (!badge) return null;
                  return (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <img src={badge.iconUrl || badge.imageUrl} alt={badge.name} className="size-3.5 object-contain" />
                      <span>Award: {badge.name}</span>
                    </div>
                  );
                })()}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {c.rating > 0 && <span className="flex items-center gap-1 text-amber-500"><Star className="size-3.5 fill-amber-400" />{c.rating}</span>}
                  {c.learners > 0 && <span className="flex items-center gap-1"><Users className="size-3.5" />{c.learners.toLocaleString()}</span>}
                  {c.hours > 0 && <span className="flex items-center gap-1"><Clock className="size-3.5" />{c.hours}h</span>}
                  {c.curriculum?.length > 0 && <span>{c.curriculum.length} sesi</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonTypeIcon({ type }: { type: string }) {
  if (type === "video")      return <Video className="size-4" />;
  if (type === "quiz")       return <FileText className="size-4" />;
  if (type === "assignment") return <FileText className="size-4" />;
  return <BookOpen className="size-4" />;
}

function CourseDetail({ course, onBack, onNavigate }: { course: Course; onBack: () => void; onNavigate: (k: string) => void }) {
  const { state, actions } = useStore();
  const totalLessons = course.curriculum?.reduce((a, m) => a + (m.lessons?.length ?? 0), 0) ?? 0;
  
  const currentUserKey = (state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();
  const userEnrollments = getUserEnrollments(state.enrollments, currentUserKey);

  const isEnrolled = userEnrollments.some(e => e.courseId === course.id);
  const enrollment = userEnrollments.find(e => e.courseId === course.id);

  const handleEnroll = () => {
    actions.enrollCourse({ courseId: course.id, userKey: currentUserKey });
    toast.success(`Berhasil enroll "${course.title}"! Mulai belajar sekarang.`);
    onNavigate("learn");
  };
  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Kembali ke katalog
      </button>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Thumbnail */}
          <div className="h-56 w-full overflow-hidden rounded-2xl bg-muted">
            {course.thumbnail
              ? <img src={course.thumbnail} alt={course.title} className="size-full object-cover" />
              : <div className="size-full grid place-items-center"><BookOpen className="size-12 text-muted-foreground/20" /></div>}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <LevelBadge level={course.level} />
            <Badge variant="secondary">{course.category}</Badge>
            {course.language && <Badge variant="outline">{course.language}</Badge>}
          </div>
          <h1 className="mt-3 text-secondary" style={{ fontFamily: "var(--font-display)" }}>{course.title}</h1>
          {course.subtitle && <p className="mt-1 text-muted-foreground">{course.subtitle}</p>}
          <p className="mt-2 text-muted-foreground">{course.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {course.rating > 0 && <span className="flex items-center gap-1 text-amber-500"><Star className="size-4 fill-amber-400" />{course.rating}</span>}
            {course.learners > 0 && <span className="flex items-center gap-1"><Users className="size-4" />{course.learners.toLocaleString()} pelajar</span>}
            {course.hours > 0  && <span className="flex items-center gap-1"><Clock className="size-4" />{course.hours}j</span>}
            <span className="flex items-center gap-1"><BookOpen className="size-4" />{course.curriculum?.length ?? 0} sesi · {totalLessons} pelajaran</span>
          </div>

          {/* Objectives */}
          {course.objectives?.length > 0 && (
            <Card className="mt-5 p-4">
              <h3 className="font-semibold text-secondary mb-3">Yang akan kamu pelajari</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {course.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{o}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Tabs defaultValue="curriculum" className="mt-6">
            <TabsList>
              <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
              <TabsTrigger value="about">Tentang</TabsTrigger>
              <TabsTrigger value="reviews">Ulasan</TabsTrigger>
            </TabsList>
            <TabsContent value="curriculum" className="mt-4 space-y-3">
              {(course.curriculum?.length ?? 0) === 0 ? (
                <EmptyState icon={<BookOpen className="size-6" />} title="Kurikulum belum tersedia" description="Mentor sedang menyiapkan materi kursus." />
              ) : (course.curriculum ?? []).map((mod, mi) => (
                <Card key={mod.id} className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="font-medium text-secondary">{mi + 1}. {mod.title}</p>
                    <span className="text-xs text-muted-foreground">{mod.lessons.length} pelajaran</span>
                  </div>
                  <div className="divide-y divide-border">
                    {mod.lessons.map(l => (
                      <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        <div className="grid size-7 place-items-center rounded-md bg-muted text-muted-foreground">
                          <LessonTypeIcon type={l.type} />
                        </div>
                        <span className="flex-1">{l.title || "(belum diberi judul)"}</span>
                        {l.isFree && <Badge variant="secondary" className="text-xs">Gratis</Badge>}
                        {l.duration && <span className="text-xs text-muted-foreground">{l.duration}</span>}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="about" className="mt-4 space-y-4">
              {course.description && <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>}
              {course.prerequisites?.length > 0 && (
                <div>
                  <h4 className="font-medium text-secondary mb-2">Prasyarat</h4>
                  <ul className="space-y-1">
                    {course.prerequisites.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="mt-1.5 size-1.5 rounded-full bg-muted-foreground shrink-0" />{p}</li>)}
                  </ul>
                </div>
              )}
              {course.targetAudience && (
                <div><h4 className="font-medium text-secondary mb-2">Untuk siapa kursus ini</h4><p className="text-sm text-muted-foreground">{course.targetAudience}</p></div>
              )}
              {course.mentorBio && (
                <div><h4 className="font-medium text-secondary mb-2">Tentang mentor</h4><p className="text-sm text-muted-foreground">{course.mentorBio}</p></div>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              {(() => {
                const courseReviews = (state.reviews || []).filter(r => r.courseId === course.id);
                if (courseReviews.length === 0) {
                  return (
                    <EmptyState
                      icon={<MessageSquare className="size-6" />}
                      title="Belum ada ulasan"
                      description="Jadilah yang pertama memberikan ulasan setelah menyelesaikan kursus."
                    />
                  );
                }

                const avgRating = (courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length).toFixed(1);
                const starCounts = [5, 4, 3, 2, 1].map(star => ({
                  star,
                  count: courseReviews.filter(r => r.rating === star).length,
                  percent: Math.round((courseReviews.filter(r => r.rating === star).length / courseReviews.length) * 100),
                }));

                return (
                  <div className="space-y-6">
                    {/* Rating Summary Header */}
                    <Card className="p-6 bg-gradient-to-br from-card via-card to-amber-500/5 border-border">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="text-center sm:text-left shrink-0">
                          <div className="text-5xl font-black text-foreground">{avgRating}</div>
                          <div className="flex items-center justify-center sm:justify-start gap-1 my-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={cn("size-4 fill-current", s <= Math.round(Number(avgRating)) ? "text-amber-400" : "text-muted-foreground/30")} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{courseReviews.length} Ulasan Pelajar</p>
                        </div>

                        <div className="flex-1 w-full space-y-1.5 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                          {starCounts.map(({ star, count, percent }) => (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-12 text-muted-foreground font-medium flex items-center gap-1">
                                {star} <Star className="size-3 text-amber-400 fill-amber-400" />
                              </span>
                              <Progress value={percent} className="h-2 flex-1" />
                              <span className="w-8 text-right text-muted-foreground">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {courseReviews.map(r => (
                        <Card key={r.id} className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 ring-1 ring-primary/20">
                                {r.userAvatar ? (
                                  <img src={r.userAvatar} alt={r.userName} className="size-full object-cover" />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{r.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-semibold text-sm text-foreground">{r.userName}</p>
                                <p className="text-xs text-muted-foreground">{r.userRole || "Student"} · {r.createdAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={cn("size-3.5 fill-current", s <= r.rating ? "text-amber-400" : "text-muted-foreground/30")} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/90 bg-muted/30 p-3 rounded-xl border border-border/50">
                            "{r.comment}"
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-4 p-5">
            <PriceDisplay price={course.price ?? 0} discountPercent={course.discountPercent ?? 0} size="lg" />
            <p className="text-sm text-muted-foreground">Akses seumur hidup</p>
            {isEnrolled ? (
              <div className="mt-4 space-y-2">
                <div className="rounded-lg bg-green-50 dark:bg-green-950 px-3 py-2 text-center text-sm font-medium text-success">
                  ✓ Sudah terdaftar
                </div>
                {enrollment && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span><span>{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-1.5" />
                  </div>
                )}
                <Button className="w-full" onClick={() => onNavigate("learn")}>
                  <Play className="size-4" /> Lanjutkan belajar
                </Button>
              </div>
            ) : (
              <Button className="mt-4 w-full" size="lg" onClick={handleEnroll}>Enroll sekarang</Button>
            )}
            <Button variant="outline" className="mt-2 w-full">Tambah wishlist</Button>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Sesi", `${course.curriculum?.length ?? 0}`],
                ["Pelajaran", `${totalLessons}`],
                ["Durasi", `${course.hours}h`],
                ["Level", course.level],
                ["Bahasa", course.language || "–"],
                ["Sertifikat", course.certificateEnabled ? "Ya" : "Tidak"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Lesson Viewer ---------------- */
type ActiveLesson = { moduleIdx: number; lessonIdx: number };

function LessonViewer({
  course, enrollment, activeLesson, onSelectLesson, onComplete, onBack,
}: {
  course: Course;
  enrollment: Enrollment;
  activeLesson: ActiveLesson;
  onSelectLesson: (a: ActiveLesson) => void;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
}) {
  const { actions } = useStore();
  const curriculum = course.curriculum ?? [];
  const mod = curriculum[activeLesson.moduleIdx];
  const lesson = mod?.lessons?.[activeLesson.lessonIdx];
  const completedLessons = enrollment?.completedLessons ?? [];
  const quizAttempts = enrollment?.quizAttempts ?? {};
  const totalLessons = curriculum.reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
  const isCompleted = lesson ? completedLessons.includes(lesson.id) : false;
  const currentModuleUnlocked = isModuleUnlocked(activeLesson.moduleIdx, completedLessons, curriculum);

  // Quiz state — reset when lesson changes
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
  }, [lesson?.id]);

  // Navigate to prev/next lesson
  const allLessons: ActiveLesson[] = curriculum.flatMap((m, mi) =>
    (m.lessons ?? []).map((_, li) => ({ moduleIdx: mi, lessonIdx: li }))
  );
  const flatIdx = allLessons.findIndex(
    a => a.moduleIdx === activeLesson.moduleIdx && a.lessonIdx === activeLesson.lessonIdx
  );
  const prevLesson = flatIdx > 0 ? allLessons[flatIdx - 1] : null;
  const nextLesson = flatIdx < allLessons.length - 1 ? allLessons[flatIdx + 1] : null;

  const videoUrl = lesson?.videoUrl ?? "";
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const embedId = videoUrl.includes("v=") ? videoUrl.split("v=")[1]?.split("&")[0]
    : videoUrl.includes("youtu.be/") ? videoUrl.split("youtu.be/")[1]?.split("?")[0] : "";

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Kembali ke pembelajaran saya
      </button>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* ── Main content area ── */}
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <p className="mb-2 text-xs text-muted-foreground">
            {course.title} · Sesi {activeLesson.moduleIdx + 1}: {mod?.title}
          </p>

          {!lesson ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Pilih pelajaran dari daftar kurikulum.</p>
            </Card>
          ) : !currentModuleUnlocked ? (
            <Card className="p-8 text-center space-y-3">
              <Lock className="mx-auto size-12 text-muted-foreground/40" />
              <h3 className="text-secondary">Sesi ini terkunci</h3>
              <p className="text-muted-foreground text-sm">Selesaikan semua pelajaran di Sesi {activeLesson.moduleIdx} terlebih dahulu untuk membuka sesi ini.</p>
              {activeLesson.moduleIdx > 0 && (
                <Button variant="outline" onClick={() => onSelectLesson({ moduleIdx: activeLesson.moduleIdx - 1, lessonIdx: 0 })}>
                  Kembali ke Sesi {activeLesson.moduleIdx}
                </Button>
              )}
            </Card>
          ) : (
            <>
              {/* ── Video lesson ── */}
              {lesson.type === "video" && (
                <div className="space-y-4">
                  {videoUrl && isYoutube && embedId ? (
                    <div className="overflow-hidden rounded-2xl aspect-video bg-black">
                      <iframe className="size-full"
                        src={`https://www.youtube.com/embed/${embedId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title={lesson.title} />
                    </div>
                  ) : videoUrl ? (
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-secondary">
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-center text-white">
                          <Play className="mx-auto size-12 fill-white" />
                          <p className="mt-3 text-sm opacity-80">Link video tersimpan</p>
                          <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-2 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm hover:bg-white/30 transition-colors">
                            Buka video
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Video className="mx-auto size-12 opacity-30" />
                        <p className="mt-2 text-sm">Video belum tersedia</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Reading lesson ── */}
              {lesson.type === "reading" && (
                <Card className="p-6">
                  {lesson.content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {lesson.content.split("\n").map((line, i) => (
                        line.trim() === "" ? <br key={i} /> :
                        line.startsWith("## ") ? <h2 key={i} className="mt-4 mb-2 text-lg font-semibold text-secondary">{line.slice(3)}</h2> :
                        line.startsWith("# ") ? <h1 key={i} className="mt-4 mb-2 text-xl font-bold text-secondary">{line.slice(2)}</h1> :
                        <p key={i} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Konten bacaan belum tersedia.</p>
                  )}
                </Card>
              )}

              {/* ── Quiz lesson ── */}
              {lesson.type === "quiz" && (() => {
                const questions = lesson.questions ?? [];
                const kkm = lesson.kkm ?? 0;
                const maxAttempts = lesson.maxAttempts ?? 0;
                const attemptCount = quizAttempts[lesson.id] ?? 0;
                const attemptsExhausted = maxAttempts > 0 && attemptCount >= maxAttempts;

                const handleSubmitQuiz = () => {
                  actions.recordQuizAttempt(course.id, lesson.id);
                  const correct = questions.filter(q => quizAnswers[q.id] === q.correctId).length;
                  const scorePercent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
                  const passed = kkm === 0 || scorePercent >= kkm;
                  setQuizPassed(passed);
                  setQuizSubmitted(true);
                };

                const correctCount = questions.filter(q => quizAnswers[q.id] === q.correctId).length;
                const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

                return (
                  <Card className="p-6">
                    {questions.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Soal kuis belum tersedia.</p>
                    ) : quizSubmitted ? (
                      <div>
                        <div className="text-center">
                          {quizPassed ? (
                            <Trophy className="mx-auto size-12 text-amber-500" />
                          ) : (
                            <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 dark:bg-red-950">
                              <span className="text-2xl">✗</span>
                            </div>
                          )}
                          <h3 className={cn("mt-3", quizPassed ? "text-success" : "text-destructive")}>
                            {quizPassed ? "Kuis lulus!" : "Belum memenuhi KKM"}
                          </h3>
                          <p className="mt-1 text-muted-foreground">
                            Skor: <span className={cn("font-bold", quizPassed ? "text-success" : "text-destructive")}>{scorePercent}%</span>
                            {" "}({correctCount}/{questions.length} benar)
                            {kkm > 0 && <span className="text-xs ml-1 text-muted-foreground">· KKM: {kkm}%</span>}
                          </p>
                          {maxAttempts > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Percobaan: {attemptCount}/{maxAttempts}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 space-y-3">
                          {questions.map((q, qi) => {
                            const isCorrect = quizAnswers[q.id] === q.correctId;
                            const selected = q.options?.find(o => o.id === quizAnswers[q.id]);
                            const correct = q.options?.find(o => o.id === q.correctId);
                            return (
                              <div key={q.id} className={cn("rounded-xl border p-3", isCorrect ? "border-success bg-green-50 dark:bg-green-950/30" : "border-destructive/40 bg-red-50 dark:bg-red-950/30")}>
                                <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Jawabanmu: {selected?.text || "–"}</p>
                                {!isCorrect && <p className="text-xs text-success">Jawaban benar: {correct?.text}</p>}
                                {q.explanation && <p className="mt-1 text-xs text-muted-foreground italic">{q.explanation}</p>}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex justify-center gap-3">
                          {attemptsExhausted ? (
                            <p className="text-sm text-destructive font-medium">Batas percobaan tercapai ({maxAttempts}x)</p>
                          ) : (
                            <Button variant="outline" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false); }}>
                              Ulangi kuis
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="font-semibold text-secondary">Kuis: {lesson.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {kkm > 0 && <span className="rounded-full border border-border px-2 py-0.5">KKM: {kkm}%</span>}
                            {maxAttempts > 0 && <span className="rounded-full border border-border px-2 py-0.5">Percobaan: {attemptCount}/{maxAttempts}</span>}
                          </div>
                        </div>
                        {attemptsExhausted ? (
                          <div className="rounded-xl border border-destructive/40 bg-red-50 dark:bg-red-950/30 p-4 text-center text-sm text-destructive">
                            Batas percobaan telah tercapai ({maxAttempts}x). Kamu tidak bisa mencoba kuis ini lagi.
                          </div>
                        ) : (
                          <>
                            {questions.map((q, qi) => (
                              <div key={q.id}>
                                <p className="text-sm font-medium mb-2">{qi + 1}. {q.question}</p>
                                <div className="space-y-2">
                                  {(q.options ?? []).map(opt => (
                                    <button key={opt.id} type="button"
                                      onClick={() => setQuizAnswers(a => ({ ...a, [q.id]: opt.id }))}
                                      className={cn(
                                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                                        quizAnswers[q.id] === opt.id ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                                      )}>
                                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border text-xs",
                                        quizAnswers[q.id] === opt.id ? "border-primary bg-primary text-white" : "border-border")}>
                                        {String.fromCharCode(65 + (q.options?.indexOf(opt) ?? 0))}
                                      </span>
                                      {opt.text}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <Button
                              disabled={questions.some(q => !quizAnswers[q.id])}
                              onClick={handleSubmitQuiz}
                              className="w-full">
                              Submit kuis
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })()}

              {/* ── Assignment lesson ── */}
              {lesson.type === "assignment" && (
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold text-secondary">Tugas: {lesson.title}</h3>
                  {(lesson.essayQuestions ?? []).length === 0 ? (
                    <p className="text-muted-foreground text-sm">Soal tugas belum tersedia.</p>
                  ) : (
                    (lesson.essayQuestions ?? []).map((q, qi) => (
                      <div key={q.id} className="space-y-2">
                        <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                        <p className="text-xs text-muted-foreground">Skor maksimal: {q.maxScore}</p>
                        <textarea
                          className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                          rows={5}
                          placeholder="Tulis jawabanmu di sini..." />
                      </div>
                    ))
                  )}
                  {(lesson.essayQuestions ?? []).length > 0 && (
                    <Button className="w-full">Kumpulkan tugas</Button>
                  )}
                </Card>
              )}

              {/* ── Lesson title + progress bar ── */}
              <div className="mt-4">
                <h2 className="text-secondary">{lesson.title || "Pelajaran"}</h2>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress kursus</span>
                  <span>{enrollment?.progress ?? 0}% ({completedLessons.length}/{totalLessons} pelajaran)</span>
                </div>
                <Progress value={enrollment?.progress ?? 0} className="mt-1 h-2" />
              </div>

              {/* ── Complete + nav buttons ── */}
              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <Button
                  variant="outline"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && onSelectLesson(prevLesson)}>
                  ← Sebelumnya
                </Button>
                {!isCompleted ? (() => {
                  const kkm = lesson.type === "quiz" ? (lesson.kkm ?? 0) : 0;
                  const canComplete = lesson.type !== "quiz" || kkm === 0 || quizPassed;
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        onClick={() => onComplete(lesson.id)}
                        disabled={!canComplete}
                        className="bg-success hover:bg-success/90 disabled:opacity-40">
                        <CheckCircle2 className="size-4" /> Tandai selesai
                      </Button>
                      {!canComplete && (
                        <p className="text-[10px] text-muted-foreground">Lulus kuis (KKM {kkm}%) untuk menyelesaikan</p>
                      )}
                    </div>
                  );
                })() : (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-3 py-1.5 text-sm font-medium text-success">
                    <CheckCircle2 className="size-4" /> Selesai
                  </div>
                )}
                <Button
                  variant="outline"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && onSelectLesson(nextLesson)}>
                  Berikutnya →
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ── Curriculum sidebar ── */}
        <div className="w-full lg:w-72 shrink-0">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Kurikulum</CardTitle></CardHeader>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-border">
              {curriculum.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Kurikulum belum tersedia.</p>
              ) : curriculum.map((mod, mi) => {
                const modUnlocked = isModuleUnlocked(mi, completedLessons, curriculum);
                return (
                  <div key={mod.id}>
                    <div className={cn("px-4 py-2", modUnlocked ? "bg-muted/50" : "bg-muted/30")}>
                      <div className="flex items-center gap-1.5">
                        {!modUnlocked && <Lock className="size-3 text-muted-foreground/60" />}
                        <p className={cn("text-xs font-semibold uppercase tracking-wide", modUnlocked ? "text-muted-foreground" : "text-muted-foreground/60")}>
                          Sesi {mi + 1} · {mod.title}
                        </p>
                      </div>
                    </div>
                    {(mod.lessons ?? []).map((l, li) => {
                      const isActive = activeLesson.moduleIdx === mi && activeLesson.lessonIdx === li;
                      const isDone = completedLessons.includes(l.id);
                      return (
                        <button key={l.id} type="button"
                          onClick={() => onSelectLesson({ moduleIdx: mi, lessonIdx: li })}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
                            !modUnlocked ? "opacity-50 cursor-not-allowed" : isActive ? "bg-accent" : "hover:bg-muted"
                          )}>
                          <div className={cn("grid size-6 shrink-0 place-items-center rounded-md",
                            !modUnlocked ? "bg-muted/50 text-muted-foreground/50" :
                            isDone ? "bg-success text-white" : "bg-muted text-muted-foreground")}>
                            {!modUnlocked
                              ? <Lock className="size-3" />
                              : isDone
                              ? <CheckCircle2 className="size-3.5" />
                              : l.type === "video" ? <Video className="size-3.5" />
                              : l.type === "quiz" ? <FileText className="size-3.5" />
                              : l.type === "assignment" ? <ScrollText className="size-3.5" />
                              : <BookOpen className="size-3.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("truncate text-xs",
                              !modUnlocked ? "text-muted-foreground/50" :
                              isActive ? "font-medium text-primary" :
                              isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                              {l.title || `Pelajaran ${li + 1}`}
                            </p>
                            {l.duration && <p className="text-[10px] text-muted-foreground">{l.duration}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Course Completion Modal (Rating + Review + Share to Feeds) ---------------- */
function CourseCompletionModal({
  courseTitle,
  courseId,
  course,
  onClose,
  onNavigateToCertificates,
}: {
  courseTitle: string;
  courseId: string;
  course?: Course;
  onClose: () => void;
  onNavigateToCertificates: () => void;
}) {
  const { state, actions } = useStore();
  const targetCourse = course || (state.courses || []).find(c => c.id === courseId);
  const providerInst = targetCourse?.providerInstitution || "3ITC Digital Education";
  
  // Awarded badge logic
  const awardedBadge = (state.badges || []).find(b => b.id === targetCourse?.courseBadgeId);

  useEffect(() => {
    if (targetCourse?.courseBadgeId) {
      const userKey = state.profile?.id || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "current";
      actions.awardUserBadge(targetCourse.courseBadgeId, userKey);
    }
  }, [targetCourse?.courseBadgeId]);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);

  // Professional default caption (English)
  const defaultCaption = `I am thrilled to announce that I have successfully completed the course "${courseTitle}" provided by ${providerInst}! 🎓✨\n\nThank you for the valuable guidance and high-quality learning experience.`;
  const [feedCaption, setFeedCaption] = useState(defaultCaption);

  const handleSubmit = () => {
    const authorName = `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "Siswa 3ITC";

    // 1. Share to Feeds if checked
    if (shareToFeed) {
      const fullContent = `${feedCaption.trim()}\n\n⭐ Rating: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}${reviewText.trim() ? `\n💬 Ulasan: "${reviewText.trim()}"` : ""}`;
      actions.addFeedPost({
        authorId: state.profile?.id || "student-1",
        authorName,
        authorRole: "Student",
        content: fullContent,
      });
    }

    // 2. Save review to store and update course average rating
    if (rating > 0 && courseId) {
      actions.addCourseReview({
        courseId,
        userName: authorName,
        userAvatar: state.profile?.avatarUrl,
        userRole: "Student",
        rating,
        comment: reviewText.trim() || feedCaption.trim(),
      });
    }

    toast.success("Terima kasih! Rating, ulasan & postingan kelulusan berhasil dibagikan! 🎉");
    onClose();
  };

  const ratingLabels = ["", "Kurang", "Cukup", "Bagus", "Sangat Bagus", "Sempurna & Luar Biasa!"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-6 bg-card shadow-2xl border-border space-y-4 text-center relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative Top Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />
        
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </button>

        {/* Header Celebration Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-lg shadow-amber-400/20">
          <Trophy className="size-8" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap mb-1">
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2.5 py-0.5 font-semibold text-xs">
              🎓 KURSUS SELESAI
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
              <Building2 className="size-3 mr-1" /> {providerInst}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Selamat! Kamu Berhasil Lulus
          </h2>
          <p className="text-sm font-semibold text-primary mt-1 line-clamp-2">
            "{courseTitle}"
          </p>
        </div>

        {/* Awarded Badge Highlight (If any) */}
        {awardedBadge && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 flex items-center gap-3 text-left">
            <img src={awardedBadge.iconUrl || awardedBadge.imageUrl} alt={awardedBadge.name} className="size-12 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">🏆 BADGE KELULUSAN UNLOCKED!</p>
              <p className="text-sm font-bold text-foreground truncate">{awardedBadge.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{awardedBadge.description || "Badge otomatis ditambahkan ke profil Anda."}</p>
            </div>
          </div>
        )}

        {/* Rating & Review Section */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border text-left space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block text-center">
            Beri Rating & Ulasan Kursus Ini
          </label>

          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 h-4">
              {ratingLabels[hoverRating || rating]}
            </span>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={2}
            placeholder="Tulis ulasanmu tentang materi, mentor, atau pengalaman belajar..."
            className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />

          {/* Share to Feeds Checkbox */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="flex items-center gap-2.5 text-xs text-foreground font-medium cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                checked={shareToFeed}
                onChange={(e) => setShareToFeed(e.target.checked)}
                className="rounded accent-primary size-4"
              />
              <span className="flex items-center gap-1">
                <Share2 className="size-3.5 text-primary" /> Bagikan pengumuman kelulusan ke Feeds Komunitas
              </span>
            </label>

            {/* Editable Announcement Text Area */}
            {shareToFeed && (
              <div className="pl-6 space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground block">
                  Pesan Pengumuman Feeds (Dapat Diedit):
                </label>
                <textarea
                  value={feedCaption}
                  onChange={(e) => setFeedCaption(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-1">
          <Button className="w-full text-xs font-semibold" size="lg" onClick={handleSubmit}>
            <CheckCircle2 className="size-4 mr-1.5" /> Kirim Rating & Simpan
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- My Learning ---------------- */
export function MyLearning({ onNavigate }: { onNavigate?: (k: string) => void }) {
  const { state, actions } = useStore();
  const [selected, setSelected] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<ActiveLesson>({ moduleIdx: 0, lessonIdx: 0 });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedCourseTitle, setCompletedCourseTitle] = useState('');
  const [completedCourseId, setCompletedCourseId] = useState('');
  const [completedCourseObj, setCompletedCourseObj] = useState<Course | undefined>(undefined);

  const currentUserKey = (state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();
  const enrollments = getUserEnrollments(state.enrollments ?? [], currentUserKey);
  const enrolledCourses = enrollments
    .map(e => ({ enrollment: e, course: state.courses.find(c => c.id === e.courseId) }))
    .filter((x): x is { enrollment: typeof enrollments[0]; course: Course } => !!x.course);

  const handleOpenCourse = (course: Course) => {
    setSelected(course);
    setActiveLesson({ moduleIdx: 0, lessonIdx: 0 });
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!selected) return;
    const curriculum = selected.curriculum ?? [];
    const totalLessons = curriculum.reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
    actions.completeLesson(selected.id, lessonId, totalLessons, currentUserKey);
    toast.success("Pelajaran ditandai selesai!");
    
    const rawEnrollment = enrollments.find(e => e.courseId === selected.id);
    const currentCompleted = rawEnrollment?.completedLessons?.length || 0;
    if (currentCompleted + 1 >= totalLessons) {
      setCompletedCourseTitle(selected.title);
      setCompletedCourseId(selected.id);
      setCompletedCourseObj(selected);
      setShowCompletionModal(true);
    }
  };

  return (
    <div>
      {showCompletionModal && (
        <CourseCompletionModal
          courseTitle={completedCourseTitle}
          courseId={completedCourseId}
          course={completedCourseObj}
          onClose={() => setShowCompletionModal(false)}
          onNavigateToCertificates={() => {
            setShowCompletionModal(false);
            if (onNavigate) onNavigate("certificates");
            else window.location.href = "/certificates";
          }}
        />
      )}

      {selected ? (() => {
        const rawEnrollment = enrollments.find(e => e.courseId === selected.id);
        if (!rawEnrollment) return null;
        // Ensure completedLessons exists for older stored enrollments
        const enrollment: Enrollment = { ...rawEnrollment, completedLessons: rawEnrollment.completedLessons ?? [] };
        return (
          <LessonViewer
            course={selected}
            enrollment={enrollment}
            activeLesson={activeLesson}
            onSelectLesson={setActiveLesson}
            onComplete={handleCompleteLesson}
            onBack={() => setSelected(null)}
          />
        );
      })() : (
        <>
          <PageHeader title="Pembelajaran Saya"
            subtitle={enrolledCourses.length > 0 ? `${enrolledCourses.length} kursus diikuti` : "Kursus yang kamu ikuti"} />
          {enrolledCourses.length === 0 ? (
            <EmptyState icon={<GraduationCap className="size-7" />} title="Belum ada kursus diikuti"
              description="Jelajahi katalog kursus dan enroll untuk mulai belajar." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map(({ enrollment, course }) => (
                <Card key={course.id} className="group cursor-pointer overflow-hidden pt-0 hover:shadow-lg transition-shadow" onClick={() => handleOpenCourse(course)}>
                  <div className="relative h-36 overflow-hidden bg-muted">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt={course.title} className="size-full object-cover group-hover:scale-105 transition-transform" />
                      : <div className="size-full grid place-items-center"><BookOpen className="size-10 text-muted-foreground/30" /></div>}
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">{enrollment.progress}%</div>
                  </div>
                  <CardContent className="pt-2">
                    <LevelBadge level={course.level} />
                    <h3 className="mt-1 line-clamp-2 text-secondary">{course.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.mentorName} · <span className="text-primary font-medium">{course.providerInstitution || "3ITC Digital Education"}</span>
                    </p>
                    <div className="mt-3">
                      <Progress value={enrollment.progress} className="h-1.5" />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress {enrollment.progress}%</span>
                      {enrollment.progress === 100 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompletedCourseTitle(course.title);
                            setCompletedCourseId(course.id);
                            setCompletedCourseObj(course);
                            setShowCompletionModal(true);
                          }}
                          className="text-success font-medium hover:underline flex items-center gap-1"
                        >
                          ✓ Selesai · Rating
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Quiz ---------------- */
export function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (quiz.questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Kuis & Asesmen" subtitle="Uji pemahamanmu" />
        <EmptyState
          icon={<FileText className="size-7" />}
          title="Belum ada kuis tersedia"
          description="Kuis akan muncul setelah kamu mengikuti kursus dan menyelesaikan modul."
        />
      </div>
    );
  }

  const q = quiz.questions[current];
  const score = answers.filter((a, i) => a === quiz.questions[i].answer).length;

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success"><Trophy className="size-10" /></div>
        <h1 className="mt-6 text-secondary font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>Kuis selesai!</h1>
        <p className="mt-2 text-muted-foreground text-sm">Kamu mendapat skor {score} dari {quiz.questions.length}</p>
        <div className="mt-2 text-4xl font-bold text-primary">{Math.round((score / quiz.questions.length) * 100)}%</div>
        <Button className="mt-6" onClick={() => { setSubmitted(false); setCurrent(0); setAnswers([]); }}>Ulangi kuis</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={quiz.title} subtitle={`Pertanyaan ${current + 1} dari ${quiz.questions.length}`} />
      <Progress value={((current) / quiz.questions.length) * 100} className="mb-6 h-2" />
      <Card className="p-6">
        <h2 className="text-secondary font-semibold text-base">{q.q}</h2>
        <div className="mt-5 space-y-3">
          {q.options.map((opt, i) => {
            const sel = answers[current] === i;
            return (
              <button key={i} onClick={() => { const n = [...answers]; n[current] = i; setAnswers(n); }}
                className={cn("flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors text-xs",
                  sel ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border hover:border-primary/40 text-foreground")}>
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                  sel ? "border-primary bg-primary text-white" : "border-border")}>{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Sebelumnya</Button>
          {current < quiz.questions.length - 1 ? (
            <Button disabled={answers[current] === undefined} onClick={() => setCurrent(current + 1)}>Berikutnya</Button>
          ) : (
            <Button disabled={answers[current] === undefined} onClick={() => setSubmitted(true)}>Submit kuis</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Assignment / Project Submission ---------------- */
export function AssignmentSubmission({ kind = "assignment" }: { kind?: "assignment" | "project" }) {
  const isProject = kind === "project";
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isProject ? "Kumpulkan Project" : "Kumpulkan Tugas"}
        subtitle={isProject ? "Belum ada project yang perlu dikumpulkan" : "Belum ada tugas yang perlu dikumpulkan"}
      />
      <EmptyState
        icon={isProject ? <FolderOpen className="size-7" /> : <ScrollText className="size-7" />}
        title={isProject ? "Belum ada project aktif" : "Belum ada tugas aktif"}
        description={isProject
          ? "Project akan muncul setelah kamu menyelesaikan modul Advanced di kursusmu."
          : "Tugas akan muncul setelah kamu mengikuti kursus dan mentor menetapkan assignment."}
      />
    </div>
  );
}

/* ---------------- Community Forum & Social Feeds ---------------- */
export function CommunityForum() {
  const { state, actions } = useStore();
  const [activeTab, setActiveTab] = useState<"feeds" | "forum" | "discovery">("feeds");
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState("Semua");
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Feed Post state
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [feedImageData, setFeedImageData] = useState<string>('');
  const [feedImagePreview, setFeedImagePreview] = useState<string>('');
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [feedCommentInput, setFeedCommentInput] = useState("");
  
  const [editingPostId, setEditingPostId] = useState<string>('');
  const [editingPostContent, setEditingPostContent] = useState<string>('');

  const handleFeedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setFeedImageData(dataUrl);
      setFeedImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Repost modal state
  const [repostingFeed, setRepostingFeed] = useState<AppFeedPost | null>(null);
  const [repostCommentary, setRepostCommentary] = useState("");

  const handleConfirmRepost = () => {
    if (!repostingFeed) return;
    if (actions.repostFeedPost) {
      actions.repostFeedPost({
        postId: repostingFeed.id,
        authorId: state.profile?.id || "user-current",
        authorName: currentUserName,
        authorRole: currentUserRole,
        authorAvatar: state.profile?.avatarUrl,
        commentary: repostCommentary,
      });
    }
    toast.success("Postingan berhasil di-repost ke Feeds Komunitas! 🔁");
    setRepostingFeed(null);
    setRepostCommentary("");
  };

  // Discovery search
  const [searchUserQuery, setSearchUserQuery] = useState("");

  // Delete confirmation modal state
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Profile Pop-up Modal state
  const [viewingUserProfile, setViewingUserProfile] = useState<UserProfileModalData | null>(null);

  const currentUserName = `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "Siswa 3ITC";
  const currentUserRole = "student";

  const [repliesMap, setRepliesMap] = useState<Record<string, Array<{ id: string; authorName: string; body: string; createdAt: string }>>>({});

  const [title, setTitle] = useState("");
  const [threadCat, setThreadCat] = useState("Programming");
  const [body, setBody] = useState("");

  const currentFeeds = state.feedPosts || [];

  // Platform members list for Discovery tab — dynamically built from state.users, state.userProfilesMap, and state.profile
  const dynamicMembers = (state.users || []).map(u => {
    const key = (u?.name || "").toLowerCase();
    const saved = state.userProfilesMap?.[key];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      institution: saved?.institution || u.institution || "3ITC Digital Education",
      headline: saved?.headline || `${u.role} at ${u.institution || "3ITC Digital Education"}`,
      bio: saved?.bio || `Anggota aktif di platform 3ITC Digital Education.`,
      avatarUrl: saved?.avatarUrl,
      bannerUrl: saved?.bannerUrl,
      educations: saved?.educations,
      experiences: saved?.experiences,
      skills: saved?.skills || ["Digital Skills", "Collaboration", "Learning"],
    };
  });

  // Ensure current user profile is in the list if not already present
  if (currentUserName && !dynamicMembers.some(m => m.name.toLowerCase() === currentUserName.toLowerCase())) {
    dynamicMembers.unshift({
      id: "mem-current",
      name: currentUserName,
      email: `${currentUserName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: "student",
      institution: state.profile?.institution || "3ITC Digital Education",
      headline: state.profile?.headline || "Pelajar 3ITC Digital Education",
      bio: state.profile?.bio || "Anggota aktif 3ITC Digital Education.",
      avatarUrl: state.profile?.avatarUrl,
      bannerUrl: state.profile?.bannerUrl,
      educations: state.profile?.educations,
      experiences: state.profile?.experiences,
      skills: state.profile?.skills || ["React", "TypeScript", "Node.js"],
    });
  }

  const platformMembers = dynamicMembers
    .filter((v, i, a) => a.findIndex(t => (t.email === v.email || t.name === v.name)) === i)
    .filter(m => m.name.toLowerCase() !== currentUserName.toLowerCase());

  const filteredMembers = platformMembers.filter(m =>
    m.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    m.institution.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  const threads = state.forumThreads || [];
  const filteredThreads = category === "Semua"
    ? threads
    : threads.filter(t => t.category?.toLowerCase() === category.toLowerCase());

  const handleCreateFeedPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      toast.error("Isi postingan tidak boleh kosong!");
      return;
    }

    actions.addFeedPost({
      authorId: state.profile?.id || "user-current",
      authorName: currentUserName,
      authorRole: currentUserRole,
      content: postContent.trim(),
      imageUrl: postImage.trim() || feedImageData || undefined,
    });

    toast.success("Postingan berhasil dibagikan di Feeds!");
    setPostContent("");
    setPostImage("");
    setFeedImageData("");
    setFeedImagePreview("");
  };

  const handleAddFeedCommentSubmit = (postId: string) => {
    if (!feedCommentInput.trim()) return;
    actions.addFeedComment(postId, currentUserName, feedCommentInput.trim());
    setFeedCommentInput("");
    toast.success("Komentar berhasil dikirim!");
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error("Judul dan isi thread wajib diisi!");
      return;
    }

    actions.addForumThread({
      title,
      body,
      authorId: state.profile.id,
      authorName: currentUserName,
      category: threadCat,
      pinned: false,
    });

    toast.success("Thread diskusi berhasil dibuat!");
    setShowModal(false);
    setTitle("");
    setBody("");
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    const newReply = {
      id: `reply_${Date.now()}`,
      authorName: currentUserName,
      body: replyText.trim(),
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    const updatedReplies = [...(repliesMap[selectedThread.id] || []), newReply];
    const nextMap = { ...repliesMap, [selectedThread.id]: updatedReplies };
    setRepliesMap(nextMap);
    setReplyText("");
    toast.success("Balasan berhasil dikirim!");
    
    // Notifications and store actions
    if (actions.addForumReply) {
      actions.addForumReply(selectedThread.id, newReply);
    }
    if (actions.addNotification) {
      actions.addNotification({
        targetUserKey: (selectedThread.authorName || selectedThread.authorId || "").toLowerCase(),
        title: "Balasan Baru di Forum",
        message: `${currentUserName} membalas thread diskusi kamu.`,
        type: "forum_reply",
        read: false,
      });
    }
  };

  const handleDeleteReply = (replyId: string, authorName?: string) => {
    if (!selectedThread) return;
    const isOwner = authorName?.toLowerCase() === currentUserName.toLowerCase();
    const isAdmin = currentUserRole === "admin" || currentUserRole === "superadmin";

    if (!isOwner && !isAdmin) {
      toast.error("Kamu hanya dapat menghapus balasan milikmu sendiri!");
      return;
    }

    const updatedReplies = (repliesMap[selectedThread.id] || []).filter(r => r.id !== replyId);
    const nextMap = { ...repliesMap, [selectedThread.id]: updatedReplies };
    setRepliesMap(nextMap);
    toast.success("Balasan berhasil dihapus!");
  };

  const handleSaveEditReply = (replyId: string, authorName?: string) => {
    if (!selectedThread || !editText.trim()) return;
    const isOwner = authorName?.toLowerCase() === currentUserName.toLowerCase();

    if (!isOwner) {
      toast.error("Kamu hanya dapat mengedit balasan milikmu sendiri!");
      return;
    }

    const updatedReplies = (repliesMap[selectedThread.id] || []).map(r =>
      r.id === replyId ? { ...r, body: editText.trim() } : r
    );
    const nextMap = { ...repliesMap, [selectedThread.id]: updatedReplies };
    setRepliesMap(nextMap);
    setEditingReplyId(null);
    setEditText("");
    toast.success("Balasan berhasil diperbarui!");
  };

  const openProfileByName = (name: string, role?: string, email?: string) => {
    const key = name.toLowerCase();
    const savedProf = state.userProfilesMap?.[key];
    const isCurrent = key === currentUserName.toLowerCase();
    const activeProf = isCurrent ? state.profile : null;

    const foundMember = dynamicMembers.find(m => m.name.toLowerCase() === key);

    const mergedName = name;
    const mergedEmail = email || foundMember?.email || (isCurrent ? `${currentUserName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : `${key.replace(/\s+/g, '')}@3itcedu.id`);
    const mergedRole = role || foundMember?.role || "student";
    const mergedInstitution = activeProf?.institution || savedProf?.institution || foundMember?.institution || "3ITC Digital Education";
    const mergedHeadline = activeProf?.headline || savedProf?.headline || foundMember?.headline || `${mergedRole} at ${mergedInstitution}`;
    const mergedBio = activeProf?.bio || savedProf?.bio || foundMember?.bio || `Anggota aktif di platform 3ITC Digital Education.`;
    const mergedAvatarUrl = activeProf?.avatarUrl || savedProf?.avatarUrl || foundMember?.avatarUrl;
    const mergedBannerUrl = activeProf?.bannerUrl || savedProf?.bannerUrl || foundMember?.bannerUrl;
    const mergedEducations = activeProf?.educations || savedProf?.educations || foundMember?.educations;
    const mergedExperiences = activeProf?.experiences || savedProf?.experiences || foundMember?.experiences;
    const mergedSkills = activeProf?.skills || savedProf?.skills || foundMember?.skills;

    setViewingUserProfile({
      name: mergedName,
      email: mergedEmail,
      role: mergedRole,
      institution: mergedInstitution,
      headline: mergedHeadline,
      bio: mergedBio,
      avatarUrl: mergedAvatarUrl,
      bannerUrl: mergedBannerUrl,
      educations: mergedEducations,
      experiences: mergedExperiences,
      skills: mergedSkills,
    });
  };

  return (
    <div>
      <PageHeader
        title="Komunitas & Feeds"
        subtitle="Berbagi aktivitas, berdiskusi, dan terhubung dengan sesama pelajar & mentor"
        actions={
          activeTab === "forum" ? (
            <Button onClick={() => setShowModal(true)}><Plus className="size-4" /> Buat thread</Button>
          ) : undefined
        }
      />

      {/* Main Tabs Navigation */}
      <div className="flex gap-2 border-b mb-6 pb-2">
        <button
          onClick={() => setActiveTab("feeds")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
            activeTab === "feeds" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Sparkles className="size-4" /> Feeds Aktivitas
        </button>
        <button
          onClick={() => setActiveTab("forum")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
            activeTab === "forum" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <MessageSquare className="size-4" /> Forum Diskusi Q&A
        </button>
        <button
          onClick={() => setActiveTab("discovery")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
            activeTab === "discovery" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Users className="size-4" /> Cari Teman (Discovery)
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
            activeTab === "friends" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <UserCheck className="size-4" /> Teman Saya ({
            dynamicMembers
              .filter(m => (state.friendConnections || []).includes(m.email || m.name))
              .filter(m => m.name.toLowerCase() !== currentUserName.toLowerCase()).length
          })
        </button>
      </div>

      {/* ── TAB 1: FEEDS (LINKEDIN STYLE) ── */}
      {activeTab === "feeds" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Box */}
            <Card className="p-4 bg-card border shadow-sm space-y-3">
              <div className="flex gap-3">
                <Avatar
                  className="size-10 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                  onClick={() => openProfileByName(currentUserName, "student")}
                >
                  <AvatarFallback className="bg-primary text-white font-bold">{currentUserName[0]}</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Bagikan pemikiran, project, atau pencapaian belajar kamu hari ini..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={3}
                  className="flex-1 text-sm resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary">
                      <ImageIcon className="size-4 text-primary" />
                      <span>Upload Gambar / File Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFeedFileUpload} />
                    </label>
                    {feedImagePreview && (
                      <div className="relative ml-2">
                        <img src={feedImagePreview} alt="preview" className="h-8 rounded-lg object-cover" />
                        <button onClick={() => { setFeedImageData(''); setFeedImagePreview(''); }} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full size-4 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    )}
                  </div>
                  <Button size="sm" onClick={handleCreateFeedPost} className="gap-1.5 font-semibold">
                    <Send className="size-3.5" /> Posting
                  </Button>
              </div>
            </Card>

            {/* Feeds List */}
            <div className="space-y-4">
              {currentFeeds.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="size-7" />}
                  title="Belum ada postingan feed"
                  description="Jadilah yang pertama membagikan pemikiran atau karya kamu di komunitas."
                />
              ) : (
                currentFeeds.map((feed) => {
                const isLiked = (feed.likedBy || []).includes(currentUserName);
                const commentsList = feed.comments || [];
                const isCommentOpen = openCommentPostId === feed.id;

                return (
                  <Card key={feed.id} className="p-5 bg-card border shadow-sm space-y-4">
                    {/* Repost Header Banner */}
                    {feed.originalPost && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pb-2 border-b border-border/40">
                        <Repeat className="size-3.5" />
                        <span>{feed.authorName} meng-repost postingan ini</span>
                      </div>
                    )}

                    {/* Author Bar */}
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="size-10 cursor-pointer hover:opacity-80 transition-opacity shrink-0 ring-2 ring-primary/20"
                        onClick={() => openProfileByName(feed.authorName, feed.authorRole)}
                      >
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{feed.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => openProfileByName(feed.authorName, feed.authorRole)}
                            className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {feed.authorName}
                          </h4>
                          <Badge variant="secondary" className="capitalize text-[10px] py-0 px-1.5 shrink-0">
                            {feed.authorRole}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{feed.createdAt}</p>
                      </div>
                      {(feed.authorName === currentUserName || currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { setEditingPostId(feed.id); setEditingPostContent(feed.content); }} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="size-3.5" />
                          </button>
                          <button onClick={() => setDeletingPostId(feed.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    {editingPostId === feed.id ? (
                      <div className="space-y-2 mt-2">
                        <Textarea value={editingPostContent} onChange={e => setEditingPostContent(e.target.value)} rows={3} className="text-sm" />
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="outline" onClick={() => setEditingPostId('')}>Batal</Button>
                           <Button size="sm" onClick={() => { 
                             if(actions.editFeedPost) actions.editFeedPost(feed.id, editingPostContent);
                             setEditingPostId('');
                             toast.success("Feed berhasil diubah");
                           }}>Simpan</Button>
                        </div>
                      </div>
                    ) : (
                      feed.content && <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{feed.content}</p>
                    )}

                    {/* Image Attachment (For direct posts) */}
                    {feed.imageUrl && !feed.originalPost && (
                      <div className="overflow-hidden rounded-xl border border-border/50 max-h-96">
                        <img src={feed.imageUrl} alt="Post Attachment" className="w-full object-cover max-h-96" />
                      </div>
                    )}

                    {/* Embedded Original Post (For Reposts) */}
                    {feed.originalPost && (
                      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            className="size-8 cursor-pointer hover:opacity-80 transition-opacity shrink-0 ring-1 ring-primary/20"
                            onClick={() => openProfileByName(feed.originalPost!.authorName, feed.originalPost!.authorRole)}
                          >
                            {feed.originalPost.authorAvatar ? (
                              <img src={feed.originalPost.authorAvatar} alt={feed.originalPost.authorName} className="size-full object-cover" />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{feed.originalPost.authorName[0]}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-bold text-xs text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                                onClick={() => openProfileByName(feed.originalPost!.authorName, feed.originalPost!.authorRole)}
                              >
                                {feed.originalPost.authorName}
                              </span>
                              <Badge variant="secondary" className="capitalize text-[9px] py-0 px-1 shrink-0">{feed.originalPost.authorRole}</Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{feed.originalPost.createdAt}</span>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">{feed.originalPost.content}</p>
                        {feed.originalPost.imageUrl && (
                          <div className="overflow-hidden rounded-lg border border-border/40 max-h-60 mt-2">
                            <img src={feed.originalPost.imageUrl} alt="Original Attachment" className="w-full object-cover max-h-60" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => actions.likeFeedPost(feed.id, currentUserName)}
                          className={cn(
                            "flex items-center gap-1.5 font-semibold transition-colors hover:text-red-500",
                            isLiked ? "text-red-500" : "text-muted-foreground"
                          )}
                        >
                          <Heart className={cn("size-4", isLiked && "fill-current")} />
                          <span>{feed.likes || 0} Menyukai</span>
                        </button>
                        <button
                          onClick={() => setOpenCommentPostId(isCommentOpen ? null : feed.id)}
                          className="flex items-center gap-1.5 font-semibold hover:text-primary transition-colors"
                        >
                          <MessageSquare className="size-4" />
                          <span>{commentsList.length} Komentar</span>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setRepostingFeed(feed);
                          setRepostCommentary("");
                        }}
                        className="flex items-center gap-1.5 font-semibold hover:text-emerald-500 transition-colors text-muted-foreground"
                      >
                        <Repeat className="size-4" />
                        <span>{feed.repostCount || 0} Repost</span>
                      </button>
                    </div>

                    {/* Comment Section Expandable */}
                    {isCommentOpen && (
                      <div className="space-y-3 pt-3 border-t bg-muted/20 p-3 rounded-xl">
                        <div className="space-y-2">
                          {commentsList.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-1">Belum ada komentar.</p>
                          ) : (
                            commentsList.map((c) => (
                              <div key={c.id} className="text-xs p-2 rounded-lg bg-card border border-border/50">
                                <span className="font-bold text-foreground">{c.authorName}: </span>
                                <span className="text-muted-foreground">{c.text}</span>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tulis komentar..."
                            value={feedCommentInput}
                            onChange={(e) => setFeedCommentInput(e.target.value)}
                            className="h-8 text-xs flex-1"
                          />
                          <Button size="sm" onClick={() => handleAddFeedCommentSubmit(feed.id)} className="h-8 text-xs">
                            Kirim
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h4 className="text-secondary font-bold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Pengumuman Komunitas
              </h4>
              <div className="mt-3">
                <EmptyState icon={<Inbox className="size-5" />} title="Belum ada pengumuman baru" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: FORUM DISKUSI Q&A ── */}
      {activeTab === "forum" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["Semua", "Programming", "AI", "Data Science", "UI/UX", "Karier"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1 text-sm font-medium transition-colors",
                    category === c ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {filteredThreads.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="size-7" />}
                title="Belum ada diskusi"
                description="Jadilah yang pertama memulai diskusi di komunitas."
                action={<Button onClick={() => setShowModal(true)}><Plus className="size-4" /> Buat thread pertama</Button>}
              />
            ) : (
              filteredThreads.map((t) => {
                const replyCount = (t.replies || 0) + (repliesMap[t.id]?.length || 0);
                const displayAuthor = t.authorName === "Pelajar" ? currentUserName : t.authorName;
                return (
                  <Card
                    key={t.id}
                    className="p-4 transition-all hover:shadow-md hover:border-primary/40 group"
                  >
                    <div className="flex gap-3">
                      <Avatar
                        className="size-10 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openProfileByName(displayAuthor)}
                      >
                        <AvatarFallback className="bg-accent text-primary font-bold">{displayAuthor[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {t.pinned && <Pin className="size-3.5 text-primary shrink-0" />}
                            <p
                              onClick={() => setSelectedThread(t)}
                              className="truncate font-semibold text-secondary group-hover:text-primary transition-colors cursor-pointer"
                            >
                              {t.title}
                            </p>
                          </div>
                          <span
                            onClick={() => setSelectedThread(t)}
                            className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            Buka <ChevronRight className="size-3" />
                          </span>
                        </div>
                        {t.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.body}</p>}
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          oleh{" "}
                          <span
                            onClick={() => openProfileByName(displayAuthor)}
                            className="font-medium text-foreground hover:underline cursor-pointer"
                          >
                            {displayAuthor}
                          </span>{" "}
                          · {t.createdAt}
                        </p>
                        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="secondary">{t.category}</Badge>
                          <span className="flex items-center gap-1 font-medium text-primary/90">
                            <MessageSquare className="size-3.5" />{replyCount} balasan
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h4 className="text-secondary font-bold">Pengumuman</h4>
              <div className="mt-3">
                <EmptyState icon={<Inbox className="size-5" />} title="Belum ada pengumuman" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 3: DISCOVERY (CARI TEMAN & MENTOR) ── */}
      {activeTab === "discovery" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama teman, mentor, atau institusi..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => {
              const targetName = member.name;
              const isFriend = (state.friendConnections || []).includes(targetName) || (state.friendConnections || []).includes(member.email || "");

              const pendingSent = (state.friendRequests || []).find(
                r => r.senderName.toLowerCase() === currentUserName.toLowerCase() &&
                     (r.receiverName.toLowerCase() === targetName.toLowerCase() || (member.email && r.receiverEmail === member.email)) &&
                     r.status === "pending"
              );

              const pendingReceived = (state.friendRequests || []).find(
                r => r.receiverName.toLowerCase() === currentUserName.toLowerCase() &&
                     (r.senderName.toLowerCase() === targetName.toLowerCase() || (member.email && r.senderEmail === member.email)) &&
                     r.status === "pending"
              );

              return (
                <Card key={member.id} className="p-5 bg-card border shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Avatar
                        className="size-14 cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-primary/20"
                        onClick={() => setViewingUserProfile(member)}
                      >
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} className="size-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{member.name[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {member.role}
                      </Badge>
                    </div>

                    <div>
                      <h4
                        onClick={() => setViewingUserProfile(member)}
                        className="font-extrabold text-foreground text-base hover:text-primary transition-colors cursor-pointer"
                      >
                        {member.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">{member.institution}</p>
                      <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{member.headline}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex gap-2">
                    <Button
                      variant={isFriend ? "outline" : pendingSent ? "secondary" : "default"}
                      size="sm"
                      onClick={() => {
                        if (isFriend) {
                          actions.removeFriend(currentUserName, targetName);
                          toast.info(`Koneksi pertemanan dengan ${targetName} dihapus.`);
                        } else if (pendingSent) {
                          actions.removeFriend(currentUserName, targetName);
                          toast.info(`Permintaan pertemanan ke ${targetName} dibatalkan.`);
                        } else if (pendingReceived) {
                          actions.acceptFriendRequest(pendingReceived.id, currentUserName);
                          toast.success(`Berhasil menerima pertemanan dari ${targetName}! 🎉`);
                        } else {
                          actions.sendFriendRequest({
                            senderName: currentUserName,
                            receiverName: targetName,
                            receiverEmail: member.email,
                          });
                          toast.success(`Permintaan pertemanan dikirim ke ${targetName}! 📩`);
                        }
                      }}
                      className="flex-1 gap-1.5 text-xs font-semibold"
                    >
                      {isFriend ? (
                        <>
                          <UserCheck className="size-3.5 text-emerald-500" /> Berteman ✓
                        </>
                      ) : pendingSent ? (
                        <>
                          <Clock className="size-3.5 text-amber-500 animate-pulse" /> Menunggu ⏳
                        </>
                      ) : pendingReceived ? (
                        <>
                          <UserCheck className="size-3.5 text-emerald-500" /> Terima
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-3.5" /> Tambah Teman
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingUserProfile(member)}
                      className="text-xs"
                    >
                      Profil
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: TEMAN SAYA ── */}
      {activeTab === "friends" && (
        <div className="space-y-6">
          {(() => {
            const friendsList = dynamicMembers
              .filter(m => (state.friendConnections || []).includes(m.email || m.name))
              .filter(m => m.name.toLowerCase() !== currentUserName.toLowerCase());

            return (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <UserCheck className="size-5 text-primary" /> Daftar Teman Terkoneksi ({friendsList.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">Teman-teman yang telah kamu tambahkan dari platform 3ITC.</p>
                </div>

                {friendsList.length === 0 ? (
                  <EmptyState
                    icon={<Users className="size-7" />}
                    title="Belum ada teman terkoneksi"
                    description="Jelajahi anggota di tab 'Cari Teman (Discovery)' untuk menemukan dan menambahkan teman baru."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {friendsList.map((friend) => (
                  <Card key={friend.id} className="p-5 bg-card border shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Avatar
                          className="size-14 cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-primary/20"
                          onClick={() => setViewingUserProfile(friend)}
                        >
                          {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt={friend.name} className="size-full object-cover rounded-full" />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{friend.name[0]}</AvatarFallback>
                          )}
                        </Avatar>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {friend.role}
                        </Badge>
                      </div>

                      <div>
                        <h4
                          onClick={() => setViewingUserProfile(friend)}
                          className="font-extrabold text-foreground text-base hover:text-primary transition-colors cursor-pointer"
                        >
                          {friend.name}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">{friend.institution}</p>
                        <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{friend.headline}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewingUserProfile(friend)}
                        className="flex-1 text-xs font-semibold"
                      >
                        Lihat Profil
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          actions.toggleFriend(friend.email || friend.name);
                          toast.info(`Koneksi dengan ${friend.name} dihapus.`);
                        }}
                        className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        Hapus
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        );
      })()}
    </div>
  )}

      {/* User Profile Pop-up Modal */}
      {viewingUserProfile && (
        <UserProfileModal
          user={viewingUserProfile}
          onClose={() => setViewingUserProfile(null)}
        />
      )}

      {/* Confirm Delete Feeds Post Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingPostId}
        title="Hapus Postingan Feeds"
        description="Apakah Anda yakin ingin menghapus postingan ini dari Komunitas 3ITC?"
        onConfirm={() => {
          if (deletingPostId && actions.deleteFeedPost) {
            actions.deleteFeedPost(deletingPostId);
            toast.success("Postingan berhasil dihapus.");
          }
        }}
        onClose={() => setDeletingPostId(null)}
      />

      {/* Modal Detail Thread & Conversation */}
      {selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl p-6 bg-card space-y-4 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{selectedThread.category}</Badge>
                  <span className="text-xs text-muted-foreground">oleh <strong className="text-foreground">{selectedThread.authorName === "Pelajar" ? currentUserName : selectedThread.authorName}</strong> · {selectedThread.createdAt}</span>
                </div>
                <h3 className="text-xl font-extrabold text-secondary">{selectedThread.title}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedThread(null); setEditingReplyId(null); }}><X className="size-4" /></Button>
            </div>

            {/* Scrollable Conversation Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Original Post */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selectedThread.body || "Tidak ada deskripsi tambahan."}</p>
              </div>

              {/* Replies List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Balasan ({(repliesMap[selectedThread.id]?.length || 0) + (selectedThread.replies || 0)})
                </h4>

                {(repliesMap[selectedThread.id] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center rounded-xl border border-dashed border-border/60">
                    Belum ada balasan. Jadilah yang pertama membalas thread ini!
                  </p>
                ) : (
                  (repliesMap[selectedThread.id] || []).map((r) => {
                    const isEditing = editingReplyId === r.id;
                    const rAuthor = r.authorName === "Pelajar" ? currentUserName : r.authorName;
                    const isMyReply = rAuthor.toLowerCase() === currentUserName.toLowerCase();
                    const canDelete = isMyReply || currentUserRole === "admin" || currentUserRole === "superadmin";

                    return (
                      <div key={r.id} className="flex gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60 group/reply">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{rAuthor[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-secondary">{rAuthor}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{r.createdAt}</span>
                              {/* Edit & Delete Action Buttons */}
                              {canDelete && (
                                <div className="flex items-center gap-1 opacity-90 group-hover/reply:opacity-100 transition-opacity">
                                  {isMyReply && !isEditing && (
                                    <button
                                      onClick={() => { setEditingReplyId(r.id); setEditText(r.body); }}
                                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                      title="Edit balasan"
                                    >
                                      <Pencil className="size-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReply(r.id, rAuthor)}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Hapus balasan"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingReplyId(null)}>
                                  Batal
                                </Button>
                                <Button size="sm" onClick={() => handleSaveEditReply(r.id)}>
                                  Simpan Edit
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{r.body}</p>
                              <div className="mt-1 flex items-center gap-3">
                                <button
                                  onClick={() => setReplyText(prev => prev ? `${prev} @${rAuthor} ` : `@${rAuthor} `)}
                                  className="text-xs text-primary hover:underline font-medium"
                                >
                                  Balas
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleAddReply} className="pt-3 border-t flex gap-2 shrink-0">
              <Input
                placeholder="Tulis balasan atau jawaban kamu..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="gap-1.5 shrink-0">
                <Send className="size-4" /> Balas
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Buat Thread */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Buat Thread Diskusi Baru</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="size-4" /></Button>
            </div>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Diskusi</label>
                <Input placeholder="cth: Cara terbaik memulai belajar Data Science di 2026?" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Kategori Topic</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={threadCat}
                  onChange={e => setThreadCat(e.target.value)}
                >
                  <option value="Programming">Programming</option>
                  <option value="AI">AI & Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UI/UX">UI/UX Design</option>
                  <option value="Karier">Karier & Tips</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Pertanyaan / Isi Diskusi</label>
                <Textarea rows={4} placeholder="Tuliskan pertanyaan atau informasi yang ingin kamu diskusikan..." value={body} onChange={e => setBody(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit">Terbitkan Thread</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Repost Feed */}
      {repostingFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg p-6 bg-card border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Repeat className="size-5 text-emerald-500" />
                <h3 className="font-bold text-lg text-foreground">Repost Postingan</h3>
              </div>
              <button onClick={() => setRepostingFeed(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Textarea
                placeholder="Tulis pemikiranmu tentang postingan ini... (Opsional)"
                value={repostCommentary}
                onChange={e => setRepostCommentary(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />

              {/* Original Post Preview Card */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-left">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {repostingFeed.authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-xs text-foreground">{repostingFeed.authorName}</p>
                    <p className="text-[10px] text-muted-foreground">{repostingFeed.createdAt}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-line">
                  {repostingFeed.content}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setRepostingFeed(null)}>Batal</Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5" onClick={handleConfirmRepost}>
                <Repeat className="size-4" /> Repost Sekarang
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Events ---------------- */
export function EventsPage() {
  const { state, actions } = useStore();
  const eventsList = state.events || [];

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const handleRegister = (evtId: string) => {
    if (registeredIds.includes(evtId)) return;
    actions.registerEvent(evtId);
    setRegisteredIds(prev => [...prev, evtId]);
    toast.success("Berhasil mendaftar event! Link webinar & reminder telah dikirim.");
  };

  return (
    <div>
      <PageHeader title="Event & Webinar" subtitle="Ikuti sesi live dan perluas jaringanmu" />
      {eventsList.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-7" />}
          title="Belum ada event terjadwal"
          description="Event dan webinar yang dibuat admin akan ditampilkan di sini. Pantau terus!"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {eventsList.map((e) => {
            const isRegistered = registeredIds.includes(e.id);
            return (
              <Card key={e.id} className="overflow-hidden pt-0 hover:shadow-lg transition-shadow flex flex-col justify-between">
                <div>
                  {e.imageUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                      <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary to-blue-700 text-white">
                      <div className="text-center">
                        <CalendarDays className="mx-auto size-7" />
                        <p className="mt-1 font-bold">{e.date}</p>
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{e.type || "Webinar"}</Badge>
                      <span className="text-xs font-semibold text-primary">{e.date}</span>
                    </div>
                    <h3 className="text-secondary font-bold text-base line-clamp-1">{e.title}</h3>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Clock className="size-4 text-primary" />{e.time || "19:00 WIB"}</p>
                      <p className="flex items-center gap-2"><Users className="size-4" />{e.speaker || "Praktisi Industri"}</p>
                      <p className="flex items-center gap-2"><MapPin className="size-4" />{e.registrations || 0} / {e.seats || 100} Pendaftar</p>
                    </div>
                  </CardContent>
                </div>
                <CardContent className="pt-0 pb-4">
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedEvent(e)}>
                      Detail Event
                    </Button>
                    <Button
                      disabled={isRegistered}
                      className={cn("flex-1", isRegistered && "bg-emerald-600 text-white opacity-100 hover:bg-emerald-600 cursor-default")}
                      onClick={() => handleRegister(e.id)}
                    >
                      {isRegistered ? "Terdaftar ✓" : "Daftar Sesi"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pop-up Detail Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 bg-card space-y-4 max-h-[90vh] overflow-y-auto">
            {selectedEvent.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{selectedEvent.type}</Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}><X className="size-4" /></Button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>{selectedEvent.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">Sesi Webinar & Workshop Eksklusif 3ITC Digital Education</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" /> Tanggal</span>
                <span className="font-semibold text-foreground">{selectedEvent.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="size-4 text-primary" /> Waktu</span>
                <span className="font-semibold text-foreground">{selectedEvent.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Users className="size-4 text-primary" /> Pembicara</span>
                <span className="font-semibold text-foreground">{selectedEvent.speaker}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Video className="size-4 text-primary" /> Kuota Pendaftar</span>
                <span className="font-semibold text-primary">{selectedEvent.registrations || 0} / {selectedEvent.seats || 100} Kursi</span>
              </div>
            </div>

            {selectedEvent.description && (
              <div className="pt-1">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Deskripsi Event</h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Conditional Thank You Note & Meeting Links (Revealed AFTER Registration) */}
            {registeredIds.includes(selectedEvent.id) ? (
              <div className="space-y-3 pt-2 border-t">
                {/* Custom Thank You Note */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Sparkles className="size-4" />
                    <span>Pesan untuk Peserta Terdaftar</span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-line">
                    {selectedEvent.thankYouMessage || "Terima kasih sudah mendaftar event ini! Silakan bergabung ke sesi live melalui link Zoom di bawah ini."}
                  </p>
                </div>

                {/* Meeting & Form Links */}
                {selectedEvent.meetingUrl && (
                  <a
                    href={selectedEvent.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-md"
                  >
                    <Video className="size-4" /> Buka Link Zoom / Google Meet
                    <ExternalLink className="size-3.5 ml-auto" />
                  </a>
                )}
                {selectedEvent.gformUrl && (
                  <a
                    href={selectedEvent.gformUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors shadow-md"
                  >
                    <FileText className="size-4" /> Isi Formulir Pendaftaran (GForm)
                    <ExternalLink className="size-3.5 ml-auto" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium pt-2">
                <Lock className="size-4 text-amber-600 shrink-0" />
                <span>Link Zoom / Google Meet & Akses Sesi akan terbuka secara otomatis setelah kamu mendaftar event ini.</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>Tutup</Button>
              <Button
                disabled={registeredIds.includes(selectedEvent.id)}
                className={cn(registeredIds.includes(selectedEvent.id) && "bg-emerald-600 text-white opacity-100 hover:bg-emerald-600 cursor-default")}
                onClick={() => {
                  handleRegister(selectedEvent.id);
                }}
              >
                {registeredIds.includes(selectedEvent.id) ? "Terdaftar ✓" : "Daftar Event Sekarang"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Portfolio ---------------- */
export function PortfolioPage() {
  const { state, actions } = useStore();
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("React, Tailwind, Node.js");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const projects = state.portfolioProjects || [];
  const profileName = `${state.profile.firstName || "Siswa"} ${state.profile.lastName || ""}`.trim() || "Nama Pelajar";

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Judul project wajib diisi!");
      return;
    }

    actions.addPortfolio({
      userId: state.profile.id,
      title,
      description: desc,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      image: "",
      liveUrl: liveUrl || "https://demo.app",
      repoUrl: repoUrl || "https://github.com",
    });

    toast.success("Portfolio project berhasil ditambahkan!");
    setShowModal(false);
    setTitle("");
    setDesc("");
    setLiveUrl("");
    setRepoUrl("");
  };

  return (
    <div>
      <PageHeader
        title="Portfolio Saya"
        subtitle="Tampilkan project dan skill ke rekruter"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("Profil publik aktif di talent pool!")}><ExternalLink className="size-4" /> Preview publik</Button>
            <Button onClick={() => setShowModal(true)}><Plus className="size-4" /> Tambah project</Button>
          </>
        }
      />

      <Card className="mb-6 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-secondary via-blue-900 to-primary" />
        <CardContent className="pt-0">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <Avatar className="size-20 border-4 border-card"><AvatarFallback className="bg-primary text-white text-xl font-bold">{profileName[0]}</AvatarFallback></Avatar>
            <div className="flex-1">
              <h2 className="text-secondary font-extrabold text-xl">{profileName}</h2>
              <p className="text-muted-foreground text-sm">{state.profile.headline || "Digital Talent & Developer"}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div><p className="text-xl font-bold text-secondary">{state.certificates?.length || 0}</p><p className="text-xs text-muted-foreground">Sertifikat</p></div>
              <div><p className="text-xl font-bold text-secondary">{projects.length}</p><p className="text-xs text-muted-foreground">Project</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="mb-3 text-secondary font-bold text-lg">Project Saya</h3>
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-7" />}
          title="Belum ada project"
          description="Selesaikan capstone project dari kursusmu atau tambahkan project mandiri ke portfolio."
          action={<Button onClick={() => setShowModal(true)}><Plus className="size-4" /> Tambah project pertama</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="overflow-hidden pt-0 transition-shadow hover:shadow-lg flex flex-col justify-between">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Capstone Project</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { actions.deletePortfolio(p.id); toast.success("Project dihapus!"); }}>
                    <X className="size-3.5 text-destructive" />
                  </Button>
                </div>
                <h3 className="text-secondary font-bold text-base">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags?.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
              </CardContent>
              <div className="p-4 border-t flex items-center justify-between text-xs bg-muted/20">
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline flex items-center gap-1"><ExternalLink className="size-3" /> Live Demo</a>}
                {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:underline flex items-center gap-1"><FolderOpen className="size-3" /> Source Code</a>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah Project */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Tambah Project Portfolio</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="size-4" /></Button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Project</label>
                <Input placeholder="cth: Aplikasi E-Commerce Toko Kita" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deskripsi Project</label>
                <Textarea rows={3} placeholder="Jelaskan fitur utama dan masalah yang diselesaikan..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tags Skill (pisahkan dengan koma)</label>
                <Input placeholder="React, TypeScript, Tailwind, Node.js" value={tags} onChange={e => setTags(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">URL Live Demo (opsional)</label>
                  <Input placeholder="https://myapp.vercel.app" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">URL GitHub Repo (opsional)</label>
                  <Input placeholder="https://github.com/user/repo" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit">Simpan Project</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Certificates ---------------- */
export function CertificatesPage() {
  return (
    <div>
      <PageHeader title="Sertifikat" subtitle="Repositori kredensial terverifikasi kamu" />
      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="size-7" />}
          title="Belum ada sertifikat"
          description="Selesaikan kursus hingga tahap Certification untuk mendapatkan sertifikat terverifikasi."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <Card key={c.id} className="overflow-hidden pt-0">
              <div className="relative flex h-40 flex-col justify-between bg-gradient-to-br from-secondary via-blue-900 to-primary p-5 text-white">
                <div className="flex items-center justify-between">
                  <GraduationCap className="size-7" />
                  <Award className="size-7 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Certificate of Completion</p>
                  <p className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>{c.title}</p>
                </div>
              </div>
              <CardContent>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Diterbitkan</span><span className="font-medium">{c.issued}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Credential ID</span><span className="font-medium">{c.credentialId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Skill</span><Badge variant="secondary">{c.skill}</Badge></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"><Download className="size-4" /> PDF</Button>
                  <Button size="sm" className="flex-1"><ExternalLink className="size-4" /> Bagikan</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Profile & Settings ---------------- */
export function ProfileSettings() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profil & Pengaturan" subtitle="Kelola akun dan preferensimu" />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="account">Akun</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16"><AvatarFallback className="bg-primary text-white text-lg">?</AvatarFallback></Avatar>
              <Button variant="outline">Ganti foto</Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-sm font-medium">Nama lengkap</label><Input placeholder="Nama kamu" /></div>
              <div><label className="mb-1.5 block text-sm font-medium">Headline</label><Input placeholder="Frontend Developer" /></div>
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium">Bio</label><Textarea rows={3} placeholder="Ceritakan tentang dirimu…" /></div>
            </div>
            <Button className="mt-4">Simpan perubahan</Button>
          </Card>
        </TabsContent>
        <TabsContent value="account" className="mt-4">
          <Card className="p-6 space-y-4">
            <div><label className="mb-1.5 block text-sm font-medium">Email</label><Input placeholder="email@sekolah.id" /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Institusi</label><Input placeholder="Nama sekolah/universitas" disabled /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Password baru</label><Input type="password" placeholder="••••••••" /></div>
            <Button>Perbarui akun</Button>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6 space-y-4">
            {["Pengingat kursus", "Tugas baru", "Balasan forum", "Rekomendasi karier"].map((n) => (
              <label key={n} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span>{n}</span>
                <input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
              </label>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
