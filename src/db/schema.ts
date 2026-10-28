import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export type ProjectClip = {
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

export const videoProjects = pgTable("video_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  sourceUrl: text("source_url"),
  sourceName: varchar("source_name", { length: 255 }),
  sourceType: varchar("source_type", { length: 24 }).notNull().default("link"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  status: varchar("status", { length: 24 }).notNull().default("ready"),
  clipCount: integer("clip_count").notNull().default(0),
  aspectRatio: varchar("aspect_ratio", { length: 12 }).notNull().default("9:16"),
  captionStyle: varchar("caption_style", { length: 32 }).notNull().default("bold"),
  prompt: text("prompt"),
  clips: jsonb("clips").$type<ProjectClip[]>().notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

