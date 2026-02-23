# Monthly Limits & Automatic Reset

## Subscription Tiers

### FREE Tier
- **Monthly Limit**: 5 caption generations
- **Cost**: Free forever
- **Target**: Casual users, trying out the service

### PREMIUM Tier
- **Monthly Limit**: 100 caption generations
- **Cost**: See pricing page
- **Benefits**: Higher limits, priority support

## How Monthly Reset Works

### Automatic Reset
The system uses a **composite key** approach that automatically resets limits each month:

```
userId_month_year: {
  userId: "user-123",
  month: 1,        // January = 1, February = 2, etc.
  year: 2026
}
```

### Example Timeline

**January 2026** (Month 1):
- User generates 5 captions
- Database record: `{userId: "abc", month: 1, year: 2026, captionsGenerated: 5}`
- Limit reached ❌

**February 2026** (Month 2):
- System looks for `{userId: "abc", month: 2, year: 2026}`
- Record doesn't exist → Creates new record with `captionsGenerated: 0`
- User can generate 5 more captions ✅

**No manual reset needed!** The system automatically creates a new tracking record for each month.

## Implementation Details

### Usage Tracking Record Creation

When a user generates captions in a new month:

1. **Check**: Look for usage record with current month/year
2. **Not Found**: Create new record with:
   - `captionsGenerated: 0`
   - `monthlyLimit: 5` (FREE) or `100` (PREMIUM)
   - `month: current month` (1-12)
   - `year: current year`
3. **Found**: Use existing record

### Code Location

- **Usage Tracker Middleware**: `backend/src/middleware/usageTracker.middleware.ts`
- **Database Model**: `backend/prisma/schema.prisma` - `UsageTracking` model

### Key Files

1. **usageTracker.middleware.ts:42-72**
   - Checks for existing usage record
   - Creates new record if month changed
   - Enforces monthly limits

2. **caption.controller.ts:367-427**
   - Saves guest captions
   - Checks limits before saving

3. **oauth.controller.ts:40-50**
   - Creates initial usage record for new users

## Important Notes

- Limits reset on the **1st of each month** at midnight
- Old month's data is **preserved** (not deleted)
- Historical usage can be queried for analytics
- Year change is handled automatically (December → January)

## Upgrade Behavior

When a user upgrades from FREE to PREMIUM:
- Current month's usage record is updated
- `monthlyLimit` changes from 5 → 100
- Existing `captionsGenerated` count remains
- User immediately gets access to higher limit

Example:
- User generates 3/5 captions on FREE tier
- Upgrades to PREMIUM
- Now has 3/100 captions used
- Can generate 97 more this month!
