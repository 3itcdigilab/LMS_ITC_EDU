import { useState, useRef } from "react";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Video, BookOpen, FileText,
  ClipboardCheck, Globe, Save, Check, ChevronDown, ChevronRight,
  Image as ImageIcon, Youtube, AlignLeft, ListChecks, PenLine, CheckCircle2,
  Upload, ChevronUp, ArrowUp, ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  useStore, type Course, type CourseModule, type CourseLesson,
  type QuizQuestion, type QuizOption, type EssayQuestion,
} from "../store/Store";
import { categories } from "../data/mock";
import { cn } from "./ui/utils";
import { toast } from "sonner";

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

// ─── Image uploader (file + URL) ──────────────────────────────────────────────
function ThumbnailUploader({ value = "", onChange }: { value?: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const safeVal = typeof value === "string" ? value : "";
  const [tab, setTab] = useState<"file" | "url">(safeVal && !safeVal.startsWith("data:") ? "url" : "file");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { return; }
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-0.5 w-fit">
        {(["file", "url"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {t === "file" ? "Upload File" : "URL Gambar"}
          </button>
        ))}
      </div>

      {tab === "file" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <Upload className="size-5" />
            <span>Pilih gambar dari komputer</span>
          </button>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP — maks. 5MB</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={safeVal.startsWith("data:") ? "" : safeVal}
              onChange={e => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-border bg-card px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {safeVal && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted h-36">
          <img src={safeVal} alt="preview" className="size-full object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── String list input ────────────────────────────────────────────────────────
function StringListInput({ label, hint, items, placeholder, onChange }: {
  label: string; hint?: string; items: string[]; placeholder: string; onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v) { onChange([...items, v]); setInput(""); } };
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-secondary">{label}</label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="space-y-1.5">
        {(Array.isArray(items) ? items : []).map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Check className="size-3.5 shrink-0 text-success" />
            <span className="flex-1 text-sm">{item}</span>
            <button onClick={() => onChange((Array.isArray(items) ? items : []).filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder={placeholder} className="flex-1" />
          <Button variant="outline" onClick={add}><Plus className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}

// ─── Video content editor ─────────────────────────────────────────────────────
function VideoEditor({ lesson, onUpdate }: { lesson: CourseLesson; onUpdate: (p: Partial<CourseLesson>) => void }) {
  const videoUrl = String(lesson.videoUrl ?? "");
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const embedId = videoUrl.includes("v=") ? videoUrl.split("v=")[1]?.split("&")[0]
    : videoUrl.includes("youtu.be/") ? videoUrl.split("youtu.be/")[1]?.split("?")[0] : "";

  return (
    <div className="space-y-3 pt-3">
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
          <Youtube className="size-4 text-red-500" /> Link Video / YouTube
        </label>
        <Input value={videoUrl} onChange={e => onUpdate({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=... atau link video lainnya" />
        <p className="mt-1 text-xs text-muted-foreground">Mendukung YouTube, Vimeo, atau URL video langsung.</p>
      </div>
      {isYoutube && embedId && (
        <div className="overflow-hidden rounded-xl aspect-video bg-black">
          <iframe className="size-full" src={`https://www.youtube.com/embed/${embedId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen title="preview" />
        </div>
      )}
      {videoUrl && !isYoutube && (
        <div className="rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground flex items-center gap-2">
          <Video className="size-4" /> Link video disimpan: <span className="truncate text-primary">{videoUrl}</span>
        </div>
      )}
    </div>
  );
}

// ─── Reading content editor ───────────────────────────────────────────────────
function ReadingEditor({ lesson, onUpdate }: { lesson: CourseLesson; onUpdate: (p: Partial<CourseLesson>) => void }) {
  return (
    <div className="space-y-3 pt-3">
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
          <AlignLeft className="size-4 text-primary" /> Konten bacaan
        </label>
        <Textarea
          value={lesson.content ?? ""}
          onChange={e => onUpdate({ content: e.target.value })}
          rows={12}
          placeholder={"Tulis materi bacaan di sini...\n\nGunakan baris kosong untuk memisahkan paragraf.\n\nContoh:\n## Subjudul\nIsi materi..."}
          className="font-mono text-sm leading-relaxed"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {(lesson.content ?? "").length} karakter · Mendukung teks biasa.
        </p>
      </div>
    </div>
  );
}

// ─── Quiz editor ──────────────────────────────────────────────────────────────
function QuizEditor({ lesson, onUpdate }: { lesson: CourseLesson; onUpdate: (p: Partial<CourseLesson>) => void }) {
  const questions: QuizQuestion[] = Array.isArray(lesson?.questions) ? lesson.questions : [];

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: uid(), question: "",
      options: [
        { id: uid(), text: "" }, { id: uid(), text: "" },
        { id: uid(), text: "" }, { id: uid(), text: "" },
      ],
      correctId: "", explanation: "",
    };
    onUpdate({ questions: [...questions, newQ] });
  };

  const updateQuestion = (qid: string, patch: Partial<QuizQuestion>) =>
    onUpdate({ questions: questions.map(q => q.id === qid ? { ...q, ...patch } : q) });

  const deleteQuestion = (qid: string) =>
    onUpdate({ questions: questions.filter(q => q.id !== qid) });

  const updateOption = (qid: string, oid: string, text: string) =>
    updateQuestion(qid, {
      options: (questions.find(q => q.id === qid)?.options ?? []).map(o => o.id === oid ? { ...o, text } : o),
    });

  return (
    <div className="space-y-4 pt-3">
      {/* KKM + batas percobaan */}
      <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border bg-muted/40 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">KKM — Nilai kelulusan minimum (%)</label>
          <div className="relative">
            <Input
              type="number" min={0} max={100}
              value={lesson.kkm ?? 0}
              onChange={e => onUpdate({ kkm: Math.min(100, Math.max(0, Number(e.target.value))) })}
              className="pr-8 text-sm" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">0 = tidak ada batas minimum</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Batas percobaan</label>
          <Input
            type="number" min={0}
            value={lesson.maxAttempts ?? 0}
            onChange={e => onUpdate({ maxAttempts: Math.max(0, Number(e.target.value)) })}
            className="text-sm" />
          <p className="mt-0.5 text-[10px] text-muted-foreground">0 = percobaan tidak terbatas</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-medium">
          <ListChecks className="size-4 text-primary" /> {questions.length} soal pilihan ganda
        </p>
        <Button size="sm" onClick={addQuestion}><Plus className="size-4" /> Tambah soal</Button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
          Belum ada soal. Klik "Tambah soal" untuk mulai membuat kuis.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-white font-medium">{qi + 1}</span>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Pertanyaan</label>
                    <Textarea value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      rows={2} placeholder="Tulis pertanyaan di sini..." className="text-sm" />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Pilihan jawaban — klik radio untuk menandai jawaban benar</label>
                    <div className="space-y-2">
                      {(q.options ?? []).map((opt, oi) => {
                        const isCorrect = q.correctId === opt.id;
                        return (
                          <div key={opt.id} className={cn("flex items-center gap-2 rounded-lg border p-2 transition-colors",
                            isCorrect ? "border-success bg-green-50 dark:bg-green-950/30" : "border-border")}>
                            <button
                              onClick={() => updateQuestion(q.id, { correctId: opt.id })}
                              className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                isCorrect ? "border-success bg-success" : "border-muted-foreground hover:border-success")}
                            >
                              {isCorrect && <Check className="size-3 text-white" />}
                            </button>
                            <span className="shrink-0 text-xs font-medium text-muted-foreground w-4">
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            <Input value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)}
                              placeholder={`Pilihan ${String.fromCharCode(65 + oi)}`}
                              className={cn("flex-1 text-sm border-transparent bg-transparent shadow-none px-0",
                                "focus-visible:border-border focus-visible:bg-card focus-visible:px-3")} />
                            {isCorrect && <Badge variant="secondary" className="text-success shrink-0">Benar</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Penjelasan jawaban (opsional)</label>
                    <Input value={q.explanation ?? ""} onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                      placeholder="Jelaskan mengapa jawaban tersebut benar..." className="text-sm" />
                  </div>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="mt-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))}
          <button onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Plus className="size-4" /> Tambah soal baru
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Assignment / Essay editor ────────────────────────────────────────────────
function AssignmentEditor({ lesson, onUpdate }: { lesson: CourseLesson; onUpdate: (p: Partial<CourseLesson>) => void }) {
  const questions: EssayQuestion[] = Array.isArray(lesson?.essayQuestions) ? lesson.essayQuestions : [];

  const addQuestion = () => {
    const newQ: EssayQuestion = { id: uid(), question: "", maxScore: 100, rubric: "" };
    onUpdate({ essayQuestions: [...questions, newQ] });
  };

  const updateQuestion = (id: string, patch: Partial<EssayQuestion>) =>
    onUpdate({ essayQuestions: questions.map(q => q.id === id ? { ...q, ...patch } : q) });

  const deleteQuestion = (id: string) =>
    onUpdate({ essayQuestions: questions.filter(q => q.id !== id) });

  return (
    <div className="space-y-4 pt-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-medium">
          <PenLine className="size-4 text-primary" /> {questions.length} soal esai
        </p>
        <Button size="sm" onClick={addQuestion}><Plus className="size-4" /> Tambah soal</Button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
          Belum ada soal esai. Klik "Tambah soal" untuk membuat tugas esai.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-white font-medium">{qi + 1}</span>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Soal esai</label>
                    <Textarea value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      rows={3} placeholder="Tulis soal esai di sini. Contoh: Jelaskan perbedaan antara props dan state dalam React..." className="text-sm" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Skor maksimal</label>
                      <Input type="number" min={1} max={1000} value={q.maxScore}
                        onChange={e => updateQuestion(q.id, { maxScore: Number(e.target.value) })}
                        className="text-sm" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Rubrik penilaian <span className="text-muted-foreground/60">(untuk mentor)</span>
                      </label>
                      <Textarea value={q.rubric} onChange={e => updateQuestion(q.id, { rubric: e.target.value })}
                        rows={2} placeholder="Kriteria penilaian: kelengkapan jawaban (40%), kedalaman analisis (40%), bahasa (20%)..." className="text-sm" />
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="mt-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))}
          <button onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Plus className="size-4" /> Tambah soal esai
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Lesson row (expandable) ──────────────────────────────────────────────────
const LESSON_TYPE_CONFIG = {
  video:      { label: "Video",   icon: Video,         color: "text-red-500" },
  reading:    { label: "Bacaan",  icon: AlignLeft,     color: "text-blue-500" },
  quiz:       { label: "Kuis",    icon: ListChecks,    color: "text-amber-500" },
  assignment: { label: "Tugas",   icon: PenLine,       color: "text-purple-500" },
} as const;

function LessonRow({ lesson, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  lesson: CourseLesson; onUpdate: (p: Partial<CourseLesson>) => void; onDelete: () => void;
  onMoveUp?: () => void; onMoveDown?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rawType = String(lesson?.type || "video").toLowerCase();
  const typeKey = (rawType in LESSON_TYPE_CONFIG ? rawType : "video") as keyof typeof LESSON_TYPE_CONFIG;
  const cfg = LESSON_TYPE_CONFIG[typeKey] || LESSON_TYPE_CONFIG.video;
  const Icon = cfg.icon;

  const contentSummary = (() => {
    if (typeKey === "video")      return lesson?.videoUrl ? "✓ Link video tersimpan" : "Belum ada link";
    if (typeKey === "reading")    return lesson?.content ? `${lesson.content.length} karakter` : "Belum ada konten";
    if (typeKey === "quiz")       return `${(Array.isArray(lesson?.questions) ? lesson.questions : []).length} soal`;
    if (typeKey === "assignment") return `${(Array.isArray(lesson?.essayQuestions) ? lesson.essayQuestions : []).length} soal esai`;
    return "";
  })();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header row */}
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/30 cursor-grab select-none" />
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={!onMoveUp}
            className="grid size-4 place-items-center rounded text-muted-foreground disabled:opacity-20 hover:bg-muted hover:text-foreground transition-colors">
            <ArrowUp className="size-3" />
          </button>
          <button onClick={onMoveDown} disabled={!onMoveDown}
            className="grid size-4 place-items-center rounded text-muted-foreground disabled:opacity-20 hover:bg-muted hover:text-foreground transition-colors">
            <ArrowDown className="size-3" />
          </button>
        </div>
        <div className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-muted", cfg.color)}>
          <Icon className="size-3.5" />
        </div>
        <Input value={lesson.title} onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Judul pelajaran"
          className="flex-1 border-transparent bg-transparent px-0 text-sm shadow-none focus-visible:border-border focus-visible:bg-background focus-visible:px-3" />
        <select value={lesson.type} onChange={e => onUpdate({ type: e.target.value as CourseLesson["type"] })}
          className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
          {Object.entries(LESSON_TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
        {lesson.type === "video" && (
          <Input value={lesson.duration ?? ""} onChange={e => onUpdate({ duration: e.target.value })}
            placeholder="mm:ss"
            className="w-16 border-transparent bg-transparent px-0 text-center text-xs shadow-none focus-visible:border-border focus-visible:bg-background focus-visible:px-2" />
        )}
        <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <input type="checkbox" checked={lesson.isFree ?? false} onChange={e => onUpdate({ isFree: e.target.checked })}
            className="accent-[var(--primary)]" /> Gratis
        </label>
        <button onClick={() => setExpanded(!expanded)}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <button onClick={onDelete} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Content summary badge */}
      {!expanded && (
        <div className="border-t border-border/50 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">{contentSummary}</span>
        </div>
      )}

      {/* Expanded content editor */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          {lesson.type === "video"      && <VideoEditor lesson={lesson} onUpdate={onUpdate} />}
          {lesson.type === "reading"    && <ReadingEditor lesson={lesson} onUpdate={onUpdate} />}
          {lesson.type === "quiz"       && <QuizEditor lesson={lesson} onUpdate={onUpdate} />}
          {lesson.type === "assignment" && <AssignmentEditor lesson={lesson} onUpdate={onUpdate} />}
        </div>
      )}
    </div>
  );
}

// ─── Reorder helpers ─────────────────────────────────────────────────────────
function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ─── Module card ──────────────────────────────────────────────────────────────
function ModuleCard({ module, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  module: CourseModule; index: number; total: number;
  onUpdate: (p: Partial<CourseModule>) => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);
  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

  const addLesson = () => onUpdate({
    lessons: [...lessons, {
      id: uid(), title: "", type: "video", duration: "", isFree: false,
      videoUrl: "", content: "", questions: [], essayQuestions: [], kkm: 0, maxAttempts: 0,
    }],
  });

  const updateLesson = (lid: string, patch: Partial<CourseLesson>) =>
    onUpdate({ lessons: lessons.map(l => l.id === lid ? { ...l, ...patch } : l) });

  const deleteLesson = (lid: string) =>
    onUpdate({ lessons: lessons.filter(l => l.id !== lid) });

  const moveLessonUp = (i: number) => i > 0 && onUpdate({ lessons: moveItem(lessons, i, i - 1) });
  const moveLessonDown = (i: number) => i < lessons.length - 1 && onUpdate({ lessons: moveItem(lessons, i, i + 1) });

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        {/* Module position arrows */}
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={index === 0}
            className="grid size-5 place-items-center rounded text-muted-foreground transition-colors disabled:opacity-20 hover:bg-muted hover:text-foreground">
            <ArrowUp className="size-3" />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="grid size-5 place-items-center rounded text-muted-foreground transition-colors disabled:opacity-20 hover:bg-muted hover:text-foreground">
            <ArrowDown className="size-3" />
          </button>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">Sesi {index + 1}</span>
        <Input value={module.title} onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Judul sesi / modul"
          className="flex-1 border-transparent bg-transparent px-0 font-medium shadow-none focus-visible:border-border focus-visible:bg-background focus-visible:px-3" />
        <span className="shrink-0 text-xs text-muted-foreground">{lessons.length} pelajaran</span>
        <button onClick={() => setOpen(!open)} className="text-muted-foreground">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="size-4" />
        </button>
      </div>
      {open && (
        <CardContent className="border-t border-border pt-3 space-y-2">
          {lessons.map((l, li) => (
            <div
              key={l.id}
              draggable
              onDragStart={() => { dragIdx.current = li; }}
              onDragOver={e => { e.preventDefault(); setDragOverIdx(li); }}
              onDrop={e => {
                e.preventDefault();
                if (dragIdx.current !== null && dragIdx.current !== li) {
                  onUpdate({ lessons: moveItem(lessons, dragIdx.current, li) });
                }
                dragIdx.current = null; setDragOverIdx(null);
              }}
              onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null); }}
              className={cn("transition-all", dragOverIdx === li && dragIdx.current !== li && "ring-2 ring-primary/40 rounded-xl")}
            >
              <LessonRow
                lesson={l}
                onUpdate={patch => updateLesson(l.id, patch)}
                onDelete={() => deleteLesson(l.id)}
                onMoveUp={li > 0 ? () => moveLessonUp(li) : undefined}
                onMoveDown={li < lessons.length - 1 ? () => moveLessonDown(li) : undefined}
              />
            </div>
          ))}
          <button onClick={addLesson}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Plus className="size-4" /> Tambah pelajaran
          </button>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Curriculum drag list ─────────────────────────────────────────────────────
function CurriculumDragList({ curriculum, onUpdate, onDelete, onMove }: {
  curriculum: CourseModule[];
  onUpdate: (mid: string, patch: Partial<CourseModule>) => void;
  onDelete: (mid: string) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);
  const curr = Array.isArray(curriculum) ? curriculum : [];

  return (
    <div className="space-y-3">
      {curr.map((m, i) => (
        <div
          key={m.id}
          draggable
          onDragStart={() => { dragIdx.current = i; }}
          onDragOver={e => { e.preventDefault(); setDragOverIdx(i); }}
          onDrop={e => {
            e.preventDefault();
            if (dragIdx.current !== null && dragIdx.current !== i) {
              onMove(dragIdx.current, i);
            }
            dragIdx.current = null; setDragOverIdx(null);
          }}
          onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null); }}
          className={cn("transition-all", dragOverIdx === i && dragIdx.current !== i && "ring-2 ring-primary/40 rounded-xl")}
        >
          <ModuleCard
            module={m}
            index={i}
            total={curriculum.length}
            onUpdate={patch => onUpdate(m.id, patch)}
            onDelete={() => onDelete(m.id)}
            onMoveUp={() => onMove(i, i - 1)}
            onMoveDown={() => onMove(i, i + 1)}
          />
        </div>
      ))}
    </div>
  );
}

import React from "react";

class CourseEditorErrorBoundary extends React.Component<
  { children: React.ReactNode; onBack: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onBack: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CourseEditor Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl border border-destructive/20 bg-card text-center space-y-4 max-w-xl mx-auto my-8">
          <h2 className="text-lg font-bold text-destructive">Kendala pada Editor Kursus</h2>
          <p className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded-lg overflow-x-auto text-left">
            {this.state.error?.message || "Unknown rendering error"}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={this.props.onBack}>
              Kembali ke Daftar Kursus
            </Button>
            <Button onClick={() => this.setState({ hasError: false, error: null })}>
              Coba Lagi
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main CourseEditor Inner ──────────────────────────────────────────────────
function CourseEditorInner({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const { state, actions } = useStore();
  const original = (state.courses || []).find(c => c && c.id === courseId);

  const defaultCategoryName = typeof categories?.[0] === "string" ? categories[0] : categories?.[0]?.name || "Programming";

  const defaultCourse: Course = {
    id: courseId, title: "", subtitle: "", category: defaultCategoryName,
    level: "Beginner", language: "Bahasa Indonesia", thumbnail: "",
    mentorId: "", mentorName: "", mentorBio: "",
    rating: 0, learners: 0, hours: 0,
    summary: "", description: "", objectives: [], prerequisites: [],
    targetAudience: "", curriculum: [], price: 0, discountPercent: 0,
    status: "draft", certificateEnabled: true, enrollmentLimit: 0,
    tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };

  const [course, setCourse] = useState<Course>(() => {
    const merged = { ...defaultCourse, ...(original || {}) };
    return {
      ...merged,
      title: merged.title || "",
      subtitle: merged.subtitle || "",
      category: merged.category || defaultCategoryName,
      level: merged.level || "Beginner",
      language: merged.language || "Bahasa Indonesia",
      thumbnail: merged.thumbnail || "",
      mentorId: merged.mentorId || "",
      mentorName: merged.mentorName || "",
      mentorBio: merged.mentorBio || "",
      summary: merged.summary || "",
      description: merged.description || "",
      objectives: Array.isArray(merged.objectives) ? merged.objectives : [],
      prerequisites: Array.isArray(merged.prerequisites) ? merged.prerequisites : [],
      targetAudience: merged.targetAudience || "",
      curriculum: Array.isArray(merged.curriculum) ? merged.curriculum : [],
      price: typeof merged.price === "number" ? merged.price : (typeof merged.price === "string" && merged.price !== "Free" ? parseInt((merged.price as string).replace(/\D/g, ""), 10) * 1000 || 0 : 0),
      discountPercent: typeof merged.discountPercent === "number" ? merged.discountPercent : 0,
      status: merged.status || "draft",
      certificateEnabled: merged.certificateEnabled ?? true,
      enrollmentLimit: merged.enrollmentLimit || 0,
      tags: Array.isArray(merged.tags) ? merged.tags : [],
      allowedInstitutions: Array.isArray(merged.allowedInstitutions) ? merged.allowedInstitutions : [],
    };
  });
  const set = (patch: Partial<Course>) => setCourse(c => ({ ...c, ...patch }));

  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
  const addModule = () => set({ curriculum: [...curriculum, { id: uid(), title: "", lessons: [] }] });
  const updateModule = (mid: string, patch: Partial<CourseModule>) =>
    set({ curriculum: curriculum.map(m => m.id === mid ? { ...m, ...patch } : m) });
  const deleteModule = (mid: string) =>
    set({ curriculum: curriculum.filter(m => m.id !== mid) });
  const moveModule = (from: number, to: number) =>
    set({ curriculum: moveItem(curriculum, from, to) });

  const totalLessons = curriculum.reduce((acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);
  const totalHours = curriculum.reduce((acc, m) =>
    acc + (Array.isArray(m?.lessons) ? m.lessons : []).reduce((a, l) => {
      const [min, sec] = String(l?.duration || "0:00").split(":").map(Number);
      return a + (min || 0) + (sec || 0) / 60;
    }, 0), 0);

  const save = (newStatus?: Course["status"]) => {
    try {
      const toSave = {
        ...course,
        ...(newStatus ? { status: newStatus } : {}),
        hours: Math.round(totalHours || 0),
        price: Number(course.price || 0),
        discountPercent: Number(course.discountPercent || 0),
        objectives: Array.isArray(course.objectives) ? course.objectives : [],
        prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
        tags: Array.isArray(course.tags) ? course.tags : [],
        allowedInstitutions: Array.isArray(course.allowedInstitutions) ? course.allowedInstitutions : [],
        curriculum: Array.isArray(course.curriculum) ? course.curriculum : [],
      };
      actions.updateCourse(toSave);
      setCourse(toSave);
      toast.success(newStatus === "published"
        ? "Kursus dipublikasikan! Pelajar dapat melihat dan enroll."
        : "Kursus berhasil disimpan.");
    } catch (err: any) {
      toast.error(`Gagal menyimpan: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /> Kembali ke daftar kursus
        </button>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium",
            course.status === "published" ? "bg-green-50 text-success dark:bg-green-950 dark:text-green-400" :
            course.status === "archived"  ? "bg-muted text-muted-foreground" :
            "bg-amber-50 text-warning dark:bg-amber-950 dark:text-amber-400")}>
            {course.status === "published" ? "Published" : course.status === "archived" ? "Archived" : "Draft"}
          </span>
          <Button variant="outline" onClick={() => save()}><Save className="size-4" /> Simpan</Button>
          {course.status !== "published"
            ? <Button onClick={() => save("published")}><Globe className="size-4" /> Publish</Button>
            : <Button variant="outline" onClick={() => save("draft")} className="text-warning border-warning/40">Kembalikan ke draft</Button>}
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-6 flex flex-wrap gap-6 rounded-xl border border-border bg-card px-5 py-3">
        {[["Sesi", curriculum.length], ["Pelajaran", totalLessons], ["Durasi", `~${Math.round(totalHours)}h`]].map(([l, v]) => (
          <div key={l as string}><p className="text-lg font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="basic">Info Dasar</TabsTrigger>
          <TabsTrigger value="desc">Deskripsi</TabsTrigger>
          <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        {/* ── Info Dasar ── */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Informasi kursus</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Judul kursus <span className="text-destructive">*</span></label>
              <Input value={course.title} onChange={e => set({ title: e.target.value })} placeholder="cth: Full-Stack Web Development dengan React" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Subjudul</label>
              <Input value={course.subtitle} onChange={e => set({ subtitle: e.target.value })} placeholder="Deskripsi singkat yang menarik" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Kategori</label>
                <select value={course.category} onChange={e => set({ category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  {categories.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Level</label>
                <select value={course.level} onChange={e => set({ level: e.target.value as Course["level"] })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  {["Beginner", "Intermediate", "Advanced", "Capstone"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Bahasa</label>
                <select value={course.language} onChange={e => set({ language: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  {["Bahasa Indonesia", "English", "Bilingual"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Instruktur / Mentor</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nama mentor <span className="text-destructive">*</span></label>
                <Input value={course.mentorName} onChange={e => set({ mentorName: e.target.value })} placeholder="cth: Dr. Anita Rahman" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">ID Mentor</label>
                <Input value={course.mentorId} onChange={e => set({ mentorId: e.target.value })} placeholder="ID akun mentor" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bio singkat mentor</label>
              <Textarea value={course.mentorBio} onChange={e => set({ mentorBio: e.target.value })} rows={2}
                placeholder="Pengalaman dan keahlian mentor" />
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Institusi Penyedia & Badge Kelulusan</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Institusi Penyedia Kursus</label>
                <select
                  value={course.providerInstitution || ""}
                  onChange={e => set({ providerInstitution: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">3ITC Digital Education (Default)</option>
                  {(state.institutions || []).map(inst => (
                    <option key={inst.id} value={inst.name}>{inst.name} ({inst.type})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">Institusi/Sekolah yang menyelenggarakan kursus ini</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Badge Otomatis (Saat Lulus)</label>
                <select
                  value={course.courseBadgeId || ""}
                  onChange={e => set({ courseBadgeId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">-- Tidak ada badge --</option>
                  {(state.badges || []).map(badge => (
                    <option key={badge.id} value={badge.id}>🏆 {badge.name} ({badge.category})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">Badge ini otomatis dianugerahkan ke profil siswa saat menyelesaikan kursus</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Thumbnail & Harga</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Gambar thumbnail</label>
              <ThumbnailUploader value={course.thumbnail} onChange={v => set({ thumbnail: v })} />
            </div>
            <div className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Harga (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                    <Input
                      type="number" min={0} step={1000}
                      value={course.price || ""}
                      onChange={e => set({ price: Math.max(0, Number(e.target.value)) })}
                      placeholder="0 = Gratis"
                      className="pl-9" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Isi 0 untuk kursus gratis</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Diskon (%)</label>
                  <div className="relative">
                    <Input
                      type="number" min={0} max={100}
                      value={course.discountPercent || ""}
                      onChange={e => set({ discountPercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      placeholder="0 = tidak ada diskon"
                      className="pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              {/* Preview harga */}
              <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Preview harga di katalog:</p>
                {course.price === 0 ? (
                  <span className="text-sm font-semibold text-success">Gratis</span>
                ) : (course.discountPercent ?? 0) > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground line-through">Rp {(course.price ?? 0).toLocaleString("id-ID")}</span>
                    <span className="text-base font-bold text-primary">Rp {Math.round((course.price ?? 0) * (1 - (course.discountPercent ?? 0) / 100)).toLocaleString("id-ID")}</span>
                    <span className="rounded-full bg-red-100 dark:bg-red-950 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">-{course.discountPercent}%</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-secondary">Rp {(course.price ?? 0).toLocaleString("id-ID")}</span>
                )}
              </div>
            </div>
          </Card>
          <div className="flex justify-end"><Button onClick={() => save()}><Save className="size-4" /> Simpan Info Dasar</Button></div>
        </TabsContent>

        {/* ── Deskripsi ── */}
        <TabsContent value="desc" className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Ringkasan kursus</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ringkasan singkat <span className="text-destructive">*</span></label>
              <Textarea value={course.summary} onChange={e => set({ summary: e.target.value })} rows={3}
                placeholder="Ceritakan tentang kursus ini dalam 2–3 kalimat." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Deskripsi lengkap</label>
              <Textarea value={course.description} onChange={e => set({ description: e.target.value })} rows={8}
                placeholder="Jelaskan secara detail tentang apa yang akan dipelajari..." />
            </div>
          </Card>
          <Card className="p-5 space-y-5">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Tujuan & prasyarat</h3>
            <StringListInput label="Yang akan dipelajari" hint="Tampil sebagai checklist di halaman kursus"
              items={Array.isArray(course.objectives) ? course.objectives : []} placeholder="cth: Memahami konsep React Hooks"
              onChange={v => set({ objectives: v })} />
            <Separator />
            <StringListInput label="Prasyarat" hint="Pengetahuan yang harus dimiliki sebelumnya"
              items={Array.isArray(course.prerequisites) ? course.prerequisites : []} placeholder="cth: Mengerti dasar HTML & CSS"
              onChange={v => set({ prerequisites: v })} />
            <Separator />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Target peserta</label>
              <Textarea value={course.targetAudience || ""} onChange={e => set({ targetAudience: e.target.value })} rows={2}
                placeholder="cth: Pelajar SMK jurusan RPL, mahasiswa IT..." />
            </div>
          </Card>
          <div className="flex justify-end"><Button onClick={() => save()}><Save className="size-4" /> Simpan Deskripsi</Button></div>
        </TabsContent>

        {/* ── Kurikulum ── */}
        <TabsContent value="curriculum" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Kurikulum kursus</h3>
              <p className="text-sm text-muted-foreground">{curriculum.length} sesi · {totalLessons} pelajaran</p>
            </div>
            <Button onClick={addModule}><Plus className="size-4" /> Tambah sesi</Button>
          </div>
          {curriculum.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed">
              <BookOpen className="size-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-muted-foreground">Kurikulum masih kosong</p>
              <Button className="mt-4" onClick={addModule}><Plus className="size-4" /> Tambah sesi pertama</Button>
            </Card>
          ) : (
            <>
              <CurriculumDragList
                curriculum={curriculum}
                onUpdate={updateModule}
                onDelete={deleteModule}
                onMove={moveModule}
              />
              <button onClick={addModule}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Plus className="size-4" /> Tambah sesi baru
              </button>
            </>
          )}
          <div className="flex justify-end pt-2"><Button onClick={() => save()}><Save className="size-4" /> Simpan Kurikulum</Button></div>
        </TabsContent>

        {/* ── Pengaturan ── */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Status publikasi</h3>
            <div className="space-y-3">
              {([
                ["published", "Published", "Kursus terlihat dan bisa diikuti pelajar", "text-success"],
                ["draft",     "Draft",     "Tersimpan tapi tidak terlihat pelajar",    "text-warning"],
                ["archived",  "Archived",  "Disembunyikan dari katalog",               "text-muted-foreground"],
              ] as const).map(([v, l, d, c]) => (
                <label key={v} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  course.status === v ? "border-primary bg-accent" : "border-border hover:border-primary/40")}>
                  <input type="radio" name="status" value={v} checked={course.status === v}
                    onChange={() => set({ status: v })} className="mt-0.5 accent-[var(--primary)]" />
                  <div><p className={cn("font-medium", c)}>{l}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                </label>
              ))}
            </div>
          </Card>
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Fitur kursus</h3>
            <label className="flex cursor-pointer items-start justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-medium text-secondary">Sertifikat penyelesaian</p>
                <p className="text-sm text-muted-foreground">Pelajar mendapat sertifikat setelah menyelesaikan semua modul</p>
              </div>
              <Switch checked={course.certificateEnabled} onCheckedChange={v => set({ certificateEnabled: v })} className="mt-0.5 shrink-0" />
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Batas pendaftar (0 = tidak terbatas)</label>
              <Input type="number" min={0} value={course.enrollmentLimit || ""} className="max-w-[140px]"
                onChange={e => set({ enrollmentLimit: Number(e.target.value) })} placeholder="0" />
            </div>
          </Card>
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>Akses & Pembatasan Institusi</h3>
            <p className="text-sm text-muted-foreground">Pilih institusi yang diperbolehkan mengakses kursus ini. Kosongkan jika kursus terbuka untuk semua.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {(state.institutions || []).length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada institusi terdaftar.</p>
              ) : (state.institutions || []).map(inst => (
                <label key={inst.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                  <input
                    type="checkbox"
                    checked={(Array.isArray(course.allowedInstitutions) ? course.allowedInstitutions : []).includes(inst.name)}
                    onChange={(e) => {
                      const current = Array.isArray(course.allowedInstitutions) ? course.allowedInstitutions : [];
                      if (e.target.checked) {
                        set({ allowedInstitutions: [...current, inst.name] });
                      } else {
                        set({ allowedInstitutions: current.filter(n => n !== inst.name) });
                      }
                    }}
                    className="rounded accent-[var(--primary)]"
                  />
                  <span>{inst.name}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{inst.type}</Badge>
                </label>
              ))}
            </div>
            {(Array.isArray(course.allowedInstitutions) ? course.allowedInstitutions : []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(course.allowedInstitutions) ? course.allowedInstitutions : []).map(inst => (
                  <Badge key={inst} variant="secondary" className="text-xs">
                    {inst}
                    <button onClick={() => set({ allowedInstitutions: (Array.isArray(course.allowedInstitutions) ? course.allowedInstitutions : []).filter(n => n !== inst) })} className="ml-1 hover:text-destructive">&times;</button>
                  </Badge>
                ))}
                <button onClick={() => set({ allowedInstitutions: [] })} className="text-xs text-muted-foreground hover:text-destructive underline">Hapus semua</button>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <StringListInput label="Tag kursus" hint="Membantu pelajar menemukan kursus via pencarian"
              items={Array.isArray(course.tags) ? course.tags : []} placeholder="cth: react, javascript"
              onChange={v => set({ tags: v })} />
          </Card>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => save("draft")}>Simpan sebagai draft</Button>
            <Button onClick={() => save("published")}><Globe className="size-4" /> Publish kursus</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function CourseEditor({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  return (
    <CourseEditorErrorBoundary onBack={onBack}>
      <CourseEditorInner courseId={courseId} onBack={onBack} />
    </CourseEditorErrorBoundary>
  );
}
