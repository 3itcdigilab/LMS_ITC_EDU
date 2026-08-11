/**
 * 3ITC Digital Education — Central Store
 * Context + useReducer → Firestore (primary DB) + localStorage (offline cache)
 */

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import { type Role } from "../data/mock";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDoc, getDocs } from "firebase/firestore";

// ─── Curriculum content types ─────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctId: string; // id of the correct QuizOption
  explanation: string;
}

export interface EssayQuestion {
  id: string;
  question: string;
  maxScore: number;
  rubric: string; // guidance for mentor when grading
}

export interface CourseLesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz" | "assignment";
  duration: string;
  isFree: boolean;
  // Video
  videoUrl: string;
  // Reading
  content: string;
  // Quiz
  questions: QuizQuestion[];
  kkm: number;        // minimum passing score 0–100, default 0 = no minimum
  maxAttempts: number; // 0 = unlimited
  // Assignment
  essayQuestions: EssayQuestion[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

// ─── Course Review ────────────────────────────────────────────────────────────

export interface CourseReview {
  id: string;
  courseId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  courseId: string;
  userKey?: string; // email or student full name (lowercase)
  enrolledAt: string;
  progress: number; // 0–100
  lastAccessedAt: string;
  completedLessons: string[]; // lesson IDs that student has completed
  quizAttempts: Record<string, number>; // lessonId → attempt count
}

export function getUserEnrollments(enrollments: Enrollment[] = [], userKey?: string): Enrollment[] {
  if (!userKey || !userKey.trim()) return enrollments || [];
  const key = userKey.trim().toLowerCase();
  return (enrollments || []).filter(e => {
    if (!e.userKey) return true; // fallback for legacy unkeyed mock enrollments
    return e.userKey.toLowerCase() === key;
  });
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Capstone";
  language: string;
  thumbnail: string;
  mentorId: string;
  mentorName: string;
  mentorBio: string;
  rating: number;
  learners: number;
  hours: number;
  summary: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  targetAudience: string;
  curriculum: CourseModule[];
  price: number;          // 0 = free
  discountPercent: number; // 0–100
  status: "draft" | "published" | "archived";
  certificateEnabled: boolean;
  enrollmentLimit: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  allowedInstitutions?: string[];  // restrict access to these institutions; empty = all
  mentorProposalStatus?: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  courseBadgeId?: string;          // badge awarded upon completion
  providerInstitution?: string;    // institution providing this course
}

// ─── Other entities ───────────────────────────────────────────────────────────

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  firstName: string; lastName: string; headline: string; bio: string;
  phone: string; city: string; dateOfBirth: string;
  institution: string; major: string; enrollYear: string; graduateYear: string;
  linkedin: string; github: string; portfolio: string; twitter: string;
  avatarUrl?: string;
  bannerUrl?: string;
  educations?: EducationItem[];
  experiences?: ExperienceItem[];
  openToWork: boolean; jobTypes: string[]; workModes: string[];
  industries: string[]; salaryRange: string; skills: string[];
  availableFrom: string; availabilityNote: string;
  publicProfile: boolean; showInTalentPool: boolean; showOnLeaderboard: boolean;
  showCertificates: boolean; showPortfolio: boolean;
  notifCourseReminder: boolean; notifNewAssignment: boolean; notifGradeReleased: boolean;
  notifCertIssued: boolean; notifForumReply: boolean; notifMentions: boolean;
  notifNewEvent: boolean; notifJobRec: boolean; notifTalentViewed: boolean;
  notifNewPartner: boolean; notif2fa: boolean; notifLoginAlert: boolean;
  earnedBadges?: string[];     // badge IDs the user has earned
  featuredBadgeId?: string;    // the one badge to display on profile
  xp?: number;                 // experience points
}

export interface AppFeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  imageData?: string;
  likes: number;
  likedBy: string[];
  comments: Array<{ id: string; authorName: string; text: string; createdAt: string; replyTo?: string; replyToAuthor?: string }>;
  createdAt: string;
  repostCount?: number;
  repostedBy?: string[];
  originalPost?: {
    id: string;
    authorName: string;
    authorRole: string;
    authorAvatar?: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
  };
}

export interface AppUser {
  id: string; name: string; email: string; password?: string; role: string;
  institution: string;
  institutions?: string[];
  status: "Active" | "Suspended"; createdAt: string;
  avatarUrl?: string;
  bannerUrl?: string;
  headline?: string;
  bio?: string;
}

export interface Institution {
  id: string; name: string; type: string; region: string;
  students: number; teachers: number; plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Trial" | "Suspended"; createdAt: string;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  replyTo?: string;        // reply to another reply ID
  replyToAuthor?: string;  // name of the person being replied to
  createdAt: string;
}

export interface ForumThread {
  id: string; title: string; body: string; authorId: string; authorName: string;
  category: string; replies: number; pinned: boolean; createdAt: string;
  forumReplies?: ForumReply[];  // actual reply objects
  isAlumniOnly?: boolean;       // only for course alumni
  linkedCourseId?: string;      // link to a specific course
}

export interface AppEvent {
  id: string; title: string; date: string; time: string;
  type: "Webinar" | "Community" | "Event"; speaker: string;
  seats: number; registrations: number; createdAt: string;
  imageUrl?: string;
  description?: string;
  meetingUrl?: string; // Link Zoom / GMeet
  gformUrl?: string;   // Link GForm Pendaftaran
  thankYouMessage?: string; // Pesan kustom setelah mendaftar
}

export interface PortfolioProject {
  id: string; userId: string; title: string; description: string;
  tags: string[]; image: string; liveUrl: string; repoUrl: string; createdAt: string;
}

export interface Certificate {
  id: string; userId: string; courseId: string; courseTitle: string;
  credentialId: string; skill: string; issuedAt: string;
}

export interface AppBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

// ─── Landing Page Content (admin-managed) ─────────────────────────────────────

export interface LandingHero {
  headline: string;
  tagline: string;
  ctaText: string;
  stats: { label: string; value: string }[];
}

export interface LandingCategory {
  id?: string;
  name: string;
  icon: string;   // lucide icon name or image URL
  color?: string;
  description?: string;
  detailImageUrl?: string;
  highlights?: string[];
}

export interface LandingFeature {
  id: string;
  icon: string;   // lucide icon name or image URL
  title: string;
  description: string;
  detailImageUrl?: string;
  fullContent?: string;
  highlights?: string[];
}

export interface LandingPartner {
  id: string;
  name: string;
  logoUrl: string;
}

export interface LandingTestimonial {
  id: string;
  name: string;
  role: string;
  institution: string;
  quote: string;
  avatarUrl: string;
}

export interface LandingBannerSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  badge: string;
  buttonText: string;
}

export interface LandingContent {
  hero: LandingHero;
  bannerSlides: LandingBannerSlide[];
  features: LandingFeature[];
  partners: LandingPartner[];
  testimonials: LandingTestimonial[];
  platformStats: { label: string; value: string; icon: string }[];
  ctaSection: { headline: string; description: string; buttonText: string };
  categories: LandingCategory[];
}

// ─── Store State ──────────────────────────────────────────────────────────────

export interface FriendRequestItem {
  id: string;
  senderName: string;
  senderEmail?: string;
  receiverName: string;
  receiverEmail?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface UserNotificationItem {
  id: string;
  targetUserKey: string; // recipient name (lowercase)
  title: string;
  message: string;
  type: "friend_request" | "friend_accepted" | "system" | "forum_reply" | "forum_comment" | "badge_earned" | "course_completed";
  requestId?: string;
  senderName?: string;
  read: boolean;
  createdAt: string;
}

export interface AppAssessment {
  id: string;
  title: string;
  type: "Quiz" | "Assignment" | "Project" | "Peer Review";
  courseId?: string;
  courseTitle?: string;
  totalQuestions?: number;
  passingScore?: number;
  dueDate?: string;
  submissionsCount?: number;
  createdAt: string;
}

export interface StoreState {
  profile: UserProfile;
  courses: Course[];
  enrollments: Enrollment[];
  users: AppUser[];
  institutions: Institution[];
  forumThreads: ForumThread[];
  events: AppEvent[];
  portfolioProjects: PortfolioProject[];
  certificates: Certificate[];
  landingContent: LandingContent;
  feedPosts: AppFeedPost[];
  friendConnections: string[]; // list of user emails or names
  friendRequests?: FriendRequestItem[];
  userNotifications?: UserNotificationItem[];
  userProfilesMap?: Record<string, Partial<UserProfile>>;
  badges?: AppBadge[];
  reviews?: CourseReview[];
  assessments?: AppAssessment[];
}

const defaultProfile: UserProfile = {
  id: "current-user",
  firstName: "", lastName: "", headline: "", bio: "", phone: "", city: "",
  dateOfBirth: "", institution: "", major: "", enrollYear: "", graduateYear: "",
  linkedin: "", github: "", portfolio: "", twitter: "",
  openToWork: true, jobTypes: [], workModes: [], industries: [],
  salaryRange: "", skills: [], availableFrom: "", availabilityNote: "",
  publicProfile: true, showInTalentPool: true, showOnLeaderboard: true,
  showCertificates: true, showPortfolio: true,
  notifCourseReminder: true, notifNewAssignment: true, notifGradeReleased: true,
  notifCertIssued: true, notifForumReply: true, notifMentions: false,
  notifNewEvent: true, notifJobRec: true, notifTalentViewed: false,
  notifNewPartner: false, notif2fa: false, notifLoginAlert: true,
  earnedBadges: [],
  featuredBadgeId: undefined,
  xp: 0,
};

const getInitialProfile = (): UserProfile => {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const saved = localStorage.getItem("3itc_active_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.firstName || parsed.lastName || parsed.email)) {
        return { ...defaultProfile, ...parsed };
      }
    }
  } catch (_) {}
  return defaultProfile;
};

