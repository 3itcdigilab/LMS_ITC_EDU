import { createBrowserRouter, Navigate, Outlet, useNavigate, useLocation, useRouteError } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { AuthScreen } from "./components/AuthScreen";
import { LandingPage } from "./components/LandingPage";
import { AppShell } from "./components/AppShell";
import { ProfilePage } from "./components/ProfilePage";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./context/AuthContext";

import {
  StudentDashboard, CourseCatalog, MyLearning, QuizPage,
  AssignmentSubmission, CommunityForum, EventsPage, PortfolioPage, CertificatesPage,
} from "./components/StudentScreens";
import {
  MentorDashboard, StudentAnalytics, StudentMonitoring, ReviewQueue, MentorCourseManagement,
} from "./components/MentorScreens";
import {
  AdminDashboard, UserManagement, InstitutionManagement, CourseManagement,
  AssessmentManagement, CertificateManagement, TalentPoolManagement,
  RecruitmentRecommendation, AnalyticsDashboard, LandingContentManager,
  EventManagement, ForumModeration, ProjectManagement, BadgeManagement,
} from "./components/AdminScreens";
import {
  GlobalDashboard, PartnerInstitutions, FinancialDashboard,
  EcosystemAnalytics, SystemSettings,
} from "./components/SuperAdminScreens";

/* ─── Landing (public) ─── */
function LandingRoot() {
  const { role } = useAuth();
  if (role) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <LandingPage />
      <Toaster />
    </>
  );
}

/* ─── Auth (login page) ─── */
function LoginRoot() {
  const { role, login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  if (role) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <AuthScreen
        onLogin={(r) => { login(r); navigate("/dashboard"); }}
        onGuest={() => { loginAsGuest(); navigate("/dashboard"); }}
      />
      <Toaster />
    </>
  );
}

/* ─── Protected shell layout ─── */
function ProtectedLayout() {
  const { role, originalRole, logout, switchRole, returnToOriginal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!role) return <Navigate to="/" replace />;

  const current = location.pathname.slice(1) || "dashboard";

  return (
    <>
      <AppShell
        role={role}
        current={current}
        originalRole={originalRole}
        onNavigate={(key) => navigate(key === "__profile__" ? "/profile" : `/${key}`)}
        onLogout={() => { logout(); navigate("/"); }}
        onSwitchRole={(r) => { switchRole(r); navigate("/dashboard"); }}
        onReturnToOriginal={() => { returnToOriginal(); navigate("/dashboard"); }}
        title=""
      >
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  );
}

/* ─── Route components ─── */

function RoleDashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  if (role === "student")    return <StudentDashboard onNavigate={(k) => navigate(`/${k}`)} />;
  if (role === "mentor")     return <MentorDashboard />;
  if (role === "admin")      return <AdminDashboard />;
  if (role === "superadmin") return <GlobalDashboard />;
  return <Navigate to="/" replace />;
}

function CatalogRoute() {
  const navigate = useNavigate();
  return <CourseCatalog onNavigate={(k) => navigate(`/${k}`)} />;
}

function AssignmentRoute() {
  return <AssignmentSubmission kind="assignment" />;
}

function ProjectRoute() {
  return <AssignmentSubmission kind="project" />;
}

function AssignmentReviewRoute() {
  return <ReviewQueue kind="assignment" />;
}

function ProjectReviewRoute() {
  return <ReviewQueue kind="project" />;
}

function ProfileRoute() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  if (!role) return <Navigate to="/" replace />;
  return <ProfilePage role={role} onLogout={() => { logout(); navigate("/"); }} />;
}

function AnalyticsRoute() {
  const { role } = useAuth();
  if (role === "mentor")                         return <StudentAnalytics />;
  if (role === "admin" || role === "superadmin") return <AnalyticsDashboard />;
  return <Navigate to="/dashboard" replace />;
}

function NotFound() {
  return (
    <div className="grid min-h-96 place-items-center text-center">
      <div>
        <p className="text-6xl font-bold text-muted-foreground/20" style={{ fontFamily: "var(--font-display)" }}>404</p>
        <p className="mt-3 text-xl font-semibold text-secondary">Halaman tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">URL yang kamu akses tidak tersedia.</p>
        <a href="/dashboard" className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          Kembali ke dashboard
        </a>
      </div>
    </div>
  );
}

function ErrorBoundaryFallback() {
  const error = useRouteError() as any;
  console.error("Route Error:", error);
  const errorMessage = error?.message || error?.statusText || (typeof error === "string" ? error : (error ? JSON.stringify(error) : ""));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <Card className="max-w-xl p-8 rounded-2xl border border-destructive/30 bg-card shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Terjadi Kendala Teknis</h2>
        {errorMessage && (
          <div className="text-xs text-destructive font-mono bg-destructive/5 p-3 rounded-lg text-left overflow-x-auto max-h-40 border border-destructive/20">
            {errorMessage}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Halaman yang kamu buka mengalami kendala. Kamu dapat kembali ke dashboard atau memuat ulang halaman.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <Button variant="outline" onClick={() => window.location.reload()}>Muat Ulang</Button>
          <Button onClick={() => window.location.href = "/dashboard"}>Ke Dashboard</Button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Router config ─── */
export const router = createBrowserRouter([
  // Public
  { path: "/",     Component: LandingRoot, ErrorBoundary: ErrorBoundaryFallback },
  { path: "/login", Component: LoginRoot, ErrorBoundary: ErrorBoundaryFallback },

  // Authenticated (all inside ProtectedLayout shell)
  {
    Component: ProtectedLayout,
    ErrorBoundary: ErrorBoundaryFallback,
    children: [
      { path: "dashboard",    Component: RoleDashboard },
      { path: "profile",      Component: ProfileRoute },

      // Student
      { path: "catalog",      Component: CatalogRoute },
      { path: "learn",        Component: MyLearning },
      { path: "quiz",         Component: QuizPage },
      { path: "assignment",   Component: AssignmentRoute },
      { path: "project",      Component: ProjectRoute },
      { path: "community",    Component: CommunityForum },
      { path: "events",       Component: EventsPage },
      { path: "portfolio",    Component: PortfolioPage },
      { path: "certificates", Component: CertificatesPage },

      // Mentor
      { path: "analytics",   Component: AnalyticsRoute },
      { path: "monitoring",  Component: StudentMonitoring },
      { path: "assignments", Component: AssignmentReviewRoute },
      { path: "projects",    Component: ProjectReviewRoute },
      { path: "mentor-courses", Component: MentorCourseManagement },

      // Admin
      { path: "users",        Component: UserManagement },
      { path: "institutions", Component: InstitutionManagement },
      { path: "courses",      Component: CourseManagement },
      { path: "assessments",  Component: AssessmentManagement },
      { path: "certificates", Component: CertificateManagement },
      { path: "talent",       Component: TalentPoolManagement },
      { path: "recruitment",  Component: RecruitmentRecommendation },
      { path: "landing-content", Component: LandingContentManager },
      { path: "events-manage",   Component: EventManagement },
      { path: "forum-manage",    Component: ForumModeration },
      { path: "projects-manage", Component: ProjectManagement },
      { path: "badge-manage",    Component: BadgeManagement },

      // Super Admin
      { path: "partners",  Component: PartnerInstitutions },
      { path: "ecosystem", Component: EcosystemAnalytics },
      { path: "financial", Component: FinancialDashboard },
      { path: "settings",  Component: SystemSettings },

      // Catch-all inside shell
      { path: "*", Component: NotFound },
    ],
  },
]);

