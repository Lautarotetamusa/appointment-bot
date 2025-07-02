CREATE TABLE "client" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"whatsapp" varchar(20) NOT NULL,
	"email" varchar(100),
	"registration_date" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_whatsapp_unique" UNIQUE("whatsapp")
);
