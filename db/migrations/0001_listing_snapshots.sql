CREATE TABLE "listing_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"platform" text DEFAULT 'whatnot' NOT NULL,
	"show_id" text NOT NULL,
	"listing_title" text NOT NULL,
	"category" text,
	"seller_username" text,
	"price_cents" integer,
	"bid_count" integer,
	"hammered" boolean DEFAULT false
);
--> statement-breakpoint
CREATE INDEX "listing_captured_idx" ON "listing_snapshots" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "listing_show_idx" ON "listing_snapshots" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "listing_platform_idx" ON "listing_snapshots" USING btree ("platform");
