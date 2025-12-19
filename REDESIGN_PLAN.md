# Dashboard Redesign Plan

## Current Issues
1. Git restored old version - need to reapply all fixes
2. Need to redesign layout for generated captions

## Fixes to Reapply
1. Add supportedContentTypes to PLATFORMS
2. Remove 'all' platform
3. Remove Pinterest
4. Update platform mappings per user specs
5. Add MAX_FREE_PLATFORMS constant
6. Add content type filtering logic
7. Fix platform selection with limits
8. Move Content Type to top of form
9. Fix hashtag display (#)
10. Fix icon rendering

## New Layout Design
- Show form centered when no captions
- Show full-width results when captions exist
- Group captions by platform
- Show 3 variants in a grid per platform
- Add "Generate Another" button at top

## Implementation Strategy
Use a comprehensive edit to replace entire file with corrected version
