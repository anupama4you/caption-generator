import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

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
    { hashtag: '#instagood', platform: 'INSTAGRAM', category: 'general', score: 95 },
    { hashtag: '#photooftheday', platform: 'INSTAGRAM', category: 'general', score: 93 },
    { hashtag: '#love', platform: 'INSTAGRAM', category: 'general', score: 98 },
    { hashtag: '#fashion', platform: 'INSTAGRAM', category: 'fashion', score: 90 },
    { hashtag: '#fitness', platform: 'INSTAGRAM', category: 'fitness', score: 88 },
    { hashtag: '#foodie', platform: 'INSTAGRAM', category: 'food', score: 87 },
    { hashtag: '#travel', platform: 'INSTAGRAM', category: 'travel', score: 89 },
    { hashtag: '#reels', platform: 'INSTAGRAM', category: 'general', score: 92 },

    // TikTok
    { hashtag: '#fyp', platform: 'TIKTOK', category: 'general', score: 99 },
    { hashtag: '#foryou', platform: 'TIKTOK', category: 'general', score: 98 },
    { hashtag: '#viral', platform: 'TIKTOK', category: 'general', score: 95 },
    { hashtag: '#trending', platform: 'TIKTOK', category: 'general', score: 93 },
    { hashtag: '#fitnessmotivation', platform: 'TIKTOK', category: 'fitness', score: 85 },
    { hashtag: '#foodtok', platform: 'TIKTOK', category: 'food', score: 86 },
    { hashtag: '#tiktoktravel', platform: 'TIKTOK', category: 'travel', score: 84 },

    // Facebook
    { hashtag: '#facebook', platform: 'FACEBOOK', category: 'general', score: 80 },
    { hashtag: '#socialmedia', platform: 'FACEBOOK', category: 'general', score: 75 },
    { hashtag: '#community', platform: 'FACEBOOK', category: 'general', score: 78 },

    // YouTube
    { hashtag: '#youtube', platform: 'YOUTUBE', category: 'general', score: 92 },
    { hashtag: '#youtuber', platform: 'YOUTUBE', category: 'general', score: 88 },
    { hashtag: '#subscribe', platform: 'YOUTUBE', category: 'general', score: 85 },
    { hashtag: '#vlog', platform: 'YOUTUBE', category: 'general', score: 83 },
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
