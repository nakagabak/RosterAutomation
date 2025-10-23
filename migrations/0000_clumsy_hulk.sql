CREATE TABLE "bathroom_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roster_id" varchar NOT NULL,
	"bathroom_number" integer NOT NULL,
	"assigned_to" text NOT NULL,
	"cleaning_mode" text NOT NULL,
	"rotation_index" integer
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"proof_photos" text[]
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roster_id" varchar NOT NULL,
	"name" text NOT NULL,
	"assigned_to" text NOT NULL,
	"is_custom_task" boolean DEFAULT false NOT NULL,
	"rotation_index" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "weekly_rosters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start_date" timestamp NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
