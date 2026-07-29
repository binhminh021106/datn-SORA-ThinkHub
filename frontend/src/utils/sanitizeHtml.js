const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2', 'h3', 'h4',
  'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'table', 'tbody', 'td',
  'th', 'thead', 'tr', 'u', 'ul',
]);

const DROP_WITH_CONTENT = new Set([
  'base', 'embed', 'form', 'iframe', 'input', 'link', 'math', 'meta', 'object', 'script',
  'style', 'svg', 'template',
]);

const GLOBAL_ATTRIBUTES = new Set(['class', 'title']);
const TAG_ATTRIBUTES = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
};

const SAFE_IMAGE_DATA_URL = /^data:image\/(?:png|gif|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i;

export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const isSafeUrl = (value, attributeName) => {
  const url = String(value ?? '').trim();
  if (!url) return false;

  if (attributeName === 'src' && SAFE_IMAGE_DATA_URL.test(url)) return true;

  // `//host`, `///host` and `/\\host` are interpreted as cross-origin URLs by
  // browsers. They must not be accepted as a normal relative link.
  if (url.startsWith('//') || url.startsWith('/\\') || url.startsWith('\\')) return false;

  try {
    const isExplicitScheme = /^[a-z][a-z\d+.-]*:/i.test(url);
    const resolvedUrl = new URL(url, window.location.origin);

    if (!isExplicitScheme && resolvedUrl.origin !== window.location.origin) return false;

    const protocol = resolvedUrl.protocol.toLowerCase();
    if (attributeName === 'src') return protocol === 'http:' || protocol === 'https:' || protocol === 'blob:';
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:';
  } catch {
    return false;
  }
};

/**
 * Sanitizes rich text received from CMS/API before it reaches v-html.
 * It intentionally permits a small presentation-only subset of HTML.
 */
export const sanitizeRichHtml = (value) => {
  if (!value || typeof window === 'undefined') return '';

  const doc = new DOMParser().parseFromString(String(value), 'text/html');
  const elements = [...doc.body.querySelectorAll('*')];

  for (const element of elements) {
    const tagName = element.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tagName)) {
      element.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      element.replaceWith(...element.childNodes);
      continue;
    }

    const allowedAttributes = new Set([
      ...GLOBAL_ATTRIBUTES,
      ...(TAG_ATTRIBUTES[tagName] || []),
    ]);

    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (!allowedAttributes.has(name)) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if ((name === 'href' || name === 'src') && !isSafeUrl(attribute.value, name)) {
        element.removeAttribute(attribute.name);
      }
    }

    if (tagName === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }

  return doc.body.innerHTML;
};

export const textWithLineBreaks = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');

export const safeNavigationUrl = (value) => {
  const url = String(value ?? '').trim();
  if (!url) return '';
  return isSafeUrl(url, 'href') ? url : '';
};
