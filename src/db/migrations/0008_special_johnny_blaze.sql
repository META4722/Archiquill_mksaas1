CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"reference_id" text NOT NULL,
	"creem_customer_id" text,
	"creem_subscription_id" text,
	"creem_order_id" text,
	"status" text DEFAULT 'pending',
	"period_start" timestamp,
	"period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "creem_customer_id" text;