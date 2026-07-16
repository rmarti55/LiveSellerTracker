CREATE TABLE "show_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"platform" text DEFAULT 'whatnot' NOT NULL,
	"show_id" text NOT NULL,
	"title" text,
	"status" text,
	"active_viewers" integer DEFAULT 0 NOT NULL,
	"watchlist" integer DEFAULT 0 NOT NULL,
	"start_time" bigint,
	"category" text,
	"seller_username" text,
	"seller_num_reviews" integer,
	"is_premier" boolean DEFAULT false
);
--> statement-breakpoint
CREATE INDEX "captured_idx" ON "show_snapshots" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "seller_idx" ON "show_snapshots" USING btree ("seller_username");--> statement-breakpoint
CREATE INDEX "show_idx" ON "show_snapshots" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "platform_idx" ON "show_snapshots" USING btree ("platform");