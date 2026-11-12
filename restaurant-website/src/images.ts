/* Every photo in src/assets/images is imported through Vite, which gives each file a
   content-hashed URL (safe to cache forever) and only ships the photos the site uses. */
const files = import.meta.glob<string>('./assets/images/*.webp', { eager: true, query: '?url', import: 'default' });

export function imageUrl(name: string): string {
  const url = files[`./assets/images/${name}.webp`];
  if (!url) throw new Error(`Photo not found: src/assets/images/${name}.webp`);
  return url;
}
