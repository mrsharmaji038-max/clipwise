import { desc } from "drizzle-orm";
import { db } from "@/db";
import { videoProjects } from "@/db/schema";
import ClipwiseStudio from "./studio";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects: (typeof videoProjects.$inferSelect)[] = [];
  try {
    projects = await db
      .select()
      .from(videoProjects)
      .orderBy(desc(videoProjects.createdAt))
      .limit(30);
  } catch (error) {
    console.error("Unable to load workspace projects:", error);
  }

  const initialProjects = projects.map((project) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
  }));

  return <ClipwiseStudio initialProjects={initialProjects} />;
}
