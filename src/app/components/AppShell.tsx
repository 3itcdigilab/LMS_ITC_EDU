import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, FolderGit2, Users2,
  CalendarDays, Award, Briefcase, Settings, Search, Bell, Menu, X, LogOut,
  BarChart3, Building2, UserCog, ShieldCheck, Sparkles, MessageSquare, Wallet,
  Network, ChevronDown, FileCheck2, UserCircle2, ArrowLeft, Eye, Moon, Sun, UserRoundX,
  LayoutTemplate, CheckCheck, Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../store/Store";
import { Button } from "./ui/button";
import { toast } from "sonner";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("3itc-theme");
    if (saved) return saved === "dark";
    return true; // Default to dark mode
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("3itc-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark] as const;
}
import { Logo } from "./shared";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { roleLabels, type Role } from "../data/mock";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

export interface NavItem { key: string; label: string; icon: React.ComponentType<{ className?: string }> }

export const navConfig: Record<Role, { group: string; items: NavItem[] }[]> = {
  student: [
    { group: "Learn", items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "catalog", label: "Course Catalog", icon: BookOpen },
      { key: "learn", label: "My Learning", icon: GraduationCap },
      { key: "quiz", label: "Quizzes & Assessment", icon: ClipboardCheck },
      { key: "assignment", label: "Assignments", icon: FileCheck2 },
      { key: "project", label: "Projects", icon: FolderGit2 },
    ]},
    { group: "Community", items: [
      { key: "community", label: "Forum", icon: MessageSquare },
      { key: "events", label: "Events & Webinars", icon: CalendarDays },
    ]},
    { group: "Career", items: [
      { key: "portfolio", label: "Portfolio", icon: Briefcase },
      { key: "certificates", label: "Certificates", icon: Award },
      { key: "profile", label: "Profile & Settings", icon: Settings },
    ]},
  ],
  mentor: [
    { group: "Overview", items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "analytics", label: "Student Analytics", icon: BarChart3 },
      { key: "monitoring", label: "Student Monitoring", icon: Users2 },
    ]},
    { group: "Kursus", items: [
      { key: "mentor-courses", label: "Manajemen Kursus Saya", icon: BookOpen },
    ]},
    { group: "Review", items: [
      { key: "assignments", label: "Assignment Review", icon: ClipboardCheck },
      { key: "projects", label: "Project Review", icon: FolderGit2 },
    ]},
  ],
  admin: [
    { group: "Overview", items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "analytics", label: "Analytics", icon: BarChart3 },
    ]},
    { group: "Manage", items: [
      { key: "users", label: "User Management", icon: UserCog },
      { key: "institutions", label: "Institutions", icon: Building2 },
      { key: "courses", label: "Course Management", icon: BookOpen },
      { key: "assessments", label: "Assessments", icon: ClipboardCheck },
      { key: "certificates", label: "Certificates", icon: Award },
    ]},
    { group: "Ecosystem", items: [
      { key: "talent", label: "Talent Pool", icon: Sparkles },
      { key: "recruitment", label: "Recruitment", icon: Briefcase },
      { key: "badge-manage", label: "Manajemen Badge", icon: Award },
    ]},
    { group: "Content & Community", items: [
      { key: "events-manage", label: "Kelola Event & Webinar", icon: CalendarDays },
      { key: "forum-manage", label: "Moderasi Forum", icon: MessageSquare },
      { key: "projects-manage", label: "Kelola Portfolio Student", icon: FolderGit2 },
      { key: "landing-content", label: "Kelola Landing Page", icon: LayoutTemplate },
    ]},
  ],
  superadmin: [
    { group: "Ecosystem", items: [
      { key: "dashboard", label: "Global Dashboard", icon: LayoutDashboard },
      { key: "partners", label: "Partner Institutions", icon: Network },
      { key: "ecosystem", label: "Ecosystem Analytics", icon: BarChart3 },
    ]},
    { group: "Platform", items: [
      { key: "users", label: "Manajemen Akun", icon: UserCog },
      { key: "financial", label: "Financial Dashboard", icon: Wallet },
      { key: "settings", label: "System Settings", icon: ShieldCheck },
      { key: "events-manage", label: "Kelola Event & Webinar", icon: CalendarDays },
      { key: "forum-manage", label: "Moderasi Forum", icon: MessageSquare },
      { key: "projects-manage", label: "Kelola Portfolio Student", icon: FolderGit2 },
      { key: "landing-content", label: "Kelola Landing Page", icon: LayoutTemplate },
      { key: "badge-manage", label: "Manajemen Badge", icon: Award },
    ]},
  ],
};

