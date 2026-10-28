import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { videoProjects, type ProjectClip } from "@/db/schema";

export const dynamic = "force-dynamic";

function formatTimestamp(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

const clipIdeas: Omit<ProjectClip, "id">[] = [
  {
    title: "The moment it finally clicked",
    start: "00:02:14",
    end: "00:02:52",
    duration: "0:38",
    score: 96,
    image: "/images/podcast-studio.jpg",
    transcript: "The difference between a good idea and a great one is usually the moment you decide to actually try it. You don't need the perfect plan. You just need to take the first step.",
    tag: "Big idea",
  },
  {
    title: "Advice I wish I heard sooner",
    start: "00:08:31",
    end: "00:09:04",
    duration: "0:33",
    score: 91,
    image: "/images/creator-studio.jpg",
    transcript: "Stop waiting until you're ready. Start where you are, work with what you have, and figure out the next step as you go. That's where the real progress happens.",
    tag: "Practical tip",
  },
  {
    title: "This changes how you see it",
    start: "00:14:06",
    end: "00:14:48",
    duration: "0:42",
    score: 89,
    image: "/images/wellness-studio.jpg",
    transcript: "Most people think the hard part is staying motivated. It isn't. The real secret is building a routine that still works on the days you don't feel like showing up.",
    tag: "Hot take",
  },
  {
    title: "One tiny habit, a huge difference",
    start: "00:18:42",
    end: "00:19:17",
    duration: "0:35",
    score: 87,
    image: "/images/podcast-studio.jpg",
    transcript: "If you can make one thing just a little easier every day, the compounding effect is incredible. Small wins are not small when you keep stacking them.",
    tag: "Story",
  },
  {
    title: "The truth about getting started",
    start: "00:24:10",
    end: "00:24:49",
    duration: "0:39",
    score: 85,
    image: "/images/creator-studio.jpg",
    transcript: "You don't build confidence first and then take action. You take action, see that you can do hard things, and confidence follows after.",
    tag: "Mindset",
  },
  {
    title: "Why most people miss the opportunity",
    start: "00:31:02",
    end: "00:31:38",
    duration: "0:36",
    score: 82,
    image: "/images/wellness-studio.jpg",
    transcript: "The opportunity is usually hiding inside the thing people keep putting off. It's not flashy, but that's exactly why almost nobody notices it.",
    tag: "Story",
  },
];

export async function GET() {
  try {
    const projects = await db
      .select()
      .from(videoProjects)
      .orderBy(desc(videoProjects.createdAt))
      .limit(30);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Unable to load video projects:", error);
    return NextResponse.json({ error: "Projects are temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const sourceType = body.sourceType === "upload" ? "upload" : "link";
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
    const sourceName = typeof body.sourceName === "string" ? body.sourceName.trim() : "";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 800) : "";
    const aspectRatio = ["9:16", "1:1", "16:9"].includes(String(body.aspectRatio))
      ? String(body.aspectRatio)
      : "9:16";
    const captionStyle = ["bold", "minimal", "karaoke"].includes(String(body.captionStyle))
      ? String(body.captionStyle)
      : "bold";
    const requestedCount = Number(body.clipCount);
    const clipCount = Number.isFinite(requestedCount)
      ? Math.max(1, Math.min(6, Math.round(requestedCount)))
      : 3;

    if (title.length < 2 || title.length > 180) {
      return NextResponse.json({ error: "Add a project name between 2 and 180 characters." }, { status: 400 });
    }

    if (sourceType === "link") {
      if (!sourceUrl) {
        return NextResponse.json({ error: "Paste a video link to get started." }, { status: 400 });
      }
      try {
        const parsedUrl = new URL(sourceUrl);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error("Unsupported protocol");
      } catch {
        return NextResponse.json({ error: "Enter a valid video link, including https://." }, { status: 400 });
      }
    }

    const durationSeconds = Math.max(0, Math.min(36000, Math.round(Number(body.durationSeconds) || 0)));
    const clips: ProjectClip[] = Array.from({ length: clipCount }, (_, index) => {
      const idea = clipIdeas[index % clipIdeas.length];
      if (!durationSeconds) return { ...idea, id: crypto.randomUUID(), transcript: "" };

      const clipLength = Math.max(1, Math.min(38, Math.floor(durationSeconds / 3)));
      const availableStart = Math.max(0, durationSeconds - clipLength);
      const startSeconds = Math.floor(availableStart * (index + 1) / (clipCount + 1));
      const endSeconds = Math.min(durationSeconds, startSeconds + clipLength);
      const actualLength = endSeconds - startSeconds;
      const clipMinutes = Math.floor(actualLength / 60);
      const clipRemainder = actualLength % 60;

      return {
        ...idea,
        id: crypto.randomUUID(),
        transcript: "",
        start: formatTimestamp(startSeconds),
        end: formatTimestamp(endSeconds),
        duration: `${clipMinutes}:${String(clipRemainder).padStart(2, "0")}`,
      };
    });

    const [project] = await db
      .insert(videoProjects)
      .values({
        title,
        sourceUrl: sourceType === "link" ? sourceUrl : null,
        sourceName: sourceName || (sourceType === "upload" ? title : null),
        sourceType,
        durationSeconds,
        status: "ready",
        clipCount: clips.length,
        aspectRatio,
        captionStyle,
        prompt: prompt || null,
        clips,
      })
      .returning();

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Unable to create video project:", error);
    return NextResponse.json({ error: "Your project could not be created. Please try again." }, { status: 500 });
  }
}
