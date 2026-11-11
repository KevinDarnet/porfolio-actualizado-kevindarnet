/**
 * Generador dinámico client-side del CV Técnico en formato PDF 1.4 (A4 Portrait).
 * - Cero dependencias externas y cargado bajo demanda (dynamic import).
 * - Identidad visual oscura (#0b0d10 / #0f1115) con acentos verde neón (#22c55e).
 * - Hipervínculos reales (/Subtype /Link) hacia secciones del portfolio en producción.
 * - Paginación inteligente por bloques para evitar cortes a mitad de tarjeta.
 */

const SITE_BASE_URL = 'https://kevindarnet-portfolio.web.app';

const PAGE_WIDTH = 595.28; // A4 portrait en pt
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 36;
const MARGIN_TOP = 36;
const MARGIN_BOTTOM = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const COLORS = Object.freeze({
  pageBg: [0.043, 0.051, 0.063], // #0b0d10
  cardBg: [0.059, 0.067, 0.082], // #0f1115
  cardBgElevated: [0.082, 0.098, 0.122], // #15191f
  border: [0.157, 0.176, 0.212], // #282d36
  borderAccent: [0.114, 0.365, 0.204], // #1d5d34
  neonGreen: [0.133, 0.773, 0.369], // #22c55e
  neonGreenSoft: [0.059, 0.165, 0.102], // #0f2a1a
  white: [0.961, 0.961, 0.969], // #f5f5f7
  textLight: [0.831, 0.847, 0.871], // #d4d8de
  textMuted: [0.612, 0.639, 0.686], // #9ca3af
  textDim: [0.451, 0.482, 0.533], // #737b88
});

const WIN_ANSI_EXTENDED = new Map([
  [0x20ac, 0x80], // €
  [0x201a, 0x82], // ‚
  [0x0192, 0x83], // ƒ
  [0x201e, 0x84], // „
  [0x2026, 0x85], // …
  [0x2020, 0x86], // †
  [0x2021, 0x87], // ‡
  [0x02c6, 0x88], // ˆ
  [0x2030, 0x89], // ‰
  [0x0160, 0x8a], // Š
  [0x2039, 0x8b], // ‹
  [0x0152, 0x8c], // Œ
  [0x017d, 0x8e], // Ž
  [0x2018, 0x91], // ‘
  [0x2019, 0x92], // ’
  [0x201c, 0x93], // “
  [0x201d, 0x94], // ”
  [0x2022, 0x95], // •
  [0x2013, 0x96], // –
  [0x2014, 0x97], // —
  [0x02dc, 0x98], // ˜
  [0x2122, 0x99], // ™
  [0x0161, 0x9a], // š
  [0x203a, 0x9b], // ›
  [0x0153, 0x9c], // œ
  [0x017e, 0x9e], // ž
  [0x0178, 0x9f], // Ÿ
]);

function normalizeText(raw) {
  return String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/→|↘|↗/g, '->')
    .replace(/←/g, '<-')
    .replace(/·/g, '|')
    .replace(/\t/g, '  ');
}

function encodePdfLiteral(rawText) {
  const normalized = normalizeText(rawText);
  let out = '(';
  for (const ch of normalized) {
    const code = ch.codePointAt(0);
    if (code === 0x5c || code === 0x28 || code === 0x29) {
      out += `\\${ch}`;
    } else if (code >= 0x20 && code <= 0x7e) {
      out += ch;
    } else if (code >= 0xa0 && code <= 0xff) {
      out += `\\${code.toString(8).padStart(3, '0')}`;
    } else if (WIN_ANSI_EXTENDED.has(code)) {
      out += `\\${WIN_ANSI_EXTENDED.get(code).toString(8).padStart(3, '0')}`;
    } else {
      out += '-';
    }
  }
  return `${out})`;
}

function estimateCharWidth(char, fontKey, fontSize) {
  if (fontKey === 'F3' || fontKey === 'F4') {
    return fontSize * 0.6;
  }
  const boldFactor = fontKey === 'F2' ? 1.06 : 1.0;
  if ('iIl1.,:;|!\'`[]()'.includes(char)) {
    return fontSize * 0.29 * boldFactor;
  }
  if ('mwMW@#%&QOG'.includes(char)) {
    return fontSize * 0.78 * boldFactor;
  }
  if (char === char.toUpperCase() && char !== char.toLowerCase()) {
    return fontSize * 0.64 * boldFactor;
  }
  return fontSize * 0.51 * boldFactor;
}

function measureTextWidth(text, fontKey, fontSize) {
  let width = 0;
  for (const char of normalizeText(text)) {
    width += estimateCharWidth(char, fontKey, fontSize);
  }
  return width;
}

function wrapTextLines(rawText, maxWidth, fontKey, fontSize) {
  const normalized = normalizeText(rawText);
  const paragraphs = normalized.split('\n');
  const wrapped = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      continue;
    }
    const tokens = paragraph.split(/(\s+)/);
    let current = '';

    for (const token of tokens) {
      if (!token) continue;
      const candidate = current + token;
      if (measureTextWidth(candidate, fontKey, fontSize) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current.trim().length > 0) {
        wrapped.push(current.trimEnd());
        current = '';
      }

      if (measureTextWidth(token, fontKey, fontSize) > maxWidth) {
        let chunk = '';
        for (const ch of token.trimStart()) {
          if (measureTextWidth(chunk + ch, fontKey, fontSize) > maxWidth && chunk.length > 0) {
            wrapped.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        current = chunk;
      } else {
        current = token.trimStart();
      }
    }

    if (current.trim().length > 0) {
      wrapped.push(current.trimEnd());
    }
  }

  return wrapped.length > 0 ? wrapped : [''];
}

