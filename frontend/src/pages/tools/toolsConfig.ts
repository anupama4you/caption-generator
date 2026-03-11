export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolConfig {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  h1: string;
  tagline: string;
  bodyDescription: string;
  platforms: string[];
  defaultContentFormat: string;
  niche?: string;
  placeholderText: string;
  features: { title: string; desc: string }[];
  faqs: ToolFaq[];
}

const toolsConfig: ToolConfig[] = [
  {
    slug: 'instagram-caption-generator',
    metaTitle: 'Free Instagram Caption Generator — AI Captions in Seconds | Captions4You',
    metaDescription: 'Generate the perfect Instagram caption instantly with AI. Get 3 caption variants with trending hashtags for every post. Free to try — no signup required.',
    keywords: 'instagram caption generator, free instagram captions, AI instagram captions, instagram post captions, captions for instagram',
    h1: 'Free Instagram Caption Generator',
    tagline: 'Generate viral Instagram captions with trending hashtags in seconds.',
    bodyDescription: 'Stop staring at a blank caption box. Describe your photo or reel and our AI instantly writes platform-optimised captions with the right hashtags, tone, and length for Instagram.',
    platforms: ['instagram'],
    defaultContentFormat: 'image',
    placeholderText: 'e.g. A flat lay of my morning coffee and journal on a wooden desk, golden hour lighting…',
    features: [
      { title: 'Platform-optimised length', desc: 'Instagram captions are tuned for engagement — not too short, not too long.' },
      { title: '15–25 trending hashtags', desc: 'Get a curated mix of popular and niche hashtags tailored to your content.' },
      { title: '3 caption variants', desc: 'Choose from short, medium, and long-form versions for A/B testing.' },
    ],
    faqs: [
      { q: 'How do I write a good Instagram caption?', a: 'A good Instagram caption starts with a hook in the first line (visible before "more"), includes relevant hashtags, and ends with a call-to-action. Our AI handles all of this automatically.' },
      { q: 'How many hashtags should I use on Instagram?', a: 'Instagram recommends 3–5 hashtags but creators see strong results with 15–25. Our generator provides a curated mix of trending and niche hashtags.' },
      { q: 'Is the Instagram caption generator free?', a: 'Yes — you can generate captions without signing up. Create a free account for 5 captions/month and upgrade to Premium for 100/month.' },
      { q: 'Can I use these captions for Reels?', a: 'Absolutely. Select "Short Video" as your content type and the AI will optimise the caption specifically for Reels with hook-first writing.' },
    ],
  },
  {
    slug: 'tiktok-caption-generator',
    metaTitle: 'Free TikTok Caption Generator — AI Captions for Viral Videos | Captions4You',
    metaDescription: 'Create TikTok captions that go viral. Our AI writes short, punchy captions with the right hashtags for maximum For You Page reach. Free, no signup needed.',
    keywords: 'tiktok caption generator, tiktok captions, free tiktok captions, tiktok hashtag generator, for you page captions',
    h1: 'Free TikTok Caption Generator',
    tagline: 'Write captions that land on the For You Page.',
    bodyDescription: 'TikTok captions are short, punchy, and hashtag-smart. Describe your video and our AI writes captions optimised for the TikTok algorithm — with #fyp, #foryou, and niche-specific tags that boost discovery.',
    platforms: ['tiktok'],
    defaultContentFormat: 'short_video',
    placeholderText: 'e.g. A quick 30-second workout showing 5 ab exercises you can do at home with no equipment…',
    features: [
      { title: 'FYP-optimised format', desc: 'Short, hook-driven captions designed to get picked up by the TikTok algorithm.' },
      { title: 'Strategic hashtag mix', desc: 'Combines #fyp, #foryou, trending tags, and niche tags for maximum reach.' },
      { title: 'Casual, engaging tone', desc: 'Matches TikTok\'s authentic, conversational content style.' },
    ],
    faqs: [
      { q: 'Do TikTok captions affect views?', a: 'Yes. TikTok\'s algorithm reads your caption to understand what your video is about and who to show it to. The right keywords and hashtags significantly improve your reach.' },
      { q: 'Should I use #fyp on TikTok?', a: '#fyp and #foryou are used by millions of creators and signal to TikTok that you want wider distribution. Our generator includes them in every TikTok caption.' },
      { q: 'How long should a TikTok caption be?', a: 'TikTok shows only the first line before "more" on the For You Page. Keep your main hook under 100 characters. Our AI writes with this in mind.' },
      { q: 'Can I generate captions for TikTok Stories?', a: 'Yes. Select "Story" as the content type to get slide-by-slide text optimised for TikTok Stories format.' },
    ],
  },
  {
    slug: 'youtube-caption-generator',
    metaTitle: 'Free YouTube Description Generator — AI-Written Titles & Descriptions | Captions4You',
    metaDescription: 'Generate SEO-optimised YouTube titles, descriptions, and hashtags instantly with AI. Rank higher, get more views. Free to try.',
    keywords: 'youtube description generator, youtube title generator, youtube SEO, youtube caption generator, AI youtube description',
    h1: 'Free YouTube Description Generator',
    tagline: 'AI-written titles, descriptions, and hashtags that rank on YouTube.',
    bodyDescription: 'YouTube SEO starts with your title and description. Our AI generates keyword-rich titles and detailed descriptions with timestamps, chapter markers, and 8–15 SEO hashtags — everything you need to rank and get discovered.',
    platforms: ['youtube_long'],
    defaultContentFormat: 'long_video',
    placeholderText: 'e.g. A 15-minute tutorial on how to make sourdough bread at home for beginners, covering starter, dough, and baking…',
    features: [
      { title: 'SEO-optimised titles', desc: 'Click-worthy titles with your target keywords in the right positions.' },
      { title: 'Full video descriptions', desc: 'Multi-paragraph descriptions with keywords, links placeholder, and chapters.' },
      { title: '8–15 SEO hashtags', desc: 'Hashtags that boost search visibility on YouTube and Google.' },
    ],
    faqs: [
      { q: 'Does a YouTube description help with SEO?', a: 'Yes. YouTube and Google both index your video description. Including relevant keywords, timestamps, and links helps your video rank in search results.' },
      { q: 'How long should a YouTube description be?', a: 'The ideal YouTube description is 200–500 words. Include keywords in the first 2–3 sentences since those appear in search results.' },
      { q: 'What hashtags should I use on YouTube?', a: 'Use 3–5 broad topic hashtags (e.g. #cooking #recipe) plus 3–5 niche-specific tags. Our generator creates the right mix based on your content.' },
      { q: 'Can I generate YouTube Shorts descriptions too?', a: 'Yes. Use our dedicated YouTube Shorts Caption Generator for short-form content optimised for the Shorts feed.' },
    ],
  },
  {
    slug: 'youtube-shorts-caption-generator',
    metaTitle: 'Free YouTube Shorts Caption Generator — AI Captions for Shorts | Captions4You',
    metaDescription: 'Generate punchy YouTube Shorts titles and captions with AI. Get more views on the Shorts feed with optimised hooks and hashtags. Free to try.',
    keywords: 'youtube shorts caption generator, youtube shorts title, youtube shorts hashtags, AI shorts captions',
    h1: 'Free YouTube Shorts Caption Generator',
    tagline: 'Titles and captions that get your Shorts discovered.',
    bodyDescription: 'YouTube Shorts is the fastest-growing short-video platform. Our AI writes punchy, click-worthy titles and captions with the right hashtags (#Shorts, #YouTubeShorts) to maximise your views on the Shorts feed.',
    platforms: ['youtube_shorts'],
    defaultContentFormat: 'short_video',
    placeholderText: 'e.g. A 60-second video showing a life hack for organising your desk in under 5 minutes…',
    features: [
      { title: '#Shorts optimised', desc: 'Every caption includes #Shorts and #YouTubeShorts for maximum feed distribution.' },
      { title: 'Click-worthy titles', desc: 'Short, curiosity-driven titles that get tapped in the Shorts feed.' },
      { title: 'Fast-paced tone', desc: 'Captions written for the quick-scroll Shorts audience.' },
    ],
    faqs: [
      { q: 'Do YouTube Shorts need captions?', a: 'Yes. A strong title and description help YouTube understand your content and recommend it to the right viewers on the Shorts feed.' },
      { q: 'What is the best title length for YouTube Shorts?', a: 'Keep Shorts titles under 60 characters. Our AI generates concise, hook-driven titles optimised for mobile viewing.' },
      { q: 'Should I add #Shorts to every video?', a: 'Yes. Adding #Shorts to your title or description tells YouTube to distribute your video on the Shorts feed.' },
      { q: 'Can YouTube Shorts go viral?', a: 'Yes — Shorts are widely distributed by the algorithm. A great title, relevant hashtags, and engaging thumbnail are the key factors.' },
    ],
  },
  {
    slug: 'reel-caption-generator',
    metaTitle: 'Free Instagram Reel Caption Generator — AI Captions for Reels | Captions4You',
    metaDescription: 'Generate Instagram Reel captions that stop the scroll. AI-written hooks, CTAs, and hashtags for maximum reach. Free, no signup needed.',
    keywords: 'reel caption generator, instagram reels captions, AI reel captions, reels hashtags, viral reel captions',
    h1: 'Free Instagram Reel Caption Generator',
    tagline: 'Stop-the-scroll Reel captions written by AI.',
    bodyDescription: 'Instagram Reels need a different kind of caption — one that hooks viewers in the first line and keeps them watching. Our AI writes Reel-optimised captions with strong opening hooks, engagement questions, and trending hashtags.',
    platforms: ['instagram'],
    defaultContentFormat: 'short_video',
    placeholderText: 'e.g. A 30-second Reel showing a before and after bedroom makeover transformation on a $200 budget…',
    features: [
      { title: 'Hook-first writing', desc: 'The first line is your hook — visible before "more". Our AI nails it every time.' },
      { title: 'Engagement prompts', desc: 'Built-in questions and CTAs that boost comments and saves.' },
      { title: 'Trending Reels hashtags', desc: 'A mix of #Reels, #InstagramReels and niche-specific tags.' },
    ],
    faqs: [
      { q: 'What makes a good Reel caption?', a: 'A great Reel caption starts with a strong hook (first 125 characters visible before "more"), includes an engagement question or CTA, and ends with relevant hashtags.' },
      { q: 'Do captions matter for Reel views?', a: 'Yes. Instagram\'s algorithm reads your caption to determine who to show your Reel to. Relevant keywords and hashtags improve distribution.' },
      { q: 'Should Reel captions be long or short?', a: 'Medium-length captions (50–150 words) perform well for Reels. Our AI writes the right length based on your content type.' },
      { q: 'How do I get my Reels on the Explore page?', a: 'Strong engagement signals (likes, comments, saves, shares) push Reels to Explore. A compelling caption that prompts interaction is key.' },
    ],
  },
  {
    slug: 'linkedin-caption-generator',
    metaTitle: 'Free LinkedIn Post Generator — AI-Written LinkedIn Captions | Captions4You',
    metaDescription: 'Generate professional LinkedIn posts with AI. Thought leadership content, career updates, and company announcements — written and ready to post. Free to try.',
    keywords: 'linkedin post generator, linkedin caption generator, AI linkedin post, linkedin content generator, professional post generator',
    h1: 'Free LinkedIn Post Generator',
    tagline: 'Professional LinkedIn posts that build your personal brand.',
    bodyDescription: 'LinkedIn rewards thoughtful, professional content. Our AI writes posts in the right tone — formal enough for business, human enough to get engagement. Whether it\'s a career milestone, industry insight, or company update, get it written in seconds.',
    platforms: ['linkedin'],
    defaultContentFormat: 'text_only',
    placeholderText: 'e.g. Just completed a Google UX Design certification after 6 months of evening study while working full-time…',
    features: [
      { title: 'Professional tone', desc: 'LinkedIn-appropriate language that builds credibility and authority.' },
      { title: 'Storytelling structure', desc: 'Posts structured with a hook, insight, and CTA for maximum reach.' },
      { title: 'Relevant hashtags', desc: 'Professional hashtags that connect your post to industry conversations.' },
    ],
    faqs: [
      { q: 'What type of posts perform best on LinkedIn?', a: 'Personal stories, career milestones, lessons learned, and industry insights consistently outperform promotional content on LinkedIn. Our AI writes in these proven formats.' },
      { q: 'How long should a LinkedIn post be?', a: 'LinkedIn posts under 1,300 characters get cut off. Aim for 150–300 words for best engagement. Our generator hits this target automatically.' },
      { q: 'Should I use hashtags on LinkedIn?', a: 'Yes — 3–5 relevant hashtags improve discoverability on LinkedIn. Avoid using too many as it looks spammy.' },
      { q: 'Can I generate LinkedIn articles too?', a: 'Currently we generate LinkedIn posts (short-form). For longer articles, use the generated post as an outline and expand it.' },
    ],
  },
  {
    slug: 'facebook-caption-generator',
    metaTitle: 'Free Facebook Caption Generator — AI Post Captions for Facebook | Captions4You',
    metaDescription: 'Generate engaging Facebook post captions with AI. Photos, videos, events, and more — get captions that drive comments and shares. Free to try.',
    keywords: 'facebook caption generator, facebook post generator, AI facebook captions, facebook post ideas, social media caption generator',
    h1: 'Free Facebook Caption Generator',
    tagline: 'Facebook captions that drive comments, shares, and reach.',
    bodyDescription: 'Facebook\'s algorithm rewards posts that spark conversations. Our AI writes conversational, relatable captions designed to get your audience to comment and share — with 1–3 targeted hashtags for discoverability.',
    platforms: ['facebook'],
    defaultContentFormat: 'image',
    placeholderText: 'e.g. A photo of our team at the annual company picnic, showing everyone enjoying the sunshine and games…',
    features: [
      { title: 'Conversational tone', desc: 'Facebook responds to authentic, friendly writing — not marketing speak.' },
      { title: 'Engagement-first', desc: 'Built-in questions and prompts designed to generate comments.' },
      { title: 'Minimal hashtags', desc: 'Facebook works best with 1–3 targeted hashtags. No hashtag spam.' },
    ],
    faqs: [
      { q: 'How do I write a Facebook caption that gets engagement?', a: 'Ask a question, share a relatable story, or create a poll prompt. Our AI bakes in these engagement hooks automatically.' },
      { q: 'Should I use hashtags on Facebook?', a: 'Yes, but sparingly. 1–3 relevant hashtags improve reach without looking spammy on Facebook.' },
      { q: 'What is the ideal Facebook post length?', a: 'Posts between 40–80 words get the most engagement on Facebook. Our generator targets this range.' },
      { q: 'Can I generate captions for Facebook Reels?', a: 'Yes. Select "Short Video" as your content type to get captions optimised for Facebook Reels.' },
    ],
  },
  {
    slug: 'travel-caption-generator',
    metaTitle: 'Free Travel Caption Generator — AI Captions for Travel Photos | Captions4You',
    metaDescription: 'Generate beautiful travel captions for Instagram, TikTok, and Facebook with AI. Adventure quotes, destination captions, and travel hashtags ready in seconds.',
    keywords: 'travel caption generator, travel instagram captions, AI travel captions, travel photo captions, vacation captions',
    h1: 'Free Travel Caption Generator',
    tagline: 'Captions as beautiful as your travel photos.',
    bodyDescription: 'Your travel photos deserve captions as stunning as the destinations. Whether it\'s a beach sunset, mountain hike, or city street, our AI writes wanderlust-worthy captions with travel hashtags for Instagram, TikTok, and more.',
    platforms: ['instagram', 'tiktok'],
    defaultContentFormat: 'image',
    niche: 'travel',
    placeholderText: 'e.g. Watching the sunset from Santorini\'s cliffside, surrounded by white-washed buildings and blue domes…',
    features: [
      { title: 'Wanderlust-worthy writing', desc: 'Evocative, descriptive language that transports your followers.' },
      { title: 'Location-aware hashtags', desc: 'Travel hashtags like #wanderlust, #travelgram, and destination-specific tags.' },
      { title: 'Multi-platform', desc: 'Get captions for Instagram and TikTok in one click.' },
    ],
    faqs: [
      { q: 'What are good travel captions for Instagram?', a: 'Great travel captions paint a picture with words — describe the feeling, not just the place. Add a travel quote or personal reflection to boost saves.' },
      { q: 'What hashtags should I use for travel posts?', a: 'Mix broad tags (#travel #wanderlust) with destination-specific ones (#Santorini #Greece). Our AI generates the right combination automatically.' },
      { q: 'How do I get more engagement on travel posts?', a: 'Ask your audience a question about the destination, share a travel tip, or post at peak times (6–9 AM or 6–9 PM local time).' },
      { q: 'Can I generate captions for travel videos?', a: 'Yes. Select "Short Video" for Reels and TikToks, or "Long Video" for YouTube travel vlogs.' },
    ],
  },
  {
    slug: 'fitness-caption-generator',
    metaTitle: 'Free Fitness Caption Generator — AI Captions for Workout Posts | Captions4You',
    metaDescription: 'Generate motivational fitness captions for Instagram and TikTok with AI. Workout posts, gym selfies, transformation content — ready in seconds. Free to try.',
    keywords: 'fitness caption generator, workout caption generator, gym caption generator, AI fitness captions, motivational fitness captions',
    h1: 'Free Fitness Caption Generator',
    tagline: 'Motivational fitness captions that inspire action.',
    bodyDescription: 'Fitness content thrives on motivation and authenticity. Our AI writes powerful, energetic captions for workout posts, gym selfies, transformation stories, and nutrition content — with fitness hashtags that grow your following.',
    platforms: ['instagram', 'tiktok'],
    defaultContentFormat: 'short_video',
    niche: 'fitness',
    placeholderText: 'e.g. A 45-second clip of my full leg day workout showing squats, lunges, and leg press with form tips…',
    features: [
      { title: 'Motivational tone', desc: 'Energetic, inspiring language that resonates with the fitness community.' },
      { title: 'Fitness hashtag sets', desc: '#fitnessmotivation, #workout, #gym, and niche-specific fitness tags.' },
      { title: 'Transformation storytelling', desc: 'Perfect for before/after, milestone, and progress content.' },
    ],
    faqs: [
      { q: 'What are good captions for fitness posts?', a: 'The best fitness captions share the story behind the workout — the struggle, the progress, the result. Our AI writes authentic fitness narratives that resonate.' },
      { q: 'What fitness hashtags get the most reach?', a: '#fitness, #workout, #gym, #fitnessmotivation, and #fitlife are consistently high-reach. Our generator adds these plus niche-specific tags.' },
      { q: 'How do I grow my fitness account on Instagram?', a: 'Consistent posting, engaging captions with questions, and a mix of trending + niche hashtags. Our AI handles the caption and hashtag strategy for you.' },
      { q: 'Can I generate captions for nutrition and meal prep posts?', a: 'Yes. Enter your food or nutrition content description and the AI will write food-focused fitness captions with relevant hashtags.' },
    ],
  },
  {
    slug: 'food-caption-generator',
    metaTitle: 'Free Food Caption Generator — AI Captions for Food Photos | Captions4You',
    metaDescription: 'Generate mouthwatering food captions for Instagram, TikTok, and Facebook with AI. Restaurant posts, recipes, and food photography — captions ready in seconds.',
    keywords: 'food caption generator, food instagram captions, restaurant caption generator, AI food captions, recipe caption generator',
    h1: 'Free Food Caption Generator',
    tagline: 'Captions as delicious as your food photos.',
    bodyDescription: 'Food content is one of the most popular niches on social media. Our AI writes vivid, sensory-rich captions for restaurant posts, recipe videos, food photography, and more — with foodie hashtags to grow your audience.',
    platforms: ['instagram', 'tiktok'],
    defaultContentFormat: 'image',
    niche: 'food',
    placeholderText: 'e.g. A homemade tiramisu I made from scratch using my grandmother\'s recipe — layers of espresso-soaked ladyfingers and mascarpone cream…',
    features: [
      { title: 'Sensory-rich language', desc: 'Vivid descriptions that make followers hungry just reading your caption.' },
      { title: 'Food community hashtags', desc: '#foodie, #instafood, #foodphotography, and cuisine-specific tags.' },
      { title: 'Recipe & restaurant ready', desc: 'Works for home cooking, restaurant reviews, and food photography.' },
    ],
    faqs: [
      { q: 'What are good captions for food photos?', a: 'Great food captions appeal to the senses — describe the taste, aroma, and texture. Add the story behind the dish for an emotional connection.' },
      { q: 'What food hashtags should I use on Instagram?', a: '#foodie, #instafood, #foodphotography, #homecooking, and cuisine-specific tags (e.g. #italianfood, #veganrecipes). Our generator tailors them to your content.' },
      { q: 'How do food bloggers grow on Instagram?', a: 'Consistent posting, beautiful photography, and captions that tell a story. Engagement questions ("what\'s your favourite pasta dish?") also drive comments.' },
      { q: 'Can I use this for restaurant social media?', a: 'Yes. Enter your dish details and restaurant atmosphere and the AI will write professional restaurant captions perfect for business accounts.' },
    ],
  },
  {
    slug: 'ai-hook-generator',
    metaTitle: 'Free AI Hook Generator — Write Viral Hooks for Videos & Posts | Captions4You',
    metaDescription: 'Generate attention-grabbing hooks for TikTok, Instagram Reels, and YouTube Shorts with AI. Stop the scroll with the perfect opening line. Free to try.',
    keywords: 'hook generator, AI hook generator, viral hooks, tiktok hooks, instagram reel hooks, youtube shorts hooks',
    h1: 'Free AI Hook Generator',
    tagline: 'Generate viral hooks that stop the scroll.',
    bodyDescription: 'The first 2 seconds of your video decide whether people watch or scroll past. Our AI generates powerful opening hooks for TikTok, Instagram Reels, and YouTube Shorts — curiosity-driven lines that force viewers to keep watching.',
    platforms: ['tiktok', 'instagram'],
    defaultContentFormat: 'short_video',
    placeholderText: 'e.g. A video revealing 5 money habits that most people learn too late, showing the contrast between broke and wealthy mindsets…',
    features: [
      { title: 'Pattern-interrupt hooks', desc: 'Hooks designed to break the scroll pattern and demand attention.' },
      { title: 'Curiosity gap technique', desc: 'Creates information gaps that viewers must fill by watching.' },
      { title: 'Platform-specific tone', desc: 'TikTok hooks vs Instagram hooks are different — our AI knows the difference.' },
    ],
    faqs: [
      { q: 'What makes a good video hook?', a: 'A great hook creates a curiosity gap, challenges a belief, or promises a specific transformation. It should be under 5 seconds and make the viewer feel they MUST keep watching.' },
      { q: 'How do I write a hook for TikTok?', a: 'TikTok hooks work best when they\'re bold, direct, and create immediate curiosity. Start with "Stop scrolling if...", "You\'re doing X wrong", or a surprising statistic.' },
      { q: 'What is a "pattern interrupt" hook?', a: 'A pattern interrupt is anything unexpected that breaks the viewer\'s autopilot scrolling — an unusual visual, a shocking statement, or a direct call-out like "Hey, [audience type]".' },
      { q: 'Does the hook affect algorithm performance?', a: 'Yes significantly. Watch time (especially the first 3 seconds) is TikTok and Instagram\'s most important ranking signal. A great hook = more watch time = more distribution.' },
    ],
  },
];

export default toolsConfig;
