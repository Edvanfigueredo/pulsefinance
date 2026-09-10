/* Navegação mobile: menu lateral acessível e sem perda de contexto. */
(function () {
  'use strict';
  function close() { document.body.classList.remove('sidebar-open'); const button = document.getElementById('mobile-menu-toggle'); if (button) button.setAttribute('aria-expanded', 'false'); }
  function open() { document.body.classList.add('sidebar-open'); document.getElementById('mobile-menu-toggle')?.setAttribute('aria-expanded', 'true'); }
  document.addEventListener('DOMContentLoaded', () => {
    const responsiveStyle = document.createElement('style');
    responsiveStyle.textContent = '@media(max-width:700px){body{height:100dvh!important;overflow:hidden!important}#app-screen{height:100dvh}sidebar{position:fixed!important;top:0;bottom:0;left:0;width:min(86vw,310px)!important;padding-top:18px;transform:translateX(-105%);transition:transform .28s ease;z-index:100}.sidebar-open sidebar{transform:translateX(0)}.mobile-overlay{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:90}.sidebar-open .mobile-overlay{display:block}.mobile-menu-toggle{display:inline-flex;align-items:center;justify-content:center}main{width:100%;min-width:0;overflow-x:hidden}header{height:auto;min-height:64px;padding:10px 14px;gap:10px}header>div:first-child{min-width:0;display:flex;align-items:center;gap:10px}header h4{font-size:1rem!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}header>div:last-child{gap:6px}.header-action-label,#user-display,header .btn-amber{display:none}.view-section{padding:16px;gap:16px}.card{padding:16px;border-radius:13px}.grid-4{grid-template-columns:1fr 1fr;gap:10px}.grid-4 .card{padding:14px}.grid-4 h2{font-size:1.2rem!important}.grid-2,.grid-2-equal{gap:14px}table{display:block;overflow-x:auto;white-space:nowrap}form[style*="display:flex"]{flex-wrap:wrap}form[style*="display:flex"] input,form[style*="display:flex"] select{min-width:0;flex:1 1 130px!important}.upload-box{padding:22px 14px}.nav-item{font-size:.88rem!important;justify-content:flex-start!important;padding:13px 16px!important}.nav-item:first-letter{font-size:inherit!important}.nav-item i{font-size:1rem!important;width:20px}.brand-logo{margin-bottom:12px}.installment-form{grid-template-columns:1fr}.chart-wrapper{height:210px}}';
    document.head.appendChild(responsiveStyle);
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
