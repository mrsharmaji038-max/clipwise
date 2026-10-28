"use client";

import { useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

type Clip = {
  id: string;
  title: string;
  start: string;
  end: string;
  duration: string;
  score: number;
  image: string;
  transcript: string;
  tag: string;
};

type StudioProject = {
  id: string;
  title: string;
  sourceUrl: string | null;
  sourceName: string | null;
  sourceType: string;
  durationSeconds: number;
  status: string;
  clipCount: number;
  aspectRatio: string;
  captionStyle: string;
  prompt: string | null;
  clips: Clip[];
  createdAt: string;
};

type ClipCard = { clip: Clip; project: StudioProject | null; isDemo: boolean };
type View = "overview" | "projects" | "clips" | "brand" | "publish";
type CaptionStyle = "bold" | "minimal" | "karaoke";

const demoClips: ClipCard[] = [
  {
    isDemo: true,
    project: null,
    clip: {
      id: "sample-1",
      title: "The 1% shift that changed everything",
      start: "00:02:14",
      end: "00:02:52",
      duration: "0:38",
      score: 98,
      image: "/images/podcast-studio.jpg",
      transcript: "The difference between a good idea and a great one is usually the moment you decide to actually try it. You don't need the perfect plan. You just need to take the first step.",
      tag: "Big idea",
    },
  },
  {
    isDemo: true,
    project: null,
    clip: {
      id: "sample-2",
      title: "Stop waiting until you feel ready",
      start: "00:08:31",
      end: "00:09:04",
      duration: "0:33",
      score: 94,
      image: "/images/creator-studio.jpg",
      transcript: "Stop waiting until you're ready. Start where you are, work with what you have, and figure out the next step as you go. That's where the real progress happens.",
      tag: "Practical tip",
    },
  },
  {
    isDemo: true,
    project: null,
    clip: {
      id: "sample-3",
      title: "The routine that works on the hard days",
      start: "00:14:06",
      end: "00:14:48",
      duration: "0:42",
      score: 91,
      image: "/images/wellness-studio.jpg",
      transcript: "Most people think the hard part is staying motivated. It isn't. The real secret is building a routine that still works on the days you don't feel like showing up.",
      tag: "Hot take",
    },
  },
];

const pageInfo: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "YOUR CREATOR STUDIO", title: "Good things happen when you hit play.", description: "Turn your long-form videos into moments worth sharing." },
  projects: { eyebrow: "YOUR WORKSPACE", title: "Projects", description: "Every source video and its standout moments, all in one place." },
  clips: { eyebrow: "THE GOOD PARTS", title: "Your clip library", description: "A little inspiration goes a long way. Find, refine, and export your best moments." },
  brand: { eyebrow: "MAKE IT YOURS", title: "Your brand, on every frame.", description: "Set up a caption style once and carry a consistent look across every clip." },
  publish: { eyebrow: "READY WHEN YOU ARE", title: "From edit to everywhere.", description: "Get your short-form workflow ready for the platforms you show up on." },
};

const navItems: { id: View; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "projects", label: "My projects", icon: "folder" },
  { id: "clips", label: "Clip library", icon: "scissors" },
  { id: "brand", label: "Brand kit", icon: "palette" },
  { id: "publish", label: "Publish", icon: "send" },
];

type IconName =
  | "home" | "folder" | "scissors" | "palette" | "send" | "plus" | "search" | "bell"
  | "help" | "sparkle" | "upload" | "play" | "arrow" | "chevron" | "clock" | "video"
  | "link" | "file" | "close" | "check" | "trash" | "edit" | "download" | "external"
  | "more" | "target" | "wand" | "layers" | "heart" | "youtube" | "instagram" | "tiktok"
  | "shield" | "copy" | "arrowUp";

