# Caption Generator - Complete Platform Restructure Migration Guide

## Overview
This guide covers the complete restructuring of the Caption Generator app to support:
- Multiple platform-specific caption generation
- 3 caption variants per platform
- Platform-specific formatting (Instagram Reels, YouTube Shorts, Stories, etc.)
- Attempt-based history (one attempt = all platforms generated)
- Story-specific features (slides, no hashtags)

## Changes Made

### 1. Database Schema (Prisma)
**File**: `backend/prisma/schema.prisma`

**Key Changes**:
- Renamed `ContentType` → `ContentFormat` with new values: `short_video`, `long_video`, `image`, `carousel`, `story`, `text_only`
- Updated `Platform` enum: lowercase values (`instagram`, `tiktok`, `youtube_shorts`, `youtube_long`, `facebook`, `linkedin`, `x`, `pinterest`, `snapchat`, `all`)
- Replaced `Caption` model with two models:
  - `CaptionAttempt`: Represents one generation attempt
  - `Caption`: Individual caption variant for a platform (3 per platform)
- Added fields:
  - `variantNumber` (1-3)
  - `hashtagReason` (why hashtags not recommended)
  - `storySlides[]` (for story format)

### 2. Backend Types
**File**: `backend/src/types/index.ts`

Updated types to match new structure with platforms array and content format.

### 3. Caption Service
**File**: `backend/src/services/caption.service.ts`

- Complete rewrite with new OpenAI prompt structure
- System prompt, Developer prompt, User prompt separation
- Generates 3 variants per platform
- Platform-specific hashtag rules (stories = no hashtags)
- Story slide generation

### 4. OpenAI Service
**File**: `backend/src/services/openai.service.ts`

- New method: `generateCaptionWithStructuredOutput()`
- Uses `gpt-4o` with JSON mode
- Returns 3 variants per call

### 5. Caption Controller
**File**: `backend/src/controllers/caption.controller.ts`

- Generates for all selected platforms in one call
- Creates one `CaptionAttempt` with multiple `Caption` records
- New endpoints:
  - `POST /captions/generate` - Generate captions
  - `GET /captions/attempts` - List all attempts
  - `GET /captions/attempts/:id` - Get one attempt with all captions
  - `PUT /captions/attempts/:id/favorite` - Toggle favorite
  - `DELETE /captions/attempts/:id` - Delete attempt

## Migration Steps

### Step 1: Stop the Backend Server
Press `Ctrl+C` in the terminal running the backend.

### Step 2: Clean and Migrate Database

```bash
cd backend

# Create migration
npx prisma migrate dev --name complete_platform_restructure

# This will:
# 1. Drop old Caption table
# 2. Create CaptionAttempt and new Caption tables
# 3. Update enums
# 4. Generate new Prisma client

# If migration fails due to existing data, use:
npx prisma migrate reset  # WARNING: Deletes all data
npx prisma migrate dev --name complete_platform_restructure
```

### Step 3: Update Analytics Service

The `AnalyticsService` needs to be updated to:
1. Change `predictCaptionAnalytics()` → `predictPerformance()`
2. Update platform enum mappings (UPPERCASE → lowercase)
3. Handle new platform types

### Step 4: Update Routes

**File**: `backend/src/routes/caption.routes.ts`

Change endpoints:
```typescript
// OLD
router.post('/generate', ...)
router.get('/', ...) // Get all captions

// NEW
router.post('/generate', ...)
router.get('/attempts', ...) // Get all attempts
router.get('/attempts/:id', ...) // Get one attempt
router.put('/attempts/:id/favorite', ...)
router.delete('/attempts/:id', ...)
```

### Step 5: Update Frontend Types

**File**: `frontend/src/types/index.ts`

Already updated with:
- New platform types (lowercase)
- `ContentType` → `ContentFormat`
- New response structure with attempts

### Step 6: Update Dashboard

**File**: `frontend/src/pages/Dashboard.tsx`

Currently updated with:
- Platform multi-select (all selected by default)
- New content format options
- Request payload: `{ platforms: Platform[], contentFormat, contentDescription }`

**What needs updating**:
- Handle response structure (attempt with multiple captions)
- Display 3 variants per platform
- Show variant selector (Variant 1, 2, 3)
- Hide hashtags for stories
- Show story slides when format is 'story'

### Step 7: Update History Page

**File**: `frontend/src/pages/History.tsx`

Needs complete rewrite to:
1. Show list of attempts (not individual captions)
2. Each attempt shows:
   - Content description
   - Date
   - Number of platforms generated
   - Content format
3. Click attempt → drill down to see all platforms and variants
4. Variant selector for each platform

## API Response Structure

### Generate Captions Response
```typescript
{
  success: true,
  data: {
    id: "attempt-id",
    contentFormat: "short_video",
    contentDescription: "...",
    createdAt: "...",
    captions: [
      {
        id: "caption-id",
        platform: "instagram",
        variantNumber: 1,
        generatedCaption: "...",
        hashtags: ["#tag1", "#tag2"],
        hashtagReason: null,
        storySlides: [],
        analytics: { ... }
      },
      {
        platform: "instagram",
        variantNumber: 2,
        ...
      },
      {
        platform: "instagram",
        variantNumber: 3,
        ...
      },
      {
        platform: "tiktok",
        variantNumber: 1,
        ...
      },
      // ... more platforms
    ]
  }
}
```

## Testing Checklist

After migration:
- [ ] Generate captions for single platform
- [ ] Generate captions for multiple platforms
- [ ] Generate captions for "all" platforms
- [ ] Verify 3 variants per platform
- [ ] Test story format (no hashtags, has slides)
- [ ] Test other formats (has hashtags)
- [ ] View attempts in history
- [ ] Click attempt to see all captions
- [ ] Toggle favorite on attempt
- [ ] Delete attempt
- [ ] Verify analytics for each variant

## Rollback Plan

If needed, revert to previous schema:
```bash
cd backend
git checkout HEAD~1 -- prisma/schema.prisma
npx prisma migrate reset
npx prisma migrate dev
```

## Notes

- All existing caption data will be lost during migration
- Seed database if needed: `npx prisma db seed`
- OpenAI costs will be higher (multiple API calls per generation)
- Consider adding caching for repeat generations
