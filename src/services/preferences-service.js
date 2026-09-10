/* Serviço: preferências persistidas sem acoplar componentes ao armazenamento. */
(function () {
  'use strict';
  const themes = {
    azul: ['#0b1d36','#102a4c','#163860','#214a78','#38bdf8','#eff8ff','#b5d5ef'],
    rosa: ['#2a1022','#3d1633','#552044','#6d2d5a','#f472b6','#fff1f8','#f4bfd8'],
    preto: ['#0b0b0c','#161618','#242427','#343438','#a78bfa','#fafafa','#c5c5ca'],
    branco: ['#f8fafc','#ffffff','#ffffff','#f1f5f9','#2563eb','#0f172a','#475569']
  };
  const defaults = { palette: 'preto', fontScale: 100, colorMode: 'padrao' };
  const get = () => Object.assign({}, defaults, db.preferences || {});
  function apply(prefs) {
    const [body, sidebar, card, input, primary, text, muted] = themes[prefs.palette] || themes.preto;
    const root = document.documentElement;
    [['--bg-body',body],['--bg-sidebar',sidebar],['--bg-card',card],['--bg-input',input],['--primary',primary],['--primary-hover',primary],['--primary-light',`${primary}26`],['--text',text],['--text-muted',muted]].forEach(([key, value]) => root.style.setProperty(key, value));
    document.body.style.fontSize = `${Math.max(80, Math.min(130, prefs.fontScale))}%`;
    root.dataset.colorMode = prefs.colorMode;
  }
  window.PulsePreferences = { get, update(values) { db.preferences = Object.assign(get(), values); apply(db.preferences); saveDB(); }, applyCurrent() { apply(get()); } };
  document.addEventListener('DOMContentLoaded', () => window.PulsePreferences.applyCurrent());
}());
