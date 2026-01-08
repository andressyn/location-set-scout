import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BYd-TVLG.mjs';
import { manifest } from './manifest_Cefra67s.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/api/keystatic/_---params_.astro.mjs');
const _page3 = () => import('./pages/it/post/_---slug_.astro.mjs');
const _page4 = () => import('./pages/it/work/_---slug_.astro.mjs');
const _page5 = () => import('./pages/keystatic/_---params_.astro.mjs');
const _page6 = () => import('./pages/post/_---slug_.astro.mjs');
const _page7 = () => import('./pages/rss.xml.astro.mjs');
const _page8 = () => import('./pages/work/_---slug_.astro.mjs');
const _page9 = () => import('./pages/_---slug_/og.png.astro.mjs');
const _page10 = () => import('./pages/_---slug_.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["node_modules/@keystatic/astro/internal/keystatic-api.js", _page2],
    ["src/pages/it/post/[...slug]/index.astro", _page3],
    ["src/pages/it/work/[...slug]/index.astro", _page4],
    ["node_modules/@keystatic/astro/internal/keystatic-astro-page.astro", _page5],
    ["src/pages/post/[...slug]/index.astro", _page6],
    ["src/pages/rss.xml.js", _page7],
    ["src/pages/work/[...slug]/index.astro", _page8],
    ["src/pages/[...slug]/og.png.ts", _page9],
    ["src/pages/[...slug]/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "5fd76541-1cec-4afa-b6ac-f10ad8daee55",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
