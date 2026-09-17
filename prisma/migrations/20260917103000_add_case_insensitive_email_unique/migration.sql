-- CreateIndex
-- Case-insensitive unique index for non-null email addresses to prevent duplicate accounts
CREATE UNIQUE INDEX IF NOT EXISTS "User_lower_email_idx" ON "User"(LOWER("email")) WHERE "email" IS NOT NULL;
