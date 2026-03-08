import { getMangaDetail } from '@/lib/api';
import { notFound } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiryuu.online';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Kiryuu';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const res = await getMangaDetail(params.slug);
  const manga = res?.data?.info;
  if (!manga) return { title: 'Komik Tidak Ditemukan' };
  return {
    title: `${manga.title} - ${SITE_NAME}`,
    description: `Baca ${manga.title} bahasa Indonesia di ${SITE_NAME}. ${manga.synopsis?.slice(0, 120) || ''}`,
    alternates: {
      canonical: `${SITE_URL}/manga/${params.slug}`,
      amphtml: `${SITE_URL}/amp/manga/${params.slug}`,
    },
  };
}

const AMP_BOILERPLATE = `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`;
const AMP_BOILERPLATE_NOSCRIPT = `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`;

export default async function AmpMangaDetailPage({ params }) {
  const res = await getMangaDetail(params.slug);
  if (!res?.data?.info) notFound();

  const { info: manga, chapters = [] } = res.data;
  const coverImage = manga.coverImage || manga.thumb || '';
  const genres = manga.tags || manga.genres || [];
  const type = (manga.type || '').toLowerCase();
  const status = (manga.status || '').toLowerCase();
  const synopsis = manga.synopsis || '';
  const recentChapters = chapters.slice(0, 50);

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d0d0d; color: #e0e0e0; }
    header { background: #111; border-bottom: 1px solid #222; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
    header a.back { font-size: 20px; color: #888; text-decoration: none; }
    header h1 { font-size: 14px; font-weight: 800; color: #e53e3e; letter-spacing: 2px; }
    .hero { display: flex; gap: 14px; padding: 16px; }
    .cover { flex: none; width: 96px; border-radius: 10px; overflow: hidden; border: 2px solid #e53e3e; }
    .info { flex: 1; }
    .manga-title { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.3; margin-bottom: 10px; }
    .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .badge { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 99px; border: 1px solid; }
    .badge-manhwa { background: #3d2680; border-color: #7c3aed; color: #a78bfa; }
    .badge-manhua { background: #7c2d12; border-color: #ea580c; color: #fb923c; }
    .badge-manga { background: #1e3a5f; border-color: #2563eb; color: #60a5fa; }
    .badge-ongoing { background: #14532d; border-color: #16a34a; color: #4ade80; }
    .badge-completed { background: #1f2937; border-color: #4b5563; color: #9ca3af; }
    .meta { font-size: 11px; color: #999; margin-top: 4px; }
    .section { padding: 0 16px 16px; }
    .section-title { font-size: 10px; font-weight: 800; letter-spacing: 3px; color: #555; margin-bottom: 10px; text-transform: uppercase; padding-top: 16px; border-top: 1px solid #1e1e1e; }
    .synopsis { font-size: 13px; color: #aaa; line-height: 1.7; }
    .genres { display: flex; flex-wrap: wrap; gap: 6px; }
    .genre-tag { font-size: 10px; font-weight: 700; padding: 4px 10px; background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; color: #888; text-decoration: none; }
    .chapter-list { display: flex; flex-direction: column; gap: 8px; }
    .chapter-item { display: flex; align-items: center; justify-content: space-between; background: #161616; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; text-decoration: none; color: #d0d0d0; }
    .chapter-item span { font-size: 12px; font-weight: 600; }
    .chapter-date { font-size: 10px; color: #555; }
    .btn-full { display: block; text-align: center; margin: 16px; padding: 14px; background: #e53e3e; color: #fff; text-decoration: none; border-radius: 12px; font-size: 13px; font-weight: 800; letter-spacing: 1px; }
    footer { padding: 20px 16px; border-top: 1px solid #1e1e1e; text-align: center; }
    footer p { font-size: 11px; color: #555; }
  `;

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <html amp="" lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        <link rel="canonical" href={`${SITE_URL}/manga/${params.slug}`} />
        <title>{`${manga.title} - ${SITE_NAME}`}</title>
        <script async src="https://cdn.ampproject.org/v0.js" />
        <style amp-boilerplate="" dangerouslySetInnerHTML={{ __html: AMP_BOILERPLATE }} />
        <noscript>
          <style amp-boilerplate="" dangerouslySetInnerHTML={{ __html: AMP_BOILERPLATE_NOSCRIPT }} />
        </noscript>
        <style amp-custom="" dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        {/* Header */}
        <header>
          <a href={SITE_URL} className="back">←</a>
          <h1>{SITE_NAME}</h1>
        </header>

        {/* Hero */}
        <div className="hero">
          <div className="cover">
            {coverImage && (
              <amp-img
                src={coverImage}
                alt={manga.title}
                width="96"
                height="136"
                layout="responsive"
              />
            )}
          </div>
          <div className="info">
            <h2 className="manga-title">{manga.title}</h2>
            <div className="badges">
              {type && (
                <span className={`badge ${type === 'manhwa' ? 'badge-manhwa' : type === 'manhua' ? 'badge-manhua' : 'badge-manga'}`}>
                  {manga.type}
                </span>
              )}
              {status && (
                <span className={`badge ${status === 'ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
                  {manga.status}
                </span>
              )}
            </div>
            {manga.author && <p className="meta">Pengarang: {manga.author}</p>}
            {manga.rating > 0 && <p className="meta">Rating: ★ {Number(manga.rating).toFixed(1)}</p>}
            <p className="meta">{chapters.length} Chapter</p>
          </div>
        </div>

        {/* CTA */}
        <a href={`${SITE_URL}/manga/${params.slug}`} className="btn-full">
          Baca Selengkapnya di {SITE_NAME} →
        </a>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="section">
            <p className="section-title">Genre</p>
            <div className="genres">
              {genres.map((g) => (
                <a key={g} href={`${SITE_URL}/manga?genre=${encodeURIComponent(g)}`} className="genre-tag">{g}</a>
              ))}
            </div>
          </div>
        )}

        {/* Synopsis */}
        {synopsis && (
          <div className="section">
            <p className="section-title">Sinopsis</p>
            <p className="synopsis">{synopsis}</p>
          </div>
        )}

        {/* Chapter List (max 50) */}
        {recentChapters.length > 0 && (
          <div className="section">
            <p className="section-title">
              Daftar Chapter {chapters.length > 50 ? `(50 dari ${chapters.length})` : ''}
            </p>
            <div className="chapter-list">
              {recentChapters.map((ch) => (
                <a
                  key={ch.slug}
                  href={`${SITE_URL}/read/${params.slug}/${ch.slug}`}
                  className="chapter-item"
                >
                  <span>{ch.title}</span>
                  {ch.createdAt && <span className="chapter-date">{formatDate(ch.createdAt)}</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        <footer>
          <p>© 2026 {SITE_NAME} · Baca Manga Komik Bahasa Indonesia</p>
        </footer>
      </body>
    </html>
  );
}
