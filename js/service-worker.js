const CACHE_NAME = 'quran-english-edu-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/data/albaqarah.json'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش بنجاح');
        return cache.addAll(urlsToCache);
      })
  );
});

// جلب البيانات: محاولة جلبها من الإنترنت، وإن فشل يجلبها من الكاش المرجعي
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف من الكاش إذا وُجد
        if (response) {
          return response;
        }
        // أو محاولة جلبه من الشبكة
        return fetch(event.request);
      })
  );
});