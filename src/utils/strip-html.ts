/**
 * Convert Quill HTML content to plain text.
 * Preserves basic block formatting with newlines.
 */
export function stripHtmlFromQuill(html: string): string {
  if (!html) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  // Replace <br> tags with line breaks
  body.querySelectorAll('br').forEach((br) => {
    br.replaceWith('\n');
  });

  // Add line breaks after block elements
  const blockTags = ['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5'];
  blockTags.forEach((tag) => {
    body.querySelectorAll(tag).forEach((el) => {
      const newline = doc.createTextNode('\n');
      el.parentNode?.insertBefore(newline, el.nextSibling);
    });
  });

  // Extract text content
  const plainText = body.textContent || '';

  // Normalize: collapse multiple newlines and trim
  return plainText.replace(/\n{2,}/g, '\n').trim();
}
