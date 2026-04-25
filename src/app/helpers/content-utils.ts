function escapeHtml(text: string): string {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
export function formatGeneratedContentToHtml(content: string): string {
  const escaped = escapeHtml(content ?? '');
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const withBreaks = withBold.replace(/\r\n|\n|\r/g, '<br/>');
  return withBreaks;
}

export function htmlToSocialText(input: any): string {
  const raw = input == null ? '' : String(input);
  if (!raw) return '';

  const looksLikeHtml = /<[^>]+>/.test(raw);
  if (!looksLikeHtml) {
    return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  try {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    const body = doc.body;

    const getText = (node: Node): string => {
      if (!node) return '';

      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || '').replace(/\s+/g, ' ');
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = (el.tagName || '').toLowerCase();

        if (tag === 'br') return '\n';

        if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article') {
          const inner = Array.from(el.childNodes).map(getText).join('').trim();
          return inner ? `${inner}\n` : '';
        }

        if (tag === 'li') {
          const inner = Array.from(el.childNodes).map(getText).join('').trim();
          return inner ? `- ${inner}\n` : '';
        }

        if (tag === 'ul' || tag === 'ol') {
          const inner = Array.from(el.childNodes).map(getText).join('');
          return inner ? `${inner}\n` : '';
        }

        if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
          const inner = Array.from(el.childNodes).map(getText).join('').trim();
          return inner ? `${inner}\n` : '';
        }

        if (tag === 'strong' || tag === 'b' || tag === 'em' || tag === 'i' || tag === 'span') {
          return Array.from(el.childNodes).map(getText).join('');
        }

        if (tag === 'a') {
          const text = (el.textContent || '').trim();
          const href = (el.getAttribute('href') || '').trim();
          if (href && text && href !== text) return `${text} (${href})`;
          return text || href;
        }

        return Array.from(el.childNodes).map(getText).join('');
      }

      return '';
    };

    let out = Array.from(body.childNodes).map(getText).join('');
    out = out
      .replace(/\r\n|\r/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return out;
  } catch (e) {
    try {
      return raw
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\r\n|\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    } catch (_e) {
      return raw;
    }
  }
}
