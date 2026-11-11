/**
 * Markdown built for the repo reads well on GitHub but needs adjusting for the site:
 *  - relative links between /sources and /themes become real routes
 *  - sections whose body is still a "（待填…）" placeholder are dropped
 */

const SECTION_RE = /^##\s+(.+?)\s*$/;

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(textOf).join('');
  return '';
}

function rewriteHref(href) {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
    return href;
  }
  const match = href.match(/(?:^|\/)(sources|themes)\/([^/#]+)\.md(#.*)?$/);
  if (!match) return href;
  const [, kind, name, hash = ''] = match;
  return `/Wisdom/${kind}/${name}/${hash}`;
}

function dropPlaceholders(children) {
  const out = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const headingMatch = node.type === 'element' && node.tagName === 'h2';

    if (headingMatch) {
      const body = [];
      let j = i + 1;
      while (j < children.length) {
        const next = children[j];
        if (next.type === 'element' && next.tagName === 'h2') break;
        body.push(next);
        j++;
      }
      const bodyText = body.map(textOf).join('').trim();
      if (bodyText.startsWith('（待填') || bodyText === '') {
        i = j - 1;
        continue;
      }
    }
    out.push(node);
  }
  return out;
}

function walk(node) {
  if (!node || !node.children) return;
  if (node.tagName === 'a' && node.properties && node.properties.href) {
    node.properties.href = rewriteHref(String(node.properties.href));
  }
  for (const child of node.children) walk(child);
}

/** Hide sections the site renders elsewhere, and mark blocks for the entrance animation. */
function prepareBody(children) {
  const out = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type === 'element' && node.tagName === 'h2' && textOf(node).trim() === '一句话') {
      // The summary is promoted to the standfirst on the entry page.
      let j = i + 1;
      while (j < children.length) {
        const next = children[j];
        if (next.type === 'element' && next.tagName === 'h2') break;
        j++;
      }
      i = j - 1;
      continue;
    }
    if (
      node.type === 'element' &&
      ['h2', 'p', 'blockquote', 'ul', 'ol'].includes(node.tagName)
    ) {
      node.properties = node.properties || {};
      const existing = node.properties.className;
      node.properties.className = existing ? [...existing, 'reveal'] : ['reveal'];
    }
    out.push(node);
  }
  return out;
}

export function rehypeSiteLinks() {
  return (tree) => {
    // A theme file opens with "# 名称"; the page renders that name as its own h1.
    if (tree.children[0]?.type === 'element' && tree.children[0].tagName === 'h1') {
      tree.children.shift();
    }
    tree.children = prepareBody(dropPlaceholders(tree.children));
    walk(tree);
  };
}
