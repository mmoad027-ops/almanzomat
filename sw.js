/* عامل الخدمة - تمرير مباشر للشبكة (دون تخزين مؤقت، لضمان أحدث البيانات دائماً) */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {});
