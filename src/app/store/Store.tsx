/**
 * 3ITC Digital Education — Central Store
 * Context + useReducer → localStorage → (nanti: REST API / database)
 */

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import { type Role } from "../data/mock";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

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

export interface LandingFeature {
  id: string;
  icon: string;   // lucide icon name
  title: string;
  description: string;
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
  categories: { name: string; icon: string; color: string }[];
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
    { id: "f1", icon: "GraduationCap", title: "Kurikulum Terstruktur", description: "Materi disusun oleh praktisi industri dengan jalur belajar dari dasar hingga mahir." },
    { id: "f2", icon: "Briefcase", title: "Project Nyata", description: "Bangun portfolio dengan capstone project yang relevan dengan kebutuhan industri." },
    { id: "f3", icon: "Award", title: "Sertifikasi Terverifikasi", description: "Dapatkan kredensial digital yang diakui oleh perusahaan dan institusi mitra kami." },
    { id: "f4", icon: "Users", title: "Talent Pool & Karier", description: "Profil terbaikmu otomatis masuk talent pool untuk direkomendasikan ke perusahaan mitra." },
    { id: "f5", icon: "MessageSquare", title: "Komunitas Aktif", description: "Diskusi, forum, dan event bersama sesama pelajar dan mentor berpengalaman." },
    { id: "f6", icon: "TrendingUp", title: "Analitik Progress", description: "Pantau perkembangan skill, XP, dan pencapaian belajarmu secara real-time." },
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

const initialState: StoreState = {
  profile: defaultProfile,
  courses: [],
  enrollments: [],
  users: [],
  institutions: [],
  forumThreads: [],
  events: [],
  portfolioProjects: [],
  certificates: [],
  landingContent: defaultLandingContent,
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
  | { type: "ADD_NOTIFICATION";  payload: Omit<UserNotificationItem, "id" | "createdAt"> }
  | { type: "ADD_FORUM_REPLY";   payload: { threadId: string; reply: Omit<ForumReply, "id" | "createdAt"> } }
  | { type: "UPDATE_FORUM_THREAD"; payload: { id: string } & Partial<ForumThread> }
  | { type: "HYDRATE";             payload: StoreState };

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function now() { return new Date().toISOString(); }

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "HYDRATE": {
      const payload = action.payload || {};
      // Migrate old string price to number and safely process courses
      const courses = (Array.isArray(payload.courses) ? payload.courses : []).map(c => ({
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
      const enrollments = (Array.isArray(payload.enrollments) ? payload.enrollments : []).map(e => ({
        ...(e || {}),
        quizAttempts: e?.quizAttempts || {},
      }));
      // Safely merge profile with defaults to prevent crashes on undefined arrays
      const profile = { ...defaultProfile, ...(payload.profile || {}) };
      const institutions = Array.isArray(payload.institutions) ? payload.institutions : [];
      const badges = Array.isArray(payload.badges) ? payload.badges : [];
      const feedPosts = Array.isArray(payload.feedPosts) ? payload.feedPosts : [];
      const friendConnections = Array.isArray(payload.friendConnections) ? payload.friendConnections : [];
      const friendRequests = Array.isArray(payload.friendRequests) ? payload.friendRequests : [];
      const userNotifications = Array.isArray(payload.userNotifications) ? payload.userNotifications : [];
      const userProfilesMap = payload.userProfilesMap && typeof payload.userProfilesMap === "object" ? payload.userProfilesMap : {};

      return {
        ...initialState,
        ...payload,
        courses,
        enrollments,
        profile,
        institutions,
        badges,
        feedPosts,
        friendConnections,
        friendRequests,
        userNotifications,
        userProfilesMap,
      };
    }
    case "UPDATE_PROFILE": {
      const updatedProfile = { ...state.profile, ...action.payload };
      const userKey = `${updatedProfile.firstName || ""} ${updatedProfile.lastName || ""}`.trim().toLowerCase();
      const existingMap = state.userProfilesMap || {};
      const newMap = userKey ? { ...existingMap, [userKey]: updatedProfile } : existingMap;
      return { ...state, profile: updatedProfile, userProfilesMap: newMap };
    }
    case "SET_ACTIVE_PROFILE_BY_NAME": {
      const { name, defaultRole, institution } = action.payload;
      const userKey = (name || "").trim().toLowerCase();
      if (!userKey) return state;

      const existingMap = state.userProfilesMap || {};
      const saved = existingMap[userKey];

      if (saved && (saved.firstName || saved.lastName)) {
        return {
          ...state,
          profile: saved as UserProfile,
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
    setActiveProfileByName: (name: string, defaultRole?: string, institution?: string) => void;
    updateFeedPost:    (patch: { id: string } & Partial<AppFeedPost>) => void;
    deleteFeedPost:    (id: string) => void;
    addBadge:          (data: Omit<AppBadge, "id" | "createdAt">) => void;
    updateBadge:       (patch: { id: string } & Partial<AppBadge>) => void;
    deleteBadge:       (id: string) => void;
    awardUserBadge:    (badgeId: string, targetUserKey: string) => void;
    setFeaturedBadge:  (badgeId: string) => void;
    addNotification:   (data: Omit<UserNotificationItem, "id" | "createdAt">) => void;
    addCourseReview:     (data: { courseId: string; userName: string; userAvatar?: string; userRole?: string; rating: number; comment: string }) => void;
    addForumReply:     (threadId: string, reply: Omit<ForumReply, "id" | "createdAt">) => void;
    updateForumThread: (patch: { id: string } & Partial<ForumThread>) => void;
  };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "HYDRATE", payload: JSON.parse(saved) });
    } catch { /* corrupt storage — start fresh */ }

    if (isSupabaseConfigured && supabase) {
      Promise.all([
        supabase.from("courses").select("*"),
        supabase.from("enrollments").select("*"),
        supabase.from("reviews").select("*"),
        supabase.from("feed_posts").select("*"),
        supabase.from("profiles").select("*"),
      ]).then(([coursesRes, enrollmentsRes, reviewsRes, feedsRes, profilesRes]) => {
        const patch: Partial<StoreState> = {};
        if (coursesRes.data && coursesRes.data.length > 0) patch.courses = coursesRes.data as any;
        if (enrollmentsRes.data && enrollmentsRes.data.length > 0) {
          patch.enrollments = enrollmentsRes.data.map(e => ({
            id: e.id,
            courseId: e.course_id,
            userKey: e.user_key,
            progress: e.progress,
            completedLessons: e.completed_lessons || [],
            quizAttempts: e.quiz_attempts || {},
            enrolledAt: e.enrolled_at,
            lastAccessedAt: e.last_accessed_at,
          }));
        }
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          patch.reviews = reviewsRes.data.map(r => ({
            id: r.id,
            courseId: r.course_id,
            userName: r.user_name,
            userAvatar: r.user_avatar,
            userRole: r.user_role,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
          }));
        }
        if (feedsRes.data && feedsRes.data.length > 0) {
          patch.feedPosts = feedsRes.data.map(f => ({
            id: f.id,
            authorId: f.author_id,
            authorName: f.author_name,
            authorRole: f.author_role,
            authorAvatar: f.author_avatar,
            content: f.content,
            imageUrl: f.image_url,
            likes: f.likes || 0,
            likedBy: f.liked_by || [],
            repostCount: f.repost_count || 0,
            repostedBy: f.reposted_by || [],
            originalPost: f.original_post,
            comments: f.comments || [],
            createdAt: f.created_at,
          }));
        }
        if (profilesRes.data && profilesRes.data.length > 0) {
          patch.users = profilesRes.data.map(p => ({
            id: p.id,
            name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email,
            email: p.email,
            role: p.role || "student",
            institution: p.institution || "3ITC Digital Education",
            status: "Active",
            createdAt: p.created_at || new Date().toISOString(),
          }));
        }
        if (Object.keys(patch).length > 0) {
          dispatch({ type: "HYDRATE", payload: patch });
        }
      }).catch(err => console.warn("Supabase initial sync:", err));
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
  }, [state]);

  const actions: StoreContextType["actions"] = {
    updateProfile:     p  => dispatch({ type: "UPDATE_PROFILE",      payload: p }),
    addCourse:         d  => dispatch({ type: "ADD_COURSE",          payload: d }),
    updateCourse:      p  => dispatch({ type: "UPDATE_COURSE",       payload: p }),
    deleteCourse:      id => dispatch({ type: "DELETE_COURSE",       payload: id }),
    enrollCourse:      id => dispatch({ type: "ENROLL_COURSE",       payload: id }),
    unenrollCourse:    id => dispatch({ type: "UNENROLL_COURSE",     payload: id }),
    updateProgress:    (id, n) => dispatch({ type: "UPDATE_PROGRESS", payload: { courseId: id, progress: n } }),
    completeLesson:    (courseId, lessonId, totalLessons) => dispatch({ type: "COMPLETE_LESSON", payload: { courseId, lessonId, totalLessons } }),
    recordQuizAttempt: (courseId, lessonId) => dispatch({ type: "RECORD_QUIZ_ATTEMPT", payload: { courseId, lessonId } }),
    addCourseReview:   d  => dispatch({ type: "ADD_COURSE_REVIEW",   payload: d }),
    addUser:           d  => {
      dispatch({ type: "ADD_USER", payload: d });
      if (isSupabaseConfigured && supabase) {
        const parts = d.name.split(" ");
        supabase.from("profiles").upsert({
          id: `user-${d.email.replace(/[^a-zA-Z0-9]/g, "-")}`,
          first_name: parts[0] || d.name,
          last_name: parts.slice(1).join(" ") || "",
          email: d.email,
          role: d.role?.toLowerCase() || "student",
          institution: d.institution || "3ITC",
        }).then(({ error }) => { if (error) console.warn("Supabase profiles upsert error:", error); });
      }
    },
    updateUser:        p  => dispatch({ type: "UPDATE_USER",         payload: p }),
    deleteUser:        id => dispatch({ type: "DELETE_USER",         payload: id }),
    addInstitution:    d  => dispatch({ type: "ADD_INSTITUTION",     payload: d }),
    updateInstitution: p  => dispatch({ type: "UPDATE_INSTITUTION",  payload: p }),
    deleteInstitution: id => dispatch({ type: "DELETE_INSTITUTION",  payload: id }),
    addForumThread:    d  => dispatch({ type: "ADD_FORUM_THREAD",    payload: d }),
    deleteForumThread: id => dispatch({ type: "DELETE_FORUM_THREAD", payload: id }),
    addEvent:          d  => dispatch({ type: "ADD_EVENT",           payload: d }),
    updateEvent:       d  => dispatch({ type: "UPDATE_EVENT",        payload: d }),
    deleteEvent:       id => dispatch({ type: "DELETE_EVENT",        payload: id }),
    registerEvent:     id => dispatch({ type: "REGISTER_EVENT",      payload: id }),
    addPortfolio:      d  => dispatch({ type: "ADD_PORTFOLIO",       payload: d }),
    updatePortfolio:   p  => dispatch({ type: "UPDATE_PORTFOLIO",    payload: p }),
    deletePortfolio:   id => dispatch({ type: "DELETE_PORTFOLIO",    payload: id }),
    addCertificate:    d  => dispatch({ type: "ADD_CERTIFICATE",     payload: d }),
    updateLanding:     p  => dispatch({ type: "UPDATE_LANDING",      payload: p }),
    addFeedPost:       d  => dispatch({ type: "ADD_FEED_POST",       payload: d }),
    repostFeedPost:    d  => dispatch({ type: "REPOST_FEED_POST",    payload: d }),
    likeFeedPost:      (postId, userEmail) => dispatch({ type: "LIKE_FEED_POST", payload: { postId, userEmail } }),
    addFeedComment:    (postId, authorName, text) => dispatch({ type: "ADD_FEED_COMMENT", payload: { postId, authorName, text } }),
    toggleFriend:        targetId => dispatch({ type: "TOGGLE_FRIEND", payload: targetId }),
    sendFriendRequest:   d => dispatch({ type: "SEND_FRIEND_REQUEST", payload: d }),
    acceptFriendRequest: (requestId, currentUserName) => dispatch({ type: "ACCEPT_FRIEND_REQUEST", payload: { requestId, currentUserName } }),
    rejectFriendRequest: requestId => dispatch({ type: "REJECT_FRIEND_REQUEST", payload: { requestId } }),
    removeFriend:        (user1, user2) => dispatch({ type: "REMOVE_FRIEND", payload: { user1, user2 } }),
    markNotificationRead:notifId => dispatch({ type: "MARK_NOTIFICATION_READ", payload: notifId }),
    markAllNotificationsRead: userKey => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ", payload: userKey }),
    deleteNotification:  notifId => dispatch({ type: "DELETE_NOTIFICATION", payload: notifId }),
    clearAllNotifications: userKey => dispatch({ type: "CLEAR_ALL_NOTIFICATIONS", payload: userKey }),
    setActiveProfileByName: (name, defaultRole, institution) => dispatch({ type: "SET_ACTIVE_PROFILE_BY_NAME", payload: { name, defaultRole, institution } }),
    updateFeedPost:    p => dispatch({ type: "UPDATE_FEED_POST", payload: p }),
    deleteFeedPost:    id => dispatch({ type: "DELETE_FEED_POST", payload: id }),
    addBadge:          d => dispatch({ type: "ADD_BADGE", payload: d }),
    updateBadge:       p => dispatch({ type: "UPDATE_BADGE", payload: p }),
    deleteBadge:       id => dispatch({ type: "DELETE_BADGE", payload: id }),
    awardUserBadge:    (badgeId, targetUserKey) => dispatch({ type: "AWARD_USER_BADGE", payload: { badgeId, targetUserKey } }),
    setFeaturedBadge:  badgeId => dispatch({ type: "SET_FEATURED_BADGE", payload: { badgeId } }),
    addNotification:   d => dispatch({ type: "ADD_NOTIFICATION", payload: d }),
    addForumReply:     (threadId, reply) => dispatch({ type: "ADD_FORUM_REPLY", payload: { threadId, reply } }),
    updateForumThread: p => dispatch({ type: "UPDATE_FORUM_THREAD", payload: p }),
  };

  return <StoreContext.Provider value={{ state, actions }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
