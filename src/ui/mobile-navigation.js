/* Navegação mobile: menu lateral acessível e sem perda de contexto. */
(function () {
  'use strict';
  function close() { document.body.classList.remove('sidebar-open'); const button = document.getElementById('mobile-menu-toggle'); if (button) button.setAttribute('aria-expanded', 'false'); }
  function open() { document.body.classList.add('sidebar-open'); document.getElementById('mobile-menu-toggle')?.setAttribute('aria-expanded', 'true'); }
  document.addEventListener('DOMContentLoaded', () => {
    const headerTitle = document.querySelector('header > div:first-child');
    if (!headerTitle) return;
    headerTitle.insertAdjacentHTML('afterbegin', '<button id="mobile-menu-toggle" class="mobile-menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>');
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => document.body.classList.contains('sidebar-open') ? close() : open());
    document.getElementById('app-screen').insertAdjacentHTML('beforeend', '<button class="mobile-overlay" type="button" aria-label="Fechar menu"></button>');
    document.querySelector('.mobile-overlay').addEventListener('click', close);
    document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', close));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  });
  window.PulseMobileMenu = { close };
}());
