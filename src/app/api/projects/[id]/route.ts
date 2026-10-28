import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { videoProjects } from "@/db/schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { clipId?: string; title?: string; transcript?: string };
    if (!body.clipId || (body.title === undefined && body.transcript === undefined)) {
      return NextResponse.json({ error: "A clip and a title or caption update are required." }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : undefined;
    const transcript = typeof body.transcript === "string" ? body.transcript.trim().slice(0, 5000) : undefined;
    if (title !== undefined && title.length < 2) {
      return NextResponse.json({ error: "Clip titles must be at least two characters." }, { status: 400 });
    }

    const [project] = await db.select().from(videoProjects).where(eq(videoProjects.id, id)).limit(1);
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const clips = project.clips.map((clip) =>
      clip.id === body.clipId
        ? { ...clip, ...(title !== undefined ? { title } : {}), ...(transcript !== undefined ? { transcript } : {}) }
        : clip,
    );
    if (clips.every((clip) => clip.id !== body.clipId)) {
      return NextResponse.json({ error: "Clip not found." }, { status: 404 });
    }

    const [updatedProject] = await db
      .update(videoProjects)
      .set({ clips, updatedAt: new Date() })
      .where(eq(videoProjects.id, id))
      .returning();

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Unable to update clip:", error);
    return NextResponse.json({ error: "The clip could not be updated." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const [deletedProject] = await db
      .delete(videoProjects)
      .where(eq(videoProjects.id, id))
      .returning({ id: videoProjects.id });

    if (!deletedProject) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete project:", error);
    return NextResponse.json({ error: "The project could not be deleted." }, { status: 500 });
  }
}
