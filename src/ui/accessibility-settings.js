/* Componente de configuração visual. */
(function () {
  'use strict';
  function render() {
    const view = document.getElementById('view-configuracoes'); if (!view) return;
    const prefs = PulsePreferences.get();
    view.innerHTML = `<div class="card settings-card"><p class="eyebrow">PREFERÊNCIAS</p><h2>Personalize sua experiência</h2><p>As escolhas ficam salvas somente neste navegador.</p><div class="settings-grid"><fieldset><legend>Cor de fundo</legend><div class="choice-row">${['azul','rosa','preto','branco'].map(color => `<button class="color-choice ${prefs.palette===color?'selected':''}" data-palette="${color}" type="button"><span class="swatch ${color}"></span>${color[0].toUpperCase()+color.slice(1)}</button>`).join('')}</div></fieldset><fieldset><legend>Tamanho do texto</legend><div class="font-controls"><button id="font-down" type="button" aria-label="Diminuir tamanho da fonte">A−</button><strong>${prefs.fontScale}%</strong><button id="font-up" type="button" aria-label="Aumentar tamanho da fonte">A+</button></div></fieldset><fieldset><legend>Visual para daltonismo</legend><p class="help">Paleta azul/laranja, alto contraste e informação textual.</p><label class="switch"><input id="colorblind-mode" type="checkbox" ${prefs.colorMode==='daltonico'?'checked':''}> Ativar modo daltônico</label></fieldset></div></div>`;
    view.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => { PulsePreferences.update({palette:button.dataset.palette}); render(); }));
    view.querySelector('#font-down').addEventListener('click', () => { PulsePreferences.update({fontScale:prefs.fontScale-10}); render(); });
    view.querySelector('#font-up').addEventListener('click', () => { PulsePreferences.update({fontScale:prefs.fontScale+10}); render(); });
    view.querySelector('#colorblind-mode').addEventListener('change', event => PulsePreferences.update({colorMode:event.target.checked?'daltonico':'padrao'}));
  }
  document.addEventListener('DOMContentLoaded', render);
}());
