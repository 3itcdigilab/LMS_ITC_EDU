import { useState } from "react";
import {
  X, UserPlus, UserCheck, Building2, GraduationCap, Briefcase,
  MapPin, Globe, Linkedin, Github, Award, CheckCircle2, Sparkles, Clock,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useStore, type EducationItem, type ExperienceItem } from "../store/Store";
import { toast } from "sonner";

export interface UserProfileModalData {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  institution?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  skills?: string[];
  educations?: EducationItem[];
  experiences?: ExperienceItem[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export function UserProfileModal({
  user,
  onClose,
}: {
  user: UserProfileModalData | null;
  onClose: () => void;
}) {
  const { state, actions } = useStore();

  if (!user) return null;

  const currentUserName = `${state.profile?.firstName || ""} ${state.profile?.lastName || ""}`.trim();
  const targetName = user.name;
  const isSelf = targetName.toLowerCase() === currentUserName.toLowerCase();

  const isFriend = (state.friendConnections || []).includes(targetName) || (state.friendConnections || []).includes(user.email || "");

  const pendingSent = (state.friendRequests || []).find(
    r => r.senderName.toLowerCase() === currentUserName.toLowerCase() &&
         (r.receiverName.toLowerCase() === targetName.toLowerCase() || (user.email && r.receiverEmail === user.email)) &&
         r.status === "pending"
  );

  const pendingReceived = (state.friendRequests || []).find(
    r => r.receiverName.toLowerCase() === currentUserName.toLowerCase() &&
         (r.senderName.toLowerCase() === targetName.toLowerCase() || (user.email && r.senderEmail === user.email)) &&
         r.status === "pending"
  );

  const handleFriendClick = () => {
    if (isFriend) {
      actions.removeFriend(currentUserName, targetName);
      toast.info(`Koneksi pertemanan dengan ${targetName} dihapus.`);
    } else if (pendingSent) {
      actions.removeFriend(currentUserName, targetName);
      toast.info(`Permintaan pertemanan ke ${targetName} dibatalkan.`);
    } else if (pendingReceived) {
      actions.acceptFriendRequest(pendingReceived.id, currentUserName);
      toast.success(`Berhasil menerima pertemanan dari ${targetName}! 🎉`);
    } else {
      actions.sendFriendRequest({
        senderName: currentUserName,
        receiverName: targetName,
        receiverEmail: user.email,
      });
      toast.success(`Permintaan pertemanan dikirim ke ${targetName}! 📩`);
    }
  };

  const educationsList = user.educations || [];
  const experiencesList = user.experiences || [];
  const skillsList = user.skills || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl overflow-hidden bg-card shadow-2xl border-border/60 max-h-[90vh] flex flex-col">
        {/* Banner Header */}
        <div className="relative h-36 w-full shrink-0 overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900">
          {user.bannerUrl ? (
            <img src={user.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-indigo-600/20 to-transparent" />
          )}
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20 size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Profile Header Bar */}
        <div className="px-6 pb-4 pt-0 relative border-b shrink-0 bg-card">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-3">
            <Avatar className="size-24 border-4 border-card shadow-lg ring-2 ring-primary/20">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="size-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              )}
            </Avatar>

            {!isSelf && (
              <div className="flex items-center gap-2">
                <Button
                  variant={isFriend ? "outline" : pendingSent ? "secondary" : "default"}
                  onClick={handleFriendClick}
                  className="gap-2 font-semibold shadow-sm transition-all"
                >
                  {isFriend ? (
                    <>
                      <UserCheck className="size-4 text-emerald-500" /> Berteman ✓
                    </>
                  ) : pendingSent ? (
                    <>
                      <Clock className="size-4 text-amber-500 animate-pulse" /> Menunggu Konfirmasi ⏳
                    </>
                  ) : pendingReceived ? (
                    <>
                      <UserCheck className="size-4 text-emerald-500" /> Terima Pertemanan
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" /> Tambah Teman
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">{user.name}</h2>
              <Badge variant="secondary" className="capitalize text-xs font-semibold">
                {user.role || "Pelajar"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" /> {user.institution || "3ITC Digital Education"}
            </p>
            {user.headline && (
              <p className="text-sm text-foreground/90 font-medium mt-2 leading-relaxed">
                {user.headline}
              </p>
            )}
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {user.bio}
              </p>
            )}
            {/* Featured Badge */}
            {(() => {
              // Look up the user's featured badge from the profiles map
              const userKey = (user.name || '').trim().toLowerCase();
              const userProf = (state.userProfilesMap || {})[userKey];
              const featuredId = userProf?.featuredBadgeId;
              if (!featuredId) return null;
              const badge = (state.badges || []).find(b => b.id === featuredId);
              if (!badge) return null;
              return (
                <div className="flex items-center gap-2 mt-2">
                  <img src={badge.iconUrl || badge.imageUrl} alt={badge.name} className="size-7 rounded-full object-contain border-2 border-amber-400 p-0.5 bg-background shrink-0" />
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{badge.name}</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Work Experience */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Briefcase className="size-4 text-primary" /> Pengalaman Kerja
            </h3>
            {experiencesList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">Belum ada riwayat pengalaman kerja.</p>
            ) : (
              <div className="space-y-3">
                {experiencesList.map((exp) => (
                  <div key={exp.id} className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="size-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">{exp.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        {exp.company} · <span className="text-primary">{exp.startDate} - {exp.endDate}</span>
                      </p>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" /> Riwayat Pendidikan
            </h3>
            {educationsList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">Belum ada riwayat pendidikan.</p>
            ) : (
              <div className="space-y-3">
                {educationsList.map((edu) => (
                  <div key={edu.id} className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
                      <GraduationCap className="size-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">{edu.institution}</h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        {edu.degree} · {edu.fieldOfStudy} ({edu.startYear} - {edu.endYear})
                      </p>
                      {edu.description && (
                        <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Keahlian & Skill
            </h3>
            {skillsList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">Belum ada keahlian yang ditambahkan.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <Badge key={skill} variant="outline" className="px-3 py-1 text-xs font-semibold bg-muted/40">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {(user.linkedin || user.github || user.portfolio) && (
            <div className="space-y-2.5 pt-2 border-t">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tautan Profesional</h3>
              <div className="flex flex-wrap gap-3 text-xs">
                {user.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Linkedin className="size-3.5" /> LinkedIn
                  </a>
                )}
                {user.github && (
                  <a href={user.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-foreground hover:underline">
                    <Github className="size-3.5" /> GitHub
                  </a>
                )}
                {user.portfolio && (
                  <a href={user.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                    <Globe className="size-3.5" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
