/**
 * Read-along videos — team members reading stories aloud on camera.
 *
 * There is no in-app upload flow by design: videos are added by the team
 * directly, not by caregivers through the UI. To add one:
 *
 *   1. Upload the video file to the Supabase Storage bucket for this
 *      project (via the Supabase dashboard — Storage tab). Make the file
 *      public, or generate a signed URL if it should expire.
 *   2. Copy that file's public URL.
 *   3. Add an entry below, commit, deploy.
 *
 * Each video: { id, title, reader, videoUrl, thumbnail, storyId? }
 *   id        — unique, kebab-case, used in the URL (/stories/video/:id)
 *   title     — shown in the video gallery and on the story page
 *   reader    — the team member's name/role, shown as "read by ___"
 *   videoUrl  — the public Supabase Storage URL for the video file
 *   thumbnail — an emoji shown on the tile before playing (no image assets)
 *   storyId   — OPTIONAL. If set, this video also appears as a "watch
 *               someone read this" option on that story's page (the id
 *               must match a key in stories/index.js). Omit it for a
 *               standalone video not tied to any existing story — it will
 *               only appear in the Read-Along Videos gallery.
 */

const VIDEOS = [
  // Example entries — remove once real videos are added:
  //
  // {
  //   id: 'cinderella-ms-jane',
  //   title: 'Cinderella',
  //   reader: 'Ms. Jane',
  //   videoUrl: 'https://<project>.supabase.co/storage/v1/object/public/story-videos/cinderella-ms-jane.mp4',
  //   thumbnail: '🎥',
  //   storyId: 'cinderella',
  // },
  // {
  //   id: 'our-garden-mr-lee',
  //   title: 'A Trip to Our Garden',
  //   reader: 'Mr. Lee',
  //   videoUrl: 'https://<project>.supabase.co/storage/v1/object/public/story-videos/our-garden-mr-lee.mp4',
  //   thumbnail: '🎥',
  //   // no storyId — this is a standalone video, gallery-only
  // },
]

/** All videos linked to a given story id, in the order they were added. */
export function getVideosForStory(storyId) {
  return VIDEOS.filter((v) => v.storyId === storyId)
}

/** Every video, regardless of whether it's linked to a story. */
export function getAllVideos() {
  return VIDEOS
}

/**
 * Videos with no storyId — these only ever appear in the Read-Along Videos
 * gallery, since story-linked videos are already reachable from within
 * that story's own reader page.
 */
export function getStandaloneVideos() {
  return VIDEOS.filter((v) => !v.storyId)
}

export function getVideoById(id) {
  return VIDEOS.find((v) => v.id === id) || null
}

export default VIDEOS
