CREATE TABLE "professional" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(100),
	"whatsapp" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_whatsapp_unique" UNIQUE("whatsapp")
);
--> statement-breakpoint
ALTER TABLE "client" ALTER COLUMN "id" SET DATA TYPE integer;