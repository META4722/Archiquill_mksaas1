CREATE TABLE "user_generation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text NOT NULL,
	"prompt" text NOT NULL,
	"tool_type" text NOT NULL,
	"style" text NOT NULL,
	"aspect_ratio" text NOT NULL,
	"source_image_url" text,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_generation" ADD CONSTRAINT "user_generation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_generation_user_id_idx" ON "user_generation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_generation_tool_type_idx" ON "user_generation" USING btree ("tool_type");--> statement-breakpoint
CREATE INDEX "user_generation_created_at_idx" ON "user_generation" USING btree ("created_at");