function SidebarNav({ role, current, onNavigate }: { role: Role; current: string; onNavigate: (k: string) => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {navConfig[role].map((section) => (
        <div key={section.group} className="mb-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{section.group}</p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = current === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-sidebar-primary text-white font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}


export function AppShell({
  role, current, onNavigate, onLogout, onSwitchRole, onReturnToOriginal, originalRole, title, children,
}: {
  role: Role; current: string; onNavigate: (k: string) => void; onLogout: () => void;
  onSwitchRole: (r: Role) => void; onReturnToOriginal: () => void;
  originalRole: Role | null; title: string; children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [dark, setDark] = useDarkMode();
  const { isGuest } = useAuth();
  const { state, actions } = useStore();

  const userFullName = `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim();
  const defaultRoleTitle = role === "admin"
    ? "Admin 3ITC"
    : role === "mentor"
    ? "Mentor 3ITC"
    : role === "superadmin"
    ? "Super Admin"
    : "Siswa 3ITC";
  const displayName = userFullName || defaultRoleTitle;

  const userEmail = state.profile?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userPrimaryRole = originalRole || role;
  const canUseRoleSwitcher = !isGuest && (role === "admin" || role === "superadmin" || role === "mentor" || originalRole !== null);
  const isViewing = originalRole !== null;

  const availableRoles = (Object.keys(roleLabels) as Role[]).filter((r) => {
    if (userPrimaryRole === "mentor") {
      return r === "student" || r === "mentor";
    }
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased selection:bg-primary/20">
      {/* Sidebar — Desktop Sticky Full Height */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border lg:flex h-screen sticky top-0">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <Logo variant="light" />
        </div>
        <SidebarNav role={role} current={current} onNavigate={onNavigate} />
        {/* User Footer inside sidebar */}
        <div className="mt-auto border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-sidebar-accent/50 p-2 text-[13px]">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onNavigate("__profile__")}
              onKeyDown={(e) => e.key === "Enter" && onNavigate("__profile__")}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
            >
              <Avatar className="size-9 shrink-0 ring-1 ring-white/20">
                {state.profile?.avatarUrl ? (
                  <img src={state.profile.avatarUrl} alt={displayName} className="size-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-primary/30 text-blue-300 font-bold text-xs border border-blue-400/30">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-400">{roleLabels[role]}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="shrink-0 text-slate-400 hover:text-white transition-colors"
              aria-label="Keluar"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-sidebar">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <Logo variant="light" />
              <button onClick={() => setMobileOpen(false)} className="text-slate-400"><X className="size-5" /></button>
            </div>
            <SidebarNav role={role} current={current} onNavigate={(k) => { onNavigate(k); setMobileOpen(false); }} />
          </aside>
        </div>
      )}

      {/* Main Content Area — Scrollable */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses, projects, people…" className="pl-9 bg-input-background border-transparent" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Role Switcher Popover */}
            {canUseRoleSwitcher && (
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={cn(
                    "h-8 text-xs font-medium gap-1.5 border-dashed cursor-pointer",
                    originalRole && "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  <UserCog className="size-3.5 text-primary" />
                  <span>
                    Role: <strong className="text-foreground">{roleLabels[role]}</strong>
                    {originalRole && " (Preview)"}
                  </span>
                  <ChevronDown className="size-3 opacity-50" />
                </Button>

                {showRoleDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />

                    <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                      {originalRole && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onReturnToOriginal();
                              setShowRoleDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ArrowLeft className="size-3.5" /> Kembali ke {roleLabels[originalRole]}
                          </button>
                          <div className="my-1 h-px bg-border/60" />
                        </>
                      )}
                      <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Ganti Role / Preview:
                      </div>
                      {availableRoles.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setShowRoleDropdown(false);
                            if (r === originalRole) {
                              onReturnToOriginal();
                            } else {
                              onSwitchRole(r);
                            }
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                            r === role ? "font-bold text-primary bg-muted" : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <span>{roleLabels[r]}</span>
                          {r === role && <span className="text-[10px] text-primary font-bold">● Aktif</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <button onClick={() => setDark(!dark)}
              className="grid size-9 place-items-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle dark mode">
              {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </button>
            
            {/* Notifications Popover */}
            {(() => {
              const myNotifs = (state.userNotifications || []).filter(
                n => (n.targetUserKey || "").toLowerCase() === displayName.toLowerCase() ||
                     (userEmail && (n.targetUserKey || "").toLowerCase() === userEmail.toLowerCase()) ||
                     !n.targetUserKey || n.targetUserKey === "all"
              );
              const unreadCount = myNotifs.filter(n => !n.read).length;

              return (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative grid size-9 place-items-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Notifikasi"
                  >
                    <Bell className="size-4.5 text-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <>
                      {/* Backdrop overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />

                      <div className="absolute right-0 top-11 z-50 w-84 rounded-xl border border-border bg-card p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30 rounded-t-xl">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground">Notifikasi</p>
                            {unreadCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-bold">
                                {unreadCount} baru
                              </Badge>
                            )}
                          </div>
                          {myNotifs.length > 0 && (
                            <div className="flex items-center gap-3">
                              {unreadCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    actions.markAllNotificationsRead(displayName);
                                    toast.success("Semua notifikasi ditandai dibaca.");
                                  }}
                                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Tandai semua dibaca"
                                >
                                  <CheckCheck className="size-3.5" /> Tandai dibaca
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  actions.clearAllNotifications(displayName);
                                  toast.info("Semua notifikasi dibersihkan.");
                                }}
                                className="text-[11px] text-destructive hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                title="Hapus semua"
                              >
                                <Trash2 className="size-3.5" /> Hapus
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                          {myNotifs.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground">
                              Tidak ada notifikasi.
                            </div>
                          ) : (
                            myNotifs.map((n) => {
                              const req = (state.friendRequests || []).find(r => r.id === n.requestId);
                              const isPendingReq = n.type === "friend_request" && req?.status === "pending";

                              return (
                                <div key={n.id} className={cn("p-3.5 space-y-2 text-xs transition-colors hover:bg-muted/50 relative group", !n.read && "bg-primary/5 font-medium")}>
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-foreground pr-2">{n.title}</p>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[10px] text-muted-foreground">{n.createdAt}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          actions.deleteNotification(n.id);
                                          toast.success("Notifikasi dihapus.");
                                        }}
                                        className="p-1 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors rounded cursor-pointer"
                                        title="Hapus notifikasi"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground leading-relaxed">{n.message}</p>

                                  {isPendingReq && n.requestId ? (
                                    <div className="flex items-center gap-2 pt-1">
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          actions.acceptFriendRequest(n.requestId!, displayName);
                                          actions.markNotificationRead(n.id);
                                          toast.success(`Pertemanan dengan ${n.senderName || "pelajar"} diterima! 🎉`);
                                        }}
                                        className="h-7 text-xs px-3 bg-primary text-white font-semibold shadow-sm cursor-pointer active:scale-95"
                                      >
                                        Terima
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          actions.rejectFriendRequest(n.requestId!);
                                          actions.markNotificationRead(n.id);
                                          toast.info(`Permintaan pertemanan ditolak.`);
                                        }}
                                        className="h-7 text-xs px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer active:scale-95"
                                      >
                                        Tolak
                                      </Button>
                                    </div>
                                  ) : (
                                    !n.read && (
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            actions.markNotificationRead(n.id);
                                            toast.success("Notifikasi ditandai dibaca.");
                                          }}
                                          className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1 font-bold cursor-pointer"
                                        >
                                          <CheckCheck className="size-3.5" /> Tandai dibaca
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-lg hover:bg-muted px-1 py-1 transition-colors">
                  <Avatar className="size-8 ring-1 ring-primary/30">
                    {state.profile?.avatarUrl ? (
                      <img src={state.profile.avatarUrl} alt={displayName} className="size-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs border border-primary/30">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-secondary">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate("__profile__")}>
                  <UserCircle2 className="size-4" /> Profil saya
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onLogout}>
                  <LogOut className="size-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Banner tamu */}
          {isGuest && (
            <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2.5 lg:px-6">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <UserRoundX className="size-4 shrink-0" />
                <span>
                  Kamu masuk sebagai <strong>Tamu</strong> — fitur terbatas. Hubungi admin untuk membuat akun.
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800"
              >
                <LogOut className="size-3.5" />
                Keluar
              </button>
            </div>
          )}

          {/* Banner "viewing as student" — hanya muncul saat mentor switch ke student */}
          {isViewing && (
            <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 lg:px-6">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <Eye className="size-4 shrink-0" />
                <span>
                  Kamu sedang melihat tampilan sebagai <strong>Student</strong> —
                  mode ini hanya untuk preview.
                </span>
              </div>
              <button
                onClick={onReturnToOriginal}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-900"
              >
                <ArrowLeft className="size-3.5" />
                Kembali ke {originalRole ? roleLabels[originalRole] : "mode sebelumnya"}
              </button>
            </div>
          )}
          <div className={cn("mx-auto max-w-7xl p-4 lg:p-8", role === "student" && "pb-24 lg:pb-8")}>
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation — student only */}
        {role === "student" && (
          <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-border bg-card lg:hidden">
            {[
              { key: "dashboard",    label: "Home",      icon: LayoutDashboard },
              { key: "catalog",      label: "Kursus",    icon: BookOpen },
              { key: "learn",        label: "Belajar",   icon: GraduationCap },
              { key: "community",    label: "Komunitas", icon: MessageSquare },
              { key: "__profile__",  label: "Profil",    icon: UserCircle2 },
            ].map(item => {
              const active = current === item.key;
              return (
                <button key={item.key} onClick={() => onNavigate(item.key)}
                  className={cn("flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition-colors",
                    active ? "text-primary" : "text-muted-foreground")}>
                  <item.icon className={cn("size-5", active && "stroke-[2.5]")} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
