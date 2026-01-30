export function getImageUrl(image?: string) {
  if (!image) return ""

  return `https://www.game-guessr.com/php/image.php?image=${image}`
}
