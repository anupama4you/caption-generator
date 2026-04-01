-- Add publishTrialUsed to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "publishTrialUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable SocialAccount
CREATE TABLE IF NOT EXISTS "SocialAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountAvatar" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable PublishPost
CREATE TABLE IF NOT EXISTS "PublishPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "cloudinaryId" TEXT,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "platforms" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable PublishResult
CREATE TABLE IF NOT EXISTS "PublishResult" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "postUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_userId_platform_key" ON "SocialAccount"("userId", "platform");
CREATE INDEX IF NOT EXISTS "SocialAccount_userId_idx" ON "SocialAccount"("userId");
CREATE INDEX IF NOT EXISTS "PublishPost_userId_createdAt_idx" ON "PublishPost"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "PublishResult_postId_idx" ON "PublishResult"("postId");

-- AddForeignKey SocialAccount -> User
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SocialAccount_userId_fkey'
  ) THEN
    ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey PublishPost -> User
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PublishPost_userId_fkey'
  ) THEN
    ALTER TABLE "PublishPost" ADD CONSTRAINT "PublishPost_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey PublishResult -> PublishPost
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PublishResult_postId_fkey'
  ) THEN
    ALTER TABLE "PublishResult" ADD CONSTRAINT "PublishResult_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "PublishPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
