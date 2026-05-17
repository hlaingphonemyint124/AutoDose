-- ============================================================
-- AUTODOSE — YouTube Video Seed
-- Run this in your Supabase SQL editor:
--   Dashboard → SQL Editor → New Query → Paste → Run
--
-- HOW TO GET YOUR VIDEO IDs:
--   1. Go to https://www.youtube.com/@autodosemm/videos
--   2. Right-click any video → Copy link
--   3. The ID is the part after ?v= (11 characters)
--   4. Replace the VIDEO_ID placeholders below
-- ============================================================

-- Example rows — replace VIDEO_ID_1, VIDEO_ID_2 etc. with real IDs
-- You can also use the Admin Dashboard importer (see AddYouTubeVideo component)

INSERT INTO videos (title, description, category, storage_url, hls_url, thumbnail_url, is_homepage_featured, created_at)
VALUES
  (
    'JDM Build Series - Episode 1',
    'First episode of our JDM build series. Follow along as we transform this iconic Japanese machine.',
    'vlogs',
    '',  -- storage_url not needed when using YouTube
    'https://www.youtube.com/watch?v=VIDEO_ID_1',
    'https://img.youtube.com/vi/VIDEO_ID_1/maxresdefault.jpg',
    true,
    NOW() - INTERVAL '6 days'
  ),
  (
    'Tokyo Car Meet 2024 - Best Shots',
    'Cinematic highlights from the biggest JDM meet of the year.',
    'photoshoots',
    '',
    'https://www.youtube.com/watch?v=VIDEO_ID_2',
    'https://img.youtube.com/vi/VIDEO_ID_2/maxresdefault.jpg',
    true,
    NOW() - INTERVAL '5 days'
  ),
  (
    'R34 GT-R Full Review',
    'An in-depth review of the legendary Nissan Skyline R34 GT-R.',
    'reviews',
    '',
    'https://www.youtube.com/watch?v=VIDEO_ID_3',
    'https://img.youtube.com/vi/VIDEO_ID_3/maxresdefault.jpg',
    true,
    NOW() - INTERVAL '4 days'
  ),
  (
    'Night Photography Tutorial - JDM Edition',
    'How to shoot JDM cars at night for that cinematic look.',
    'tutorials',
    '',
    'https://www.youtube.com/watch?v=VIDEO_ID_4',
    'https://img.youtube.com/vi/VIDEO_ID_4/maxresdefault.jpg',
    false,
    NOW() - INTERVAL '3 days'
  ),
  (
    'Weekly JDM Vlog - Garage Day',
    'A week in the life building our project car.',
    'vlogs',
    '',
    'https://www.youtube.com/watch?v=VIDEO_ID_5',
    'https://img.youtube.com/vi/VIDEO_ID_5/maxresdefault.jpg',
    false,
    NOW() - INTERVAL '2 days'
  );

-- After inserting, update is_homepage_featured for the videos you want in the hero slideshow:
-- UPDATE videos SET is_homepage_featured = true WHERE hls_url LIKE '%VIDEO_ID_1%';
