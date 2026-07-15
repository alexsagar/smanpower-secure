# Image and Video Guidelines

## Supported managed formats

- Images: `image/jpeg`, `image/png`, `image/webp`
- Videos: `video/mp4`, `video/webm`

Unsupported uploads are rejected for public CMS placement. Do not use SVG, HTML, archives, executables, MOV, AVI, or MKV for managed public media.

## Upload limits

- CMS images, poster images, and mobile fallback images: `5 MB` maximum
- CMS videos: `50 MB` maximum

Keep source files under these limits before upload. The server validates MIME type, extension, purpose, Cloudinary resource type, and size at completion time.

## Recommended editorial targets

- Hero video resolution: `1920x1080` or `1920x1280`
- Section video resolution: `1280x720` or `1440x810`
- Hero and poster aspect ratio: `16:9` or `3:2`
- Mobile fallback aspect ratio: match the intended mobile crop, typically `4:5` or `3:4`
- Recommended bitrate:
  - Hero/background video: `3-6 Mbps`
  - Section video: `2-4 Mbps`
- Recommended duration:
  - Hero/background video: `6-20 seconds`
  - Section video: keep concise and task-focused

These are editorial targets, not schema rules. Long or oversized files will degrade page weight and mobile performance even when they pass validation.

## Poster and mobile fallback requirements

- Poster images are strongly recommended for every CMS video.
- Poster images are required for autoplay hero videos.
- Mobile fallback images are required for hero videos intended for public pages.
- Use a real frame from the video or a closely matched still image. Do not use unrelated stock art.

## Playback defaults

- Hero videos autoplay muted, play inline, and loop.
- Hero videos do not autoplay for users requesting reduced motion.
- Reduced-motion users receive the poster or mobile fallback image instead.
- Section videos do not autoplay. They render with controls and `preload="metadata"`.

## Accessibility guidance

- Never upload a video that depends on audio autoplay.
- Keep text readable over background media. Use overlays where needed.
- Use meaningful alt text for poster and fallback images when the media is informational.
- Treat decorative background video as non-essential visual media.
- If a section video carries essential spoken content, provide adjacent transcript or summary content in the page body.

## Cloudinary organization

- Public CMS media stays under the `seven-seas-cms` folder family.
- Use purpose-specific prefixes:
  - `cms_` for general CMS images
  - `cms_video_` for CMS videos
  - `cms_poster_` for poster images
  - `cms_mobile_` for mobile fallback images
- Do not move public media into private/document folders to reuse it on pages.

## Caching and preload guidance

- Hero videos should use `preload="metadata"`, not full eager preload.
- Below-the-fold videos should use `preload="metadata"` or stricter.
- Poster and fallback images should be optimized for the visible viewport size.
- Avoid replacing a lightweight poster with a much larger original image just because both are valid assets.

## Safe replacement and deletion

1. Upload the replacement asset with the correct purpose.
2. Update the CMS page to point at the new asset.
3. Publish and verify the public page render.
4. Delete the old asset only after the CMS no longer references it.

Referenced assets are intentionally protected from deletion. Remote deletion must be confirmed before the database record is removed.

## Staging to production promotion

- Keep authoring and review on the approved managed-media flow.
- Verify poster, mobile fallback, and reduced-motion behavior before any later production deployment.
- Promote approved media through normal content publishing; do not hotlink ad hoc files into CMS JSON.

## Hard rule

Do not store videos in Git or `public/`. Use the managed Cloudinary flow only.
