#!/usr/bin/env node

/**
 * candidates.json을 읽어서 장소별 후보 사진을 눈으로 보고 고를 수 있는
 * 정적 HTML 갤러리(gallery.html)를 만든다. 브라우저로 그냥 열면 됨.
 *
 * 실행: node scripts/tour-photos/build-gallery.js
 */

const fs = require('fs');
const path = require('path');

const CANDIDATES_PATH = path.join(__dirname, 'candidates.json');
const GALLERY_PATH = path.join(__dirname, 'gallery.html');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function cardHtml(c) {
  const badges = [
    !c.inRegion ? '<span class="badge warn">경주 아닐 수 있음</span>' : '',
    c.isDrone ? '<span class="badge warn">드론</span>' : '',
    `<span class="badge">${esc(c.source)}</span>`,
  ].join('');

  return `
  <div class="card">
    <a href="${esc(c.image)}" target="_blank"><img src="${esc(c.thumb || c.image)}" loading="lazy" /></a>
    <div class="meta">
      <div class="title">${esc(c.title)}</div>
      <div class="loc">${esc(c.location)}</div>
      <div class="badges">${badges}</div>
      <input class="url" type="text" readonly value="${esc(c.image)}" onclick="this.select()" />
    </div>
  </div>`;
}

function placeSection(name, candidates) {
  const body = candidates.length
    ? candidates.map(cardHtml).join('\n')
    : '<p class="empty">API에서 찾은 후보가 없습니다. 직접 사진을 구해야 합니다.</p>';

  return `
<section>
  <h2>${esc(name)} <span class="count">(${candidates.length}개 후보)</span></h2>
  <div class="grid">${body}</div>
</section>`;
}

function main() {
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf-8'));
  const sections = Object.entries(candidates)
    .map(([name, list]) => placeSection(name, list))
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>경주 미션 사진 후보</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 1100px; margin: 0 auto; padding: 24px; background: #fafafa; color: #222; }
  h1 { font-size: 20px; }
  h2 { font-size: 16px; margin-top: 40px; border-bottom: 2px solid #333; padding-bottom: 6px; }
  .count { font-weight: normal; color: #888; font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
  .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
  .card img { width: 100%; height: 140px; object-fit: cover; display: block; background: #eee; }
  .meta { padding: 8px; }
  .title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
  .loc { font-size: 11px; color: #666; margin-bottom: 4px; }
  .badges { margin-bottom: 6px; }
  .badge { display: inline-block; font-size: 10px; background: #eee; color: #555; border-radius: 4px; padding: 1px 5px; margin-right: 4px; }
  .badge.warn { background: #fde2e2; color: #b42318; }
  .url { width: 100%; font-size: 10px; box-sizing: border-box; padding: 3px; border: 1px solid #ddd; border-radius: 4px; color: #444; }
  .empty { color: #999; font-size: 13px; }
</style>
</head>
<body>
<h1>경주 미션 사진 후보 (클릭하면 원본 이미지, URL 칸 클릭하면 전체 선택)</h1>
${sections}
</body>
</html>`;

  fs.writeFileSync(GALLERY_PATH, html, 'utf-8');
  console.log(`-> ${GALLERY_PATH}`);
}

main();
