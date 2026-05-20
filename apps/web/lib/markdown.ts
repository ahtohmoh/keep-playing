/**
 * Tiny markdown -> HTML renderer.
 *
 * Stage 1 keeps this lean — no full markdown library, just the constructs we
 * use: headings, paragraphs, lists, blockquotes, bold/italic, inline + block
 * code, links, hr. Stage 2 can swap to remark/rehype if richer rendering is
 * needed (footnotes, tables, callouts, etc.).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // bold/italic
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // links [text](href)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" rel="noreferrer">$1</a>',
  );
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuf: string[] = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  }
  function closeList() {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  }

  while (i < lines.length) {
    const raw = lines[i]!;
    const line = raw.replace(/\s+$/, '');

    // Fenced code blocks
    const fenceMatch = /^```(\w*)\s*$/.exec(line);
    if (fenceMatch) {
      if (inCodeBlock) {
        out.push(
          `<pre><code class="lang-${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join('\n'))}</code></pre>`,
        );
        codeBuf = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        flushParagraph();
        closeList();
        inCodeBlock = true;
        codeLang = fenceMatch[1] ?? '';
      }
      i++;
      continue;
    }
    if (inCodeBlock) {
      codeBuf.push(raw);
      i++;
      continue;
    }

    // Blank
    if (line === '') {
      flushParagraph();
      closeList();
      i++;
      continue;
    }

    // HR
    if (/^-{3,}$/.test(line) || /^\*{3,}$/.test(line)) {
      flushParagraph();
      closeList();
      out.push('<hr />');
      i++;
      continue;
    }

    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushParagraph();
      closeList();
      const level = h[1]!.length;
      const id = h[2]!
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      out.push(`<h${level} id="${id}">${inline(h[2]!)}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushParagraph();
      closeList();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('> ')) {
        quoteLines.push(lines[i]!.slice(2));
        i++;
      }
      out.push(`<blockquote><p>${inline(quoteLines.join(' '))}</p></blockquote>`);
      continue;
    }

    // List item
    const ul = /^[-*+]\s+(.*)$/.exec(line);
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushParagraph();
      const wantType = ul ? 'ul' : 'ol';
      if (listType !== wantType) {
        closeList();
        out.push(`<${wantType}>`);
        listType = wantType;
      }
      out.push(`<li>${inline((ul ?? ol)![1]!)}</li>`);
      i++;
      continue;
    }

    // Default: paragraph line
    closeList();
    paragraph.push(line);
    i++;
  }

  flushParagraph();
  closeList();
  if (inCodeBlock) {
    out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }

  return out.join('\n');
}