const defaultLandingContent: LandingContent = {
  hero: {
    headline: "Bangun Skill Digital, Raih Karier Impian",
    tagline: "Platform edukasi digital terdepan di Indonesia. Belajar dari mentor terbaik, bangun portfolio nyata, dan dapatkan sertifikasi yang diakui industri.",
    ctaText: "Mulai Belajar Gratis",
    stats: [
      { label: "Pelajar Aktif", value: "85.000+" },
      { label: "Kursus Tersedia", value: "1.200+" },
      { label: "Institusi Mitra", value: "120+" },
      { label: "Tingkat Kepuasan", value: "98%" },
    ],
  },
  bannerSlides: [
    {
      id: "slide-1",
      title: "National Tech Hackathon 2026",
      subtitle: "Kompetisi Inovasi Digital Mahasiswa & Pelajar se-Indonesia. Hadiah Total Rp 150 Juta!",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      linkUrl: "#event",
      badge: "🔥 EVENT UNGULAN",
      buttonText: "Daftar Hackathon",
    },
    {
      id: "slide-2",
      title: "Mastering AI & Large Language Models",
      subtitle: "Workshop Eksklusif 3 Hari bersama AI Researcher & Senior Engineer dari Tech Industry.",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      linkUrl: "#kursus",
      badge: "⚡ WORKSHOP SPESIAL",
      buttonText: "Ikuti Workshop",
    },
    {
      id: "slide-3",
      title: "Beasiswa Digital Talent 3ITC",
      subtitle: "Dapatkan akses gratis 100+ kursus premium & penyaluran kerja ke 50+ perusahaan mitra.",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      linkUrl: "/login",
      badge: "🎓 PROGRAM BEASISWA",
      buttonText: "Klaim Beasiswa",
    },
  ],
  features: [
    {
      id: "f1",
      icon: "GraduationCap",
      title: "Kurikulum Terstruktur",
      description: "Materi disusun oleh praktisi industri dengan jalur belajar dari dasar hingga mahir.",
      detailImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
      fullContent: "Setiap jalur pembelajaran dirancang mengikuti kurikulum standar industri IT global. Pelajar diajarkan mulai dari fundamental hingga implementasi arsitektur kompleks secara bertahap.",
      highlights: ["Materi Terupdate 2026", "Jalur Pembelajaran Terarah", "Studi Kasus Perusahaan Tech", "Akses Seumur Hidup"]
    },
    {
      id: "f2",
      icon: "Briefcase",
      title: "Project Nyata",
      description: "Bangun portfolio dengan capstone project yang relevan dengan kebutuhan industri.",
      detailImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
      fullContent: "Bukan sekadar teori. Kamu akan membangun aplikasi nyata, memecahkan masalah industri sekelas startup unicorn, dan mengunggah kode ke GitHub/Portfolio.",
      highlights: ["Real Capstone Project", "Code Review oleh Mentor Senior", "Portfolio Siap Melamar Kerja", "Grup Kolaborasi Tim"]
    },
    {
      id: "f3",
      icon: "Award",
      title: "Sertifikasi Terverifikasi",
      description: "Dapatkan kredensial digital yang diakui oleh perusahaan dan institusi mitra kami.",
      detailImageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80",
      fullContent: "Setiap sertifikat yang kamu raih memiliki QR Code dan Credential ID unik yang dapat diverifikasi secara online oleh tim HR & Rekruter perusahaan mitra.",
      highlights: ["QR Code Verifikasi Kredensial", "Diakui 120+ Perusahaan Mitra", "Bisa Di-share ke LinkedIn", "Standardized Assessment"]
    },
    {
      id: "f4",
      icon: "Users",
      title: "Talent Pool & Karier",
      description: "Profil terbaikmu otomatis masuk talent pool untuk direkomendasikan ke perusahaan mitra.",
      detailImageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80",
      fullContent: "Lulusan dengan performa tinggi langsung direkomendasikan ke jaringan hiring partner 3ITC tanpa perlu melewati screening berkali-kali.",
      highlights: ["Penyaluran Kerja Direct Referral", "Persiapan Interview Tech & HR", "Review CV & Profil LinkedIn", "Akses Exclusive Hiring Event"]
    },
    {
      id: "f5",
      icon: "MessageSquare",
      title: "Komunitas Aktif",
      description: "Diskusi, forum, dan event bersama sesama pelajar dan mentor berpengalaman.",
      detailImageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
      fullContent: "Bergabung bersama 85.000+ anggota komunitas teknologi. Tanya jawab masalah coding, ikuti webinar mingguan, dan bangun networking karirmu.",
      highlights: ["Forum Diskusi Real-time", "Webinar & Event Gratis", "Networking dengan Mentor", "Study Group Berdasarkan Kategori"]
    },
    {
      id: "f6",
      icon: "TrendingUp",
      title: "Analitik Progress",
      description: "Pantau perkembangan skill, XP, dan pencapaian belajarmu secara real-time.",
      detailImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
      fullContent: "Dashboard analitik memberikan wawasan mendalam tentang penguasaan skill, kecepatan belajar, poin XP, serta badge pencapaian yang kamu raih.",
      highlights: ["Skill Radar Chart", "XP & Gamification Badge", "Laporan Rekap Kemajuan", "Peringkat Leaderboard Student"]
    },
  ],
  partners: [
    { id: "p1", name: "Universitas Indonesia", logoUrl: "" },
    { id: "p2", name: "ITB", logoUrl: "" },
    { id: "p3", name: "Telkom University", logoUrl: "" },
    { id: "p4", name: "UGM", logoUrl: "" },
    { id: "p5", name: "Binus University", logoUrl: "" },
    { id: "p6", name: "ITS", logoUrl: "" },
  ],
  testimonials: [
    { id: "t1", name: "Rina Maharani", role: "Frontend Developer", institution: "PT Tokopedia", quote: "Berkat 3ITC, saya berhasil mendapatkan pekerjaan impian saya sebagai frontend developer hanya dalam 6 bulan belajar.", avatarUrl: "" },
    { id: "t2", name: "Ahmad Fauzi", role: "Data Analyst", institution: "Gojek", quote: "Kurikulum yang terstruktur dan project-based learning membuat saya benar-benar siap masuk dunia kerja.", avatarUrl: "" },
    { id: "t3", name: "Siti Nurhaliza", role: "UI/UX Designer", institution: "Bukalapak", quote: "Komunitas dan mentor di 3ITC sangat supportive. Sertifikasinya juga diakui oleh perusahaan tempat saya bekerja sekarang.", avatarUrl: "" },
  ],
  platformStats: [
    { label: "Pelajar Aktif", value: "85.000+", icon: "Users" },
    { label: "Kursus Tersedia", value: "1.200+", icon: "BookOpen" },
    { label: "Sertifikat Diterbitkan", value: "45.000+", icon: "Award" },
    { label: "Institusi Mitra", value: "120+", icon: "Building2" },
  ],
  ctaSection: {
    headline: "Siap Memulai Perjalanan Belajarmu?",
    description: "Bergabung dengan ribuan pelajar yang telah meningkatkan skill dan kariernya bersama 3ITC Digital Education.",
    buttonText: "Daftar Sekarang — Gratis",
  },
  categories: [
    { name: "Programming", icon: "Code", color: "#2563eb" },
    { name: "AI & Machine Learning", icon: "Brain", color: "#8b5cf6" },
    { name: "Data Science", icon: "BarChart3", color: "#0ea5e9" },
    { name: "Cyber Security", icon: "Shield", color: "#dc2626" },
    { name: "UI/UX Design", icon: "Palette", color: "#ec4899" },
    { name: "Digital Business", icon: "Briefcase", color: "#6366f1" },
    { name: "IoT & Robotics", icon: "Cpu", color: "#14b8a6" },
    { name: "Software Engineering", icon: "Settings", color: "#16a34a" },
  ],
};

const getInitialLandingContent = (): LandingContent => {
  if (typeof window === "undefined") return defaultLandingContent;
  try {
    const saved = localStorage.getItem("3itc_landing_cache");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.hero) {
        return { ...defaultLandingContent, ...parsed };
      }
    }
  } catch (_) {}
  return defaultLandingContent;
};

const defaultInstitutions: Institution[] = [
  {
    id: "inst-3itc",
    name: "3ITC",
    type: "Other",
    region: "Jakarta",
    plan: "Free",
    status: "Active",
    students: 120,
    teachers: 15,
    createdAt: new Date().toISOString(),
  }
];

const defaultEvents: EventItem[] = [
  {
    id: "evt-1",
    title: "Webinar: Masa Depan Artificial Intelligence & Career in Tech",
    speaker: "Tubagus Aria & Tim 3ITC",
    speakerRole: "Lead Tech Educator",
    date: "2026-08-20",
    time: "19:00 - 21:00 WIB",
    category: "AI & Career",
    description: "Pelajari tren industri AI terkini dan persiapkan karir teknologi bersama pakar dari 3ITC Digital Education.",
    link: "https://meet.google.com/3itc-demo",
    registeredCount: 42,
  }
];

