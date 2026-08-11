import { useState, useEffect, useRef } from "react";
import {
  User, Mail, Lock, MapPin, Phone, Globe, Github, Linkedin,
  GraduationCap, Camera, Check, ChevronRight,
  Building2, Twitter, ExternalLink, Trash2, Save, Upload,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { PageHeader, ConfirmDeleteModal } from "./shared";
import { useStore, type UserProfile } from "../store/Store";
import { type Role } from "../data/mock";
import { cn } from "./ui/utils";
import { toast } from "sonner";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="block text-sm font-medium text-secondary">{label}</label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const JOB_TYPES      = ["Full-time", "Part-time", "Internship", "Freelance", "Contract"];
const WORK_MODES     = ["Remote", "Hybrid", "On-site"];
const INDUSTRIES     = ["Technology", "Startup", "E-commerce", "Fintech", "EdTech", "Government", "Healthcare", "Creative Agency", "Consulting"];
const SALARY_RANGES  = ["< Rp 3 jt", "Rp 3–5 jt", "Rp 5–8 jt", "Rp 8–15 jt", "Rp 15–25 jt", "> Rp 25 jt"];
const SKILL_OPTIONS  = ["React", "Python", "TypeScript", "Node.js", "SQL", "Figma", "Machine Learning", "Data Analysis", "UI/UX Design", "Docker"];

function MultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const safeSelected = selected || [];
  const toggle = (o: string) => onChange(safeSelected.includes(o) ? safeSelected.filter(x => x !== o) : [...safeSelected, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const on = safeSelected.includes(o);
        return (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
              on ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:border-primary/50")}>
            {on && <Check className="size-3" />}{o}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tab: Basic Info ──────────────────────────────────────────────────────── */
function BasicInfoTab({ profile, onSave }: { profile: UserProfile; onSave: (p: Partial<UserProfile>) => void }) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const cleanLastName = (l: string) => l ? l.replace(/\s*\((Student|Mentor|Admin|Super Admin)\)/gi, "").trim() : "";

  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: cleanLastName(profile.lastName),
    headline: profile.headline, bio: profile.bio,
    phone: profile.phone, city: profile.city, dateOfBirth: profile.dateOfBirth,
    institution: profile.institution, major: profile.major,
    enrollYear: profile.enrollYear, graduateYear: profile.graduateYear,
    linkedin: profile.linkedin, github: profile.github,
    portfolio: profile.portfolio, twitter: profile.twitter,
    avatarUrl: profile.avatarUrl || "",
    bannerUrl: profile.bannerUrl || "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setForm({
      firstName: profile.firstName,
      lastName: cleanLastName(profile.lastName),
      headline: profile.headline, bio: profile.bio,
      phone: profile.phone, city: profile.city, dateOfBirth: profile.dateOfBirth,
      institution: profile.institution, major: profile.major,
      enrollYear: profile.enrollYear, graduateYear: profile.graduateYear,
      linkedin: profile.linkedin, github: profile.github,
      portfolio: profile.portfolio, twitter: profile.twitter,
      avatarUrl: profile.avatarUrl || "",
      bannerUrl: profile.bannerUrl || "",
    });
  }, [profile]);

