/* Camada de aplicação: recursos educativos e persistência local desacoplada. */
(function () {
  'use strict';
  const DB_NAME = 'pulse-finance', STORE = 'application-state', KEY = 'principal';
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);

  class IndexedDbStorage {
    open() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    async get() { const db = await this.open(); return new Promise((resolve, reject) => { const r = db.transaction(STORE).objectStore(STORE).get(KEY); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
    async set(value) { const db = await this.open(); return new Promise((resolve, reject) => { const r = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, KEY); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); }); }
  }
  const storage = new IndexedDbStorage();

  function selectedMonth() { return document.getElementById('month-selector')?.value || new Date().toISOString().slice(0, 7); }
  function allMonths() {
    const values = new Set((db.transacoes || []).filter(t => /^\d{4}-\d{2}/.test(t.date || '')).map(t => t.date.slice(0, 7)));
    values.add(new Date().toISOString().slice(0, 7));
    return [...values].sort().reverse();
  }
  function totals(month) {
    const entries = (db.transacoes || []).filter(t => !month || (t.date || '').startsWith(month));
    const income = entries.filter(t => t.tipo === 'receita').reduce((a, t) => a + (+t.val || 0), 0);
    const expenses = entries.filter(t => t.tipo === 'despesa').reduce((a, t) => a + (+t.val || 0), 0);
    return { entries, income, expenses, balance: income - expenses };
  }
  function renderInsights() {
    const target = document.getElementById('pulse-insights');
    if (!target) return;
    const current = totals(selectedMonth());
    if (!current.entries.length) { target.innerHTML = '<p>Registre receitas e despesas para receber leituras baseadas nos seus dados.</p>'; return; }
    const byCategory = {};
    current.entries.filter(t => t.tipo === 'despesa').forEach(t => byCategory[t.cat || 'Geral'] = (byCategory[t.cat || 'Geral'] || 0) + (+t.val || 0));
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const savingRate = current.income ? Math.round((current.balance / current.income) * 100) : null;
    target.innerHTML = [
      top ? `<li><strong>${top[0]}</strong> representa ${current.expenses ? Math.round(top[1] / current.expenses * 100) : 0}% das despesas do período.</li>` : '<li>Ainda não há despesas categorizadas.</li>',
      savingRate === null ? '<li>Registre uma receita para calcular a capacidade de poupança.</li>' : `<li>${savingRate >= 0 ? 'Você conseguiu guardar' : 'As despesas superaram as receitas em'} <strong>${Math.abs(savingRate)}%</strong> da renda.</li>`,
      (db.metas || []).length ? `<li>Você acompanha ${(db.metas || []).length} meta(s). Metas tornam o planejamento mais visível.</li>` : '<li>Você ainda não possui metas registradas.</li>'
    ].join('');
  }
  function renderMonths() {
    const list = document.getElementById('month-list'); if (!list) return;
    list.innerHTML = allMonths().map(value => { const s = totals(value); return `<button class="pulse-month" data-month="${value}"><strong>${monthLabel.format(new Date(value + '-02T12:00:00'))}</strong><span>Receitas ${money(s.income)} · Despesas ${money(s.expenses)} · Saldo ${money(s.balance)}</span></button>`; }).join('');
    list.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      const [year, month] = button.dataset.month.split('-');
      const m = document.getElementById('rep-filter-month'), y = document.getElementById('rep-filter-year');
      if (m) m.value = month; if (y) y.value = year;
      navigate('relatorios'); renderApp();
    }));
  }
  function createMonth() {
    const value = prompt('Informe o novo mês no formato AAAA-MM:', new Date().toISOString().slice(0, 7));
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value || '')) return alert('Use o formato AAAA-MM. Nenhum dado foi alterado.');
    db.months = Array.from(new Set([...(db.months || []), value]));
    saveDB(); renderMonths(); alert('Mês criado. Categorias, contas, cartões, orçamentos e metas continuam disponíveis; transações não são duplicadas.');
  }
  function simulation() {
    const essential = +document.getElementById('sim-essential').value || 0;
    const reserve = +document.getElementById('sim-reserve').value || 0;
    document.getElementById('sim-result').textContent = `Meta de reserva: 1 mês ${money(essential)}, 3 meses ${money(essential * 3)} e 6 meses ${money(essential * 6)}. Hoje você possui ${money(reserve)}.`;
  }
  function compound() {
    const initial = +document.getElementById('sim-initial').value || 0, contribution = +document.getElementById('sim-contribution').value || 0, months = +document.getElementById('sim-months').value || 0, rate = (+document.getElementById('sim-rate').value || 0) / 100;
    const value = rate ? initial * (1 + rate) ** months + contribution * (((1 + rate) ** months - 1) / rate) : initial + contribution * months;
    document.getElementById('compound-result').textContent = `Em ${months} meses, o valor estimado seria ${money(value)}.`;
  }
  const promptText = `Analise o relatório financeiro anexado exclusivamente para fins educativos. Explique receitas, despesas, categorias, maiores gastos, capacidade de poupança, metas, dívidas e reserva. Aponte oportunidades gerais de organização, consumo consciente e renda extra. Crie planos práticos de 30, 90 e 180 dias. Não recomende compra ou venda de ativos específicos, não prometa rentabilidade e peça esclarecimentos quando os dados forem insuficientes.`;
  async function copyPrompt() { try { await navigator.clipboard.writeText(promptText); alert('Prompt copiado. Revise o relatório e remova dados sensíveis antes de compartilhá-lo.'); } catch { alert('Não foi possível copiar automaticamente.\n\n' + promptText); } }
  function addViews() {
    document.querySelector('main').insertAdjacentHTML('beforeend', `
      <section id="view-meses" class="view-section"><div class="card"><h2>Histórico financeiro</h2><p>Consulte meses anteriores sem apagar dados. As transações permanecem no mês em que foram registradas.</p><button class="btn-primary" id="new-month">Começar novo mês</button></div><div class="card"><div id="month-list" class="pulse-list"></div></div></section>
      <section id="view-educacao" class="view-section"><div class="card"><h2>Entenda seus números</h2><div class="pulse-terms"><p><strong>Receita:</strong> dinheiro que entra.</p><p><strong>Despesa:</strong> dinheiro que sai.</p><p><strong>Saldo:</strong> o que sobra após as movimentações.</p><p><strong>Reserva:</strong> dinheiro separado para imprevistos.</p><p><strong>Liquidez:</strong> facilidade de usar o dinheiro quando necessário.</p></div></div><div class="grid-2-equal"><div class="card"><h3>Simulador de reserva</h3><label>Despesas essenciais mensais<input id="sim-essential" type="number" min="0" step="0.01"></label><label>Reserva atual<input id="sim-reserve" type="number" min="0" step="0.01"></label><button class="btn-primary" id="run-reserve">Calcular</button><p id="sim-result"></p></div><div class="card"><h3>Juros compostos</h3><label>Valor inicial<input id="sim-initial" type="number" min="0" step="0.01"></label><label>Contribuição mensal<input id="sim-contribution" type="number" min="0" step="0.01"></label><label>Meses<input id="sim-months" type="number" min="0"></label><label>Taxa hipotética mensal (%)<input id="sim-rate" type="number" min="0" step="0.01"></label><button class="btn-primary" id="run-compound">Simular</button><p id="compound-result">Simulação educacional: não representa garantia de rendimento.</p></div></div><div class="card"><h3>Primeiros passos nos investimentos</h3><p>Conheça os conceitos de reserva, renda fixa, Tesouro, CDB, fundos, ações, ETFs, diversificação, risco e liquidez antes de decidir. Pesquise e considere objetivo, prazo e tolerância a risco.</p></div></section>`);
    document.getElementById('new-month').addEventListener('click', createMonth);
    document.getElementById('run-reserve').addEventListener('click', simulation);
    document.getElementById('run-compound').addEventListener('click', compound);
    document.getElementById('view-dashboard').insertAdjacentHTML('beforeend', '<div class="card"><h5>Aprenda com seus números</h5><ul id="pulse-insights" class="pulse-insights"></ul></div>');
    const ai = document.getElementById('view-inteligencia');
    ai.innerHTML = `<div class="card"><h2>Pulse IA</h2><p>Use uma ferramenta externa apenas se desejar. O Pulse não envia seus dados, não usa API de IA e não controla o ChatGPT.</p><p class="pulse-warning">Seu relatório pode conter informações financeiras pessoais. Revise os dados e remova informações sensíveis antes de compartilhar o arquivo.</p><div class="pulse-actions"><a class="btn-primary" href="https://chatgpt.com/" target="_blank" rel="noopener">Abrir ChatGPT</a><button class="btn-amber" id="copy-ai-prompt">Copiar prompt de análise</button></div></div><div class="card"><h3>Como analisar um relatório</h3><p>Gere ou exporte seu relatório, revise o conteúdo, anexe-o manualmente no ChatGPT e cole o prompt. Nunca compartilhe senhas, CVV, códigos de autenticação ou números completos de cartão.</p></div>`;
    document.getElementById('copy-ai-prompt').addEventListener('click', copyPrompt);
  }
  function applyStyles() {
    const style = document.createElement('style'); style.textContent = `.pulse-list{display:grid;gap:10px}.pulse-month{background:var(--bg-input);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:14px;text-align:left;cursor:pointer}.pulse-month span{display:block;color:var(--text-muted);font-size:.8rem;margin-top:5px}.pulse-terms{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:16px}.pulse-insights{padding-left:20px;display:grid;gap:10px}.pulse-warning{border-left:4px solid var(--accent-amber);padding:12px;background:var(--primary-light);margin:16px 0}.pulse-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.pulse-actions a{text-decoration:none}@media(max-width:700px){body{height:auto;overflow:auto}sidebar{width:70px}.nav-item{font-size:0;padding:12px;justify-content:center}.nav-item:first-letter{font-size:1.15rem}.brand-slogan{display:none}header{padding:0 12px}.view-section{padding:16px}header #user-display,header .btn-amber{display:none}table{display:block;overflow-x:auto}.pulse-actions>*{width:100%;text-align:center}}`; document.head.appendChild(style);
  }
  document.addEventListener('DOMContentLoaded', async () => {
    applyStyles(); addViews();
    const legacySave = saveDB;
    saveDB = function () { legacySave(); storage.set(db).catch(() => {}); };
    try { const saved = await storage.get(); if (saved && typeof saved === 'object') { db = saved; validarIntegridadeDB(); renderApp(); } else { await storage.set(db); } } catch { /* localStorage remains a compatible fallback */ }
    if (!db.userName) { db.authenticated = false; checkAuth(); }
    const originalRender = renderApp;
    renderApp = function () { originalRender(); renderInsights(); renderMonths(); };
    renderApp();
  });
}());
