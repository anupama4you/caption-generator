-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('instagram', 'tiktok', 'youtube_shorts', 'youtube_long', 'facebook', 'linkedin', 'x', 'pinterest', 'snapchat', 'all');

-- CreateEnum
CREATE TYPE "ContentFormat" AS ENUM ('short_video', 'long_video', 'image', 'carousel', 'story', 'text_only');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "subscriptionStart" TIMESTAMP(3),
    "subscriptionEnd" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "niche" TEXT,
    "brandVoice" TEXT,
    "targetAudience" TEXT,
    "preferredPlatforms" "Platform"[],
    "emojiPreference" BOOLEAN NOT NULL DEFAULT true,
    "defaultHashtags" TEXT,
    "toneOfVoice" TEXT,
    "includeQuestions" BOOLEAN NOT NULL DEFAULT true,
    "ctaStyle" TEXT NOT NULL DEFAULT 'moderate',
    "avoidClickbait" BOOLEAN NOT NULL DEFAULT false,
    "formalityLevel" TEXT NOT NULL DEFAULT 'balanced',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "captionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "monthlyLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptionAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentFormat" "ContentFormat" NOT NULL,
    "contentDescription" TEXT NOT NULL,
    "niche" TEXT,
    "brandVoice" TEXT,
    "targetAudience" TEXT,
    "emojiPreference" BOOLEAN NOT NULL DEFAULT true,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaptionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caption" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "variantNumber" INTEGER NOT NULL DEFAULT 1,
    "generatedCaption" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "hashtags" TEXT[],
    "hashtagReason" TEXT,
    "storySlides" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Caption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptionAnalytics" (
    "id" TEXT NOT NULL,
    "captionId" TEXT NOT NULL,
    "engagementScore" DOUBLE PRECISION NOT NULL,
    "reachEstimate" TEXT NOT NULL,
    "viralityScore" DOUBLE PRECISION NOT NULL,
    "hashtagScore" DOUBLE PRECISION NOT NULL,
    "lengthScore" DOUBLE PRECISION NOT NULL,
    "emojiScore" DOUBLE PRECISION NOT NULL,
    "timingScore" DOUBLE PRECISION NOT NULL,
    "keywordScore" DOUBLE PRECISION NOT NULL,
    "bestPostingTime" TEXT[],
    "improvementTips" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaptionAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingHashtag" (
    "id" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "trendScore" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingHashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "monthlyCaptionLimit" INTEGER NOT NULL,
    "features" TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UsageTracking_userId_month_year_idx" ON "UsageTracking"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_userId_month_year_key" ON "UsageTracking"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "CaptionAttempt_userId_createdAt_idx" ON "CaptionAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Caption_attemptId_idx" ON "Caption"("attemptId");

-- CreateIndex
CREATE INDEX "Caption_platform_idx" ON "Caption"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "CaptionAnalytics_captionId_key" ON "CaptionAnalytics"("captionId");

-- CreateIndex
CREATE INDEX "TrendingHashtag_platform_category_trendScore_idx" ON "TrendingHashtag"("platform", "category", "trendScore");

-- CreateIndex
CREATE INDEX "TrendingHashtag_isActive_lastUpdated_idx" ON "TrendingHashtag"("isActive", "lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingHashtag_hashtag_platform_key" ON "TrendingHashtag"("hashtag", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_tier_key" ON "SubscriptionPlan"("tier");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptionAttempt" ADD CONSTRAINT "CaptionAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caption" ADD CONSTRAINT "Caption_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "CaptionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptionAnalytics" ADD CONSTRAINT "CaptionAnalytics_captionId_fkey" FOREIGN KEY ("captionId") REFERENCES "Caption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
