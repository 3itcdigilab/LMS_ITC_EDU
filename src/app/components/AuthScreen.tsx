import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap, Award, Users, Briefcase, ArrowRight, Mail, Lock,
  ChevronLeft, ShieldCheck, User as UserIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Logo } from "./shared";
import { type Role } from "../data/mock";
import { useStore } from "../store/Store";

type Mode = "splash" | "login" | "forgot" | "admin-login";

const highlights = [
  { icon: GraduationCap, title: "Belajar", desc: "Video, modul, kuis & project" },
  { icon: Briefcase, title: "Bangun", desc: "Capstone project siap portfolio" },
  { icon: Award, title: "Sertifikasi", desc: "Kredensial skill terverifikasi" },
  { icon: Users, title: "Berkarier", desc: "Talent pool & pencocokan karier" },
];

/* Left brand panel */
function BrandPanel() {
  const navigate = useNavigate();
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white border-r border-slate-800">
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div
        className="relative z-10 cursor-pointer hover:opacity-90 transition-opacity inline-block w-fit"
        onClick={() => navigate('/')}
        title="Kembali ke Beranda"
      >
        <Logo variant="light" size="lg" />
      </div>
      <div className="relative z-10 max-w-md">
        <h1 className="text-white text-3xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          Bukan sekadar LMS — sebuah ekosistem belajar.
        </h1>
        <p className="mt-4 text-slate-300 text-sm leading-relaxed">
          Belajar, bangun project nyata, raih sertifikasi, dan direkomendasikan untuk pekerjaan. Semua dalam satu platform.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {highlights.map((h) => (
            <div key={h.title} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <h.icon className="size-5 text-blue-400" />
              <p className="mt-2 font-semibold text-white">{h.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-6 text-sm text-slate-400 font-medium">
        <span>120+ institusi</span>
        <span>·</span>
        <span>85k pelajar</span>
        <span>·</span>
        <span>1.200 kursus</span>
      </div>
    </div>
  );
}

export function AuthScreen({ onLogin, onGuest, initialMode = "login" }: { onLogin: (role: Role) => void; onGuest: () => void; initialMode?: Mode }) {
  const navigate = useNavigate();
  const { state, actions } = useStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const DEFAULT_ACCOUNTS: Record<string, { pass: string; role: Role; name: string; institution?: string }> = {
    "3itcdigilab@gmail.com": { pass: "gaadapasswordnya", role: "admin",      name: "Admin 3ITC",  institution: "3ITC Digital Education" },
    "mentor@3itcedu.id":     { pass: "mentorpass",       role: "mentor",     name: "Mentor 3ITC", institution: "3ITC Digital Education" },
    "student@3itcedu.id":    { pass: "studentpass",      role: "student",    name: "Siswa 3ITC",  institution: "3ITC Digital Education" },
    "superadmin@3itcedu.id": { pass: "superadminpass",   role: "superadmin", name: "Super Admin", institution: "3ITC Digital Education" },
  };

  const syncUserProfile = (fullName: string, inst?: string, roleStr?: string) => {
    actions.setActiveProfileByName(fullName, roleStr || "student", inst || "3ITC Digital Education");
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanInput = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput) {
      setErrorMsg("Silakan masukkan User / Email Anda.");
      return;
    }
    if (!cleanPass) {
      setErrorMsg("Silakan masukkan password Anda.");
      return;
    }

    // 1. First check default accounts (by email or username)
    const defaultAccKey = Object.keys(DEFAULT_ACCOUNTS).find(
      k => k.toLowerCase() === cleanInput || k.split('@')[0].toLowerCase() === cleanInput
    );
    if (defaultAccKey) {
      const acc = DEFAULT_ACCOUNTS[defaultAccKey];
      if (acc.pass === cleanPass) {
        syncUserProfile(acc.name, acc.institution, acc.role);
        onLogin(acc.role);
        return;
      } else {
        setErrorMsg("Password yang Anda masukkan salah. Silakan periksa kembali!");
        return;
      }
    }

    // 2. Check dynamic users in Store (by email or full name)
    const foundUser = state.users.find(
      u => (u?.email || "").toLowerCase() === cleanInput || (u?.name || "").toLowerCase() === cleanInput
    );

    if (!foundUser) {
      setErrorMsg("User / Email atau password salah. Akun tidak ditemukan!");
      return;
    }

    // Check user status
    if (foundUser.status === "Suspended") {
      setErrorMsg("Akun Anda sedang dinonaktifkan (Suspended). Hubungi Admin.");
      return;
    }

    // Check password if set, or accept default role pass
    if (foundUser.password) {
      if (foundUser.password !== cleanPass) {
        setErrorMsg("Password yang Anda masukkan salah. Silakan periksa kembali!");
        return;
      }
    }

    // Map role string to Role type
    const roleMap: Record<string, Role> = {
      "student": "student",
      "mentor": "mentor",
      "admin": "admin",
      "super admin": "superadmin",
      "superadmin": "superadmin",
    };
    const targetRole = roleMap[foundUser.role.toLowerCase()] || "student";

    // Sync logged in user name and profile
    syncUserProfile(foundUser.name, foundUser.institution, targetRole);
    onLogin(targetRole);
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string, targetRole: Role) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
    const acc = DEFAULT_ACCOUNTS[demoEmail];
    if (acc) {
      syncUserProfile(acc.name, acc.institution, acc.role);
    }
    onLogin(targetRole);
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <BrandPanel />

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate('/')} title="Kembali ke Beranda">
            <Logo size="lg" />
          </div>

          {/* ── Splash ── */}
          {mode === "splash" && (
            <div>
              <Logo size="lg" />
              <h2
                className="mt-8 text-secondary font-bold text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Selamat Datang di 3ITC
              </h2>
              <p className="mt-2 text-muted-foreground">
                Mulai perjalananmu dari belajar hingga karier.
              </p>
              <div className="mt-8 space-y-3">
                <Button className="w-full" size="lg" onClick={() => setMode("login")}>
                  Masuk Akun <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Unified Login ── */}
          {(mode === "login" || mode === "admin-login") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-secondary font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>
                  Masuk ke Akun
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Masukkan user/email dan password untuk masuk ke platform 3ITC.
              </p>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">User / Email</Label>
                  <div className="relative mt-1.5">
                    <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Email/Nama User"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => setMode("forgot")}
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Masuk Sekarang <ArrowRight className="size-4 ml-1" />
                </Button>
              </form>



              <div className="mt-6 text-center">
                <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Kembali ke Landing Page
                </a>
              </div>
            </div>
          )}

          {/* ── Forgot Password ── */}
          {mode === "forgot" && (
            <div>
              <button
                type="button"
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMode("login")}
              >
                <ChevronLeft className="size-4" /> Kembali ke halaman masuk
              </button>
              <h2 className="text-secondary" style={{ fontFamily: "var(--font-display)" }}>Reset password</h2>
              <p className="mt-1 text-muted-foreground">
                Masukkan emailmu dan kami akan kirimkan link reset.
              </p>
              <Card className="mt-6 p-6 space-y-4">
                <div>
                  <Label htmlFor="remail">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="remail" type="email" placeholder="3itcdigilab@gmail.com" className="pl-9" />
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => setMode("login")}>
                  Kirim link reset
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