function Icon({ name, size = 18, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    folder: <><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /><path d="M3.5 9h17" /></>,
    scissors: <><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="m8.2 7.5 11 9M8.2 16.5 19 7M14 12l5 5" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1.1a2 2 0 0 0 1.5-3.3 1.9 1.9 0 0 1 1.5-3.2H18a3 3 0 0 0 3-3c0-4.7-4-8.5-9-8.5Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="15" cy="8" r="1" /></>,
    send: <><path d="m21 3-7.4 18-3.9-7.7L2 9.5 21 3Z" /><path d="M9.7 13.3 15 8" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 4.4 1.3c-.9 1.1-2.1 1.5-2.1 3.2" /><path d="M12 17.4h.01" /></>,
    sparkle: <><path d="m12 3 1.9 5.9L20 11l-6.1 2.1L12 19l-2-5.9L4 11l6-2.1L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></>,
    play: <><path d="m9 6 10 6-10 6z" fill="currentColor" stroke="none" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" /><path d="M10 11v5m4-5v5" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5" /><path d="M4 17v3h16v-3" /></>,
    external: <><path d="M14 3h7v7m0-7L10 14" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    wand: <><path d="m15 4 5 5M4 20 17 7m-2-4 1-2m5 12 2 1m-8 8 1-2M5 3l.7 2.3L8 6l-2.3.7L5 9l-.7-2.3L2 6l2.3-.7L5 3Z" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    heart: <path d="M20.8 8.8c0 4.3-8.8 10.3-8.8 10.3S3.2 13.1 3.2 8.8a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z" />,
    youtube: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    tiktok: <><path d="M14 4v10.5a4.5 4.5 0 1 1-4-4.5" /><path d="M14 4c.6 3 2.2 4.5 5 4.8" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    arrowUp: <><path d="M12 19V5m0 0-6 6m6-6 6 6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function timeAgo(value: string) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "Just now";
  const hours = Math.max(0, Math.floor((Date.now() - time) / 3_600_000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function formatDuration(seconds: number) {
  if (!seconds) return "Source video";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function FileSize({ bytes }: { bytes: number }) {
  return <>{bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`}</>;
}

function parseTimestamp(value: string) {
  const parts = value.split(":").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function splitCaptionSegments(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const segments: string[] = [];
  let current: string[] = [];
  for (const word of words) {
    current.push(word);
    if (current.length >= 6 || /[.!?…]$/.test(word)) {
      segments.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) segments.push(current.join(" "));
  return segments;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function ClipwiseStudio({ initialProjects }: { initialProjects: StudioProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [view, setView] = useState<View>("overview");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState<"link" | "upload">("upload");
  const [sourceUrl, setSourceUrl] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [clipCount, setClipCount] = useState(3);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("bold");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(8);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<"all" | "recent">("all");
  const [clipFilter, setClipFilter] = useState<"all" | "top">("all");
  const [selectedProject, setSelectedProject] = useState<StudioProject | null>(null);
  const [selectedClip, setSelectedClip] = useState<ClipCard | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [clipTitleDraft, setClipTitleDraft] = useState("");
  const [captionDraft, setCaptionDraft] = useState("");
  const [clipSaving, setClipSaving] = useState(false);
  const [renderingClipId, setRenderingClipId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [brandColor, setBrandColor] = useState("#d4f66a");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const localVideoFiles = useRef<Map<string, File>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const totalClips = projects.reduce((sum, project) => sum + project.clips.length, 0);
  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = query
      ? projects.filter((project) => `${project.title} ${project.sourceName ?? ""} ${project.sourceUrl ?? ""}`.toLowerCase().includes(query))
      : projects;
    return projectFilter === "recent" ? list.slice(0, 5) : list;
  }, [projects, projectFilter, searchQuery]);
  const projectClips = useMemo<ClipCard[]>(() => projects.flatMap((project) =>
    project.clips.map((clip) => ({ clip, project, isDemo: false }))), [projects]);
  const visibleClips = useMemo(() => {
    const source = projectClips.length ? projectClips : demoClips;
    return clipFilter === "top" ? source.filter(({ clip }) => clip.score >= 90) : source;
  }, [clipFilter, projectClips]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3400);
  }

  function openCreate() {
    setFormError("");
    setIsCreateOpen(true);
  }

  function resetCreate() {
    setIsCreateOpen(false);
    setIsGenerating(false);
    setGenerationProgress(8);
    setSourceMode("upload");
    setSourceUrl("");
    setProjectTitle("");
    setSelectedFile(null);
    setFileDuration(0);
    setPrompt("");
    setClipCount(3);
    setAdvancedOpen(false);
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function selectVideoFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFormError("Choose a video file such as MP4, MOV, or WebM.");
      return;
    }
    if (file.size > 1024 * 1024 * 1024) {
      setFormError("This file is over the 1 GB demo upload limit.");
      return;
    }
    setSelectedFile(file);
    setFormError("");
    setProjectTitle((current) => current || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " "));
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setFileDuration(Number.isFinite(video.duration) ? Math.round(video.duration) : 0);
      URL.revokeObjectURL(objectUrl);
    };
    video.onerror = () => URL.revokeObjectURL(objectUrl);
    video.src = objectUrl;
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const trimmedTitle = projectTitle.trim() || (selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "");
    if (trimmedTitle.length < 2) {
      setFormError("Give your project a name to get started.");
      return;
    }
    if (sourceMode === "link" && !sourceUrl.trim()) {
      setFormError("Paste a video link to get started.");
      return;
    }
    if (sourceMode === "upload" && !selectedFile) {
      setFormError("Choose a video file to get started.");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(16);
    const progressTimer = window.setInterval(() => {
      setGenerationProgress((current) => Math.min(current + 9, 88));
    }, 420);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          sourceUrl: sourceUrl.trim(),
          sourceType: sourceMode,
          sourceName: selectedFile?.name ?? "",
          durationSeconds: sourceMode === "upload" ? fileDuration : 0,
          clipCount,
          aspectRatio,
          captionStyle,
          prompt,
        }),
      });
      const data = await response.json() as { error?: string; project?: StudioProject };
      if (!response.ok || !data.project) throw new Error(data.error || "Your project could not be created.");
      if (sourceMode === "upload" && selectedFile) localVideoFiles.current.set(data.project.id, selectedFile);
      await new Promise((resolve) => window.setTimeout(resolve, 1050));
      setGenerationProgress(100);
      setProjects((current) => [data.project!, ...current]);
      resetCreate();
      setView("projects");
      notify("Your project is ready — clip suggestions are waiting.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setIsGenerating(false);
    } finally {
      window.clearInterval(progressTimer);
    }
  }

  function openClip(item: ClipCard) {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    const file = item.project ? localVideoFiles.current.get(item.project.id) : undefined;
    setLocalPreviewUrl(file ? URL.createObjectURL(file) : null);
    setClipTitleDraft(item.clip.title);
    setCaptionDraft(item.clip.transcript ?? "");
    setSelectedClip(item);
  }

  function closeClip() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setSelectedClip(null);
  }

  async function saveClipChanges() {
    if (!selectedClip?.project || clipTitleDraft.trim().length < 2) return;
    setClipSaving(true);
    try {
      const response = await fetch(`/api/projects/${selectedClip.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clipId: selectedClip.clip.id, title: clipTitleDraft.trim(), transcript: captionDraft.trim() }),
      });
      const data = await response.json() as { error?: string; project?: StudioProject };
      if (!response.ok || !data.project) throw new Error(data.error || "Clip settings couldn't be saved.");
      setProjects((current) => current.map((project) => project.id === data.project!.id ? data.project! : project));
      setSelectedClip((current) => current ? { ...current, clip: { ...current.clip, title: clipTitleDraft.trim(), transcript: captionDraft.trim() } } : null);
      notify("Clip title and captions saved.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Clip settings couldn't be saved.");
    } finally {
      setClipSaving(false);
    }
  }

  async function deleteProject(project: StudioProject) {
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The project could not be deleted.");
      localVideoFiles.current.delete(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setSelectedProject(null);
      notify("Project removed from your workspace.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "The project could not be deleted.");
    }
  }

  function exportClipNotes(item: ClipCard) {
    const lines = [
      "CLIPWISE — CLIP EDIT NOTES",
      `Project: ${item.project?.title ?? "Sample clip"}`,
      `Clip: ${item.clip.title}`,
      `Moment: ${item.clip.start} – ${item.clip.end} (${item.clip.duration})`,
      `Suggested aspect ratio: ${item.project?.aspectRatio ?? aspectRatio}`,
      `Caption treatment: ${item.project?.captionStyle ?? captionStyle}`,
      "",
      "CAPTIONS",
      selectedClip?.clip.id === item.clip.id ? captionDraft : item.clip.transcript,
      "",
      "Note: These are illustrative edit notes, not a rendered clip. Upload a video to render a local clip in this browser session.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const filename = `${item.clip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "clip"}-edit-notes.txt`;
    triggerDownload(blob, filename);
    notify("Edit notes downloaded.");
  }

  async function exportUploadedClip(item: ClipCard) {
    const project = item.project;
    const file = project ? localVideoFiles.current.get(project.id) : undefined;
    if (!project || !file) {
      exportClipNotes(item);
      return;
    }
    const isOpenClip = selectedClip?.clip.id === item.clip.id;
    const captionText = (isOpenClip ? captionDraft : item.clip.transcript).trim();
    if (!captionText) {
      notify("Add or paste the spoken words in the Captions box first, then render the video.");
      return;
    }
    const captionSegments = splitCaptionSegments(captionText);
    const renderedTitle = isOpenClip ? clipTitleDraft.trim() || item.clip.title : item.clip.title;
    if (typeof MediaRecorder === "undefined") {
      notify("Video export is not supported in this browser. Try a recent version of Chrome, Edge, or Firefox.");
      return;
    }

    const canvas = document.createElement("canvas");
    if (typeof canvas.captureStream !== "function") {
      notify("This browser does not support local video rendering. Try Chrome, Edge, or Firefox.");
      return;
    }

    setRenderingClipId(item.clip.id);
    setRenderProgress(1);
    const sourceUrl = URL.createObjectURL(file);
    let video: HTMLVideoElement | null = null;
    let canvasStream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let audioContext: AudioContext | null = null;
    let capturedStream: MediaStream | null = null;
    let animationFrame = 0;

    try {
      video = document.createElement("video");
      video.preload = "auto";
      video.playsInline = true;
      video.src = sourceUrl;
      await new Promise<void>((resolve, reject) => {
        video!.addEventListener("loadedmetadata", () => resolve(), { once: true });
        video!.addEventListener("error", () => reject(new Error("This video could not be opened by your browser.")), { once: true });
        video!.load();
      });

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration <= 0) throw new Error("The selected video has no readable duration.");
      const hasMeasuredDuration = project.durationSeconds > 0;
      const requestedStart = hasMeasuredDuration ? parseTimestamp(item.clip.start) : 0;
      const startTime = Math.min(requestedStart, Math.max(0, duration - 0.1));
      const requestedEnd = hasMeasuredDuration ? parseTimestamp(item.clip.end) : Math.min(38, duration);
      const endTime = Math.min(duration, Math.max(startTime + Math.min(0.5, duration - startTime), requestedEnd || duration));
      if (endTime <= startTime) throw new Error("There is no video at this clip’s selected timestamp.");

      const [width, height] = project.aspectRatio === "16:9" ? [1280, 720] : project.aspectRatio === "1:1" ? [960, 960] : [720, 1280];
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create a video canvas.");

      let audioTracks: MediaStreamTrack[] = [];
      const captureVideo = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
      try {
        capturedStream = captureVideo.captureStream?.() ?? captureVideo.mozCaptureStream?.() ?? null;
        audioTracks = capturedStream?.getAudioTracks() ?? [];
      } catch {
        audioTracks = [];
      }
      if (audioTracks.length === 0 && typeof window.AudioContext !== "undefined") {
        try {
          audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();
          audioContext.createMediaElementSource(video).connect(destination);
          await audioContext.resume();
          audioTracks = destination.stream.getAudioTracks();
        } catch {
          if (audioContext) void audioContext.close();
          audioContext = null;
        }
      }

      const aspectRatio = width / height;
      const drawFrame = () => {
        if (!video || video.readyState < 2) return;
        const videoAspect = video.videoWidth / video.videoHeight;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = video.videoWidth;
        let sourceHeight = video.videoHeight;
        if (videoAspect > aspectRatio) {
          sourceWidth = video.videoHeight * aspectRatio;
          sourceX = (video.videoWidth - sourceWidth) / 2;
        } else {
          sourceHeight = video.videoWidth / aspectRatio;
          sourceY = (video.videoHeight - sourceHeight) / 2;
        }
        context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
        const gradient = context.createLinearGradient(0, height * 0.58, 0, height);
        gradient.addColorStop(0, "rgba(8,10,10,0)");
        gradient.addColorStop(1, "rgba(8,10,10,.78)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        const elapsed = Math.max(0, Math.min(video.currentTime - startTime, endTime - startTime));
        const segmentIndex = Math.min(captionSegments.length - 1, Math.floor((elapsed / (endTime - startTime)) * captionSegments.length));
        const captionWords = captionSegments[segmentIndex].split(/\s+/);
        const fontSize = Math.max(20, Math.round(width * 0.043));
        context.font = `700 ${fontSize}px Arial, sans-serif`;
        const lines: string[] = [];
        let currentLine = "";
        for (const word of captionWords) {
          const nextLine = currentLine ? `${currentLine} ${word}` : word;
          if (currentLine && context.measureText(nextLine).width > width * 0.82) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = nextLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        const lineHeight = Math.round(fontSize * 1.22);
        const paddingX = Math.round(width * 0.035);
        const paddingY = Math.round(fontSize * 0.3);
        const captionWidth = Math.min(width * 0.94, Math.max(...lines.map((line) => context.measureText(line).width)) + paddingX * 2);
        const captionHeight = lines.length * lineHeight + paddingY * 2;
        const captionX = (width - captionWidth) / 2;
        const captionY = height * 0.77 - captionHeight / 2;
        context.fillStyle = "rgba(8,10,10,.7)";
        context.fillRect(captionX, captionY, captionWidth, captionHeight);
        context.textAlign = "center";
        context.textBaseline = "middle";
        lines.forEach((line, index) => {
          context.lineWidth = Math.max(2, fontSize * 0.1);
          context.strokeStyle = "rgba(0,0,0,.7)";
          context.strokeText(line, width / 2, captionY + paddingY + lineHeight * (index + 0.5), width * 0.9);
          context.fillStyle = "#ffffff";
          context.fillText(line, width / 2, captionY + paddingY + lineHeight * (index + 0.5), width * 0.9);
        });
      };

      canvasStream = canvas.captureStream(30);
      const stream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
      const mimeType = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_000_000 })
        : new MediaRecorder(stream, { videoBitsPerSecond: 3_000_000 });
      const chunks: BlobPart[] = [];
      const recording = new Promise<Blob>((resolve, reject) => {
        recorder!.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
        recorder!.onerror = () => reject(new Error("The video encoder stopped unexpectedly. Try a shorter source clip."));
        recorder!.onstop = () => resolve(new Blob(chunks, { type: recorder?.mimeType || mimeType || "video/webm" }));
      });

      if (Math.abs(video.currentTime - startTime) > 0.05) {
        await new Promise<void>((resolve, reject) => {
          video!.addEventListener("seeked", () => resolve(), { once: true });
          video!.addEventListener("error", () => reject(new Error("Could not seek to this clip’s start time.")), { once: true });
          video!.currentTime = startTime;
        });
      }
      drawFrame();
      video.muted = false;
      await video.play();
      recorder.start(250);
      let lastProgressUpdate = 0;
      const renderFrame = (now: number) => {
        drawFrame();
        if (video && now - lastProgressUpdate > 350) {
          lastProgressUpdate = now;
          setRenderProgress(Math.min(99, Math.round(((video.currentTime - startTime) / (endTime - startTime)) * 100)));
        }
        if (!video || video.currentTime >= endTime) {
          video?.pause();
          drawFrame();
          if (recorder?.state === "recording") recorder.stop();
          return;
        }
        animationFrame = window.requestAnimationFrame(renderFrame);
      };
      animationFrame = window.requestAnimationFrame(renderFrame);

      const blob = await recording;
      if (blob.size === 0) throw new Error("The exported clip was empty. Please try again with a different video.");
      const extension = blob.type.includes("mp4") ? "mp4" : "webm";
      const filename = `${renderedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "clip"}.${extension}`;
      triggerDownload(blob, filename);
      setRenderProgress(100);
      notify(`Your ${extension.toUpperCase()} video clip was downloaded.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "The clip could not be rendered. Please try again.");
    } finally {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (recorder?.state === "recording") recorder.stop();
      canvasStream?.getTracks().forEach((track) => track.stop());
      capturedStream?.getTracks().forEach((track) => track.stop());
      video?.pause();
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
      if (audioContext) void audioContext.close();
      URL.revokeObjectURL(sourceUrl);
      setRenderingClipId(null);
      setRenderProgress(0);
    }
  }

  function handleSearchKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") setView("projects");
  }

  const menuItems = navItems.map((item) => (
    <button
      key={item.id}
      type="button"
      className={`nav-item ${view === item.id ? "active" : ""}`}
      onClick={() => setView(item.id)}
      aria-current={view === item.id ? "page" : undefined}
    >
      <Icon name={item.icon} size={18} />
      <span>{item.label}</span>
      {item.id === "projects" && projects.length > 0 && <span className="nav-count">{projects.length}</span>}
    </button>
  ));

  const renderProjectCard = (project: StudioProject, compact = false) => (
    <button type="button" className={`project-card ${compact ? "project-card-compact" : ""}`} key={project.id} onClick={() => setSelectedProject(project)}>
      <div className="project-art" style={{ backgroundImage: `linear-gradient(180deg,rgba(12,17,19,.04),rgba(12,17,19,.54)),url("${project.clips[0]?.image ?? "/images/podcast-studio.jpg"}")` }}>
        <span className="project-play"><Icon name="play" size={16} /></span>
        <span className="project-status"><span /> Ready</span>
      </div>
      <div className="project-info">
        <div className="project-title-row"><span className="project-title">{project.title}</span><Icon name="chevron" size={17} /></div>
        <p>{project.sourceType === "upload" ? project.sourceName || "Uploaded video" : project.sourceUrl || "Video project"}</p>
        <div className="project-meta"><span><Icon name="scissors" size={14} /> {project.clips.length} clip ideas</span><span>{timeAgo(project.createdAt)}</span></div>
      </div>
    </button>
  );

  const renderClipCard = (item: ClipCard) => (
    <button type="button" className="clip-card" key={item.clip.id} onClick={() => openClip(item)}>
      <div className="clip-card-image" style={{ backgroundImage: `linear-gradient(180deg,rgba(15,16,22,.05) 8%,rgba(15,16,22,.56) 100%),url("${item.clip.image}")` }}>
        <span className="clip-duration">{item.clip.duration}</span>
        <span className="clip-play"><Icon name="play" size={16} /></span>
        <span className="clip-caption">{item.clip.title}</span>
      </div>
      <div className="clip-card-body">
        <div className="clip-card-heading"><span className="clip-card-title">{item.clip.title}</span><span className="score-chip"><Icon name="sparkle" size={12} /> {item.clip.score}</span></div>
        <div className="clip-card-meta"><span>{item.project?.title ?? "Example project"}</span><span>{item.clip.start}</span></div>
      </div>
    </button>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand-lockup" type="button" onClick={() => setView("overview")} aria-label="Clipwise home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-word">clipwise<span className="brand-period">.</span></span>
        </button>
        <button className="workspace-switcher" type="button" onClick={() => setHelpOpen(true)}>
          <span className="workspace-avatar">J</span>
          <span className="workspace-copy"><strong>Jamie’s studio</strong><small>Personal workspace</small></span>
          <span className="workspace-chevron">⌄</span>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">{menuItems}</nav>
        <div className="sidebar-separator" />
        <div className="nav-label">DISCOVER</div>
        <button className="nav-item" type="button" onClick={() => setHelpOpen(true)}><Icon name="sparkle" size={18} /><span>What’s new</span><span className="new-pill">NEW</span></button>
        <button className="nav-item" type="button" onClick={() => setHelpOpen(true)}><Icon name="help" size={18} /><span>Help center</span></button>
        <div className="sidebar-spacer" />
        <div className="plan-card">
          <div className="plan-card-top"><span className="plan-icon"><Icon name="wand" size={15} /></span><span className="plan-label">FREE PLAN</span><span className="plan-renew">30 days left</span></div>
          <strong>Make more moments.</strong>
          <p>120 processing minutes included in your workspace.</p>
          <div className="usage-track"><span /></div>
          <div className="usage-caption"><span>0 min used</span><span>120 min</span></div>
          <button type="button" className="plan-upgrade" onClick={() => notify("You’re already on the free demo plan.")}>Explore plans <Icon name="arrow" size={14} /></button>
        </div>
        <button className="profile-row" type="button" onClick={() => setHelpOpen(true)}>
          <span className="profile-avatar">JD</span>
          <span className="profile-info"><strong>Jamie Davis</strong><small>Creator account</small></span>
          <Icon name="more" size={19} />
        </button>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /><span /><span /></span><span className="brand-word">clipwise<span className="brand-period">.</span></span></div>
          <div className="breadcrumbs"><span>Jamie’s studio</span><Icon name="chevron" size={14} /><strong>{pageInfo[view].title}</strong></div>
          <div className="topbar-actions">
            <div className="top-search"><Icon name="search" size={17} /><input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={handleSearchKey} onFocus={() => { if (view !== "projects") setView("projects"); }} placeholder="Search your projects" aria-label="Search projects" /><kbd>⌘ K</kbd></div>
            <button className="icon-button help-button" type="button" aria-label="Open help" onClick={() => setHelpOpen(true)}><Icon name="help" size={19} /></button>
            <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => notify("You’re all caught up — no new notifications.")}><Icon name="bell" size={19} /><span className="notification-dot" /></button>
            <button className="top-avatar" type="button" aria-label="Your profile" onClick={() => setHelpOpen(true)}>JD</button>
          </div>
        </header>

        <div className="content-area">
          <div className="page-heading">
            <div><span className="eyebrow">{pageInfo[view].eyebrow}</span><h1>{pageInfo[view].title}</h1><p>{pageInfo[view].description}</p></div>
            <button className="button button-primary header-create" type="button" onClick={openCreate}><Icon name="plus" size={17} /> New project</button>
          </div>

          {view === "overview" && <>
            <section className="welcome-hero">
              <div className="hero-copy">
                <div className="hero-pill"><span className="hero-pill-dot" /> ONE VIDEO. SO MANY MOMENTS.</div>
                <h2>Make your best<br />ideas <span>impossible</span><br />to scroll past.</h2>
                <p>Meet your new shortcut to short-form. Turn your long videos into scroll-stopping clips, without the editing marathon.</p>
                <div className="hero-actions"><button type="button" className="button button-lime" onClick={openCreate}>Create your first clips <Icon name="arrow" size={16} /></button><span className="hero-caption"><Icon name="shield" size={15} /> Your original stays yours</span></div>
              </div>
              <div className="hero-visual" aria-label="A preview of a vertical video clip">
                <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
                <div className="hero-float hero-float-top"><span className="float-sparkle"><Icon name="sparkle" size={17} /></span><span><strong>Great moment found</strong><small>Relatable story · 96 score</small></span></div>
                <div className="hero-phone">
                  <div className="hero-phone-image" style={{ backgroundImage: "linear-gradient(180deg,rgba(15,16,22,.01),rgba(15,16,22,.12) 38%,rgba(15,16,22,.76)),url('/images/podcast-studio.jpg')" }}>
                    <div className="phone-top"><span>9:16</span><span><span className="phone-dot" /> READY TO SHARE</span></div>
                    <div className="phone-play"><Icon name="play" size={17} /></div>
                    <div className="phone-caption"><span>YOU DON’T NEED</span><strong>THE PERFECT PLAN.</strong></div>
                    <div className="phone-subtitle">You just need to take the first step.</div>
                    <div className="phone-progress"><span /></div>
                  </div>
                </div>
                <div className="hero-float hero-float-bottom"><span className="float-bars"><i /><i /><i /><i /><i /></span><span><strong>Auto captions</strong><small>Ready in seconds</small></span><Icon name="check" size={17} /></div>
                <span className="visual-star visual-star-one">✳</span><span className="visual-star visual-star-two">✳</span>
              </div>
            </section>

            <section className="stats-row" aria-label="Workspace summary">
              <div className="stat-card"><span className="stat-icon stat-purple"><Icon name="video" size={18} /></span><div><span className="stat-label">Projects created</span><strong>{projects.length}</strong></div><span className="stat-note">all time</span></div>
              <div className="stat-card"><span className="stat-icon stat-lime"><Icon name="scissors" size={18} /></span><div><span className="stat-label">Clip suggestions</span><strong>{totalClips}</strong></div><span className="stat-note">ready to refine</span></div>
              <div className="stat-card"><span className="stat-icon stat-peach"><Icon name="clock" size={18} /></span><div><span className="stat-label">Minutes processed</span><strong>{projects.reduce((total, project) => total + Math.ceil(project.durationSeconds / 60), 0)}</strong></div><span className="stat-note">of 120 included</span></div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span className="section-kicker">KEEP THE MOMENTUM</span><h2>Your recent projects</h2></div><button type="button" className="text-link" onClick={() => setView("projects")}>All projects <Icon name="arrow" size={15} /></button></div>
              {projects.length ? <div className="project-grid">{projects.slice(0, 3).map((project) => renderProjectCard(project, true))}</div> : <div className="empty-projects"><span className="empty-art"><Icon name="video" size={25} /></span><div><strong>Your first great edit starts here.</strong><p>Drop in a video and we’ll help you find the moments that deserve a second watch.</p></div><button type="button" className="button button-dark" onClick={openCreate}><Icon name="plus" size={16} /> Create a project</button></div>}
            </section>

            <section className="section-block inspiration-block">
              <div className="section-heading"><div><span className="section-kicker">A LITTLE CLIP INSPIRATION</span><h2>Great moments, made short.</h2></div><span className="example-label"><Icon name="sparkle" size={13} /> SAMPLE CLIPS</span></div>
              <div className="clip-grid">{demoClips.map(renderClipCard)}</div>
              <p className="demo-note"><Icon name="shield" size={14} /> These examples are illustrative. Your project will create editable clip suggestions, not rendered video files.</p>
            </section>
          </>}

          {view === "projects" && <section className="section-block projects-page-block">
            <div className="library-toolbar"><div className="filter-tabs"><button type="button" className={projectFilter === "all" ? "selected" : ""} onClick={() => setProjectFilter("all")}>All projects <span>{projects.length}</span></button><button type="button" className={projectFilter === "recent" ? "selected" : ""} onClick={() => setProjectFilter("recent")}>Recent</button></div><span className="toolbar-hint"><Icon name="layers" size={15} /> {projects.length} {projects.length === 1 ? "project" : "projects"} in your studio</span></div>
            {filteredProjects.length ? <div className="project-list">{filteredProjects.map((project) => (
              <div key={project.id} className="project-list-item"><button className="project-list-thumb" type="button" onClick={() => setSelectedProject(project)} style={{ backgroundImage: `linear-gradient(180deg,rgba(10,12,18,.02),rgba(10,12,18,.38)),url("${project.clips[0]?.image ?? "/images/podcast-studio.jpg"}")` }} aria-label={`Open ${project.title}`}><span className="project-play"><Icon name="play" size={15} /></span></button><button type="button" className="project-list-main" onClick={() => setSelectedProject(project)}><span className="project-list-title">{project.title}</span><span className="project-list-source"><Icon name={project.sourceType === "upload" ? "file" : "link"} size={13} /> {project.sourceType === "upload" ? project.sourceName || "Uploaded video" : project.sourceUrl || "Video link"}</span><span className="project-list-mobile-meta">{project.clips.length} clip ideas · {timeAgo(project.createdAt)}</span></button><div className="project-list-count"><span className="status-dot" /> Ready<span>{project.clips.length} clips</span></div><span className="project-list-time">{timeAgo(project.createdAt)}</span><button className="icon-button row-more" type="button" aria-label={`Open ${project.title}`} onClick={() => setSelectedProject(project)}><Icon name="more" size={18} /></button></div>
            ))}</div> : <div className="empty-state"><span className="empty-art"><Icon name={searchQuery ? "search" : "folder"} size={25} /></span><h3>{searchQuery ? "No projects match that search." : "Your project list is ready when you are."}</h3><p>{searchQuery ? "Try another project name or clear the search above." : "Add a YouTube link or select a video to create your first clip workspace."}</p>{searchQuery ? <button type="button" className="button button-secondary" onClick={() => setSearchQuery("")}>Clear search</button> : <button type="button" className="button button-dark" onClick={openCreate}><Icon name="plus" size={16} /> Start a project</button>}</div>}
          </section>}

          {view === "clips" && <section className="section-block clip-library-block">
            <div className="library-toolbar"><div className="filter-tabs"><button type="button" className={clipFilter === "all" ? "selected" : ""} onClick={() => setClipFilter("all")}>All moments</button><button type="button" className={clipFilter === "top" ? "selected" : ""} onClick={() => setClipFilter("top")}>Top-scoring <Icon name="sparkle" size={13} /></button></div><span className="toolbar-hint"><Icon name="scissors" size={15} /> {projectClips.length ? `${projectClips.length} clip suggestions` : "A few examples to get you started"}</span></div>
            <div className="clip-grid">{visibleClips.map(renderClipCard)}</div>
            {!projectClips.length && <p className="demo-note clip-library-note"><Icon name="shield" size={14} /> Showing sample output. Create a project to build a clip workspace from your own source video.</p>}
          </section>}

          {view === "brand" && <section className="brand-layout">
            <div className="brand-settings-card">
              <div className="brand-card-heading"><span className="section-kicker">CAPTIONS THAT SOUND LIKE YOU</span><h2>Set your clip style</h2><p>Choose how your captions show up in your preview. You can fine-tune each clip later.</p></div>
              <div className="settings-field"><div className="settings-label-row"><strong>Caption treatment</strong><span>APPLIED TO NEW PROJECTS</span></div>
                <div className="caption-style-options">
                  <button type="button" className={`caption-option ${captionStyle === "bold" ? "chosen" : ""}`} onClick={() => setCaptionStyle("bold")}><span className="caption-sample sample-bold">MAKE IT<br />HAPPEN.</span><span><strong>Bold pop</strong><small>Big, energetic emphasis</small></span>{captionStyle === "bold" && <Icon name="check" size={16} />}</button>
                  <button type="button" className={`caption-option ${captionStyle === "minimal" ? "chosen" : ""}`} onClick={() => setCaptionStyle("minimal")}><span className="caption-sample sample-minimal">make it happen.</span><span><strong>Clean & quiet</strong><small>Subtle, understated captions</small></span>{captionStyle === "minimal" && <Icon name="check" size={16} />}</button>
                  <button type="button" className={`caption-option ${captionStyle === "karaoke" ? "chosen" : ""}`} onClick={() => setCaptionStyle("karaoke")}><span className="caption-sample sample-karaoke">MAKE IT <i>HAPPEN.</i></span><span><strong>Word by word</strong><small>Highlight along with the beat</small></span>{captionStyle === "karaoke" && <Icon name="check" size={16} />}</button>
                </div>
              </div>
              <div className="settings-field color-field"><div className="settings-label-row"><strong>Accent color</strong><span>YOUR SIGNATURE SHADE</span></div><div className="color-options">{[{ value: "#d4f66a", label: "Lime" }, { value: "#aa8cff", label: "Lilac" }, { value: "#ff9f7a", label: "Coral" }, { value: "#7bdce0", label: "Aqua" }, { value: "#faf8f2", label: "Cream" }].map((color) => <button key={color.value} type="button" className={`color-swatch ${brandColor === color.value ? "chosen" : ""}`} style={{ backgroundColor: color.value }} onClick={() => setBrandColor(color.value)} aria-label={`${color.label} accent`} title={color.label}>{brandColor === color.value && <Icon name="check" size={16} />}</button>)}</div></div>
              <div className="brand-settings-footer"><span><Icon name="shield" size={15} /> Your choices are saved for this session.</span><button type="button" className="button button-dark" onClick={() => notify("Brand styles saved for your next project.")}>Save brand kit <Icon name="arrow" size={15} /></button></div>
            </div>
            <div className="brand-preview-column"><div className="section-kicker">A LOOK BEFORE YOU LEAP</div><div className="brand-preview-frame" style={{ "--brand-accent": brandColor } as React.CSSProperties}><div className="brand-preview-image" style={{ backgroundImage: "linear-gradient(180deg,rgba(12,13,17,.08),rgba(12,13,17,.76)),url('/images/creator-studio.jpg')" }}><span className="preview-tag"><Icon name="sparkle" size={12} /> YOUR BRAND PREVIEW</span><div className={`brand-caption brand-caption-${captionStyle}`}>{captionStyle === "minimal" ? <>your next chapter<br />starts here.</> : captionStyle === "karaoke" ? <>YOUR NEXT <i>CHAPTER</i><br />STARTS HERE.</> : <>YOUR NEXT<br /><strong>CHAPTER</strong><br />STARTS HERE.</>}</div><span className="brand-handle">@jamiedavis</span></div></div><p className="preview-caption-note">Your selected style, shown on a frame from an example video.</p><div className="brand-feature-note"><span className="brand-feature-icon"><Icon name="palette" size={17} /></span><div><strong>Consistent from clip to clip</strong><p>Use one recognizable caption look to help every short feel like it came from you.</p></div></div></div>
          </section>}

          {view === "publish" && <section className="publish-layout">
            <div className="publish-intro-card"><div className="publish-decoration"><span><Icon name="send" size={22} /></span></div><div><span className="section-kicker">YOUR SHORT-FORM TOOLKIT</span><h2>Your next audience is out there.</h2><p>Pick the platforms you create for. Connecting accounts is shown as an interactive demo; publishing integrations are not configured in this workspace.</p></div><button type="button" className="button button-dark" onClick={() => setView("projects")}>Choose a clip <Icon name="arrow" size={15} /></button></div>
            <div className="platform-grid">{[{ id: "youtube", name: "YouTube Shorts", detail: "Reach a new audience with vertical video.", icon: "youtube" as IconName, tint: "yt" }, { id: "instagram", name: "Instagram Reels", detail: "Give your best moments a second life.", icon: "instagram" as IconName, tint: "ig" }, { id: "tiktok", name: "TikTok", detail: "Show up where culture is moving.", icon: "tiktok" as IconName, tint: "tt" }].map((platform) => { const connected = connectedPlatforms.includes(platform.id); return <div className="platform-card" key={platform.id}><span className={`platform-icon ${platform.tint}`}><Icon name={platform.icon} size={22} /></span><span className={`platform-state ${connected ? "is-connected" : ""}`}><span />{connected ? "CONNECTED" : "NOT CONNECTED"}</span><h3>{platform.name}</h3><p>{platform.detail}</p><button type="button" className={`platform-connect ${connected ? "connected" : ""}`} onClick={() => { setConnectedPlatforms((current) => connected ? current.filter((item) => item !== platform.id) : [...current, platform.id]); notify(connected ? `${platform.name} disconnected.` : `${platform.name} connected in demo mode.`); }}>{connected ? <><Icon name="check" size={15} /> Connected</> : <>Connect account <Icon name="arrow" size={15} /></>}</button></div>; })}</div>
            <div className="publish-footnote"><Icon name="shield" size={16} /><span><strong>Nothing posts without you.</strong> Account connections and direct publishing need platform API credentials. This demo lets you explore your workflow safely.</span></div>
          </section>}

          <footer className="app-footer"><span>Made for the moments worth sharing <span className="footer-heart">♥</span></span><span>CLIPWISE STUDIO <span>·</span> DEMO WORKSPACE</span></footer>
        </div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{menuItems}</nav>

      {isCreateOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isGenerating) resetCreate(); }}><section className={`modal-card create-modal ${isGenerating ? "is-processing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
        <div className="modal-topline"><span className="modal-icon"><Icon name={isGenerating ? "sparkle" : "video"} size={19} /></span><button type="button" className="modal-close" onClick={resetCreate} disabled={isGenerating} aria-label="Close"><Icon name="close" size={19} /></button></div>
        {isGenerating ? <div className="processing-view"><div className="processing-spinner"><Icon name="sparkle" size={25} /></div><span className="section-kicker">GOOD MOMENTS TAKE A SECOND</span><h2 id="create-modal-title">Setting up your studio…</h2><p>Putting your source, clip settings, and brand style together.</p><div className="processing-track"><span style={{ width: `${generationProgress}%` }} /></div><span className="processing-caption">Building your project <strong>{generationProgress}%</strong></span><div className="processing-steps"><span className={generationProgress > 25 ? "done" : "current"}><Icon name={generationProgress > 25 ? "check" : "video"} size={15} /> Preparing source</span><span className={generationProgress > 55 ? "done" : generationProgress > 25 ? "current" : ""}><Icon name={generationProgress > 55 ? "check" : "sparkle"} size={15} /> Finding standout moments</span><span className={generationProgress > 88 ? "done" : generationProgress > 55 ? "current" : ""}><Icon name={generationProgress > 88 ? "check" : "layers"} size={15} /> Setting up your clips</span></div><p className="demo-mode-hint">Clip suggestions are examples, not AI analysis. Uploaded video can be cropped locally; link-based video processing is not connected.</p></div> : <>
          <div className="modal-heading"><span className="section-kicker">A FRESH START</span><h2 id="create-modal-title">Let’s make something<br />worth sharing.</h2><p>Start with a video link or choose a file from your device.</p></div>
          <form onSubmit={handleCreateProject}>
            <div className="source-mode-tabs"><button type="button" className={sourceMode === "link" ? "selected" : ""} onClick={() => { setSourceMode("link"); setFormError(""); }}><Icon name="link" size={16} /> Paste a link</button><button type="button" className={sourceMode === "upload" ? "selected" : ""} onClick={() => { setSourceMode("upload"); setFormError(""); }}><Icon name="upload" size={16} /> Upload a video</button></div>
            {sourceMode === "link" ? <label className="form-field"><span>Video link</span><div className="field-with-icon"><Icon name="link" size={16} /><input type="url" value={sourceUrl} onChange={(event) => { setSourceUrl(event.target.value); if (!projectTitle && event.target.value) { try { setProjectTitle(new URL(event.target.value).hostname.replace(/^www\./, "") + " video"); } catch { /* Wait for a valid URL. */ } } }} placeholder="Paste a YouTube, Vimeo, or video link" autoFocus /></div><small>Works best with a public video URL you have permission to use.</small></label> : <div className={`upload-dropzone ${selectedFile ? "has-file" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectVideoFile(event.dataTransfer.files[0]); }}>
              {selectedFile ? <><span className="upload-file-icon"><Icon name="video" size={21} /></span><span className="upload-file-info"><strong>{selectedFile.name}</strong><small><FileSize bytes={selectedFile.size} />{fileDuration ? ` · ${formatDuration(fileDuration)}` : " · Video file"}</small></span><button className="remove-upload" type="button" aria-label="Remove video" onClick={() => { setSelectedFile(null); setFileDuration(0); if (fileInputRef.current) fileInputRef.current.value = ""; }}><Icon name="close" size={17} /></button></> : <><span className="upload-icon"><Icon name="upload" size={22} /></span><strong>Drop your video here</strong><span>or <button type="button" className="browse-link" onClick={() => fileInputRef.current?.click()}>browse files</button></span><small>MP4, MOV, or WebM · up to 1 GB</small></>}
              <input ref={fileInputRef} className="visually-hidden-input" type="file" accept="video/*" onChange={(event: ChangeEvent<HTMLInputElement>) => selectVideoFile(event.target.files?.[0])} />
            </div>}
            <label className="form-field title-field"><span>Project name</span><input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="e.g. The founder story episode" maxLength={180} /></label>
            <button type="button" className={`advanced-toggle ${advancedOpen ? "open" : ""}`} onClick={() => setAdvancedOpen((current) => !current)}><span><Icon name="layers" size={16} /> Clip settings <small>Optional</small></span><span className="advanced-chevron">⌄</span></button>
            {advancedOpen && <div className="advanced-settings"><label className="form-field"><span>What moments should we look for?</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} maxLength={800} placeholder="e.g. honest stories, actionable advice, or a surprising opinion" /><small>Tell your editor what would make a great clip.</small></label><div className="setting-pair"><div className="form-field"><span>Clip format</span><div className="ratio-options">{["9:16", "1:1", "16:9"].map((ratio) => <button type="button" key={ratio} className={aspectRatio === ratio ? "selected" : ""} onClick={() => setAspectRatio(ratio)}>{ratio}</button>)}</div></div><div className="form-field"><span>Clip ideas</span><select value={clipCount} onChange={(event) => setClipCount(Number(event.target.value))}>{[3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} suggestions</option>)}</select></div></div><div className="form-field"><span>Caption style</span><div className="ratio-options caption-modal-options">{([{ id: "bold", label: "Bold pop" }, { id: "minimal", label: "Clean" }, { id: "karaoke", label: "Word by word" }] as const).map((style) => <button type="button" key={style.id} className={captionStyle === style.id ? "selected" : ""} onClick={() => setCaptionStyle(style.id)}>{style.label}</button>)}</div></div></div>}
            {formError && <div className="form-error"><Icon name="help" size={16} /> {formError}</div>}
            <div className="modal-form-footer"><span><Icon name="shield" size={15} /> Your source stays yours.</span><button type="submit" className="button button-dark">Create clip ideas <Icon name="arrow" size={16} /></button></div>
            <p className="modal-disclaimer">Only project details are saved on the server. An uploaded file stays in this browser session and can be cropped locally; clip suggestions are illustrative, and pasted-link AI analysis is not connected.</p>
          </form>
        </>}
      </section></div>}

      {selectedProject && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProject(null); }}><section className="modal-card project-detail-modal" role="dialog" aria-modal="true" aria-labelledby="project-detail-title"><div className="detail-cover" style={{ backgroundImage: `linear-gradient(180deg,rgba(12,14,18,.05),rgba(12,14,18,.58)),url("${selectedProject.clips[0]?.image ?? "/images/podcast-studio.jpg"}")` }}><button type="button" className="modal-close detail-close" onClick={() => setSelectedProject(null)} aria-label="Close"><Icon name="close" size={19} /></button><span className="project-status detail-status"><span /> READY</span><div><span className="section-kicker">PROJECT OVERVIEW</span><h2 id="project-detail-title">{selectedProject.title}</h2><span className="detail-source">{selectedProject.sourceType === "upload" ? selectedProject.sourceName : selectedProject.sourceUrl}</span></div></div><div className="detail-content"><div className="detail-stats"><span><Icon name="scissors" size={15} /> {selectedProject.clips.length} clip suggestions</span><span><Icon name="clock" size={15} /> {selectedProject.durationSeconds ? formatDuration(selectedProject.durationSeconds) : "Duration not available"}</span><span><Icon name="video" size={15} /> {selectedProject.aspectRatio} format</span></div><div className="detail-clips-heading"><div><strong>Your standout moments</strong><small>Choose a moment to review and export a local clip or edit notes.</small></div><span className="demo-badge">SUGGESTIONS</span></div><div className="detail-clip-list">{selectedProject.clips.map((clip, index) => <button type="button" key={clip.id} className="detail-clip-row" onClick={() => { setSelectedProject(null); openClip({ clip, project: selectedProject, isDemo: false }); }}><span className="detail-clip-thumb" style={{ backgroundImage: `url("${clip.image}")` }}><span>{String(index + 1).padStart(2, "0")}</span></span><span className="detail-clip-info"><strong>{clip.title}</strong><small>{clip.start} – {clip.end} <span>·</span> {clip.duration}</small></span><span className="score-chip"><Icon name="sparkle" size={12} /> {clip.score}</span><Icon name="chevron" size={17} /></button>)}</div><div className="detail-actions"><span><Icon name="shield" size={14} /> Sample clip suggestions. Original video not modified.</span><button type="button" className="delete-project-button" onClick={() => deleteProject(selectedProject)}><Icon name="trash" size={15} /> Delete project</button></div></div></section></div>}

      {selectedClip && <div className="modal-backdrop clip-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeClip(); }}><section className="modal-card clip-detail-modal" role="dialog" aria-modal="true" aria-labelledby="clip-detail-title"><button type="button" className="modal-close clip-close" onClick={closeClip} aria-label="Close"><Icon name="close" size={19} /></button><div className={`clip-detail-preview ${localPreviewUrl ? "has-local-video" : ""}`} style={{ backgroundImage: localPreviewUrl ? "none" : `linear-gradient(180deg,rgba(13,14,19,.08),rgba(13,14,19,.16) 36%,rgba(13,14,19,.9)),url("${selectedClip.clip.image}")` }}>{localPreviewUrl && <video className="clip-source-video" src={localPreviewUrl} controls playsInline preload="metadata" onLoadedMetadata={(event) => { const video = event.currentTarget; const start = selectedClip.project?.durationSeconds ? parseTimestamp(selectedClip.clip.start) : 0; video.currentTime = Math.min(start, Math.max(0, video.duration - 0.1)); }} onTimeUpdate={(event) => { const video = event.currentTarget; const requestedEnd = selectedClip.project?.durationSeconds ? parseTimestamp(selectedClip.clip.end) : Math.min(38, video.duration); if (requestedEnd > 0 && video.currentTime >= Math.min(requestedEnd, video.duration)) video.pause(); }} />}<span className="preview-aspect">{selectedClip.project?.aspectRatio ?? "9:16"}</span>{localPreviewUrl && <span className="clip-preview-caption">{splitCaptionSegments(captionDraft)[0] || "Add captions below to include subtitles"}</span>}<span className="clip-detail-play"><Icon name="play" size={19} /></span><div className="clip-detail-caption">{selectedClip.clip.title.split(" ").slice(0, 5).join(" ")}<br /><strong>{selectedClip.clip.title.split(" ").slice(5).join(" ") || ""}</strong></div><span className="clip-detail-subtitle">{selectedClip.clip.transcript.split(".")[0]}.</span><div className="preview-timeline"><span /></div></div><div className="clip-detail-info"><div className="clip-detail-heading"><span className="section-kicker">{selectedClip.project?.title ?? "SAMPLE MOMENT"}</span><div className="clip-score-line"><span className="score-chip"><Icon name="sparkle" size={13} /> {selectedClip.clip.score} moment score</span><span className="tag-pill">{selectedClip.clip.tag}</span></div></div><label className="form-field"><span>Clip title</span><div className="clip-title-edit"><input id="clip-detail-title" value={clipTitleDraft} onChange={(event) => setClipTitleDraft(event.target.value)} maxLength={100} disabled={selectedClip.isDemo} /><Icon name="edit" size={16} /></div></label><div className="timestamp-box"><Icon name="clock" size={17} /><div><span>START & END</span><strong>{selectedClip.clip.start} <i>→</i> {selectedClip.clip.end}</strong></div><span className="timestamp-duration">{selectedClip.clip.duration}</span></div><div className="transcript-box caption-input-box"><div><strong>Captions on your clip</strong><button type="button" onClick={() => { void navigator.clipboard?.writeText(captionDraft); notify("Captions copied."); }} aria-label="Copy captions"><Icon name="copy" size={15} /></button></div><textarea value={captionDraft} onChange={(event) => setCaptionDraft(event.target.value)} rows={4} maxLength={5000} placeholder="Paste or type the words spoken in this clip…" /><p>These words will be timed across the trimmed video and burned in as subtitles. Automatic speech-to-text isn’t connected yet.</p></div><div className="clip-detail-actions">{selectedClip.project && !selectedClip.isDemo && <button type="button" className="button button-secondary save-title-button" onClick={saveClipChanges} disabled={clipSaving || clipTitleDraft.trim().length < 2}>{clipSaving ? "Saving…" : "Save title & captions"}</button>}<button type="button" className="button button-dark" disabled={renderingClipId === selectedClip.clip.id} onClick={() => { if (selectedClip.project && localVideoFiles.current.has(selectedClip.project.id)) void exportUploadedClip(selectedClip); else exportClipNotes(selectedClip); }}><Icon name="download" size={16} /> {renderingClipId === selectedClip.clip.id ? `Rendering ${renderProgress}%…` : localVideoFiles.current.has(selectedClip.project?.id ?? "") ? "Render & download clip" : "Download edit notes (.txt)"}</button></div><p className="clip-export-note">{localVideoFiles.current.has(selectedClip.project?.id ?? "") ? "The selected moment is cropped and captioned locally in your browser; the source video is never uploaded." : selectedClip.project?.sourceType === "upload" ? "The source file is not attached after a refresh. Recreate the project with the file to render a local video clip." : "No local source video is attached. This download contains the clip edit notes (.txt), not a video."}</p></div></section></div>}

      {helpOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}><section className="modal-card help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title"><div className="modal-topline"><span className="modal-icon"><Icon name="sparkle" size={19} /></span><button type="button" className="modal-close" onClick={() => setHelpOpen(false)} aria-label="Close"><Icon name="close" size={19} /></button></div><span className="section-kicker">A QUICK TOUR</span><h2 id="help-modal-title">Your next good idea is<br />closer than you think.</h2><div className="help-steps"><div><span>01</span><div><strong>Bring a video</strong><p>Start with a link or choose a video file. Uploaded files stay in this browser and can be cropped locally.</p></div></div><div><span>02</span><div><strong>Shape your suggestions</strong><p>Choose a vertical format, caption look, and the kinds of moments that feel like you.</p></div></div><div><span>03</span><div><strong>Fine-tune and export</strong><p>Edit clip titles, review transcripts, and crop an uploaded video locally or export an edit brief.</p></div></div></div><button type="button" className="button button-dark help-modal-button" onClick={() => { setHelpOpen(false); openCreate(); }}>Create a project <Icon name="arrow" size={16} /></button><p className="modal-disclaimer">AI moment detection from pasted links needs an external provider. Uploaded clips can be cropped locally in this browser tab.</p></section></div>}

      {toast && <div className="toast-message" role="status"><span><Icon name="check" size={15} /></span>{toast}</div>}
    </div>
  );
}
