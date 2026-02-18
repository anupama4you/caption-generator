import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ─── Test Users ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Test@1234', 10);

  // Free tier test user
  await prisma.user.upsert({
    where: { email: 'test@captions4you.com' },
    update: {},
    create: {
      email: 'test@captions4you.com',
      password: hashedPassword,
      name: 'Test User (Free)',
      subscriptionTier: 'FREE',
    },
  });

  // Premium tier test user (subscription valid for 1 year)
  await prisma.user.upsert({
    where: { email: 'premium@captions4you.com' },
    update: {},
    create: {
      email: 'premium@captions4you.com',
      password: hashedPassword,
      name: 'Test User (Premium)',
      subscriptionTier: 'PREMIUM',
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  });

  console.log('Test users seeded');
  console.log('  Free:    test@captions4you.com    / Test@1234');
  console.log('  Premium: premium@captions4you.com / Test@1234');
  // ──────────────────────────────────────────────────────────────────────────

  // Create subscription plans
  await prisma.subscriptionPlan.upsert({
    where: { tier: 'FREE' },
    update: {},
    create: {
      tier: 'FREE',
      monthlyCaptionLimit: 10,
      features: ['10 captions per month', 'Basic analytics', 'Caption history (30 days)'],
      price: 0,
      currency: 'USD',
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { tier: 'PREMIUM' },
    update: {},
    create: {
      tier: 'PREMIUM',
      monthlyCaptionLimit: 100,
      features: [
        '100 captions per month',
        'Advanced AI analytics',
        'Unlimited caption history',
        'Trending hashtag suggestions',
        'Export to CSV',
        'Priority support',
      ],
      price: 9.99,
      currency: 'USD',
    },
  });

  console.log('Subscription plans seeded');

  // Seed trending hashtags
  const trendingHashtags = [
    // Instagram
    { hashtag: '#instagood', platform: 'instagram', category: 'general', score: 95 },
    { hashtag: '#photooftheday', platform: 'instagram', category: 'general', score: 93 },
    { hashtag: '#love', platform: 'instagram', category: 'general', score: 98 },
    { hashtag: '#fashion', platform: 'instagram', category: 'fashion', score: 90 },
    { hashtag: '#fitness', platform: 'instagram', category: 'fitness', score: 88 },
    { hashtag: '#foodie', platform: 'instagram', category: 'food', score: 87 },
    { hashtag: '#travel', platform: 'instagram', category: 'travel', score: 89 },
    { hashtag: '#reels', platform: 'instagram', category: 'general', score: 92 },

    // TikTok
    { hashtag: '#fyp', platform: 'tiktok', category: 'general', score: 99 },
    { hashtag: '#foryou', platform: 'tiktok', category: 'general', score: 98 },
    { hashtag: '#viral', platform: 'tiktok', category: 'general', score: 95 },
    { hashtag: '#trending', platform: 'tiktok', category: 'general', score: 93 },
    { hashtag: '#fitnessmotivation', platform: 'tiktok', category: 'fitness', score: 85 },
    { hashtag: '#foodtok', platform: 'tiktok', category: 'food', score: 86 },
    { hashtag: '#tiktoktravel', platform: 'tiktok', category: 'travel', score: 84 },

    // Facebook
    { hashtag: '#facebook', platform: 'facebook', category: 'general', score: 80 },
    { hashtag: '#socialmedia', platform: 'facebook', category: 'general', score: 75 },
    { hashtag: '#community', platform: 'facebook', category: 'general', score: 78 },

    // YouTube
    { hashtag: '#shorts', platform: 'youtube_shorts', category: 'general', score: 90 },
    { hashtag: '#youtubeshorts', platform: 'youtube_shorts', category: 'general', score: 88 },
    { hashtag: '#ytshorts', platform: 'youtube_shorts', category: 'general', score: 85 },
    { hashtag: '#youtube', platform: 'youtube_long', category: 'general', score: 92 },
    { hashtag: '#youtuber', platform: 'youtube_long', category: 'general', score: 88 },
    { hashtag: '#subscribe', platform: 'youtube_long', category: 'general', score: 85 },
    { hashtag: '#vlog', platform: 'youtube_long', category: 'general', score: 83 },

    // LinkedIn
    { hashtag: '#careerdevelopment', platform: 'linkedin', category: 'general', score: 82 },
    { hashtag: '#leadership', platform: 'linkedin', category: 'general', score: 80 },
    { hashtag: '#b2bmarketing', platform: 'linkedin', category: 'marketing', score: 78 },

    // X (Twitter)
    { hashtag: '#buildinpublic', platform: 'x', category: 'general', score: 82 },
    { hashtag: '#newsthread', platform: 'x', category: 'general', score: 79 },
    { hashtag: '#marketingtwitter', platform: 'x', category: 'marketing', score: 77 },

    // Pinterest
    { hashtag: '#pinterestideas', platform: 'pinterest', category: 'general', score: 80 },
    { hashtag: '#diyprojects', platform: 'pinterest', category: 'diy', score: 82 },
    { hashtag: '#homedecor', platform: 'pinterest', category: 'home', score: 79 },

    // Snapchat
    { hashtag: '#snapchat', platform: 'snapchat', category: 'general', score: 78 },
    { hashtag: '#snaplife', platform: 'snapchat', category: 'general', score: 76 },
    { hashtag: '#snapfam', platform: 'snapchat', category: 'community', score: 75 },
  ];

  for (const tag of trendingHashtags) {
    await prisma.trendingHashtag.upsert({
      where: {
        hashtag_platform: {
          hashtag: tag.hashtag,
          platform: tag.platform as any,
        },
      },
      update: {
        trendScore: tag.score,
        lastUpdated: new Date(),
      },
      create: {
        hashtag: tag.hashtag,
        platform: tag.platform as any,
        category: tag.category,
        trendScore: tag.score,
      },
    });
  }

  console.log('Trending hashtags seeded');
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