/**
 * Genera una imagen JPEG circular en alta resolución (2x) usando Canvas 2D:
 * intenta cargar /avatar.jpg, /avatar.png o /profile.jpg desde public/ y, si no existe,
 * dibuja un avatar monograma minimalista "KD >_" con estética terminal y borde #22c55e.
 */
async function buildCircularAvatarJpeg(sizePx = 192) {
  if (typeof document === 'undefined') {
    return null;
  }

  const loadOptionalImage = async () => {
    const candidates = ['/avatar.jpg', '/avatar.png', '/profile.jpg', '/profile.png'];
    for (const src of candidates) {
      try {
        const img = await new Promise((resolve, reject) => {
          const el = new Image();
          el.crossOrigin = 'anonymous';
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = src;
        });
        return img;
      } catch {
        // Siguiente candidato
      }
    }
    return null;
  };

  try {
    const canvas = document.createElement('canvas');
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fondo base grafito del header para que las esquinas de JPEG coincidan sin halo
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, sizePx, sizePx);

    const cx = sizePx / 2;
    const cy = sizePx / 2;
    const outerRadius = sizePx / 2 - 4;
    const innerRadius = outerRadius - 5;

    // Halo y anillo verde neón
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.clip();

    const photo = await loadOptionalImage();
    if (photo) {
      const scale = Math.max((innerRadius * 2) / photo.width, (innerRadius * 2) / photo.height);
      const drawW = photo.width * scale;
      const drawH = photo.height * scale;
      ctx.drawImage(photo, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    } else {
      const grad = ctx.createRadialGradient(cx, cy - 16, 12, cx, cy, innerRadius);
      grad.addColorStop(0, '#18241e');
      grad.addColorStop(1, '#0b0d10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, sizePx, sizePx);

      // Prompt ">_" sutil arriba
      ctx.fillStyle = '#22c55e';
      ctx.font = `700 ${Math.round(sizePx * 0.14)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('>_', cx, cy - sizePx * 0.2);

      // Iniciales "KD"
      ctx.fillStyle = '#f5f5f5';
      ctx.font = `700 ${Math.round(sizePx * 0.31)}px Inter, system-ui, sans-serif`;
      ctx.fillText('KD', cx, cy + sizePx * 0.1);
    }
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, width: sizePx, height: sizePx };
  } catch {
    return null;
  }
}

function roundedRectPath(x, yBottom, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  const k = 0.55228475 * radius;
  const xR = x + w;
  const yT = yBottom + h;

  return [
    `${(x + radius).toFixed(2)} ${yBottom.toFixed(2)} m`,
    `${(xR - radius).toFixed(2)} ${yBottom.toFixed(2)} l`,
    `${(xR - radius + k).toFixed(2)} ${yBottom.toFixed(2)} ${xR.toFixed(2)} ${(yBottom + radius - k).toFixed(2)} ${xR.toFixed(2)} ${(yBottom + radius).toFixed(2)} c`,
    `${xR.toFixed(2)} ${(yT - radius).toFixed(2)} l`,
    `${xR.toFixed(2)} ${(yT - radius + k).toFixed(2)} ${(xR - radius + k).toFixed(2)} ${yT.toFixed(2)} ${(xR - radius).toFixed(2)} ${yT.toFixed(2)} c`,
    `${(x + radius).toFixed(2)} ${yT.toFixed(2)} l`,
    `${(x + radius - k).toFixed(2)} ${yT.toFixed(2)} ${x.toFixed(2)} ${(yT - radius + k).toFixed(2)} ${x.toFixed(2)} ${(yT - radius).toFixed(2)} c`,
    `${x.toFixed(2)} ${(yBottom + radius).toFixed(2)} l`,
    `${x.toFixed(2)} ${(yBottom + radius - k).toFixed(2)} ${(x + radius - k).toFixed(2)} ${yBottom.toFixed(2)} ${(x + radius).toFixed(2)} ${yBottom.toFixed(2)} c`,
    'h',
  ].join(' ');
}

function createCvPdfCanvas({ hasAvatar, lang }) {
  const pages = [{ commands: [], links: [] }];
  let cursorY = PAGE_HEIGHT - MARGIN_TOP;

  const paintPageBackground = (page) => {
    page.commands.push(
      `q ${COLORS.pageBg[0]} ${COLORS.pageBg[1]} ${COLORS.pageBg[2]} rg 0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(2)} re f Q`
    );
  };

  paintPageBackground(pages[0]);

  function currentPage() {
    return pages[pages.length - 1];
  }

  function addPage() {
    const next = { commands: [], links: [] };
    paintPageBackground(next);
    pages.push(next);
    cursorY = PAGE_HEIGHT - MARGIN_TOP;
  }

  function ensureSpace(requiredHeight) {
    if (cursorY - requiredHeight < MARGIN_BOTTOM) {
      addPage();
      return true;
    }
    return false;
  }

  function drawRoundedRect(x, yBottom, w, h, radius, fillRgb, strokeRgb = null, lineWidth = 0.75) {
    const cmds = currentPage().commands;
    cmds.push('q');
    if (fillRgb) cmds.push(`${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg`);
    if (strokeRgb) cmds.push(`${lineWidth} w ${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG`);
    cmds.push(roundedRectPath(x, yBottom, w, h, radius));
    const op = fillRgb && strokeRgb ? 'B' : fillRgb ? 'f' : 'S';
    cmds.push(op);
    cmds.push('Q');
  }

  function drawRect(x, yBottom, w, h, fillRgb) {
    currentPage().commands.push(
      `q ${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg ${x.toFixed(2)} ${yBottom.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f Q`
    );
  }

  function drawLine(x1, y1, x2, y2, strokeRgb, lineWidth = 0.65) {
    currentPage().commands.push(
      `q ${lineWidth} w ${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S Q`
    );
  }

  function drawText(text, x, yBaseline, fontKey, fontSize, rgb) {
    currentPage().commands.push(
      `BT /${fontKey} ${fontSize.toFixed(2)} Tf ${rgb[0]} ${rgb[1]} ${rgb[2]} rg 1 0 0 1 ${x.toFixed(2)} ${yBaseline.toFixed(2)} Tm ${encodePdfLiteral(text)} Tj ET`
    );
  }

  function addLink(x1, y1, x2, y2, uri) {
    if (!uri) return;
    currentPage().links.push({
      rect: [x1, y1, x2, y2],
      uri,
    });
  }

  function drawAvatar(x, yBottom, size) {
    if (!hasAvatar) return;
    currentPage().commands.push(
      `q ${size.toFixed(2)} 0 0 ${size.toFixed(2)} ${x.toFixed(2)} ${yBottom.toFixed(2)} cm /Im1 Do Q`
    );
  }

  function drawTagPills(tags, startX, startTopY, maxWidth) {
    let x = startX;
    let yTop = startTopY;
    const pillHeight = 13.5;
    const rowGap = 4;

    for (const rawTag of tags) {
      const label = String(rawTag);
      const pillW = measureTextWidth(label, 'F3', 7.2) + 10;
      if (x + pillW > startX + maxWidth && x > startX) {
        x = startX;
        yTop -= pillHeight + rowGap;
      }
      const yBottom = yTop - pillHeight;
      drawRoundedRect(x, yBottom, pillW, pillHeight, 3.5, COLORS.neonGreenSoft, COLORS.borderAccent, 0.5);
      drawText(label, x + 5, yBottom + 4, 'F3', 7.2, COLORS.neonGreen);
      x += pillW + 4.5;
    }

    return startTopY - yTop + pillHeight;
  }

  function measureTagRowsHeight(tags, maxWidth) {
    if (!tags || tags.length === 0) return 0;
    let x = 0;
    let rows = 1;
    const pillHeight = 13.5;
    const rowGap = 4;

    for (const rawTag of tags) {
      const pillW = measureTextWidth(String(rawTag), 'F3', 7.2) + 10;
      if (x + pillW > maxWidth && x > 0) {
        x = 0;
        rows += 1;
      }
      x += pillW + 4.5;
    }
    return rows * pillHeight + (rows - 1) * rowGap;
  }

  function finalizePages() {
    const total = pages.length;
    const footerText =
      lang === 'en'
        ? 'Kevin Darnet | Application Security & Full-Stack Engineer | Interactive CV'
        : 'Kevin Darnet | Application Security & Full-Stack Engineer | CV Tecnico Interactivo';

    return pages.map((page, index) => {
      const footerY = MARGIN_BOTTOM - 22;
      const lineY = footerY + 11;
      const pageLabel = lang === 'en' ? `Page ${index + 1} / ${total}` : `Pagina ${index + 1} / ${total}`;
      const rightX = PAGE_WIDTH - MARGIN_X - measureTextWidth(pageLabel, 'F3', 7.5);
      const webLabel = 'kevindarnet-portfolio.web.app';
      const webX = PAGE_WIDTH / 2 - measureTextWidth(webLabel, 'F3', 7.5) / 2;

      const footerCommands = [
        `q 0.5 w ${COLORS.border[0]} ${COLORS.border[1]} ${COLORS.border[2]} RG ${MARGIN_X.toFixed(2)} ${lineY.toFixed(2)} m ${(PAGE_WIDTH - MARGIN_X).toFixed(2)} ${lineY.toFixed(2)} l S Q`,
        `BT /F1 7.50 Tf ${COLORS.textDim[0]} ${COLORS.textDim[1]} ${COLORS.textDim[2]} rg 1 0 0 1 ${MARGIN_X.toFixed(2)} ${footerY.toFixed(2)} Tm ${encodePdfLiteral(footerText)} Tj ET`,
        `BT /F3 7.50 Tf ${COLORS.neonGreen[0]} ${COLORS.neonGreen[1]} ${COLORS.neonGreen[2]} rg 1 0 0 1 ${webX.toFixed(2)} ${footerY.toFixed(2)} Tm ${encodePdfLiteral(webLabel)} Tj ET`,
        `BT /F3 7.50 Tf ${COLORS.textDim[0]} ${COLORS.textDim[1]} ${COLORS.textDim[2]} rg 1 0 0 1 ${rightX.toFixed(2)} ${footerY.toFixed(2)} Tm ${encodePdfLiteral(pageLabel)} Tj ET`,
      ];

      page.links.push({
        rect: [webX - 2, footerY - 2, webX + measureTextWidth(webLabel, 'F3', 7.5) + 2, footerY + 9],
        uri: `${SITE_BASE_URL}/`,
      });

      return {
        stream: [...page.commands, ...footerCommands].join('\n'),
        links: page.links,
      };
    });
  }

  return {
    getCursorY: () => cursorY,
    moveCursor: (delta) => {
      cursorY -= delta;
    },
    ensureSpace,
    drawRoundedRect,
    drawRect,
    drawLine,
    drawText,
    addLink,
    drawAvatar,
    drawTagPills,
    measureTagRowsHeight,
    finalizePages,
  };
}

/**
 * Serializador binario PDF 1.4 con offsets exactos en bytes (soporta imágenes JPEG y Link Annots).
 */
function serializeBinaryPdf(finalizedPages, avatarJpeg) {
  const encoder = new TextEncoder();
  const objectChunks = [];

  const addStringObject = (text) => {
    objectChunks.push(encoder.encode(text));
    return objectChunks.length;
  };

  const addBinaryObject = (prefixStr, binaryBytes, suffixStr) => {
    const prefix = encoder.encode(prefixStr);
    const suffix = encoder.encode(suffixStr);
    const merged = new Uint8Array(prefix.length + binaryBytes.length + suffix.length);
    merged.set(prefix, 0);
    merged.set(binaryBytes, prefix.length);
    merged.set(suffix, prefix.length + binaryBytes.length);
    objectChunks.push(merged);
    return objectChunks.length;
  };

  // Objetos 1..4: Fuentes Type1 estándar
  const fontRegularId = addStringObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const fontBoldId = addStringObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const fontMonoId = addStringObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
  const fontMonoBoldId = addStringObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');

  let imageObjectId = null;
  if (avatarJpeg && avatarJpeg.bytes?.length > 0) {
    imageObjectId = addBinaryObject(
      `<< /Type /XObject /Subtype /Image /Width ${avatarJpeg.width} /Height ${avatarJpeg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${avatarJpeg.bytes.length} >>\nstream\n`,
      avatarJpeg.bytes,
      '\nendstream'
    );
  }

  const pagesObjectId = objectChunks.length + 1;
  objectChunks.push(new Uint8Array(0)); // Reservado para /Pages

  const resourcesDict = imageObjectId
    ? `<< /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R /F3 ${fontMonoId} 0 R /F4 ${fontMonoBoldId} 0 R >> /XObject << /Im1 ${imageObjectId} 0 R >> >>`
    : `<< /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R /F3 ${fontMonoId} 0 R /F4 ${fontMonoBoldId} 0 R >> >>`;

  const pageIds = [];
  for (const page of finalizedPages) {
    const streamBytes = encoder.encode(page.stream);
    const contentId = addBinaryObject(
      `<< /Length ${streamBytes.length} >>\nstream\n`,
      streamBytes,
      '\nendstream'
    );

    const annotIds = [];
    for (const link of page.links) {
      const [x1, y1, x2, y2] = link.rect.map((n) => n.toFixed(2));
      const escapedUri = String(link.uri).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      const annotId = addStringObject(
        `<< /Type /Annot /Subtype /Link /Rect [${x1} ${y1} ${x2} ${y2}] /Border [0 0 0] /A << /S /URI /URI (${escapedUri}) >> >>`
      );
      annotIds.push(annotId);
    }

    const annotsEntry =
      annotIds.length > 0 ? `/Annots [${annotIds.map((id) => `${id} 0 R`).join(' ')}] ` : '';

    const pageId = addStringObject(
      `<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources ${resourcesDict} ${annotsEntry}/Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objectChunks[pagesObjectId - 1] = encoder.encode(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  );

  const catalogId = addStringObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

  // Ensamblar documento final calculando offsets exactos en bytes
  const chunks = [];
  let totalBytes = 0;

  const pushStr = (s) => {
    const b = encoder.encode(s);
    chunks.push(b);
    totalBytes += b.length;
  };

  const pushBytes = (b) => {
    chunks.push(b);
    totalBytes += b.length;
  };

  pushStr('%PDF-1.4\n');
  const offsets = [0];

  for (let i = 0; i < objectChunks.length; i += 1) {
    offsets.push(totalBytes);
    pushStr(`${i + 1} 0 obj\n`);
    pushBytes(objectChunks[i]);
    pushStr('\nendobj\n');
  }

  const xrefOffset = totalBytes;
  pushStr(`xref\n0 ${objectChunks.length + 1}\n`);
  pushStr('0000000000 65535 f \n');
  for (let i = 1; i < offsets.length; i += 1) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }

  pushStr(
    `trailer\n<< /Size ${objectChunks.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  const output = new Uint8Array(totalBytes);
  let cursor = 0;
  for (const chunk of chunks) {
    output.set(chunk, cursor);
    cursor += chunk.length;
  }
  return output;
}

function renderSectionHeading(canvas, codePrefix, title, actionLabel, actionUrl, minFollowHeight = 60) {
  const headingHeight = 24;
  canvas.ensureSpace(headingHeight + minFollowHeight);

  const yTop = canvas.getCursorY();
  const titleY = yTop - 13;

  canvas.drawRect(MARGIN_X, titleY - 2, 3, 13, COLORS.neonGreen);
  canvas.drawText(codePrefix, MARGIN_X + 10, titleY, 'F4', 8.5, COLORS.neonGreen);
  const codeWidth = measureTextWidth(codePrefix, 'F4', 8.5);
  canvas.drawText(title, MARGIN_X + 16 + codeWidth, titleY, 'F2', 11.5, COLORS.white);

  if (actionLabel && actionUrl) {
    const linkText = `[ ${actionLabel} -> ]`;
    const linkW = measureTextWidth(linkText, 'F3', 7.5);
    const linkX = PAGE_WIDTH - MARGIN_X - linkW;
    canvas.drawText(linkText, linkX, titleY, 'F3', 7.5, COLORS.neonGreen);
    canvas.addLink(linkX - 2, titleY - 3, PAGE_WIDTH - MARGIN_X + 2, titleY + 9, actionUrl);
  }

  canvas.drawLine(MARGIN_X, yTop - 20, PAGE_WIDTH - MARGIN_X, yTop - 20, COLORS.border, 0.6);
  canvas.moveCursor(headingHeight + 6);
}

function renderHeaderCard(canvas, t, isEn, hasAvatar) {
  const email = t.contact?.emailAddress || 'kevindarnet.work@gmail.com';
  const location = t.contact?.location || 'Argentina | Remote (UTC-3)';
  const role = `${t.hero?.rolePrefix || 'Application Security'} ${t.hero?.roleHighlight || '& Full-Stack Engineer'}`;
  const statusText = t.hero?.status || 'Software Resiliente & Ciberdefensa';
  const bioLines = wrapTextLines(t.hero?.tagline || '', CONTENT_WIDTH - 24, 'F1', 8.8);

  const headerCardHeight = 92 + bioLines.length * 11.5 + 14;
  const cardTop = canvas.getCursorY();
  const cardBottom = cardTop - headerCardHeight;

  canvas.drawRoundedRect(MARGIN_X, cardBottom, CONTENT_WIDTH, headerCardHeight, 8, COLORS.cardBg, COLORS.border, 0.8);
  canvas.drawRect(MARGIN_X, cardTop - 2.5, CONTENT_WIDTH, 2.5, COLORS.neonGreen);

  const avatarSize = 54;
  const avatarX = MARGIN_X + 14;
  const avatarY = cardTop - 16 - avatarSize;
  if (hasAvatar) {
    canvas.drawAvatar(avatarX, avatarY, avatarSize);
  }

  const textX = hasAvatar ? avatarX + avatarSize + 14 : MARGIN_X + 14;

  // Badge superior
  const badgeText = `> ${statusText}`;
  const badgeW = measureTextWidth(badgeText, 'F3', 7.5) + 12;
  canvas.drawRoundedRect(textX, cardTop - 25, badgeW, 14, 4, COLORS.neonGreenSoft, COLORS.borderAccent, 0.5);
  canvas.drawText(badgeText, textX + 6, cardTop - 20.5, 'F3', 7.5, COLORS.neonGreen);

  // Nombre y rol
  canvas.drawText('Kevin Darnet', textX, cardTop - 42, 'F2', 17, COLORS.white);
  canvas.drawText(role, textX, cardTop - 57, 'F2', 10, COLORS.neonGreen);

  // Fila de enlaces de contacto interactivos
  const contacts = [
    { label: email, uri: `mailto:${email}` },
    { label: 'linkedin.com/in/kevin-darnet', uri: 'https://www.linkedin.com/in/kevin-darnet' },
    { label: 'github.com/KevinDarnet', uri: 'https://github.com/KevinDarnet' },
    { label: 'kevindarnet-portfolio.web.app', uri: `${SITE_BASE_URL}/` },
  ];

  let cx = textX;
  let cy = cardTop - 72;
  for (let i = 0; i < contacts.length; i += 1) {
    const item = contacts[i];
    const itemW = measureTextWidth(item.label, 'F3', 7.5);
    if (cx + itemW > PAGE_WIDTH - MARGIN_X - 12 && cx > textX) {
      cx = textX;
      cy -= 11;
    }
    canvas.drawText(item.label, cx, cy, 'F3', 7.5, COLORS.textLight);
    canvas.addLink(cx - 1, cy - 2, cx + itemW + 1, cy + 8, item.uri);
    cx += itemW + 10;
    if (i < contacts.length - 1 && cx + 8 < PAGE_WIDTH - MARGIN_X - 12) {
      canvas.drawText('|', cx - 6, cy, 'F3', 7.5, COLORS.textDim);
    }
  }

  // Ubicación
  canvas.drawText(location, textX, cy - 11, 'F1', 7.5, COLORS.textMuted);

  // Divisor y bio
  const bioTop = cardTop - 92;
  canvas.drawLine(MARGIN_X + 14, bioTop + 6, PAGE_WIDTH - MARGIN_X - 14, bioTop + 6, COLORS.border, 0.5);

  let by = bioTop - 6;
  for (const line of bioLines) {
    canvas.drawText(line, MARGIN_X + 14, by, 'F1', 8.8, COLORS.textLight);
    by -= 11.5;
  }

  canvas.moveCursor(headerCardHeight + 14);

  // Bloque resumen de Perfil Técnico (3 pilares AppSec)
  const profilePoints = t.hero?.profilePoints || [];
  if (profilePoints.length > 0) {
    const profileTitle = t.hero?.profileHeader || '// PERFIL TECNICO';
    const summaryLines = wrapTextLines(t.hero?.profileSummary || '', CONTENT_WIDTH - 24, 'F1', 8.3);
    const pointLinesList = profilePoints.map((pt) =>
      wrapTextLines(`${pt.label}: ${pt.value}`, CONTENT_WIDTH - 32, 'F1', 8.2)
    );
    const pointsTotalH = pointLinesList.reduce((sum, lines) => sum + lines.length * 10.5 + 3, 0);
    const boxH = 22 + summaryLines.length * 10.5 + 6 + pointsTotalH + 8;

    canvas.ensureSpace(boxH + 12);
    const bTop = canvas.getCursorY();
    const bBottom = bTop - boxH;
    canvas.drawRoundedRect(MARGIN_X, bBottom, CONTENT_WIDTH, boxH, 7, COLORS.cardBgElevated, COLORS.border, 0.65);

    canvas.drawText(profileTitle, MARGIN_X + 12, bTop - 15, 'F4', 8.2, COLORS.neonGreen);
    const badge = t.hero?.profileBadge || 'AppSec & Ciberdefensa';
    const bW = measureTextWidth(badge, 'F3', 7.2);
    canvas.drawText(badge, PAGE_WIDTH - MARGIN_X - 12 - bW, bTop - 15, 'F3', 7.2, COLORS.neonGreen);

    let py = bTop - 28;
    for (const line of summaryLines) {
      canvas.drawText(line, MARGIN_X + 12, py, 'F1', 8.3, COLORS.textMuted);
      py -= 10.5;
    }
    py -= 4;
    for (const lines of pointLinesList) {
      canvas.drawText('>', MARGIN_X + 12, py, 'F4', 8.2, COLORS.neonGreen);
      for (const l of lines) {
        canvas.drawText(l, MARGIN_X + 22, py, 'F1', 8.2, COLORS.textLight);
        py -= 10.5;
      }
      py -= 3;
    }

    canvas.moveCursor(boxH + 14);
  }
}

function renderProductionSection(canvas, t, isEn) {
  const items = t.production?.items || [];
  if (items.length === 0) return;

  const sectionLabel = isEn ? 'PRODUCTION SYSTEMS' : 'SERVICIOS EN PRODUCCION';
  const viewWebLabel = isEn ? 'View live online' : 'Ver en web';
  renderSectionHeading(canvas, '01 //', sectionLabel, viewWebLabel, `${SITE_BASE_URL}/#production`, 85);

  const innerW = CONTENT_WIDTH - 24;
  for (const item of items) {
    const descLines = wrapTextLines(item.description, innerW, 'F1', 8.3);
    const secLines = wrapTextLines(
      `${isEn ? 'Security & Architecture:' : 'Seguridad y Arquitectura:'} ${item.problemSolved}`,
      innerW - 8,
      'F1',
      8.1
    );
    const tagsH = canvas.measureTagRowsHeight(item.stack || [], innerW);

    const cardH =
      28 +
      descLines.length * 10.5 +
      4 +
      secLines.length * 10.2 +
      8 +
      tagsH +
      12;

    canvas.ensureSpace(cardH + 8);
    const cTop = canvas.getCursorY();
    const cBottom = cTop - cardH;

    canvas.drawRoundedRect(MARGIN_X, cBottom, CONTENT_WIDTH, cardH, 7, COLORS.cardBg, COLORS.border, 0.7);
    canvas.drawRect(MARGIN_X, cBottom + 4, 2.5, cardH - 8, COLORS.neonGreen);

    canvas.drawText(item.name, MARGIN_X + 12, cTop - 16, 'F2', 9.8, COLORS.white);
    if (item.liveUrl) {
      const liveText = '[Live]';
      const lW = measureTextWidth(liveText, 'F3', 7.4);
      const lX = PAGE_WIDTH - MARGIN_X - 12 - lW;
      canvas.drawText(liveText, lX, cTop - 16, 'F3', 7.4, COLORS.neonGreen);
      canvas.addLink(lX - 2, cTop - 19, lX + lW + 2, cTop - 8, item.liveUrl);
    }

    const meta = `${item.category}  |  ${item.metric}`;
    canvas.drawText(meta, MARGIN_X + 12, cTop - 27, 'F3', 7.3, COLORS.neonGreen);

    let y = cTop - 39;
    for (const line of descLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F1', 8.3, COLORS.textLight);
      y -= 10.5;
    }
    y -= 2;
    for (const line of secLines) {
      canvas.drawText(line, MARGIN_X + 16, y, 'F1', 8.1, COLORS.textMuted);
      y -= 10.2;
    }
    y -= 4;
    canvas.drawTagPills(item.stack || [], MARGIN_X + 12, y + 6, innerW);

    canvas.moveCursor(cardH + 8);
  }

  canvas.moveCursor(6);
}

function renderProjectsSection(canvas, t, isEn) {
  const items = t.projects?.items || [];
  if (items.length === 0) return;

  const sectionLabel = isEn ? 'FEATURED PROJECTS & APPSEC' : 'PROYECTOS DESTACADOS & APPSEC';
  const viewWebLabel = isEn ? 'Explore projects' : 'Ver proyectos';
  renderSectionHeading(canvas, '02 //', sectionLabel, viewWebLabel, `${SITE_BASE_URL}/#projects`, 80);

  const innerW = CONTENT_WIDTH - 24;
  for (const proj of items) {
    const descLines = wrapTextLines(proj.description, innerW, 'F1', 8.3);
    const featLinesList = (proj.features || []).map((f) => wrapTextLines(f, innerW - 12, 'F1', 8.0));
    const featsH = featLinesList.reduce((sum, lines) => sum + lines.length * 10 + 2, 0);
    const tagsH = canvas.measureTagRowsHeight(proj.tags || [], innerW);

    const cardH = 26 + descLines.length * 10.5 + 4 + featsH + 6 + tagsH + 10;

    canvas.ensureSpace(cardH + 8);
    const cTop = canvas.getCursorY();
    const cBottom = cTop - cardH;

    canvas.drawRoundedRect(MARGIN_X, cBottom, CONTENT_WIDTH, cardH, 7, COLORS.cardBg, COLORS.border, 0.7);
    const headerTitle = `/${proj.number}  ${proj.title}`;
    canvas.drawText(headerTitle, MARGIN_X + 12, cTop - 15, 'F2', 9.5, COLORS.white);

    // Enlace Repo / Demo a la derecha
    let rightCursor = PAGE_WIDTH - MARGIN_X - 12;
    if (proj.repoUrl) {
      const repoLabel = '[GitHub]';
      const rW = measureTextWidth(repoLabel, 'F3', 7.3);
      rightCursor -= rW;
      canvas.drawText(repoLabel, rightCursor, cTop - 15, 'F3', 7.3, COLORS.neonGreen);
      canvas.addLink(rightCursor - 2, cTop - 18, rightCursor + rW + 2, cTop - 7, proj.repoUrl);
      rightCursor -= 6;
    }
    if (proj.demoUrl) {
      const demoLabel = '[Demo]';
      const dW = measureTextWidth(demoLabel, 'F3', 7.3);
      rightCursor -= dW;
      canvas.drawText(demoLabel, rightCursor, cTop - 15, 'F3', 7.3, COLORS.textLight);
      canvas.addLink(rightCursor - 2, cTop - 18, rightCursor + dW + 2, cTop - 7, proj.demoUrl);
    }

    canvas.drawText(proj.highlight || '', MARGIN_X + 12, cTop - 25.5, 'F3', 7.2, COLORS.neonGreen);

    let y = cTop - 37;
    for (const line of descLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F1', 8.3, COLORS.textLight);
      y -= 10.5;
    }
    y -= 2;
    for (const lines of featLinesList) {
      canvas.drawText('-', MARGIN_X + 12, y, 'F4', 8.0, COLORS.neonGreen);
      for (const l of lines) {
        canvas.drawText(l, MARGIN_X + 20, y, 'F1', 8.0, COLORS.textMuted);
        y -= 10;
      }
      y -= 2;
    }
    y -= 2;
    canvas.drawTagPills(proj.tags || [], MARGIN_X + 12, y + 6, innerW);

    canvas.moveCursor(cardH + 8);
  }

  canvas.moveCursor(6);
}

function renderArticlesSection(canvas, posts, isEn) {
  if (!posts || posts.length === 0) return;

  const sectionLabel = isEn ? 'TECHNICAL ARTICLES & WRITE-UPS' : 'ARTICULOS & WRITE-UPS TECNICOS';
  const viewWebLabel = isEn ? 'Read blog' : 'Leer articulos';
  renderSectionHeading(canvas, '03 //', sectionLabel, viewWebLabel, `${SITE_BASE_URL}/#blog`, 60);

  const innerW = CONTENT_WIDTH - 24;
  for (const post of posts) {
    const summary = isEn && post.summaryEn ? post.summaryEn : post.summary;
    const category = isEn && post.categoryEn ? post.categoryEn : post.category;
    const titleLines = wrapTextLines(post.title, innerW - 55, 'F2', 8.8);
    const summaryLines = wrapTextLines(summary, innerW, 'F1', 7.9);
    const cardH = 14 + titleLines.length * 10.5 + summaryLines.length * 9.8 + 10;

    canvas.ensureSpace(cardH + 6);
    const cTop = canvas.getCursorY();
    const cBottom = cTop - cardH;

    canvas.drawRoundedRect(MARGIN_X, cBottom, CONTENT_WIDTH, cardH, 6, COLORS.cardBg, COLORS.border, 0.6);

    const meta = `[${category}] ${post.date}`;
    const metaW = measureTextWidth(meta, 'F3', 7.0);
    canvas.drawText(meta, PAGE_WIDTH - MARGIN_X - 10 - metaW, cTop - 13, 'F3', 7.0, COLORS.neonGreen);

    let y = cTop - 13;
    for (const line of titleLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F2', 8.8, COLORS.white);
      y -= 10.5;
    }
    canvas.addLink(
      MARGIN_X + 10,
      y + 8,
      PAGE_WIDTH - MARGIN_X - 65,
      cTop - 4,
      `${SITE_BASE_URL}/#blog/${post.slug}`
    );

    y -= 1;
    for (const line of summaryLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F1', 7.9, COLORS.textMuted);
      y -= 9.8;
    }

    canvas.moveCursor(cardH + 6);
  }

  canvas.moveCursor(6);
}

function renderSkillsSection(canvas, t, isEn) {
  const categories = t.skills?.categories || [];
  if (categories.length === 0) return;

  const sectionLabel = isEn ? 'TECH STACK & APPSEC SKILLS' : 'HABILIDADES & STACK APPSEC';
  const viewWebLabel = isEn ? 'View skills' : 'Ver habilidades';
  renderSectionHeading(canvas, '04 //', sectionLabel, viewWebLabel, `${SITE_BASE_URL}/#skills`, 75);

  const innerW = CONTENT_WIDTH - 24;
  for (const cat of categories) {
    const descLines = wrapTextLines(cat.description, innerW, 'F1', 8.1);
    const skillText = (cat.skills || []).join('  |  ');
    const skillLines = wrapTextLines(skillText, innerW, 'F1', 8.0);
    const allTags = [...(cat.tags || []), ...(cat.tools || [])];
    const tagsH = canvas.measureTagRowsHeight(allTags, innerW);

    const cardH = 22 + descLines.length * 10 + 3 + skillLines.length * 10 + 6 + tagsH + 8;
    canvas.ensureSpace(cardH + 6);

    const cTop = canvas.getCursorY();
    const cBottom = cTop - cardH;
    canvas.drawRoundedRect(MARGIN_X, cBottom, CONTENT_WIDTH, cardH, 6, COLORS.cardBg, COLORS.border, 0.65);

    canvas.drawText(`${cat.code}  ${cat.title}`, MARGIN_X + 12, cTop - 14, 'F2', 9.0, COLORS.white);

    let y = cTop - 25;
    for (const line of descLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F1', 8.1, COLORS.textMuted);
      y -= 10;
    }
    y -= 2;
    for (const line of skillLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F1', 8.0, COLORS.textLight);
      y -= 10;
    }
    y -= 3;
    canvas.drawTagPills(allTags, MARGIN_X + 12, y + 5, innerW);

    canvas.moveCursor(cardH + 6);
  }

  canvas.moveCursor(6);
}

function renderExperienceSection(canvas, t, isEn) {
  const items = t.experience?.items || [];
  if (items.length === 0) return;

  const sectionLabel = isEn ? 'EXPERIENCE & EDUCATION ROADMAP' : 'TRAYECTORIA & FORMACION';
  const viewWebLabel = isEn ? 'View trajectory' : 'Ver trayectoria';
  renderSectionHeading(canvas, '05 //', sectionLabel, viewWebLabel, `${SITE_BASE_URL}/#experience`, 75);

  const innerW = CONTENT_WIDTH - 24;
  for (const exp of items) {
    const impactLines = wrapTextLines(exp.impact, innerW, 'F1', 8.1);
    const tagsH = canvas.measureTagRowsHeight(exp.tags || [], innerW);
    const cardH = 28 + impactLines.length * 10.2 + 6 + tagsH + 8;

    canvas.ensureSpace(cardH + 6);
    const cTop = canvas.getCursorY();
    const cBottom = cTop - cardH;

    canvas.drawRoundedRect(MARGIN_X, cBottom, CONTENT_WIDTH, cardH, 6, COLORS.cardBg, COLORS.border, 0.65);

    canvas.drawText(exp.role, MARGIN_X + 12, cTop - 14, 'F2', 9.2, COLORS.white);
    const periodLabel = `${exp.period} (${exp.duration})`;
    const pW = measureTextWidth(periodLabel, 'F3', 7.3);
    canvas.drawText(periodLabel, PAGE_WIDTH - MARGIN_X - 12 - pW, cTop - 14, 'F3', 7.3, COLORS.neonGreen);

    canvas.drawText(exp.entity, MARGIN_X + 12, cTop - 25, 'F3', 7.7, COLORS.textLight);

    let y = cTop - 37;
    for (const line of impactLines) {
      canvas.drawText(line, MARGIN_X + 12, y, 'F1', 8.1, COLORS.textMuted);
      y -= 10.2;
    }
    y -= 3;
    canvas.drawTagPills(exp.tags || [], MARGIN_X + 12, y + 5, innerW);

    canvas.moveCursor(cardH + 6);
  }
}

/**
 * Genera el CV Técnico completo de Kevin Darnet en PDF A4 interactivo.
 * @returns {Promise<{ fileName: string, pdfBytes: Uint8Array, blob: Blob }>}
 */
export async function generateTechnicalCvPdf({ t, posts = [], language = 'es' }) {
  const isEn = language === 'en';
  const avatarJpeg = await buildCircularAvatarJpeg(192);
  const hasAvatar = Boolean(avatarJpeg);

  const canvas = createCvPdfCanvas({ hasAvatar, lang: isEn ? 'en' : 'es' });
  renderHeaderCard(canvas, t, isEn, hasAvatar);
  renderProductionSection(canvas, t, isEn);
  renderProjectsSection(canvas, t, isEn);
  renderArticlesSection(canvas, posts, isEn);
  renderSkillsSection(canvas, t, isEn);
  renderExperienceSection(canvas, t, isEn);

  const finalizedPages = canvas.finalizePages();
  const pdfBytes = serializeBinaryPdf(finalizedPages, avatarJpeg);

  return {
    fileName: 'cv-kevin-darnet.pdf',
    pdfBytes,
    blob: new Blob([pdfBytes], { type: 'application/pdf' }),
  };
}