function compressImage(dataUrl: string, maxWidth: number, maxHeight: number, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const rawResult = evt.target?.result as string;
      const compressed = await compressImage(rawResult, 300, 300, 0.8);
      set("avatarUrl", compressed);
      onSave({ avatarUrl: compressed });
      toast.success("Foto profil berhasil diunggah dan disimpan!");
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const rawResult = evt.target?.result as string;
      const compressed = await compressImage(rawResult, 1000, 400, 0.75);
      set("bannerUrl", compressed);
      onSave({ bannerUrl: compressed });
      toast.success("Banner profil berhasil diunggah dan disimpan!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input type="file" ref={photoInputRef} accept="image/*" onChange={handlePhotoFileChange} className="hidden" />
      <input type="file" ref={bannerInputRef} accept="image/*" onChange={handleBannerFileChange} className="hidden" />

      <Section title="Foto profil">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="size-20">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="size-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {form.firstName ? form.firstName[0].toUpperCase() : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-2 border-card bg-primary text-white shadow-sm hover:bg-primary/90 transition-transform active:scale-95"
              title="Ganti Foto Profil"
            >
              <Camera className="size-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} className="gap-1.5">
              <Upload className="size-3.5" /> Upload foto
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG atau GIF · maks. 2MB</p>
          </div>
        </div>
      </Section>

      <Separator />

      <Section title="Informasi personal">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama depan">
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Nama depan" className="pl-9" />
            </div>
          </Field>
          <Field label="Nama belakang">
            <Input value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Nama belakang" />
          </Field>
          <Field label="Headline" hint="Ditampilkan di bawah namamu">
            <Input value={form.headline} onChange={e => set("headline", e.target.value)} placeholder="cth: Frontend Developer · React Enthusiast" />
          </Field>
          <Field label="Banner Profil" hint="Pilih file gambar dari komputer untuk banner header profil">
            <div className="flex gap-2 items-center">
              <Button type="button" variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()} className="gap-1.5 border-dashed border-2 py-3 w-full justify-center text-xs">
                <Upload className="size-4 text-primary" /> {form.bannerUrl ? "Ganti File Banner Header" : "Upload File Banner Header"}
              </Button>
            </div>
          </Field>
          <Field label="Nomor telepon">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+62 812 3456 7890" className="pl-9" />
            </div>
          </Field>
          <Field label="Kota / lokasi">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="cth: Jakarta, Indonesia" className="pl-9" />
            </div>
          </Field>
          <Field label="Tanggal lahir">
            <Input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio" hint="Ceritakan tentang dirimu (maks. 300 karakter)">
              <Textarea value={form.bio} onChange={e => set("bio", e.target.value)}
                placeholder="Saya adalah seorang pelajar yang antusias di bidang teknologi…" rows={3} maxLength={300} />
            </Field>
          </div>
        </div>
      </Section>

      <Separator />

      <Section title="Pendidikan">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Institusi / sekolah">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.institution} onChange={e => set("institution", e.target.value)} placeholder="cth: SMAN 1 Jakarta" className="pl-9" />
            </div>
          </Field>
          <Field label="Jurusan / program studi">
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.major} onChange={e => set("major", e.target.value)} placeholder="cth: Teknik Informatika" className="pl-9" />
            </div>
          </Field>
          <Field label="Tahun masuk">
            <Input value={form.enrollYear} onChange={e => set("enrollYear", e.target.value)} placeholder="2022" />
          </Field>
          <Field label="Tahun lulus (estimasi)">
            <Input value={form.graduateYear} onChange={e => set("graduateYear", e.target.value)} placeholder="2026" />
          </Field>
        </div>
      </Section>

      <Separator />

      <Section title="Tautan sosial & portfolio">
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["LinkedIn",          Linkedin, "linkedin",  "linkedin.com/in/username"],
            ["GitHub",            Github,   "github",    "github.com/username"],
            ["Portfolio/Website", Globe,    "portfolio", "portfolioku.com"],
            ["Twitter / X",       Twitter,  "twitter",   "twitter.com/username"],
          ] as const).map(([label, Icon, key, ph]) => (
            <Field key={key} label={label}>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={ph} className="pl-9" />
              </div>
            </Field>
          ))}
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={() => { onSave(form); toast.success("Profil berhasil disimpan!"); }}>
          <Save className="size-4" /> Simpan perubahan
        </Button>
      </div>
    </div>
  );
}

/* ── Tab: Resume & Badge ─────────────────────────────────────────────────── */
function ResumeTab({ profile, onSave }: { profile: UserProfile; onSave: (p: Partial<UserProfile>) => void }) {
  const { state, actions } = useStore();
  const [showSharePopup, setShowSharePopup] = useState<{type: 'education' | 'experience'; text: string} | null>(null);

  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");

  const experiences = profile.experiences || [];
  const educations = profile.educations || [];

  const addExperience = () => {
    if (!expTitle || !expCompany) return;
    const newExp = { id: Date.now().toString(), title: expTitle, company: expCompany };
    const updated = [...experiences, newExp];
    onSave({ experiences: updated });
    setExpTitle(""); setExpCompany("");
    setShowSharePopup({ type: 'experience', text: `Saya baru saja menambahkan pengalaman baru sebagai ${newExp.title} di ${newExp.company}!` });
  };

  const deleteExperience = (id: string) => {
    onSave({ experiences: experiences.filter((e: any) => e.id !== id) });
  };

  const addEducation = () => {
    if (!eduSchool || !eduDegree) return;
    const newEdu = { id: Date.now().toString(), school: eduSchool, degree: eduDegree };
    const updated = [...educations, newEdu];
    onSave({ educations: updated });
    setEduSchool(""); setEduDegree("");
    setShowSharePopup({ type: 'education', text: `Saya telah memperbarui riwayat pendidikan saya di ${newEdu.school} (${newEdu.degree})!` });
  };

  const deleteEducation = (id: string) => {
    onSave({ educations: educations.filter((e: any) => e.id !== id) });
  };

  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string; type: "experience" | "education" } | null>(null);

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        title={deletingItem?.type === "experience" ? "Hapus Pengalaman Kerja" : "Hapus Riwayat Pendidikan"}
        itemName={deletingItem?.name}
        description="Apakah Anda yakin ingin menghapus riwayat profil ini?"
        onConfirm={() => {
          if (deletingItem) {
            if (deletingItem.type === "experience") deleteExperience(deletingItem.id);
            else deleteEducation(deletingItem.id);
            toast.success("Riwayat berhasil dihapus.");
          }
        }}
        onClose={() => setDeletingItem(null)}
      />

      <Section title="Badge Unggulan" description="Pilih 1 badge untuk dipajang di profil kamu">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(profile.earnedBadges || []).map((badgeId: string) => {
            const badge = (state.badges || []).find((b: any) => b.id === badgeId);
            if (!badge) return null;
            return (
              <button
                key={badgeId}
                onClick={() => {
                  if (actions.setFeaturedBadge) {
                    actions.setFeaturedBadge(badgeId);
                  } else {
                    onSave({ featuredBadgeId: badgeId });
                  }
                }}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  profile.featuredBadgeId === badgeId
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img src={badge.iconUrl || badge.imageUrl} alt={badge.name} className="size-12 rounded-full object-contain" />
                <span className="text-xs font-medium text-center">{badge.name}</span>
              </button>
            );
          })}
          {(profile.earnedBadges || []).length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full">Belum ada badge yang diperoleh</p>
          )}
        </div>
      </Section>

      <Separator />

      <Section title="Pengalaman Kerja" description="Tambahkan riwayat pekerjaan atau organisasi">
        <div className="space-y-4">
          {experiences.map((exp: any) => (
            <div key={exp.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold text-sm">{exp.title}</p>
                <p className="text-xs text-muted-foreground">{exp.company}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDeletingItem({ id: exp.id, name: `${exp.title} (${exp.company})`, type: "experience" })}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Posisi (cth: Frontend Dev)" value={expTitle} onChange={e => setExpTitle(e.target.value)} />
            <Input placeholder="Perusahaan" value={expCompany} onChange={e => setExpCompany(e.target.value)} />
            <Button onClick={addExperience}>Tambah</Button>
          </div>
        </div>
      </Section>

      <Separator />

      <Section title="Pendidikan (Lanjutan)" description="Tambahkan riwayat pendidikan lainnya">
        <div className="space-y-4">
          {educations.map((edu: any) => (
            <div key={edu.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold text-sm">{edu.school}</p>
                <p className="text-xs text-muted-foreground">{edu.degree}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDeletingItem({ id: edu.id, name: `${edu.school} - ${edu.degree}`, type: "education" })}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Sekolah / Universitas" value={eduSchool} onChange={e => setEduSchool(e.target.value)} />
            <Input placeholder="Gelar / Jurusan" value={eduDegree} onChange={e => setEduDegree(e.target.value)} />
            <Button onClick={addEducation}>Tambah</Button>
          </div>
        </div>
      </Section>

      {showSharePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border">
            <h3 className="text-lg font-bold mb-2">🎉 Bagikan ke Feeds Aktivitas?</h3>
            <p className="text-sm text-muted-foreground mb-4">{showSharePopup.text}</p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  actions.addFeedPost({
                    authorId: profile.id,
                    authorName: `${profile.firstName} ${profile.lastName}`.trim(),
                    authorRole: 'student',
                    content: showSharePopup.text,
                    authorAvatar: profile.avatarUrl,
                  });
                  setShowSharePopup(null);
                }}
              >
                Bagikan
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowSharePopup(null)}>
                Nanti Saja
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tab: Work Preferences ────────────────────────────────────────────────── */
function WorkPrefsTab({ profile, onSave }: { profile: UserProfile; onSave: (p: Partial<UserProfile>) => void }) {
  const [openToWork,      setOpenToWork]      = useState(profile.openToWork);
  const [jobTypes,        setJobTypes]        = useState<string[]>(profile.jobTypes || []);
  const [workModes,       setWorkModes]       = useState<string[]>(profile.workModes || []);
  const [industries,      setIndustries]      = useState<string[]>(profile.industries || []);
  const [salary,          setSalary]          = useState(profile.salaryRange);
  const [skills,          setSkills]          = useState<string[]>(profile.skills || []);
  const [skillInput,      setSkillInput]      = useState("");
  const [availableFrom,   setAvailableFrom]   = useState(profile.availableFrom);
  const [availabilityNote, setNote]           = useState(profile.availabilityNote);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(""); }
  };

  return (
    <div className="space-y-6">
      <Section title="Status pencarian kerja">
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="font-medium text-secondary">Terbuka untuk peluang kerja</p>
            <p className="text-sm text-muted-foreground">{openToWork ? "Profilmu terlihat oleh rekruter dan mitra 3ITC." : "Profilmu tersembunyi dari rekruter."}</p>
          </div>
          <Switch checked={openToWork} onCheckedChange={setOpenToWork} />
        </div>
      </Section>
      <Separator />
      <Section title="Tipe pekerjaan" description="Pilih semua yang sesuai">
        <MultiSelect options={JOB_TYPES} selected={jobTypes} onChange={setJobTypes} />
      </Section>
      <Separator />
      <Section title="Mode kerja">
        <MultiSelect options={WORK_MODES} selected={workModes} onChange={setWorkModes} />
      </Section>
      <Separator />
      <Section title="Industri yang diminati" description="Pilih hingga 5 industri">
        <MultiSelect options={INDUSTRIES} selected={industries} onChange={v => v.length <= 5 && setIndustries(v)} />
      </Section>
      <Separator />
      <Section title="Ekspektasi gaji">
        <div className="flex flex-wrap gap-2">
          {SALARY_RANGES.map(r => (
            <button key={r} type="button" onClick={() => setSalary(r)}
              className={cn("rounded-full border px-3 py-1 text-sm transition-colors",
                salary === r ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:border-primary/50")}>
              {r}
            </button>
          ))}
        </div>
      </Section>
      <Separator />
      <Section title="Skill & keahlian">
        <MultiSelect options={SKILL_OPTIONS} selected={skills} onChange={setSkills} />
        <div className="mt-3 flex gap-2">
          <Input value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSkill()}
            placeholder="Tambah skill lain…" className="max-w-xs" />
          <Button variant="outline" onClick={addSkill}>Tambah</Button>
        </div>
        {skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.filter(s => !SKILL_OPTIONS.includes(s)).map(s => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs text-secondary">
                {s}
                <button onClick={() => setSkills(skills.filter(x => x !== s))} className="text-muted-foreground hover:text-destructive">×</button>
              </span>
            ))}
          </div>
        )}
      </Section>
      <Separator />
      <Section title="Ketersediaan">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tersedia mulai">
            <Input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
          </Field>
          <Field label="Catatan tambahan" hint="opsional">
            <Input value={availabilityNote} onChange={e => setNote(e.target.value)} placeholder="cth: Tersedia setelah sidang skripsi" />
          </Field>
        </div>
      </Section>
      <div className="flex justify-end">
        <Button onClick={() => {
          onSave({ openToWork, jobTypes, workModes, industries, salaryRange: salary, skills, availableFrom, availabilityNote });
          toast.success("Preferensi kerja disimpan!");
        }}><Save className="size-4" /> Simpan preferensi</Button>
      </div>
    </div>
  );
}

