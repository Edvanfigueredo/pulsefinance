/* Recurso: página de impressão que o navegador exporta como PDF. */
(function () {
  'use strict';
  const money = value => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(+value || 0);
  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function emit() {
    const month = document.getElementById('rep-filter-month')?.value, year = document.getElementById('rep-filter-year')?.value;
    const period = month && year ? `${year}-${month}` : new Date().toISOString().slice(0,7);
    const tx = (db.transacoes || []).filter(item => (item.date || '').startsWith(period));
    const income = tx.filter(item => item.tipo === 'receita').reduce((sum,item) => sum + (+item.val || 0), 0);
    const expenses = tx.filter(item => item.tipo === 'despesa').reduce((sum,item) => sum + (+item.val || 0), 0);
    const label = new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(`${period}-02T12:00:00`));
    const category = {}; tx.filter(item => item.tipo === 'despesa').forEach(item => category[item.cat || 'Geral'] = (category[item.cat || 'Geral'] || 0) + (+item.val || 0));
    const categories = Object.entries(category).sort((a,b) => b[1]-a[1]).map(([name,value]) => `<tr><td>${safe(name)}</td><td>${money(value)}</td></tr>`).join('') || '<tr><td colspan="2">Sem despesas no período.</td></tr>';
    const rows = tx.map(item => `<tr><td>${safe(item.date)}</td><td>${safe(item.desc)}</td><td>${safe(item.cat || 'Geral')}</td><td>${safe(item.tipo)}</td><td>${money(item.val)}</td></tr>`).join('') || '<tr><td colspan="5">Sem movimentações no período.</td></tr>';
    document.getElementById('print-month-report')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<article id="print-month-report"><header><h1>Resumo financeiro</h1><p>${label}</p></header><section class="summary"><div><small>Receitas</small><strong>${money(income)}</strong></div><div><small>Despesas</small><strong>${money(expenses)}</strong></div><div><small>Saldo</small><strong>${money(income-expenses)}</strong></div></section><h2>Despesas por categoria</h2><table><thead><tr><th>Categoria</th><th>Total</th></tr></thead><tbody>${categories}</tbody></table><h2>Movimentações</h2><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>${rows}</tbody></table><footer>Relatório educativo gerado localmente pelo Pulse. Revise dados pessoais antes de compartilhar.</footer></article>`);
    const title = document.title; document.title = `Resumo financeiro — ${label}`; window.print(); document.title = title;
  }
  window.PulseMonthReport = { emit };
  document.addEventListener('DOMContentLoaded', () => document.getElementById('monthly-report-button')?.addEventListener('click', emit));
}());
