// Central mock data for 3ITC Digital Education

export type Role = "student" | "mentor" | "admin" | "superadmin";

export const roleLabels: Record<Role, string> = {
  student: "Student",
  mentor: "Mentor",
  admin: "Admin",
  superadmin: "Super Admin",
};

export const categories = [
  { name: "Programming", color: "#2563eb" },
  { name: "AI", color: "#8b5cf6" },
  { name: "Data Science", color: "#0ea5e9" },
  { name: "Cyber Security", color: "#dc2626" },
  { name: "Robotics", color: "#f59e0b" },
  { name: "IoT", color: "#14b8a6" },
  { name: "UI/UX", color: "#ec4899" },
  { name: "Software Engineering", color: "#16a34a" },
  { name: "Digital Business", color: "#6366f1" },
  { name: "General Skills", color: "#64748b" },
];

export type Level = "Beginner" | "Intermediate" | "Advanced" | "Capstone";

export interface Course {
  id: string;
  title: string;
  category: string;
  level: Level;
  mentor: string;
  rating: number;
  learners: number;
  hours: number;
  modules: number;
  progress?: number;
  price: string;
  image: string;
  summary: string;
  isFeatured?: boolean;
}

export const courses: Course[] = [];

export const learningPath = [
  { level: "Beginner", desc: "Fundamentals & core concepts", status: "locked" },
  { level: "Intermediate", desc: "Applied skills & tools", status: "locked" },
  { level: "Advanced", desc: "Specialization & depth", status: "locked" },
  { level: "Capstone Project", desc: "Real-world build", status: "locked" },
  { level: "Certification", desc: "Verified credential", status: "locked" },
];

export interface Skill {
  name: string;
  score: number;
}
export const skills: Skill[] = [];

export const progressSeries: { week: string; xp: number }[] = [];

export const certificates: { id: string; title: string; issued: string; credentialId: string; skill: string }[] = [];

export const badges: { name: string; icon: string }[] = [];

export const portfolioProjects: { id: string; title: string; tags: string[]; image: string; desc: string }[] = [];

export const quiz = {
  title: "No quiz available",
  questions: [] as { q: string; options: string[]; answer: number }[],
};

export const forumThreads: { id: string; title: string; author: string; replies: number; category: string; time: string; pinned?: boolean }[] = [];

export const events: { id: string; title: string; date: string; time: string; type: string; speaker: string; seats: number }[] = [];

export const students: { id: string; name: string; course: string; progress: number; score: number; status: string; risk: string; assignments: number }[] = [];

export const submissions: { id: string; student: string; title: string; course: string; submitted: string; status: string; type: string }[] = [];

export const adminUsers: { id: string; name: string; email: string; role: string; institution: string; status: string }[] = [];

export const talentPool: { id: string; name: string; headline: string; skillScore: number; topSkill: string; certs: number; matched: string; match: number }[] = [];

export const institutions: { id: string; name: string; type: string; students: number; teachers: number; plan: string; status: string; region: string }[] = [];

export const revenueSeries: { m: string; revenue: number; users: number }[] = [];

export const enrollmentByCategory: { name: string; value: number }[] = [];

export const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
