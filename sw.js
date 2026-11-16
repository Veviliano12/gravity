/* 引力 · 离线缓存（构建时由 vite.config.ts 填入版本号和文件清单） */
const VERSION = '0.5.1-1794844302534'
const ASSETS = ["./","./assets/index-4CGu8Cx3.css","./assets/index-NADaCQcJ.js","./assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-greek-ext-wght-normal-DlzME5K_.woff2","./assets/inter-greek-wght-normal-CkhJZR-_.woff2","./assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./index.html","./manifest.webmanifest"]
// 同一个网站下可能挂着两个版本（/gravity/ 和 /gravity/lab/），各用各的缓存，互不清理
const SCOPE = new URL(self.registration.scope).pathname
const PREFIX = `gravity-${SCOPE}-`
const CACHE = PREFIX + VERSION
// 只管自己这一份打包里的文件：子目录里的另一个版本交给它自己的 sw.js
const OWN = new Set(ASSETS.map((a) => new URL(a, self.registration.scope).pathname))

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // 旧格式（gravity-版本号）也清掉；别的目录的缓存不动
            .filter((k) => (k.startsWith(PREFIX) && k !== CACHE) || /^gravity-\d/.test(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// 页面点「有新版本 · 点此更新」时切换到新版本
self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  // 打开 App：先用缓存（秒开、离线可用），新版本在后台下载后提示更新
  if (req.mode === 'navigate') {
    if (url.pathname !== SCOPE && url.pathname !== SCOPE + 'index.html') return
    e.respondWith(
      caches
        .open(CACHE)
        .then((c) => c.match('./', { ignoreSearch: true }).then((r) => r || c.match('./index.html', { ignoreSearch: true })))
        .then((r) => r || fetch(req)),
    )
    return
  }
  if (!OWN.has(url.pathname)) return
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true })).then((r) => r || fetch(req)))
})
