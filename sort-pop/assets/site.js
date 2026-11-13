(function (root) {
'use strict';
var MAX_QUEUE = 200;
var MAX_STR = 80;
var queue = (root.__mglEvents = root.__mglEvents || []);
var provider = null;
function clean(props) {
var out = {};
if (!props || typeof props !== 'object') return out;
Object.keys(props).forEach(function (k) {
var v = props[k];
if (typeof v === 'string') out[k] = v.slice(0, MAX_STR);
else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
});
return out;
}
function track(name, props) {
if (typeof name !== 'string' || !name) return null;
var evt = { name: name, props: clean(props), ts: Date.now() };
queue.push(evt);
if (queue.length > MAX_QUEUE) queue.shift();
try {
root.dispatchEvent(new root.CustomEvent('mgl:event', { detail: evt }));
} catch (e) {  }
if (provider) {
try { provider(evt); } catch (e) {  }
}
return evt;
}
function setProvider(fn) {
provider = typeof fn === 'function' ? fn : null;
}
root.MGL = { track: track, setProvider: setProvider };
})(typeof window !== 'undefined' ? window : globalThis);
(function (doc) {
'use strict';
var html = doc.documentElement;
var base = { app: html.getAttribute('data-app') || '', lang: html.lang || '' };
function props(extra) {
var out = { app: base.app, lang: base.lang };
Object.keys(extra || {}).forEach(function (k) { if (extra[k] !== null && extra[k] !== '') out[k] = extra[k]; });
return out;
}
window.MGL.track('page_view', props());
doc.addEventListener('click', function (e) {
var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
if (!el) return;
var name = el.getAttribute('data-track');
var extra = {};
if (name === 'cta_click') extra.cta = el.getAttribute('data-cta');
if (name === 'app_store_visit') extra.store = el.getAttribute('data-store');
if (name === 'language_switch') extra.to = el.getAttribute('data-to');
window.MGL.track(name, props(extra));
});
doc.addEventListener('toggle', function (e) {
var d = e.target;
if (d && d.tagName === 'DETAILS' && d.open && d.hasAttribute('data-faq-index')) {
window.MGL.track('faq_open', props({ item: Number(d.getAttribute('data-faq-index')) }));
}
}, true);
})(document);