const getInitialEvents = (): EventItem[] => {
  if (typeof window === "undefined") return defaultEvents;
  try {
    const saved = localStorage.getItem("3itc_events_cache");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return defaultEvents;
};

const initialState: StoreState = {
  profile: getInitialProfile(),
  courses: [],
  enrollments: [],
  users: [],
  institutions: defaultInstitutions,
  forumThreads: [],
  events: getInitialEvents(),
  portfolioProjects: [],
  certificates: [],
  landingContent: getInitialLandingContent(),
  badges: [],
  feedPosts: [],
  friendConnections: [],
  friendRequests: [],
  userNotifications: [],
  userProfilesMap: {},
  reviews: [
    {
      id: "rev-1",
      courseId: "c1",
      userName: "Budi Santoso",
      userAvatar: "",
      userRole: "Student",
      rating: 5,
      comment: "Materi sangat komprehensif, penjelasan mentor sangat jelas dan studi kasusnya langsung bisa diterapkan di dunia kerja!",
      createdAt: "2026-08-01",
    },
    {
      id: "rev-2",
      courseId: "c1",
      userName: "Siti Rahma",
      userAvatar: "",
      userRole: "Student",
      rating: 5,
      comment: "Platform 3ITC keren banget! Suka sama fitur kuis dan latihan praktisnya. Highly recommended bgt buat upgrade skill!",
      createdAt: "2026-08-03",
    },
  ],
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "UPDATE_PROFILE";      payload: Partial<UserProfile> }
  | { type: "ADD_COURSE";          payload: Omit<Course, "id" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_COURSE";       payload: { id: string } & Partial<Course> }
  | { type: "DELETE_COURSE";       payload: string }
  | { type: "ENROLL_COURSE";       payload: string | { courseId: string; userKey?: string } }   // courseId or object
  | { type: "UNENROLL_COURSE";     payload: string | { courseId: string; userKey?: string } }   // courseId or object
  | { type: "UPDATE_PROGRESS";     payload: { courseId: string; progress: number; userKey?: string } }
  | { type: "COMPLETE_LESSON";     payload: { courseId: string; lessonId: string; totalLessons: number; userKey?: string } }
  | { type: "RECORD_QUIZ_ATTEMPT"; payload: { courseId: string; lessonId: string; userKey?: string } }
  | { type: "ADD_COURSE_REVIEW";   payload: { courseId: string; userName: string; userAvatar?: string; userRole?: string; rating: number; comment: string } }
  | { type: "ADD_USER";            payload: Omit<AppUser, "id" | "createdAt"> }
  | { type: "UPDATE_USER";         payload: { id: string } & Partial<AppUser> }
  | { type: "DELETE_USER";         payload: string }
  | { type: "ADD_INSTITUTION";     payload: Omit<Institution, "id" | "createdAt"> }
  | { type: "UPDATE_INSTITUTION";  payload: { id: string } & Partial<Institution> }
  | { type: "DELETE_INSTITUTION";  payload: string }
  | { type: "ADD_FORUM_THREAD";    payload: Omit<ForumThread, "id" | "replies" | "createdAt"> }
  | { type: "DELETE_FORUM_THREAD"; payload: string }
  | { type: "ADD_EVENT";           payload: Omit<AppEvent, "id" | "registrations" | "createdAt"> }
  | { type: "UPDATE_EVENT";        payload: { id: string } & Partial<AppEvent> }
  | { type: "DELETE_EVENT";        payload: string }
  | { type: "REGISTER_EVENT";      payload: string }
  | { type: "ADD_PORTFOLIO";       payload: Omit<PortfolioProject, "id" | "createdAt"> }
  | { type: "UPDATE_PORTFOLIO";    payload: { id: string } & Partial<PortfolioProject> }
  | { type: "DELETE_PORTFOLIO";    payload: string }
  | { type: "ADD_CERTIFICATE";     payload: Omit<Certificate, "id" | "issuedAt"> }
  | { type: "UPDATE_LANDING";      payload: Partial<LandingContent> }
  | { type: "ADD_FEED_POST";       payload: Omit<AppFeedPost, "id" | "likes" | "likedBy" | "comments" | "createdAt"> }
  | { type: "REPOST_FEED_POST";    payload: { postId: string; authorId: string; authorName: string; authorRole: string; authorAvatar?: string; commentary?: string } }
  | { type: "LIKE_FEED_POST";      payload: { postId: string; userEmail: string } }
  | { type: "ADD_FEED_COMMENT";   payload: { postId: string; authorName: string; text: string } }
  | { type: "TOGGLE_FRIEND";       payload: string } // target email or id
  | { type: "SEND_FRIEND_REQUEST"; payload: { senderName: string; receiverName: string; senderEmail?: string; receiverEmail?: string } }
  | { type: "ACCEPT_FRIEND_REQUEST"; payload: { requestId: string; currentUserName: string } }
  | { type: "REJECT_FRIEND_REQUEST"; payload: { requestId: string } }
  | { type: "REMOVE_FRIEND";       payload: { user1: string; user2: string } }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "SET_ACTIVE_PROFILE_BY_NAME"; payload: { name: string; defaultRole?: string; institution?: string } }
  | { type: "UPDATE_FEED_POST";  payload: { id: string } & Partial<AppFeedPost> }
  | { type: "DELETE_FEED_POST";  payload: string }
  | { type: "ADD_BADGE";         payload: Omit<AppBadge, "id" | "createdAt"> }
  | { type: "UPDATE_BADGE";      payload: { id: string } & Partial<AppBadge> }
  | { type: "DELETE_BADGE";      payload: string }
  | { type: "AWARD_USER_BADGE";  payload: { badgeId: string; targetUserKey: string } }
  | { type: "SET_FEATURED_BADGE"; payload: { badgeId: string } }
  | { type: "ADD_ASSESSMENT";     payload: Omit<AppAssessment, "id" | "createdAt"> }
  | { type: "UPDATE_ASSESSMENT";  payload: { id: string } & Partial<AppAssessment> }
  | { type: "DELETE_ASSESSMENT";  payload: string }
  | { type: "HYDRATE";             payload: StoreState };

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function now() { return new Date().toISOString(); }

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "HYDRATE": {
      const payload = action.payload || {};
      // Only override fields that are actually present in the payload.
      // This prevents one onSnapshot (e.g. profiles) from wiping other collections (e.g. institutions).
      const merged = { ...state };

      if (Array.isArray(payload.users) && payload.users.length > 0) {
        merged.users = payload.users;
      }
      if (Array.isArray(payload.institutions) && payload.institutions.length > 0) {
        merged.institutions = payload.institutions;
      }
      if (Array.isArray(payload.courses)) {
        merged.courses = payload.courses.map(c => ({
          ...(c || {}),
          price: typeof c?.price === "string"
            ? (c.price === "Free" ? 0 : parseInt((c.price as unknown as string).replace(/\D/g, ""), 10) * 1000 || 0)
            : (c?.price ?? 0),
          discountPercent: c?.discountPercent ?? 0,
          curriculum: (Array.isArray(c?.curriculum) ? c.curriculum : []).map(mod => ({
            ...(mod || {}),
            lessons: (Array.isArray(mod?.lessons) ? mod.lessons : []).map(l => ({
              ...(l || {}),
              kkm: l?.kkm ?? 0,
              maxAttempts: l?.maxAttempts ?? 0,
            })),
          })),
        }));
      }
      if (Array.isArray(payload.enrollments)) {
        merged.enrollments = payload.enrollments.map(e => ({
          ...(e || {}),
          quizAttempts: e?.quizAttempts || {},
        }));
      }
      if (payload.profile) {
        merged.profile = { ...defaultProfile, ...(payload.profile || {}) };
      }
      if (Array.isArray(payload.events)) merged.events = payload.events;
      if (Array.isArray(payload.badges)) merged.badges = payload.badges;
      if (Array.isArray(payload.assessments)) merged.assessments = payload.assessments;
      if (Array.isArray(payload.portfolioProjects)) merged.portfolioProjects = payload.portfolioProjects;
      if (Array.isArray(payload.certificates)) merged.certificates = payload.certificates;
      if (Array.isArray(payload.feedPosts)) merged.feedPosts = payload.feedPosts;
      if (Array.isArray(payload.forumThreads)) merged.forumThreads = payload.forumThreads;
      if (Array.isArray(payload.reviews)) merged.reviews = payload.reviews;
      if (Array.isArray(payload.friendConnections)) merged.friendConnections = payload.friendConnections;
      if (Array.isArray(payload.friendRequests)) merged.friendRequests = payload.friendRequests;
      if (Array.isArray(payload.userNotifications)) merged.userNotifications = payload.userNotifications;
      if (payload.userProfilesMap && typeof payload.userProfilesMap === "object") merged.userProfilesMap = payload.userProfilesMap;

      return merged;
    }
    case "UPDATE_PROFILE": {
      const updatedProfile = { ...state.profile, ...action.payload };
      const userKey = `${updatedProfile.firstName || ""} ${updatedProfile.lastName || ""}`.trim().toLowerCase();
      const existingMap = state.userProfilesMap || {};
      const newMap = userKey ? { ...existingMap, [userKey]: updatedProfile } : existingMap;

      const updatedUsers = (state.users || []).map(u => {
        if ((u.email && updatedProfile.email && u.email.toLowerCase() === updatedProfile.email.toLowerCase()) ||
            u.id === updatedProfile.id) {
          return {
            ...u,
            avatarUrl: updatedProfile.avatarUrl || u.avatarUrl,
            bannerUrl: updatedProfile.bannerUrl || u.bannerUrl,
            headline: updatedProfile.headline || u.headline,
            bio: updatedProfile.bio || u.bio,
          };
        }
        return u;
      });

      return { ...state, profile: updatedProfile, users: updatedUsers, userProfilesMap: newMap };
    }
    case "SET_ACTIVE_PROFILE_BY_NAME": {
      const { name, defaultRole, institution, email } = action.payload;
      const userKey = (name || "").trim().toLowerCase();
      if (!userKey) return state;

      const existingMap = state.userProfilesMap || {};
      const saved = existingMap[userKey];

      if (saved && (saved.firstName || saved.lastName)) {
        return {
          ...state,
          profile: { ...saved, email: email || saved.email || "" } as UserProfile,
        };
      }

      const parts = name.trim().split(" ");
      const firstName = parts[0] || "User";
      const lastName = parts.slice(1).join(" ") || "";

      const newProfile: UserProfile = {
        ...defaultProfile,
        id: `user-${userKey.replace(/\s+/g, "-")}`,
        firstName,
        lastName,
        email: email || "",
        institution: institution || "3ITC Digital Education",
        headline: `${defaultRole || "student"} at ${institution || "3ITC Digital Education"}`,
        bio: `Anggota aktif 3ITC Digital Education.`,
        avatarUrl: undefined,
        bannerUrl: undefined,
      };

      return {
        ...state,
        profile: newProfile,
        userProfilesMap: {
          ...existingMap,
          [userKey]: newProfile,
        },
      };
    }
    case "ADD_FEED_POST":
      return {
        ...state,
        feedPosts: [
          {
            ...action.payload,
            id: uid(),
            likes: 0,
            likedBy: [],
            comments: [],
            createdAt: now(),
          },
          ...(state.feedPosts || []),
        ],
      };
    case "REPOST_FEED_POST": {
      const { postId, authorId, authorName, authorRole, authorAvatar, commentary } = action.payload;
      const targetPost = (state.feedPosts || []).find(p => p.id === postId);
      if (!targetPost) return state;

      const updatedFeedPosts = (state.feedPosts || []).map(p => {
        if (p.id !== postId) return p;
        const list = p.repostedBy || [];
        return {
          ...p,
          repostCount: (p.repostCount || 0) + 1,
          repostedBy: list.includes(authorName) ? list : [...list, authorName],
        };
      });

      const orig = targetPost.originalPost || {
        id: targetPost.id,
        authorName: targetPost.authorName,
        authorRole: targetPost.authorRole,
        authorAvatar: targetPost.authorAvatar,
        content: targetPost.content,
        imageUrl: targetPost.imageUrl || targetPost.imageData,
        createdAt: targetPost.createdAt,
      };

      const newRepostPost: AppFeedPost = {
        id: uid(),
        authorId,
        authorName,
        authorRole,
        authorAvatar,
        content: commentary?.trim() || "",
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: now(),
        repostCount: 0,
        originalPost: orig,
      };

      return {
        ...state,
        feedPosts: [newRepostPost, ...updatedFeedPosts],
      };
    }
    case "LIKE_FEED_POST": {
      const { postId, userEmail } = action.payload;
      return {
        ...state,
        feedPosts: (state.feedPosts || []).map((p) => {
          if (p.id !== postId) return p;
          const alreadyLiked = (p.likedBy || []).includes(userEmail);
          const nextLikedBy = alreadyLiked
            ? (p.likedBy || []).filter((e) => e !== userEmail)
            : [...(p.likedBy || []), userEmail];
          return {
            ...p,
            likedBy: nextLikedBy,
            likes: nextLikedBy.length,
          };
        }),
      };
    }
    case "ADD_FEED_COMMENT": {
      const { postId, authorName, text } = action.payload;
      return {
        ...state,
        feedPosts: (state.feedPosts || []).map((p) => {
          if (p.id !== postId) return p;
          const newComment = {
            id: uid(),
            authorName,
            text,
            createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          };
          return {
            ...p,
            comments: [...(p.comments || []), newComment],
          };
        }),
      };
    }
    case "TOGGLE_FRIEND": {
      const targetId = action.payload;
      const already = (state.friendConnections || []).includes(targetId);
      const nextConnections = already
        ? (state.friendConnections || []).filter((e) => e !== targetId)
        : [...(state.friendConnections || []), targetId];
      return {
        ...state,
        friendConnections: nextConnections,
      };
    }
    case "SEND_FRIEND_REQUEST": {
      const { senderName, receiverName, senderEmail, receiverEmail } = action.payload;
      if (senderName.toLowerCase() === receiverName.toLowerCase()) return state;

      const reqId = uid();
      const newRequest: FriendRequestItem = {
        id: reqId,
        senderName,
        senderEmail,
        receiverName,
        receiverEmail,
        status: "pending",
        createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      };
      const newNotification: UserNotificationItem = {
        id: uid(),
        targetUserKey: receiverName.toLowerCase(),
        title: "Permintaan Pertemanan Baru 🤝",
        message: `${senderName} mengirimkan permintaan pertemanan.`,
        type: "friend_request",
        requestId: reqId,
        senderName,
        read: false,
        createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      };
      return {
        ...state,
        friendRequests: [newRequest, ...(state.friendRequests || [])],
        userNotifications: [newNotification, ...(state.userNotifications || [])],
      };
    }
    case "ACCEPT_FRIEND_REQUEST": {
      const { requestId, currentUserName } = action.payload;
      const req = (state.friendRequests || []).find(r => r.id === requestId);
      if (!req) return state;

      const updatedRequests = (state.friendRequests || []).map(r =>
        r.id === requestId ? { ...r, status: "accepted" as const } : r
      );

      const senderKey = req.senderName;
      const receiverKey = req.receiverName;

      const nextConnections = Array.from(new Set([...(state.friendConnections || []), senderKey, receiverKey]));

      const acceptanceNotification: UserNotificationItem = {
        id: uid(),
        targetUserKey: req.senderName.toLowerCase(),
        title: "Pertemanan Diterima! 🎉",
        message: `${currentUserName} menyetujui permintaan pertemanan kamu.`,
        type: "friend_accepted",
        senderName: currentUserName,
        read: false,
        createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      };

      const updatedNotifs = (state.userNotifications || []).map(n =>
        n.requestId === requestId ? { ...n, read: true } : n
      );

      return {
        ...state,
        friendConnections: nextConnections,
        friendRequests: updatedRequests,
        userNotifications: [acceptanceNotification, ...updatedNotifs],
      };
    }
    case "REJECT_FRIEND_REQUEST": {
      const { requestId } = action.payload;
      const updatedRequests = (state.friendRequests || []).map(r =>
        r.id === requestId ? { ...r, status: "rejected" as const } : r
      );
      const updatedNotifs = (state.userNotifications || []).map(n =>
        n.requestId === requestId ? { ...n, read: true } : n
      );
      return {
        ...state,
        friendRequests: updatedRequests,
        userNotifications: updatedNotifs,
      };
    }
    case "REMOVE_FRIEND": {
      const { user1, user2 } = action.payload;
      const nextConnections = (state.friendConnections || []).filter(
        (e) => e.toLowerCase() !== user1.toLowerCase() && e.toLowerCase() !== user2.toLowerCase()
      );
      const nextRequests = (state.friendRequests || []).filter(
        r => !( (r.senderName.toLowerCase() === user1.toLowerCase() && r.receiverName.toLowerCase() === user2.toLowerCase()) ||
               (r.senderName.toLowerCase() === user2.toLowerCase() && r.receiverName.toLowerCase() === user1.toLowerCase()) )
      );
      return {
        ...state,
        friendConnections: nextConnections,
        friendRequests: nextRequests,
      };
    }
    case "MARK_NOTIFICATION_READ": {
      const notifId = action.payload;
      return {
        ...state,
        userNotifications: (state.userNotifications || []).map(n => n.id === notifId ? { ...n, read: true } : n),
      };
    }
    case "MARK_ALL_NOTIFICATIONS_READ": {
      const userKey = (action.payload || "").toLowerCase();
      return {
        ...state,
        userNotifications: (state.userNotifications || []).map(n =>
          !userKey || (n.targetUserKey || "").toLowerCase() === userKey || (n.targetUserKey || "").toLowerCase() === "all" || !n.targetUserKey ? { ...n, read: true } : n
        ),
      };
    }
    case "DELETE_NOTIFICATION": {
      const notifId = action.payload;
      return {
        ...state,
        userNotifications: (state.userNotifications || []).filter(n => n.id !== notifId),
      };
    }
    case "CLEAR_ALL_NOTIFICATIONS": {
      const userKey = (action.payload || "").toLowerCase();
      return {
        ...state,
        userNotifications: (state.userNotifications || []).filter(n =>
          userKey && (n.targetUserKey || "").toLowerCase() !== userKey && (n.targetUserKey || "").toLowerCase() !== "all" && !!n.targetUserKey
        ),
      };
    }
    case "ADD_COURSE": {
      const payload = action.payload;
      const numPrice = typeof payload.price === "string"
        ? (payload.price === "Free" ? 0 : parseInt((payload.price as unknown as string).replace(/\D/g, ""), 10) * 1000 || 0)
        : (payload.price ?? 0);
      const sanitized: Course = {
        ...payload,
        id: uid(),
        title: payload.title || "Untitled Course",
        subtitle: payload.subtitle || "",
        category: payload.category || "General",
        level: payload.level || "Beginner",
        language: payload.language || "Bahasa Indonesia",
        thumbnail: payload.thumbnail || "",
        mentorId: payload.mentorId || "",
        mentorName: payload.mentorName || "Mentor",
        mentorBio: payload.mentorBio || "",
        rating: payload.rating || 0,
        learners: payload.learners || 0,
        hours: payload.hours || 0,
        summary: payload.summary || "",
        description: payload.description || "",
        objectives: payload.objectives || [],
        prerequisites: payload.prerequisites || [],
        targetAudience: payload.targetAudience || "",
        curriculum: payload.curriculum || [],
        price: numPrice,
        discountPercent: payload.discountPercent || 0,
        status: payload.status || "draft",
        certificateEnabled: payload.certificateEnabled ?? true,
        enrollmentLimit: payload.enrollmentLimit || 0,
        tags: payload.tags || [],
        createdAt: now(),
        updatedAt: now(),
      };
      return { ...state, courses: [...(state.courses || []), sanitized] };
    }
    case "UPDATE_COURSE":
      return { ...state, courses: state.courses.map(c => c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: now() } : c) };
    case "DELETE_COURSE":
      return { ...state, courses: state.courses.filter(c => c.id !== action.payload) };
    case "ENROLL_COURSE": {
      const courseId = typeof action.payload === "string" ? action.payload : action.payload.courseId;
      const rawUserKey = typeof action.payload === "object" ? action.payload.userKey : undefined;
      const userKey = (rawUserKey || state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();

      const already = (state.enrollments ?? []).some(
        e => e.courseId === courseId && (e.userKey || "").toLowerCase() === userKey
      );
      if (already) return state;

      const newEnrollment: Enrollment = {
        id: uid(),
        courseId,
        userKey,
        enrolledAt: now(),
        progress: 0,
        lastAccessedAt: now(),
        completedLessons: [],
        quizAttempts: {}
      };
      return { ...state, enrollments: [...(state.enrollments ?? []), newEnrollment] };
    }
    case "UNENROLL_COURSE": {
      const courseId = typeof action.payload === "string" ? action.payload : action.payload.courseId;
      const rawUserKey = typeof action.payload === "object" ? action.payload.userKey : undefined;
      const userKey = (rawUserKey || state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();

      return {
        ...state,
        enrollments: (state.enrollments ?? []).filter(
          e => !(e.courseId === courseId && (!e.userKey || e.userKey.toLowerCase() === userKey))
        )
      };
    }
    case "UPDATE_PROGRESS": {
      const { courseId, progress } = action.payload;
      const userKey = (action.payload.userKey || state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();

      return {
        ...state,
        enrollments: (state.enrollments ?? []).map(e => {
          if (e.courseId !== courseId) return e;
          if (e.userKey && e.userKey.toLowerCase() !== userKey) return e;
          return { ...e, userKey: e.userKey || userKey, progress, lastAccessedAt: now() };
        })
      };
    }
    case "COMPLETE_LESSON": {
      const { courseId, lessonId, totalLessons } = action.payload;
      const userKey = (action.payload.userKey || state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();

      return {
        ...state,
        enrollments: (state.enrollments ?? []).map(e => {
          if (e.courseId !== courseId) return e;
          if (e.userKey && e.userKey.toLowerCase() !== userKey) return e;

          const completed = (e.completedLessons ?? []).includes(lessonId)
            ? e.completedLessons
            : [...(e.completedLessons ?? []), lessonId];
          const progress = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;
          return { ...e, userKey: e.userKey || userKey, completedLessons: completed, progress, lastAccessedAt: now() };
        }),
      };
    }
    case "RECORD_QUIZ_ATTEMPT": {
      const { courseId, lessonId } = action.payload;
      const userKey = (action.payload.userKey || state.profile?.email || `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim() || "student").toLowerCase();

      return {
        ...state,
        enrollments: (state.enrollments ?? []).map(e => {
          if (e.courseId !== courseId) return e;
          if (e.userKey && e.userKey.toLowerCase() !== userKey) return e;
          const attempts = e.quizAttempts ?? {};
          return { ...e, userKey: e.userKey || userKey, quizAttempts: { ...attempts, [lessonId]: (attempts[lessonId] ?? 0) + 1 } };
        }),
      };
    }
    case "ADD_COURSE_REVIEW": {
      const { courseId, userName, userAvatar, userRole, rating, comment } = action.payload;
      const newReview: CourseReview = {
        id: uid(),
        courseId,
        userName,
        userAvatar,
        userRole: userRole || "Student",
        rating,
        comment,
        createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      };
      const updatedReviews = [newReview, ...(state.reviews || [])];

      const courseReviews = updatedReviews.filter(r => r.courseId === courseId);
      const avgRating = Math.round((courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length) * 10) / 10;

      const updatedCourses = state.courses.map(c => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          rating: avgRating,
          learners: (c.learners || 0) + 1,
        };
      });

      return {
        ...state,
        reviews: updatedReviews,
        courses: updatedCourses,
      };
    }
    case "ADD_USER":
      return { ...state, users: [...state.users, { ...action.payload, id: uid(), createdAt: now() }] };
    case "UPDATE_USER":
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u) };
    case "DELETE_USER":
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case "ADD_INSTITUTION":
      return { ...state, institutions: [...state.institutions, { ...action.payload, id: uid(), createdAt: now() }] };
    case "UPDATE_INSTITUTION":
      return { ...state, institutions: state.institutions.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i) };
    case "DELETE_INSTITUTION":
      return { ...state, institutions: state.institutions.filter(i => i.id !== action.payload) };
    case "ADD_FORUM_THREAD":
      return { ...state, forumThreads: [{ ...action.payload, id: uid(), replies: 0, createdAt: now() }, ...state.forumThreads] };
    case "DELETE_FORUM_THREAD":
      return { ...state, forumThreads: state.forumThreads.filter(t => t.id !== action.payload) };
    case "ADD_EVENT":
      return { ...state, events: [...state.events, { ...action.payload, id: uid(), registrations: 0, createdAt: now() }] };
    case "UPDATE_EVENT":
      return { ...state, events: state.events.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e) };
    case "DELETE_EVENT":
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };
    case "REGISTER_EVENT":
      return { ...state, events: state.events.map(e => e.id === action.payload ? { ...e, registrations: (e.registrations || 0) + 1 } : e) };
    case "ADD_PORTFOLIO":
      return { ...state, portfolioProjects: [{ ...action.payload, id: uid(), createdAt: now() }, ...state.portfolioProjects] };
    case "UPDATE_PORTFOLIO":
      return { ...state, portfolioProjects: state.portfolioProjects.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    case "DELETE_PORTFOLIO":
      return { ...state, portfolioProjects: state.portfolioProjects.filter(p => p.id !== action.payload) };
    case "ADD_CERTIFICATE":
      return { ...state, certificates: [{ ...action.payload, id: uid(), issuedAt: now() }, ...state.certificates] };
    case "UPDATE_LANDING":
      return { ...state, landingContent: { ...(state.landingContent ?? defaultLandingContent), ...action.payload } };
    case "UPDATE_FEED_POST": {
      const { id, ...rest } = action.payload;
      return { ...state, feedPosts: (state.feedPosts || []).map(p => p.id === id ? { ...p, ...rest } : p) };
    }
    case "DELETE_FEED_POST":
      return { ...state, feedPosts: (state.feedPosts || []).filter(p => p.id !== action.payload) };
    case "ADD_BADGE":
      return { ...state, badges: [...(state.badges || []), { ...action.payload, id: uid(), createdAt: now() }] };
    case "UPDATE_BADGE":
      return { ...state, badges: (state.badges || []).map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) };
    case "DELETE_BADGE":
      return { ...state, badges: (state.badges || []).filter(b => b.id !== action.payload) };
    case "ADD_ASSESSMENT":
      return { ...state, assessments: [...(state.assessments || []), { ...action.payload, id: uid(), createdAt: now() }] };
    case "UPDATE_ASSESSMENT":
      return { ...state, assessments: (state.assessments || []).map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) };
    case "DELETE_ASSESSMENT":
      return { ...state, assessments: (state.assessments || []).filter(a => a.id !== action.payload) };
    case "AWARD_USER_BADGE": {
      const { badgeId, targetUserKey } = action.payload;
      const keyLower = (targetUserKey || "").toLowerCase();
      const map = { ...(state.userProfilesMap || {}) };
      
      Object.keys(map).forEach(k => {
        if (k.toLowerCase() === keyLower) {
          const userProfile = map[k];
          const earned = [...(userProfile.earnedBadges || [])];
          if (!earned.includes(badgeId)) earned.push(badgeId);
          map[k] = { ...userProfile, earnedBadges: earned };
        }
      });

      const activeName = `${state.profile.firstName || ''} ${state.profile.lastName || ''}`.trim().toLowerCase();
      const activeEmail = (state.profile.email || "").toLowerCase();
      let updatedProfile = state.profile;
      
      if (!keyLower || activeName === keyLower || activeEmail === keyLower || (activeName && keyLower.includes(activeName)) || (activeName && activeName.includes(keyLower))) {
        const earned = [...(state.profile.earnedBadges || [])];
        if (!earned.includes(badgeId)) earned.push(badgeId);
        updatedProfile = { ...state.profile, earnedBadges: earned };
      }
      return { ...state, profile: updatedProfile, userProfilesMap: map };
    }
    case "SET_FEATURED_BADGE":
      return { ...state, profile: { ...state.profile, featuredBadgeId: action.payload.badgeId } };
    case "ADD_NOTIFICATION": {
      const payloadData = action.payload as any;
      const targetKey = (payloadData.targetUserKey || payloadData.userId || "").toLowerCase();
      const newNotif: UserNotificationItem = {
        targetUserKey: targetKey,
        title: action.payload.title || "Notifikasi",
        message: action.payload.message || "",
        type: (action.payload.type as any) || "system",
        read: action.payload.read ?? false,
        id: uid(),
        createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      };
      return { ...state, userNotifications: [newNotif, ...(state.userNotifications || [])] };
    }
    case "ADD_FORUM_REPLY": {
      const { threadId, reply } = action.payload;
      const newReply: ForumReply = { ...reply, id: uid(), createdAt: now() };
      return {
        ...state,
        forumThreads: state.forumThreads.map(t =>
          t.id === threadId
            ? { ...t, replies: (t.replies || 0) + 1, forumReplies: [...(t.forumReplies || []), newReply] }
            : t
        ),
      };
    }
    case "UPDATE_FORUM_THREAD":
      return { ...state, forumThreads: state.forumThreads.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "3itc_store_v3"; // bumped: price → number, discountPercent, quizAttempts

interface StoreContextType {
  state: StoreState;
  actions: {
    updateProfile:     (patch: Partial<UserProfile>) => void;
    addCourse:         (data: Omit<Course, "id" | "createdAt" | "updatedAt">) => void;
    updateCourse:      (patch: { id: string } & Partial<Course>) => void;
    deleteCourse:      (id: string) => void;
    enrollCourse:      (courseId: string) => void;
    unenrollCourse:    (courseId: string) => void;
    updateProgress:    (courseId: string, progress: number) => void;
    completeLesson:    (courseId: string, lessonId: string, totalLessons: number) => void;
    recordQuizAttempt: (courseId: string, lessonId: string) => void;
    addUser:           (data: Omit<AppUser, "id" | "createdAt">) => void;
    updateUser:        (patch: { id: string } & Partial<AppUser>) => void;
    deleteUser:        (id: string) => void;
    addInstitution:    (data: Omit<Institution, "id" | "createdAt">) => void;
    updateInstitution: (patch: { id: string } & Partial<Institution>) => void;
    deleteInstitution: (id: string) => void;
    addForumThread:    (data: Omit<ForumThread, "id" | "replies" | "createdAt">) => void;
    deleteForumThread: (id: string) => void;
    addEvent:          (data: Omit<AppEvent, "id" | "registrations" | "createdAt">) => void;
    updateEvent:       (data: { id: string } & Partial<AppEvent>) => void;
    deleteEvent:       (id: string) => void;
    registerEvent:     (id: string) => void;
    addPortfolio:      (data: Omit<PortfolioProject, "id" | "createdAt">) => void;
    updatePortfolio:   (patch: { id: string } & Partial<PortfolioProject>) => void;
    deletePortfolio:   (id: string) => void;
    addCertificate:    (data: Omit<Certificate, "id" | "issuedAt">) => void;
    updateLanding:     (patch: Partial<LandingContent>) => void;
    addFeedPost:       (data: Omit<AppFeedPost, "id" | "likes" | "likedBy" | "comments" | "createdAt">) => void;
    repostFeedPost:    (data: { postId: string; authorId: string; authorName: string; authorRole: string; authorAvatar?: string; commentary?: string }) => void;
    likeFeedPost:      (postId: string, userEmail: string) => void;
    addFeedComment:    (postId: string, authorName: string, text: string) => void;
    toggleFriend:      (targetId: string) => void;
    sendFriendRequest:   (data: { senderName: string; receiverName: string; senderEmail?: string; receiverEmail?: string }) => void;
    acceptFriendRequest: (requestId: string, currentUserName: string) => void;
    rejectFriendRequest: (requestId: string) => void;
    removeFriend:        (user1: string, user2: string) => void;
    markNotificationRead:(notifId: string) => void;
    markAllNotificationsRead: (targetUserKey: string) => void;
    deleteNotification:  (notifId: string) => void;
    clearAllNotifications: (targetUserKey: string) => void;
    setActiveProfileByName: (name: string, defaultRole?: string, institution?: string, email?: string) => void;
    updateFeedPost:    (patch: { id: string } & Partial<AppFeedPost>) => void;
    deleteFeedPost:    (id: string) => void;
    addBadge:          (data: Omit<AppBadge, "id" | "createdAt">) => void;
    updateBadge:       (patch: { id: string } & Partial<AppBadge>) => void;
    deleteBadge:       (id: string) => void;
    awardUserBadge:    (badgeId: string, targetUserKey: string) => void;
    setFeaturedBadge:  (badgeId: string) => void;
    addAssessment:     (data: Omit<AppAssessment, "id" | "createdAt">) => void;
    updateAssessment:  (patch: { id: string } & Partial<AppAssessment>) => void;
    deleteAssessment:  (id: string) => void;
    addCourseReview:   (data: { courseId: string; userName: string; userAvatar?: string; userRole?: string; rating: number; comment: string }) => void;
    addForumReply:     (threadId: string, reply: Omit<ForumReply, "id" | "createdAt">) => void;
    updateForumThread: (patch: { id: string } & Partial<ForumThread>) => void;
  };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Sync state.profile to localStorage whenever it changes
  useEffect(() => {
    if (state.profile && (state.profile.firstName || state.profile.lastName || state.profile.email)) {
      try {
        localStorage.setItem("3itc_active_profile", JSON.stringify(state.profile));
      } catch (_) {}
    }
  }, [state.profile]);

  // ─── Firestore Real-time Sync (Primary DB) + localStorage offline cache ───
  useEffect(() => {
    // Helper: save to localStorage as offline cache
    const cacheSet = (key: string, data: any) => {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
    };
    const cacheGet = (key: string) => {
      try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (_) { return null; }
    };

    // Load offline cache immediately so UI is never empty on first paint
    const cachedUsers = cacheGet("3itc_users_cache");
    const cachedInstitutions = cacheGet("3itc_institutions_cache");
    if (cachedUsers?.length || cachedInstitutions?.length) {
      const patch: Partial<StoreState> = {};
      if (cachedUsers?.length) patch.users = cachedUsers;
      if (cachedInstitutions?.length) patch.institutions = cachedInstitutions;
      dispatch({ type: "HYDRATE", payload: patch });
    }

    // Real-time Firestore listeners — when Firestore is available, these override the cache
    const capitalizeRole = (r: string) => r ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() : "Student";
    const unsubProfiles = onSnapshot(collection(db, "profiles"), (snap) => {
      if (!snap.empty) {
        const userProfilesMap: Record<string, UserProfile> = { ...(state.userProfilesMap || {}) };
        let matchingProfilePatch: Partial<UserProfile> | null = null;

        const users = snap.docs.map(d => {
          const data = d.data();
          const fullName = data.name || `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email || "";
          const avatarUrl = data.avatarUrl || data.avatar_url || "";
          const bannerUrl = data.bannerUrl || data.banner_url || "";
          const headline = data.headline || "";
          const bio = data.bio || "";
          const email = data.email || "";

          // Populate userProfilesMap for public profile modals and member lists
          const userKey = fullName.toLowerCase();
          if (userKey) {
            userProfilesMap[userKey] = {
              ...defaultProfile,
              id: d.id,
              firstName: data.first_name || fullName.split(" ")[0] || "User",
              lastName: data.last_name || fullName.split(" ").slice(1).join(" ") || "",
              email,
              headline,
              bio,
              avatarUrl,
              bannerUrl,
              institution: data.institution || "3ITC Digital Education",
              city: data.city || "",
              phone: data.phone || "",
              experiences: data.experiences || [],
              educations: data.educations || [],
              skills: data.skills || [],
            };
          }

          // Check if this doc matches the active profile email
          if (email && state.profile?.email && email.toLowerCase() === state.profile.email.toLowerCase()) {
            matchingProfilePatch = {
              avatarUrl: avatarUrl || state.profile.avatarUrl,
              bannerUrl: bannerUrl || state.profile.bannerUrl,
              headline: headline || state.profile.headline,
              bio: bio || state.profile.bio,
              city: data.city || state.profile.city,
              institution: data.institution || state.profile.institution,
              experiences: data.experiences || state.profile.experiences,
              educations: data.educations || state.profile.educations,
              skills: data.skills || state.profile.skills,
            };
          }

          return {
            id: d.id,
            name: fullName,
            email,
            password: data.password || "gaadapasswordnya",
            role: capitalizeRole(data.role || "student"),
            institution: data.institution || "3ITC Digital Education",
            status: data.status || "Active",
            avatarUrl,
            bannerUrl,
            headline,
            bio,
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          };
        });

        const patch: Partial<StoreState> = { users, userProfilesMap };
        if (matchingProfilePatch) {
          patch.profile = { ...state.profile, ...matchingProfilePatch };
        }

        dispatch({ type: "HYDRATE", payload: patch });
        cacheSet("3itc_users_cache", users);
      }
    }, err => console.warn("Firestore profiles listener:", err));

    const unsubInstitutions = onSnapshot(collection(db, "institutions"), (snap) => {
      if (!snap.empty) {
        const institutions = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
        dispatch({ type: "HYDRATE", payload: { institutions } });
        cacheSet("3itc_institutions_cache", institutions);
      }
    }, err => console.warn("Firestore institutions listener:", err));

    const unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
      if (!snap.empty) {
        const courses = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
        dispatch({ type: "HYDRATE", payload: { courses } });
      }
    }, err => console.warn("Firestore courses listener:", err));

    const unsubEnrollments = onSnapshot(collection(db, "enrollments"), (snap) => {
      if (!snap.empty) {
        const enrollments = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
        dispatch({ type: "HYDRATE", payload: { enrollments } });
      }
    }, err => console.warn("Firestore enrollments listener:", err));

    const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      if (!snap.empty) {
        const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
        dispatch({ type: "HYDRATE", payload: { reviews } });
      }
    }, err => console.warn("Firestore reviews listener:", err));

    const unsubFeed = onSnapshot(collection(db, "feedPosts"), (snap) => {
      const feedPosts = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { feedPosts } });
      cacheSet("3itc_feed_cache", feedPosts);
    }, err => console.warn("Firestore feedPosts listener:", err));

    const unsubForum = onSnapshot(collection(db, "forumThreads"), (snap) => {
      const forumThreads = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { forumThreads } });
      cacheSet("3itc_forum_cache", forumThreads);
    }, err => console.warn("Firestore forumThreads listener:", err));

    const unsubEvents = onSnapshot(collection(db, "events"), (snap) => {
      const events = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { events } });
      cacheSet("3itc_events_cache", events);
    }, err => console.warn("Firestore events listener:", err));

    const unsubBadges = onSnapshot(collection(db, "badges"), (snap) => {
      const badges = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { badges } });
      cacheSet("3itc_badges_cache", badges);
    }, err => console.warn("Firestore badges listener:", err));

    const unsubAssessments = onSnapshot(collection(db, "assessments"), (snap) => {
      const assessments = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { assessments } });
      cacheSet("3itc_assessments_cache", assessments);
    }, err => console.warn("Firestore assessments listener:", err));

    const unsubPortfolio = onSnapshot(collection(db, "portfolioProjects"), (snap) => {
      const portfolioProjects = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { portfolioProjects } });
      cacheSet("3itc_portfolio_cache", portfolioProjects);
    }, err => console.warn("Firestore portfolioProjects listener:", err));

    const unsubCertificates = onSnapshot(collection(db, "certificates"), (snap) => {
      const certificates = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
      dispatch({ type: "HYDRATE", payload: { certificates } });
      cacheSet("3itc_certs_cache", certificates);
    }, err => console.warn("Firestore certificates listener:", err));

    const unsubLanding = onSnapshot(doc(db, "settings", "landing"), (snap) => {
      if (snap.exists()) {
        const landingContent = snap.data() as LandingContent;
        dispatch({ type: "HYDRATE", payload: { landingContent } });
        cacheSet("3itc_landing_cache", landingContent);
      }
    }, err => console.warn("Firestore landing listener:", err));

    return () => {
      unsubProfiles(); unsubInstitutions(); unsubCourses();
      unsubEnrollments(); unsubReviews(); unsubFeed(); unsubForum();
      unsubEvents(); unsubBadges(); unsubAssessments(); unsubPortfolio();
      unsubCertificates(); unsubLanding();
    };
  }, []);

  // ─── Auto-seed initial Firestore collections if empty so all collections show in Firebase Console ───
  useEffect(() => {
    getDoc(doc(db, "settings", "landing")).then(snap => {
      if (!snap.exists()) {
        fsSet("settings", "landing", defaultLandingContent);
      }
    }).catch(_ => {});

    getDocs(collection(db, "badges")).then(snap => {
      if (snap.empty) {
        const defaultBadgesList = [
          { id: "b-1", name: "TypeScript Specialist", category: "Skill", description: "Menguasai TypeScript dari tingkat dasar hingga lanjut.", iconUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
          { id: "b-2", name: "AI Practitioner", category: "Achievement", description: "Menyelesaikan kursus AI & Machine Learning.", iconUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
        ];
        defaultBadgesList.forEach(b => fsSet("badges", b.id, b));
      }
    }).catch(_ => {});

    getDocs(collection(db, "assessments")).then(snap => {
      if (snap.empty) {
        const defaultAssList = [
          { id: "ass-1", title: "Kuis Dasar React & State Management", type: "Quiz", passingScore: 80, dueDate: "2026-08-30", submissionsCount: 12, createdAt: new Date().toISOString() }
        ];
        defaultAssList.forEach(a => fsSet("assessments", a.id, a));
      }
    }).catch(_ => {});

    getDocs(collection(db, "reviews")).then(snap => {
      if (snap.empty) {
        const defaultRevList = [
          { id: "rev-1", courseId: "c-1", userName: "Ahmad Rizky", userRole: "Student", rating: 5, comment: "Materi sangat jelas dan praktis untuk pemula!", createdAt: new Date().toISOString() }
        ];
        defaultRevList.forEach(r => fsSet("reviews", r.id, r));
      }
    }).catch(_ => {});

    getDocs(collection(db, "forumThreads")).then(snap => {
      if (snap.empty) {
        const defaultForumList = [
          { id: "thread-1", title: "Diskusi: Best Practice arsitektur Next.js App Router", body: "Bagaimana cara terbaik mengorganisasi Server vs Client Components?", authorName: "Tubagus Aria", category: "Programming", replies: 2, createdAt: new Date().toISOString() }
        ];
        defaultForumList.forEach(t => fsSet("forumThreads", t.id, t));
      }
    }).catch(_ => {});

    getDocs(collection(db, "feedPosts")).then(snap => {
      if (snap.empty) {
        const defaultFeedList = [
          { id: "feed-1", authorName: "Tubagus Aria", authorRole: "Admin", content: "Selamat datang di platform 3ITC Digital Education!", createdAt: new Date().toISOString() }
        ];
        defaultFeedList.forEach(f => fsSet("feedPosts", f.id, f));
      }
    }).catch(_ => {});
  }, []);

  // ─── Helper: write to Firestore ───
  const fsSet = (col: string, id: string, data: any) =>
    setDoc(doc(db, col, id), data, { merge: true }).catch(e => console.warn(`Firestore ${col} write error:`, e));
  const fsDel = (col: string, id: string) =>
    deleteDoc(doc(db, col, id)).catch(e => console.warn(`Firestore ${col} delete error:`, e));

  const actions: StoreContextType["actions"] = {
    // ── Profile ──
    updateProfile: p => {
      dispatch({ type: "UPDATE_PROFILE", payload: p });
      if (state.profile?.email) {
        const uId = `user-${state.profile.email.replace(/[^a-zA-Z0-9]/g, "-")}`;
        const fullName = `${p.firstName !== undefined ? p.firstName : (state.profile.firstName || "")} ${p.lastName !== undefined ? p.lastName : (state.profile.lastName || "")}`.trim();
        const parts = fullName.split(" ");
        fsSet("profiles", uId, {
          name: fullName,
          first_name: parts[0] || "",
          last_name: parts.slice(1).join(" ") || "",
          email: state.profile.email,
          institution: p.institution !== undefined ? p.institution : (state.profile.institution || "3ITC Digital Education"),
          headline: p.headline !== undefined ? p.headline : (state.profile.headline || ""),
          bio: p.bio !== undefined ? p.bio : (state.profile.bio || ""),
          avatarUrl: p.avatarUrl !== undefined ? p.avatarUrl : (state.profile.avatarUrl || ""),
          bannerUrl: p.bannerUrl !== undefined ? p.bannerUrl : (state.profile.bannerUrl || ""),
          city: p.city !== undefined ? p.city : (state.profile.city || ""),
          phone: p.phone !== undefined ? p.phone : (state.profile.phone || ""),
          experiences: p.experiences || state.profile.experiences || [],
          educations: p.educations || state.profile.educations || [],
          skills: p.skills || state.profile.skills || [],
          updatedAt: new Date().toISOString(),
        });
      }
    },

    // ── Courses ──
    addCourse: d => {
      const cId = `c-${Date.now()}`;
      dispatch({ type: "ADD_COURSE", payload: d });
      fsSet("courses", cId, {
        title: d.title, subtitle: d.subtitle, category: d.category, level: d.level,
        providerInstitution: d.providerInstitution || "3ITC Digital Education",
        mentorName: d.mentorName || "Mentor 3ITC",
        rating: d.rating || 5.0, learners: d.learners || 0, hours: d.hours || 10,
        summary: d.summary || "", description: d.description || "",
        thumbnail: d.thumbnail || "", price: typeof d.price === "number" ? d.price : 0,
        status: d.status || "published",
      });
    },
    updateCourse: p => {
      dispatch({ type: "UPDATE_COURSE", payload: p });
      fsSet("courses", p.id, p);
    },
    deleteCourse: id => {
      dispatch({ type: "DELETE_COURSE", payload: id });
      fsDel("courses", id);
    },

    // ── Enrollments ──
    enrollCourse: id => {
      dispatch({ type: "ENROLL_COURSE", payload: id });
      const cId = typeof id === "string" ? id : id.courseId;
      const uKey = typeof id === "string" ? (state.profile?.email || "student") : (id.userKey || state.profile?.email || "student");
      const eId = `enr-${cId}-${uKey.replace(/[^a-zA-Z0-9]/g, "-")}`;
      fsSet("enrollments", eId, {
        courseId: cId, userKey: uKey.toLowerCase(),
        progress: 0, completedLessons: [], enrolledAt: new Date().toISOString(),
      });
    },
    unenrollCourse: id => {
      dispatch({ type: "UNENROLL_COURSE", payload: id });
      const cId = typeof id === "string" ? id : id.courseId;
      const uKey = typeof id === "string" ? (state.profile?.email || "student") : (id.userKey || state.profile?.email || "student");
      fsDel("enrollments", `enr-${cId}-${uKey.replace(/[^a-zA-Z0-9]/g, "-")}`);
    },
    updateProgress: (id, n) => {
      dispatch({ type: "UPDATE_PROGRESS", payload: { courseId: id, progress: n } });
      const uKey = (state.profile?.email || "student").toLowerCase();
      fsSet("enrollments", `enr-${id}-${uKey.replace(/[^a-zA-Z0-9]/g, "-")}`, {
        progress: n, lastAccessedAt: new Date().toISOString(),
      });
    },
    completeLesson: (courseId, lessonId, totalLessons) => {
      dispatch({ type: "COMPLETE_LESSON", payload: { courseId, lessonId, totalLessons } });
    },
    recordQuizAttempt: (courseId, lessonId) => dispatch({ type: "RECORD_QUIZ_ATTEMPT", payload: { courseId, lessonId } }),

    // ── Reviews ──
    addCourseReview: d => {
      dispatch({ type: "ADD_COURSE_REVIEW", payload: d });
      fsSet("reviews", `rev-${Date.now()}`, {
        courseId: d.courseId, userName: d.userName,
        userAvatar: d.userAvatar || "", userRole: d.userRole || "Student",
        rating: d.rating, comment: d.comment, createdAt: new Date().toISOString(),
      });
    },

    // ── Users (profiles) ──
    addUser: d => {
      dispatch({ type: "ADD_USER", payload: d });
      const uId = d.id || `user-${d.email.replace(/[^a-zA-Z0-9]/g, "-")}`;
      fsSet("profiles", uId, {
        id: uId, name: d.name, email: d.email,
        password: d.password || "gaadapasswordnya",
        role: d.role?.toLowerCase() || "student",
        institution: d.institution || "3ITC Digital Education",
        status: d.status || "Active",
        createdAt: d.createdAt || new Date().toISOString(),
      });
    },
    updateUser: p => {
      dispatch({ type: "UPDATE_USER", payload: p });
      fsSet("profiles", p.id, p);
    },
    deleteUser: id => {
      dispatch({ type: "DELETE_USER", payload: id });
      fsDel("profiles", id);
    },

    // ── Institutions ──
    addInstitution: d => {
      dispatch({ type: "ADD_INSTITUTION", payload: d });
      const instId = `inst-${Date.now()}`;
      fsSet("institutions", instId, {
        name: d.name, type: d.type || "Other", region: d.region || "Jakarta",
        plan: d.plan || "Free", status: d.status || "Active",
        students: d.students || 0, teachers: d.teachers || 0,
        createdAt: new Date().toISOString(),
      });
    },
    updateInstitution: p => {
      dispatch({ type: "UPDATE_INSTITUTION", payload: p });
      fsSet("institutions", p.id, p);
    },
    deleteInstitution: id => {
      dispatch({ type: "DELETE_INSTITUTION", payload: id });
      fsDel("institutions", id);
    },

    // ── Forum ──
    addForumThread: d => {
      dispatch({ type: "ADD_FORUM_THREAD", payload: d });
      fsSet("forumThreads", `thread-${Date.now()}`, {
        title: d.title, body: d.body, authorId: d.authorId,
        authorName: d.authorName, category: d.category || "Programming",
        createdAt: new Date().toISOString(),
      });
    },
    deleteForumThread: id => {
      dispatch({ type: "DELETE_FORUM_THREAD", payload: id });
      fsDel("forumThreads", id);
    },

    // ── Events (Cloud Firestore) ──
    addEvent: d => {
      const evtId = `evt-${Date.now()}`;
      const newEvt = {
        id: evtId,
        title: d.title,
        date: d.date,
        time: d.time || "19:00 WIB",
        type: d.type || "Webinar",
        speaker: d.speaker || "Praktisi Industri",
        seats: d.seats || 100,
        imageUrl: d.imageUrl || "",
        description: d.description || "",
        meetingUrl: d.meetingUrl || "",
        gformUrl: d.gformUrl || "",
        thankYouMessage: d.thankYouMessage || "",
        registrations: 0,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_EVENT", payload: newEvt });
      fsSet("events", evtId, newEvt);
    },
    updateEvent: p => {
      dispatch({ type: "UPDATE_EVENT", payload: p });
      fsSet("events", p.id, p);
    },
    deleteEvent: id => {
      dispatch({ type: "DELETE_EVENT", payload: id });
      fsDel("events", id);
    },
    registerEvent: id => {
      dispatch({ type: "REGISTER_EVENT", payload: id });
      const evt = (state.events || []).find(e => e.id === id);
      const currentReg = (evt?.registrations || 0) + 1;
      fsSet("events", id, { registrations: currentReg });
    },

    // ── Portfolio & Certificates ──
    addPortfolio: d => {
      const pId = `port-${Date.now()}`;
      const newPort = { id: pId, ...d, createdAt: new Date().toISOString() };
      dispatch({ type: "ADD_PORTFOLIO", payload: newPort });
      fsSet("portfolioProjects", pId, newPort);
    },
    updatePortfolio: p => {
      dispatch({ type: "UPDATE_PORTFOLIO", payload: p });
      fsSet("portfolioProjects", p.id, p);
    },
    deletePortfolio: id => {
      dispatch({ type: "DELETE_PORTFOLIO", payload: id });
      fsDel("portfolioProjects", id);
    },
    addCertificate: d => {
      const cId = `cert-${Date.now()}`;
      const newCert = { id: cId, ...d, issuedAt: new Date().toISOString() };
      dispatch({ type: "ADD_CERTIFICATE", payload: newCert });
      fsSet("certificates", cId, newCert);
    },
    updateLanding: p => {
      dispatch({ type: "UPDATE_LANDING", payload: p });
      const newLanding = { ...state.landingContent, ...p };
      fsSet("settings", "landing", newLanding);
    },

    // ── Badges ──
    addBadge: d => {
      const bId = `badge-${Date.now()}`;
      const newBadge = { id: bId, ...d, createdAt: new Date().toISOString() };
      dispatch({ type: "ADD_BADGE", payload: newBadge });
      fsSet("badges", bId, newBadge);
    },
    updateBadge: p => {
      dispatch({ type: "UPDATE_BADGE", payload: p });
      fsSet("badges", p.id, p);
    },
    deleteBadge: id => {
      dispatch({ type: "DELETE_BADGE", payload: id });
      fsDel("badges", id);
    },
    awardUserBadge: (badgeId, targetUserKey) => {
      dispatch({ type: "AWARD_USER_BADGE", payload: { badgeId, targetUserKey } });
    },
    setFeaturedBadge: badgeId => dispatch({ type: "SET_FEATURED_BADGE", payload: { badgeId } }),

    // ── Assessments ──
    addAssessment: d => {
      const aId = `ass-${Date.now()}`;
      const newAss = { id: aId, ...d, submissionsCount: d.submissionsCount || 0, createdAt: new Date().toISOString() };
      dispatch({ type: "ADD_ASSESSMENT", payload: newAss });
      fsSet("assessments", aId, newAss);
    },
    updateAssessment: p => {
      dispatch({ type: "UPDATE_ASSESSMENT", payload: p });
      fsSet("assessments", p.id, p);
    },
    deleteAssessment: id => {
      dispatch({ type: "DELETE_ASSESSMENT", payload: id });
      fsDel("assessments", id);
    },

    // ── Feed Posts ──
    addFeedPost: d => {
      dispatch({ type: "ADD_FEED_POST", payload: d });
      fsSet("feedPosts", `feed-${Date.now()}`, {
        authorId: d.authorId, authorName: d.authorName,
        authorRole: d.authorRole || "Student", authorAvatar: d.authorAvatar || "",
        content: d.content, imageUrl: d.imageUrl || "",
        createdAt: new Date().toISOString(),
      });
    },
    repostFeedPost: d => {
      dispatch({ type: "REPOST_FEED_POST", payload: d });
      fsSet("feedPosts", `repost-${Date.now()}`, {
        authorId: d.authorId, authorName: d.authorName,
        authorRole: d.authorRole || "Student", authorAvatar: d.authorAvatar || "",
        content: d.commentary || "", createdAt: new Date().toISOString(),
      });
    },

    // ── Social (local only) ──
    likeFeedPost: (postId, userEmail) => dispatch({ type: "LIKE_FEED_POST", payload: { postId, userEmail } }),
    addFeedComment: (postId, authorName, text) => dispatch({ type: "ADD_FEED_COMMENT", payload: { postId, authorName, text } }),
    toggleFriend: targetId => dispatch({ type: "TOGGLE_FRIEND", payload: targetId }),
    sendFriendRequest: d => dispatch({ type: "SEND_FRIEND_REQUEST", payload: d }),
    acceptFriendRequest: (requestId, currentUserName) => dispatch({ type: "ACCEPT_FRIEND_REQUEST", payload: { requestId, currentUserName } }),
    rejectFriendRequest: requestId => dispatch({ type: "REJECT_FRIEND_REQUEST", payload: { requestId } }),
    removeFriend: (user1, user2) => dispatch({ type: "REMOVE_FRIEND", payload: { user1, user2 } }),
    markNotificationRead: notifId => dispatch({ type: "MARK_NOTIFICATION_READ", payload: notifId }),
    markAllNotificationsRead: userKey => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ", payload: userKey }),
    deleteNotification: notifId => dispatch({ type: "DELETE_NOTIFICATION", payload: notifId }),
    clearAllNotifications: userKey => dispatch({ type: "CLEAR_ALL_NOTIFICATIONS", payload: userKey }),
    setActiveProfileByName: (name, defaultRole, institution, email) => dispatch({ type: "SET_ACTIVE_PROFILE_BY_NAME", payload: { name, defaultRole, institution, email } }),
    updateFeedPost: p => {
      dispatch({ type: "UPDATE_FEED_POST", payload: p });
      fsSet("feedPosts", p.id, p);
    },
    deleteFeedPost: id => {
      dispatch({ type: "DELETE_FEED_POST", payload: id });
      fsDel("feedPosts", id);
    },
    addNotification: d => dispatch({ type: "ADD_NOTIFICATION", payload: d }),
    addForumReply: (threadId, reply) => dispatch({ type: "ADD_FORUM_REPLY", payload: { threadId, reply } }),
    updateForumThread: p => dispatch({ type: "UPDATE_FORUM_THREAD", payload: p }),
  };

  return <StoreContext.Provider value={{ state, actions }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
