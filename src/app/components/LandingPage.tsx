import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store/Store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Logo } from './shared';
import { cn } from './ui/utils';
import {
  GraduationCap,
  Briefcase,
  Award,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Video,
  Calendar,
  Clock,
  MonitorPlay,
  Zap,
  Shield,
  Globe,
  Cpu,
  Layout,
  PenTool,
  Database,
  Book,
  Play,
  Sparkles,
  MapPin,
  TrendingUp,
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Building2,
  Palette,
  Brain,
  Code,
  Settings,
  MousePointer2,
  Sun,
  Moon,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Briefcase,
  Award,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  ChevronRight,
  Video,
  Calendar,
  Clock,
  MonitorPlay,
  Zap,
  Shield,
  Globe,
  Cpu,
  Layout,
  PenTool,
  Database,
  Book,
  Play,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Building2,
  Palette,
  Brain,
  Code,
  Settings,
};

function DynIcon({ name, className, ...props }: { name?: string; className?: string } & any) {
  const Icon = name && iconMap[name] ? iconMap[name] : BookOpen;
  return <Icon className={className} {...props} />;
}

// Fade in on scroll effect hook
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-1000 ease-out transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
    >
      {children}
    </div>
  );
}

function HeroBannerSlider({ slides, navigate }: { slides: any[]; navigate: (path: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!slides || slides.length === 0 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides, isHovered]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const handleLinkClick = (url: string) => {
    if (!url) return;
    if (url.startsWith("#")) {
      const el = document.getElementById(url.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(url);
    }
  };

  return (
    <div
      className="mt-12 relative w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border/60 shadow-2xl bg-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden cursor-pointer"
        onClick={() => handleLinkClick(currentSlide.linkUrl || "#")}
      >
        <img
          key={currentSlide.id}
          src={currentSlide.imageUrl}
          alt={currentSlide.title || "Banner Slide"}
          className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
        />

        {/* Optional subtle badge */}
        {currentSlide.badge && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-md">
              {currentSlide.badge}
            </span>
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % slides.length);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg z-20"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex ? "w-6 bg-primary shadow-sm" : "w-2 bg-white/60 hover:bg-white"
              )}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    // Generate Floating Particles
    const PARTICLE_COUNT = 130;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2.5 + 1.2,
      color: Math.random() > 0.45 ? 'rgba(59, 130, 246, ' : 'rgba(147, 51, 234, ',
      alpha: Math.random() * 0.5 + 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp for mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Draw Google Antigravity Cursor Aura Halo (Multi-layered Radial Gradient)
      if (mouse.isHovered || mouse.x > 0) {
        const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 380);
        auraGrad.addColorStop(0, 'rgba(59, 130, 246, 0.40)');
        auraGrad.addColorStop(0.3, 'rgba(147, 51, 234, 0.22)');
        auraGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.10)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 380, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Particles & Interactive Laser Connections
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let pAlpha = p.alpha;
        if (dist < 200) {
          const force = (200 - dist) / 200;
          pAlpha = Math.min(1, p.alpha + force * 0.6);

          // Draw laser energy line connecting cursor to nearby particles
          ctx.strokeStyle = `rgba(59, 130, 246, ${force * 0.35})`;
          ctx.lineWidth = force * 1.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();

          // Gentle particle repulsion physics
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        // Draw particle dot
        ctx.fillStyle = `${p.color}${pAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 size-full z-0"
    />
  );
}

function InteractiveHero({ lc, navigate }: { lc: any; navigate: (path: string) => void }) {
  return (
    <div
      id="beranda"
      className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden bg-background"
    >
      {/* 🌌 Google Antigravity Interactive Particle Field & Cursor Aura Canvas */}
      <AntigravityCanvas />

      {/* 🔮 Film Grain Noise Overlay */}
      <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.20] dark:opacity-[0.28] mix-blend-overlay z-10">
        <filter id="noiseFilterGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterGrain)" />
      </svg>

      {/* Background Chromatic Glowing Blobs */}
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-blue-50/60 via-background to-background dark:from-blue-950/30 dark:via-background dark:to-background pointer-events-none" />
      <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/25 to-purple-600/25 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/25 to-pink-500/20 blur-[130px] pointer-events-none animate-pulse" />

      {/* Subtle Technical Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Platform Belajar Digital #1 di Indonesia
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-secondary dark:text-foreground mb-8 leading-tight drop-shadow-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {lc.hero?.headline || 'Tingkatkan Karirmu di Era Digital'}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            {lc.hero?.tagline || 'Belajar langsung dari praktisi industri, bangun portfolio, dan dapatkan pekerjaan impianmu bersama 3itcedu.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1" onClick={() => navigate('/login')}>
              {lc.hero?.ctaText || 'Mulai Belajar Gratis'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 hover:bg-muted/50 transition-all" onClick={() => {
              const el = document.getElementById('kursus');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Lihat Silabus
            </Button>
          </div>

          {/* Photo Slides / Banner Carousel */}
          <HeroBannerSlider slides={lc.bannerSlides || []} navigate={navigate} />

          {/* Hero Stats */}
          {lc.hero?.stats && lc.hero.stats.length > 0 && (
            <div className="mt-20 pt-10 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8">
              {lc.hero.stats.map((stat: any, i: number) => (
                <div key={i} className="flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</span>
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { state } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activePopupItem, setActivePopupItem] = useState<{ type: 'category' | 'feature'; data: any } | null>(null);

  const lc = state.landingContent;
  const publishedCourses = state.courses?.filter(c => c.status === 'published').slice(0, 6) || [];
  const upcomingEvents = state.events?.slice(0, 3) || [];

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("3itc-theme");
    return saved ? saved === "dark" : document.documentElement.classList.contains("dark");
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("3itc-theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!lc?.testimonials?.length) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % lc.testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [lc?.testimonials?.length]);

  if (!lc) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-border/50 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <Logo />
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Beranda', 'Kategori', 'Kursus', 'Event', 'Tentang'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.toLowerCase());
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full text-foreground hover:bg-muted"
                title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              >
                {isDark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-slate-700" />}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/login')}>Masuk</Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full text-foreground hover:bg-muted"
              >
                {isDark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-slate-700" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 absolute top-20 inset-x-0 p-4 shadow-lg flex flex-col space-y-4">
             {['Beranda', 'Kategori', 'Kursus', 'Event', 'Tentang'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    const el = document.getElementById(item.toLowerCase());
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-base font-medium px-4 py-2 text-foreground/80 hover:bg-muted rounded-lg transition-colors"
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 border-t border-border flex flex-col space-y-2 px-4">
                <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/login')}>Masuk</Button>
              </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Interactive Mouse Cursor Spotlight & 3D Tilt */}
      <InteractiveHero lc={lc} navigate={navigate} />

      {/* Partners Marquee */}
      {lc.partners && lc.partners.length > 0 && (
        <div className="py-12 bg-muted/30 border-y border-border/50 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 text-center mb-8">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Dipercaya oleh institusi & perusahaan terkemuka</p>
          </div>
          
          {/* CSS Animation for Marquee */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 30s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}} />
          
          <div className="relative flex overflow-x-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="animate-marquee items-center gap-16 px-8">
              {[...lc.partners, ...lc.partners].map((partner: any, i: number) => (
                <div key={i} className="flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="h-12 object-contain max-w-[150px]" />
                  ) : (
                    <div className="h-12 flex items-center justify-center text-2xl font-bold text-muted-foreground/80 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                      {partner.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      {lc.categories && lc.categories.length > 0 && (
        <Section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="kategori">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-secondary dark:text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Jelajahi Kategori
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pilih dari berbagai kategori pembelajaran yang dirancang khusus untuk kebutuhan industri saat ini.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {lc.categories.map((cat: any, i: number) => (
              <div 
                key={i} 
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center"
                onClick={() => setActivePopupItem({ type: 'category', data: cat })}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {cat.icon?.startsWith("data:") || cat.icon?.startsWith("http") ? (
                    <img src={cat.icon} alt="" className="w-7 h-7 object-contain" />
                  ) : (
                    <DynIcon name={cat.icon} className="w-7 h-7" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                <span className="text-[11px] text-muted-foreground mt-1 group-hover:text-primary transition-colors flex items-center gap-1">
                  Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Features Section */}
      {lc.features && lc.features.length > 0 && (
        <div className="py-24 bg-muted/30 border-y border-border/50 relative overflow-hidden" id="tentang">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Section className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-secondary dark:text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Mengapa Memilih 3itcedu?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Kami menyediakan ekosistem pembelajaran terlengkap untuk menunjang karir impian Anda.
              </p>
            </Section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lc.features.map((feature: any, i: number) => (
                <Section key={i} className={`delay-${(i % 3) * 100}`}>
                  <Card 
                    className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                    onClick={() => setActivePopupItem({ type: 'feature', data: feature })}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform">
                        {feature.icon?.startsWith("data:") || feature.icon?.startsWith("http") ? (
                          <img src={feature.icon} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <DynIcon name={feature.icon} className="w-6 h-6" />
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <div className="mt-4 pt-3 border-t border-border/40 text-xs font-semibold text-primary flex items-center justify-between">
                        <span>Pelajari Lebih Lanjut</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Section>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popular Courses */}
      <Section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="kursus">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-secondary dark:text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Kursus Terpopuler
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Tingkatkan skill Anda dengan materi terupdate dari mentor berpengalaman.
            </p>
          </div>
          <Button variant="ghost" className="hidden md:flex text-primary hover:text-primary/80" onClick={() => navigate('/login')}>
            Lihat Semua Kursus <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {publishedCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedCourses.map((course: any) => (
              <Card key={course.id} className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group cursor-pointer border-border/50" onClick={() => navigate('/login')}>
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-primary/10">
                       <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur shadow-sm">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Play className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </div>
                <CardHeader className="flex-grow pb-2">
                  <div className="flex items-center space-x-1 text-amber-500 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{course.rating || '4.8'}</span>
                    <span className="text-xs text-muted-foreground ml-1">({course.reviewCount || Math.floor(Math.random() * 500 + 50)})</span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center mt-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-3">
                      {course.mentorName?.substring(0,2).toUpperCase() || 'M'}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{course.mentorName || 'Mentor 3ITC'}</p>
                      <p className="text-xs text-muted-foreground">Expert Mentor</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      {course.price === 0 ? (
                        <span className="text-lg font-bold text-success">Gratis</span>
                      ) : (
                        <span className="text-lg font-bold text-foreground">Rp {course.price?.toLocaleString('id-ID')}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{course.level || 'Beginner'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border border-dashed">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Kursus Segera Hadir</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Kami sedang mempersiapkan materi pembelajaran terbaik untuk Anda. Nantikan update selanjutnya!</p>
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
            Lihat Semua Kursus
          </Button>
        </div>
      </Section>

      {/* Events Section */}
      <Section className="py-24 bg-secondary/5 dark:bg-muted/20 border-y border-border/50" id="event">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-secondary dark:text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Event & Webinar Mendatang
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ikuti sesi interaktif langsung dengan para ahli di bidangnya.
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {upcomingEvents.map((evt: any) => {
                const rawDate = evt.date || evt.startDate;
                let displayDate = rawDate || "Segera";
                if (rawDate) {
                  const d = new Date(rawDate);
                  if (!isNaN(d.getTime())) {
                    displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  }
                }
                const displayTime = evt.time || "19:00 WIB";

                return (
                  <Card key={evt.id} className="hover:shadow-lg transition-all duration-300 border-border/50 group overflow-hidden bg-card/80 backdrop-blur">
                    <div className="h-3 bg-gradient-to-r from-primary to-indigo-500 w-full" />
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize">
                          {evt.type || "Webinar"}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">
                            {displayDate}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {displayTime}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{evt.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">{evt.description || "Sesi interaktif bersama praktisi industri."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-foreground font-medium">{evt.speaker || "Praktisi Industri"}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MonitorPlay className="w-4 h-4 mr-2" />
                          Online via Zoom / Meet
                        </div>
                      </div>
                      <Button className="w-full mt-8 group-hover:bg-primary" variant="secondary" onClick={() => navigate('/login')}>
                        Daftar Event
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-16">
               <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
               <p className="text-lg text-muted-foreground">Belum ada event terjadwal dalam waktu dekat.</p>
             </div>
          )}
        </div>
      </Section>



      {/* Footer */}
      <footer className="bg-slate-950 dark:bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2">
              <div className="mb-6">
                <Logo variant="light" />
              </div>
              <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
                Platform pembelajaran digital interaktif yang membantu Anda mencapai potensi maksimal dalam karir dan pendidikan.
              </p>
              <div className="flex space-x-4">
                 <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white">
                   <span className="text-sm font-bold">In</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white">
                   <span className="text-sm font-bold">Ig</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white">
                   <span className="text-sm font-bold">Yt</span>
                 </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Instruktur</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">Kategori</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pemrograman</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Desain</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Marketing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Bisnis</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">Bantuan</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © 2026 3itcedu Digital Education. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0 text-slate-500 text-sm">
               <span>Indonesia (ID)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Slide-up Animated Popup Modal for Category & Feature Details ── */}
      {activePopupItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative p-6 bg-gradient-to-r from-primary/10 via-accent/20 to-transparent border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
                  {activePopupItem.data.icon?.startsWith("data:") || activePopupItem.data.icon?.startsWith("http") ? (
                    <img src={activePopupItem.data.icon} alt="" className="w-8 h-8 object-contain" />
                  ) : (
                    <DynIcon name={activePopupItem.data.icon || "Sparkles"} className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1 text-[10px] uppercase tracking-wider font-bold">
                    {activePopupItem.type === "category" ? "Kategori Pembelajaran" : "Fitur Unggulan 3ITC"}
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {activePopupItem.data.name || activePopupItem.data.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActivePopupItem(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {activePopupItem.data.detailImageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted shadow-md">
                  <img src={activePopupItem.data.detailImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Penjelasan Detail</h4>
                <p className="text-base text-foreground leading-relaxed">
                  {activePopupItem.data.description || activePopupItem.data.fullContent || "Detail penjelasan fitur dan kategori pembelajaran 3ITC Digital Education."}
                </p>
              </div>

              {Array.isArray(activePopupItem.data.highlights) && activePopupItem.data.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Keunggulan & Manfaat Utama</h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {activePopupItem.data.highlights.map((h: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-accent/30 border border-border/40 text-sm">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span className="font-medium text-foreground">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">3ITC Digital Education Platform</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => setActivePopupItem(null)}>
                  Tutup
                </Button>
                <Button className="flex-1 sm:flex-initial" onClick={() => { setActivePopupItem(null); navigate('/login'); }}>
                  Jelajahi Sekarang <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
