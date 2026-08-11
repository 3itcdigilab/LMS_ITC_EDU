-- ─────────────────────────────────────────────────────────────────────────────
-- 3ITC DIGITAL EDUCATION PLATFORM - SUPABASE DATABASE SCHEMA
-- Copy dan paste seluruh isi file ini ke Supabase Dashboard -> SQL Editor -> Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Profiles Table (Siswa, Mentor, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  institution TEXT DEFAULT '3ITC Digital Education',
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  earned_badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table (Katalog Kursus)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'Beginner',
  provider_institution TEXT DEFAULT '3ITC Digital Education',
  mentor_name TEXT DEFAULT 'Mentor 3ITC',
  mentor_id TEXT,
  rating NUMERIC DEFAULT 4.8,
  learners INT DEFAULT 0,
  hours INT DEFAULT 0,
  summary TEXT,
  description TEXT,
  thumbnail TEXT,
  price NUMERIC DEFAULT 0,
  discount_percent INT DEFAULT 0,
  status TEXT DEFAULT 'published',
  curriculum JSONB DEFAULT '[]'::jsonb,
  objectives TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enrollments Table (Pendaftaran & Progress Belajar Per Pengguna)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_key TEXT NOT NULL, -- Email atau nama siswa (lowercase)
  progress INT DEFAULT 0,
  completed_lessons TEXT[] DEFAULT '{}',
  quiz_attempts JSONB DEFAULT '{}'::jsonb,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Course Reviews Table (Ulasan Bintang & Feedback Siswa)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  user_role TEXT DEFAULT 'Student',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Feed Posts Table (Feeds Komunitas & Repost)
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Student',
  author_avatar TEXT,
  content TEXT,
  image_url TEXT,
  likes INT DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  repost_count INT DEFAULT 0,
  reposted_by TEXT[] DEFAULT '{}',
  original_post JSONB, -- Embedded original post for reposts
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Forum Threads Table (Diskusi Komunitas Q&A)
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category TEXT DEFAULT 'Programming',
  pinned BOOLEAN DEFAULT FALSE,
  replies INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable Row Level Security (RLS) & Grant Access
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for quick setup & demo
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public insert courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update courses" ON public.courses FOR UPDATE USING (true);

CREATE POLICY "Allow public read enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Allow public insert enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update enrollments" ON public.enrollments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete enrollments" ON public.enrollments FOR DELETE USING (true);

CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read feed_posts" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert feed_posts" ON public.feed_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update feed_posts" ON public.feed_posts FOR UPDATE USING (true);

CREATE POLICY "Allow public read forum_threads" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Allow public insert forum_threads" ON public.forum_threads FOR INSERT WITH CHECK (true);
