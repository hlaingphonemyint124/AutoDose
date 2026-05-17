# AUTODOSE — YouTube Integration Setup

## What changed

| File | What it does |
|------|-------------|
| `src/components/FeaturedHero.tsx` | Netflix-style hero slideshow — auto-advances, YouTube background videos, mute toggle |
| `src/pages/Videos.tsx` | Videos page — embeds YouTube instead of hosting files |
| `src/components/HomeVideoRows.tsx` | Homepage video rows — plays YouTube inline |
| `src/components/EditVideoDialog.tsx` | Admin edit dialog — YouTube URL field with live preview |
| `src/components/AddYouTubeVideo.tsx` | **New** — Admin panel widget to add YouTube videos |
| `supabase/add_homepage_featured_column.sql` | DB migration — adds `is_homepage_featured` column |
| `supabase/seed_youtube_videos.sql` | Template to bulk-insert videos via SQL |

---

## Step 1 — Run the database migration

In your **Supabase Dashboard → SQL Editor**:

```sql
-- Paste and run: supabase/add_homepage_featured_column.sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_homepage_featured BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_videos_homepage_featured ON videos (is_homepage_featured, created_at DESC);
```

---

## Step 2 — Add your YouTube videos

### Option A: Admin Dashboard (easiest)
Add `<AddYouTubeVideo />` to your `AdminDashboard.tsx` and fill in the form. Each video needs:
- YouTube URL (any format: watch, youtu.be, shorts)
- Title & category
- Check "Feature on Homepage Hero" for the slideshow

### Option B: SQL bulk insert
1. Go to `https://www.youtube.com/@autodosemm/videos`
2. Copy each video URL
3. Open `supabase/seed_youtube_videos.sql`, replace `VIDEO_ID_1`, `VIDEO_ID_2` etc.
4. Run in Supabase SQL Editor

### Option C: Edit existing videos
In the Admin Dashboard, click Edit on any existing video. Paste a YouTube URL into the **YouTube URL** field. The site will automatically use the YouTube embed instead of any stored file.

---

## How YouTube URLs are stored

YouTube URLs are saved in the `hls_url` column (no schema change needed). The site detects YouTube links automatically and switches to an iframe embed. The `storage_url` column is no longer required for new videos — leave it empty `""`.

---

## Hero slideshow

- Shows up to **5 videos** marked `is_homepage_featured = true`
- Falls back to the 5 most recent videos if none are featured
- Auto-advances every **10 seconds**, pauses on hover
- Mute/unmute button top-right of hero
- Left/right arrows + dot progress indicators

---

## Thumbnail auto-generation

When you add a YouTube URL, the thumbnail is automatically set to:
```
https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg
```
No manual thumbnail upload needed.