/* ── Tab: Notifications ───────────────────────────────────────────────────── */
function NotificationsTab({ profile, onSave }: { profile: UserProfile; onSave: (p: Partial<UserProfile>) => void }) {
  const [prefs, setPrefs] = useState({
    notifCourseReminder: profile.notifCourseReminder,
    notifNewAssignment:  profile.notifNewAssignment,
    notifGradeReleased:  profile.notifGradeReleased,
    notifCertIssued:     profile.notifCertIssued,
    notifForumReply:     profile.notifForumReply,
    notifMentions:       profile.notifMentions,
    notifNewEvent:       profile.notifNewEvent,
    notifJobRec:         profile.notifJobRec,
    notifTalentViewed:   profile.notifTalentViewed,
    notifNewPartner:     profile.notifNewPartner,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const groups = [
    { label: "Pembelajaran", items: [
      { key: "notifCourseReminder" as const, label: "Pengingat kursus",        desc: "Ingatkan saat ada modul belum selesai" },
      { key: "notifNewAssignment"  as const, label: "Tugas baru",               desc: "Notifikasi saat mentor menetapkan tugas baru" },
      { key: "notifGradeReleased"  as const, label: "Nilai keluar",             desc: "Saat tugas atau kuis sudah dinilai" },
      { key: "notifCertIssued"     as const, label: "Sertifikat diterbitkan",   desc: "Saat kamu mendapatkan sertifikat baru" },
    ]},
    { label: "Komunitas", items: [
      { key: "notifForumReply"   as const, label: "Balasan forum",           desc: "Saat ada yang membalas thread-mu" },
      { key: "notifMentions"     as const, label: "Sebutan / mention",       desc: "Saat ada yang menyebutmu di diskusi" },
      { key: "notifNewEvent"     as const, label: "Event baru",              desc: "Pengumuman webinar dan event" },
    ]},
    { label: "Karier", items: [
      { key: "notifJobRec"       as const, label: "Rekomendasi karier",      desc: "Peluang kerja yang cocok untukmu" },
      { key: "notifTalentViewed" as const, label: "Profilmu dilihat rekruter", desc: "Notifikasi saat profilmu diintip" },
      { key: "notifNewPartner"   as const, label: "Mitra rekruter baru",    desc: "Saat ada perusahaan baru bergabung" },
    ]},
  ];

  return (
    <div className="space-y-6">
      {groups.map(g => (
        <Section key={g.label} title={g.label}>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {g.items.map(item => (
                <label key={item.key} className="flex cursor-pointer items-start justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-secondary">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} className="mt-0.5 shrink-0" />
                </label>
              ))}
            </CardContent>
          </Card>
        </Section>
      ))}
      <div className="flex justify-end">
        <Button onClick={() => { onSave(prefs); toast.success("Preferensi notifikasi disimpan!"); }}>
          <Save className="size-4" /> Simpan notifikasi
        </Button>
      </div>
    </div>
  );
}

/* ── Tab: Privacy ─────────────────────────────────────────────────────────── */
function PrivacyTab({ profile, onSave }: { profile: UserProfile; onSave: (p: Partial<UserProfile>) => void }) {
  const [prefs, setPrefs] = useState({
    publicProfile:     profile.publicProfile,
    showInTalentPool:  profile.showInTalentPool,
    showOnLeaderboard: profile.showOnLeaderboard,
    showCertificates:  profile.showCertificates,
    showPortfolio:     profile.showPortfolio,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const items = [
    { key: "publicProfile"     as const, label: "Profil publik",                   desc: "Profilmu bisa dilihat orang luar platform via link" },
    { key: "showInTalentPool"  as const, label: "Tampil di talent pool",            desc: "Rekruter mitra 3ITC bisa menemukan profilmu" },
    { key: "showOnLeaderboard" as const, label: "Tampil di leaderboard",            desc: "Namamu muncul di papan peringkat komunitas" },
    { key: "showCertificates"  as const, label: "Tampilkan sertifikat di profil",   desc: "Sertifikat terlihat oleh pengunjung profil" },
    { key: "showPortfolio"     as const, label: "Tampilkan portfolio di profil",    desc: "Project dan karya terlihat oleh pengunjung" },
  ];

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `3itc_profile_${profile.firstName || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Data profil berhasil diekspor ke JSON!");
  };

  return (
    <div className="space-y-6">
      <Section title="Visibilitas profil" description="Atur siapa yang bisa melihat profilmu">
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {items.map(item => (
              <label key={item.key} className="flex cursor-pointer items-start justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-secondary">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} className="mt-0.5 shrink-0" />
              </label>
            ))}
          </CardContent>
        </Card>
      </Section>
      <Separator />
      <Section title="Data & privasi">
        <div className="space-y-3">
          <Card onClick={handleExportData} className="cursor-pointer p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Unduh data saya</p>
                <p className="text-xs text-muted-foreground">Ekspor semua data akun dalam format JSON</p>
              </div>
              <ExternalLink className="size-4 text-muted-foreground" />
            </div>
          </Card>
          <Card onClick={() => toast.info("Semua log aktivitas Anda tercatat aman.")} className="cursor-pointer p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Riwayat aktivitas</p>
                <p className="text-xs text-muted-foreground">Lihat log aktivitas di platform</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </Section>
      <div className="flex justify-end">
        <Button onClick={() => { onSave(prefs); toast.success("Pengaturan privasi disimpan!"); }}>
          <Save className="size-4" /> Simpan privasi
        </Button>
      </div>
    </div>
  );
}

/* ── Tab: Account & Security ──────────────────────────────────────────────── */
function AccountTab({ onLogout }: { onLogout: () => void }) {
  const { state, actions } = useStore();
  const [email,      setEmail]      = useState(state.profile?.email || "");
  const [pass,       setPass]       = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [twofa,      setTwofa]      = useState(false);
  const [loginAlert, setLoginAlert] = useState(true);

  useEffect(() => {
    if (state.profile?.email) {
      setEmail(state.profile.email);
    }
  }, [state.profile?.email]);

  const handleUpdateCredentials = () => {
    if (pass && pass.length < 6) {
      toast.error("Password baru minimal 6 karakter!");
      return;
    }
    if (pass && pass !== confirm) {
      toast.error("Password dan konfirmasi password tidak cocok!");
      return;
    }

    const currentEmail = state.profile?.email || "";
    const existingUser = state.users.find(
      u => (u.email || "").toLowerCase() === currentEmail.toLowerCase() ||
           u.id === state.profile?.id ||
           (u.email || "").toLowerCase() === email.toLowerCase()
    );

    const targetId = existingUser?.id || `user-${(email || currentEmail || "user").replace(/[^a-zA-Z0-9]/g, "-")}`;
    const targetName = existingUser?.name || `${state.profile?.firstName || "User"} ${state.profile?.lastName || ""}`.trim();
    const updatedPass = pass ? pass.trim() : (existingUser?.password || "gaadapasswordnya");
    const updatedEmail = email.trim() || currentEmail || "user@3itcedu.id";

    // 1. Update user account in Store & Firestore
    actions.updateUser({
      id: targetId,
      name: targetName,
      email: updatedEmail,
      password: updatedPass,
      institution: state.profile?.institution || "3ITC Digital Education",
      role: existingUser?.role || "Student",
      status: existingUser?.status || "Active",
    });

    // 2. Update current active profile
    actions.updateProfile({
      email: updatedEmail,
    });

    toast.success("Kredensial & Password baru berhasil diperbarui!");
    setPass("");
    setConfirm("");
  };

  return (
    <div className="space-y-6">
      <Section title="Kredensial akun">
        <Card className="p-5 space-y-4">
          <Field label="Alamat email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@institusi.id" className="pl-9" />
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password baru">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" className="pl-9" />
              </div>
            </Field>
            <Field label="Konfirmasi password baru">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className="pl-9" />
              </div>
            </Field>
          </div>
          <Button onClick={handleUpdateCredentials}><Save className="size-4" /> Perbarui kredensial</Button>
        </Card>
      </Section>

      <Separator />

      <Section title="Keamanan">
        <Card>
          <CardContent className="divide-y divide-border p-0">
            <label className="flex cursor-pointer items-start justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-secondary">Autentikasi dua faktor (2FA)</p>
                <p className="text-xs text-muted-foreground">Tambahan lapisan keamanan saat login</p>
              </div>
              <Switch checked={twofa} onCheckedChange={setTwofa} className="mt-0.5 shrink-0" />
            </label>
            <label className="flex cursor-pointer items-start justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-secondary">Login notifikasi</p>
                <p className="text-xs text-muted-foreground">Kirim email saat ada login dari perangkat baru</p>
              </div>
              <Switch checked={loginAlert} onCheckedChange={setLoginAlert} className="mt-0.5 shrink-0" />
            </label>
          </CardContent>
        </Card>
      </Section>

      <Separator />

      <Section title="Sesi aktif">
        <Card className="p-5">
          {[
            { device: "Chrome · MacBook Pro", location: "Jakarta, Indonesia", time: "Sekarang (sesi ini)", current: true },
            { device: "Safari · iPhone 14",   location: "Bandung, Indonesia", time: "2 jam lalu",          current: false },
          ].map(s => (
            <div key={s.device} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-secondary">
                  {s.device}
                  {s.current && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-success">Aktif</span>}
                </p>
                <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" className="text-destructive text-xs"
                  onClick={() => toast.success("Sesi berhasil dikeluarkan.")}>
                  Keluarkan
                </Button>
              )}
            </div>
          ))}
        </Card>
      </Section>

      <Separator />

      <Section title="Danger zone">
        <Card className="border-destructive/30 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-medium text-secondary">Hapus akun</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Semua data, progress, sertifikat, dan portfolio akan dihapus permanen.
              </p>
            </div>
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/5 shrink-0"
              onClick={() => toast.error("Fitur ini memerlukan konfirmasi admin.")}>
              <Trash2 className="size-4" /> Hapus akun
            </Button>
          </div>
        </Card>
      </Section>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export function ProfilePage({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const { state, actions } = useStore();
  const profile = state.profile;
  const isAdmin = role === "admin" || role === "superadmin";

  const save = (patch: Partial<UserProfile>) => actions.updateProfile(patch);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profil Saya" subtitle="Kelola identitas, preferensi karier, dan pengaturan akun" />

      {/* Live Profile Header Banner Card */}
      <Card className="overflow-hidden mb-6 border-border/80 shadow-md">
        <div className="relative h-44 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900">
          {profile.bannerUrl ? (
            <img src={profile.bannerUrl} alt="Banner Profil" className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/40 via-indigo-600/30 to-transparent" />
          )}
        </div>
        <div className="px-6 pb-6 pt-0 relative bg-card">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-14 mb-3">
            <Avatar className="size-28 border-4 border-card shadow-xl ring-2 ring-primary/20">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Foto Profil" className="size-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-primary text-white text-3xl font-extrabold">
                  {profile.firstName ? profile.firstName[0].toUpperCase() : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize px-3 py-1 text-xs font-semibold">
                {role}
              </Badge>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {`${profile.firstName} ${profile.lastName}`.trim() || "Nama Pengguna"}
            </h2>
            <p className="text-sm text-primary font-semibold mt-0.5">
              {profile.headline || `${role} at 3ITC Digital Education`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span>{profile.institution || "3ITC Digital Education"}</span>
              {profile.city && (
                <>
                  <span>•</span>
                  <span>{profile.city}</span>
                </>
              )}
            </p>
            {profile.bio && (
              <p className="text-sm text-foreground/80 mt-3 whitespace-pre-line leading-relaxed max-w-2xl border-t border-border/50 pt-3">
                {profile.bio}
              </p>
            )}

            {profile.featuredBadgeId && (() => {
              const badge = (state.badges || []).find((b: any) => b.id === profile.featuredBadgeId);
              return badge ? (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  <img src={badge.iconUrl || badge.imageUrl} alt={badge.name} className="size-8 rounded-full object-contain border-2 border-amber-400 p-0.5 bg-background shrink-0" />
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{badge.name}</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
          {!isAdmin && <TabsTrigger value="resume">Resume & Badge</TabsTrigger>}
          {!isAdmin && <TabsTrigger value="work">Preferensi Kerja</TabsTrigger>}
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          {!isAdmin && <TabsTrigger value="privacy">Privasi</TabsTrigger>}
          <TabsTrigger value="account">Akun & Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoTab profile={profile} onSave={save} />
        </TabsContent>
        {!isAdmin && (
          <TabsContent value="resume">
            <ResumeTab profile={profile} onSave={save} />
          </TabsContent>
        )}
        {!isAdmin && (
          <TabsContent value="work">
            <WorkPrefsTab profile={profile} onSave={save} />
          </TabsContent>
        )}
        <TabsContent value="notifications">
          <NotificationsTab profile={profile} onSave={save} />
        </TabsContent>
        {!isAdmin && (
          <TabsContent value="privacy">
            <PrivacyTab profile={profile} onSave={save} />
          </TabsContent>
        )}
        <TabsContent value="account">
          <AccountTab onLogout={onLogout} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
