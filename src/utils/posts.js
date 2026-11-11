/**
 * Utilidad de parsing de frontmatter y carga estática de artículos en Markdown
 */

export function parseFrontmatter(rawContent) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: rawContent };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const data = {};

  yamlBlock.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else if (value === 'true') {
      data[key] = true;
    } else if (value === 'false') {
      data[key] = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      data[key] = Number(value);
    } else {
      data[key] = value.replace(/^['"]|['"]$/g, '');
    }
  });

  return { data, content };
}

// Carga estática de archivos .md mediante Vite glob import con '?raw'
const rawPostFiles = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export function getAllPosts() {
  const posts = Object.entries(rawPostFiles).map(([path, rawContent]) => {
    const { data, content } = parseFrontmatter(rawContent);
    const filename = path.split('/').pop().replace(/\.md$/, '');
    const slug = data.slug || filename;

    return {
      slug,
      title: data.title || filename,
      date: data.date || '',
      readTime: data.readTime || '5 min de lectura',
      readTimeEn: data.readTimeEn || '5 min read',
      category: data.category || 'Ingeniería',
      categoryEn: data.categoryEn || 'Engineering',
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: data.summary || '',
      summaryEn: data.summaryEn || data.summary || '',
      content,
    };
  });

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}
