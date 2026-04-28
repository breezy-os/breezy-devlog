
/**
 * Wraps emojis defined in paragraphs with a span that has a solid color
 * to avoid them from inheriting alpha color values.
 */
export function em(emoji: string) {
  return <span style={{ color: 'black' }}>{emoji}</span>
}