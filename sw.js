/* عامل الخدمة v2 — تسريع المنظومة: تخزين الملفات الثابتة مرة واحدة، والبيانات الحية دائماً مباشرة من الشبكة */
const CACHE = 'almanzomat-v2';
const PRECACHE = [
  './',
  './volunteer-membership.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Cairo:wght@400;600;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* بيانات المسجلين وكلمات المرور: دائماً حية من الشبكة — لا تخزين ولا اعتراض */
  if (url.hostname.endsWith('supabase.co')) return;

  /* الصفحات: تُقدَّم فوراً من التخزين وتُحدَّث بالخلفية (stale-while-revalidate) */
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      caches.match(req).then(cached => {
        const fresh = fetch(req).then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    );
    return;
  }

  /* الملفات الثابتة (مكتبات، خطوط، أيقونات): من التخزين فوراً — وتُنزَّل فقط عند أول استخدام */
  e.respondWith(
    caches.match(req).then(cached =>
      cached ||
      fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
