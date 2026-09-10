        // Camada de apresentação: gráficos Chart.js e renderização das telas.
        function renderCharts(totalReceitas, totalDespesas, txFiltradas) {
            const isDark = db.theme === 'dark';
            const textColor = isDark ? '#f9fafb' : '#0f172a';
            const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

            // 1. Dashboard Balance Bar Chart
            const ctxBalance = document.getElementById('chart-dash-balance');
            if (ctxBalance) {
                if (chartDashBalanceInstance) chartDashBalanceInstance.destroy();
                chartDashBalanceInstance = new Chart(ctxBalance, {
                    type: 'bar',
                    data: {
                        labels: ['Receitas', 'Despesas'],
                        datasets: [{
                            data: [totalReceitas, totalDespesas],
                            backgroundColor: ['#10b981', '#ef4444'],
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { ticks: { color: textColor }, grid: { display: false } },
                            y: { ticks: { color: textColor }, grid: { color: gridColor } }
                        }
                    }
                });
            }

            // 2. Dashboard Category Doughnut Chart
            const ctxCats = document.getElementById('chart-dash-cats');
            if (ctxCats) {
                const despesasMap = {};
                db.transacoes.filter(t => t.tipo === 'despesa').forEach(t => {
                    const cat = t.cat || 'Geral';
                    despesasMap[cat] = (despesasMap[cat] || 0) + (t.val || 0);
                });
                const labels = Object.keys(despesasMap);
                const data = Object.values(despesasMap);

                if (chartDashCatsInstance) chartDashCatsInstance.destroy();
                chartDashCatsInstance = new Chart(ctxCats, {
                    type: 'doughnut',
                    data: {
                        labels: labels.length ? labels : ['Sem dados'],
                        datasets: [{
                            data: data.length ? data : [1],
                            backgroundColor: ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#64748b'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right', labels: { color: textColor, font: { size: 12 } } } }
                    }
                });
            }

            // 3. Reports Category Pie Chart
            const ctxRepPie = document.getElementById('chart-rep-pie');
            if (ctxRepPie) {
                const repCatMap = {};
                txFiltradas.filter(t => t.tipo === 'despesa').forEach(t => {
                    const cat = t.cat || 'Geral';
                    repCatMap[cat] = (repCatMap[cat] || 0) + (t.val || 0);
                });
                const repLabels = Object.keys(repCatMap);
                const repData = Object.values(repCatMap);

                if (chartRepPieInstance) chartRepPieInstance.destroy();
                chartRepPieInstance = new Chart(ctxRepPie, {
                    type: 'pie',
                    data: {
                        labels: repLabels.length ? repLabels : ['Sem Despesas'],
                        datasets: [{
                            data: repData.length ? repData : [1],
                            backgroundColor: ['#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
                    }
                });
            }
        }

        // RENDER MASTER
        function renderApp() {
            validarIntegridadeDB();
            applyTheme();
            checkAuth();

            // Contas & Cartões
            const accSelect = document.getElementById('tx-conta');
            if (accSelect) {
                accSelect.innerHTML = '';
                db.contas.forEach(c => accSelect.innerHTML += `<option value="conta_${c.id}">${c.nome}</option>`);
                db.cartoes.forEach(c => accSelect.innerHTML += `<option value="cartao_${c.id}">${c.nome}</option>`);
            }

            // Categorias
            const catSelect = document.getElementById('tx-cat');
            const limCatSelect = document.getElementById('lim-cat');
            if(catSelect) {
                catSelect.innerHTML = '';
                db.categorias.forEach(c => catSelect.innerHTML += `<option value="${c.nome}">${c.nome}</option>`);
            }
            if(limCatSelect) {
                limCatSelect.innerHTML = '';
                db.categorias.filter(c => c.tipo === 'despesa').forEach(c => limCatSelect.innerHTML += `<option value="${c.nome}">${c.nome}</option>`);
            }

            // Filtros de Relatórios
            const repCatSelect = document.getElementById('rep-filter-cat');
            if(repCatSelect) {
                const currentCat = repCatSelect.value;
                repCatSelect.innerHTML = '<option value="">Todas as Categorias</option>';
                db.categorias.forEach(c => {
                    const sel = c.nome === currentCat ? 'selected' : '';
                    repCatSelect.innerHTML += `<option value="${c.nome}" ${sel}>${c.nome}</option>`;
                });
            }

            const repYearSelect = document.getElementById('rep-filter-year');
            if(repYearSelect) {
                const currentYear = repYearSelect.value;
                const yearsSet = new Set(['2024', '2025', '2026', '2027']);
                db.transacoes.forEach(t => { if (t.date && t.date.includes('-')) yearsSet.add(t.date.split('-')[0]); });
                const sortedYears = Array.from(yearsSet).sort();
                repYearSelect.innerHTML = '<option value="">Todos os Anos</option>';
                sortedYears.forEach(y => {
                    const sel = y === currentYear ? 'selected' : '';
                    repYearSelect.innerHTML += `<option value="${y}" ${sel}>${y}</option>`;
                });
            }

            // Destino Importação
            const importDestino = document.getElementById('import-destino');
            if(importDestino) {
                const valorAtual = importDestino.value;
                importDestino.innerHTML = '<option value="">-- Escolha a Conta ou Cartão --</option>';
                db.contas.forEach(c => importDestino.innerHTML += `<option value="conta_${c.id}">${c.nome} (conta)</option>`);
                db.cartoes.forEach(c => importDestino.innerHTML += `<option value="cartao_${c.id}">${c.nome} (cartão)</option>`);
                importDestino.value = valorAtual;
            }

            // Totais
            const totalReceitas = db.transacoes.filter(t => t.tipo === 'receita').reduce((a, b) => a + (b.val || 0), 0);
            const totalDespesas = db.transacoes.filter(t => t.tipo === 'despesa').reduce((a, b) => a + (b.val || 0), 0);
            const saldoContas = db.contas.reduce((a, b) => a + (b.saldo || 0), 0);
            const resultado = totalReceitas - totalDespesas;

            document.getElementById('dash-saldo').innerText = `R$ ${saldoContas.toFixed(2)}`;
            document.getElementById('dash-receitas').innerText = `R$ ${totalReceitas.toFixed(2)}`;
            document.getElementById('dash-despesas').innerText = `R$ ${totalDespesas.toFixed(2)}`;
            
            const resEl = document.getElementById('dash-resultado');
            resEl.innerText = `R$ ${resultado.toFixed(2)}`;
            resEl.className = resultado >= 0 ? 'val-plus' : 'val-minus';

            // Pendentes
            const tbPend = document.getElementById('tb-pendentes');
            if (tbPend) {
                tbPend.innerHTML = '';
                db.transacoes.filter(t => t.status === 'pendente').forEach(t => {
                    tbPend.innerHTML += `<tr><td>${t.date}</td><td>${t.desc}</td><td>${t.tipo}</td><td class="${t.tipo==='receita'?'val-plus':'val-minus'}">R$ ${(t.val||0).toFixed(2)}</td></tr>`;
                });
            }

            // Indicadores
            const indBox = document.getElementById('dash-indicadores');
            if (indBox) {
                const atvTotal = db.patrimonio.filter(p => p.tipo === 'ativo').reduce((a,b) => a + (b.val||0), 0);
                const pasTotal = db.patrimonio.filter(p => p.tipo === 'passivo').reduce((a,b) => a + (b.val||0), 0);
                indBox.innerHTML = `
                    <div><small style="color:var(--text-muted); font-weight:700;">PATRIMÔNIO LÍQUIDO</small><h4 style="margin-top:4px; font-weight:800; font-size:1.2rem;">R$ ${(atvTotal - pasTotal).toFixed(2)}</h4></div>
                    <div><small style="color:var(--text-muted); font-weight:700;">TAXA DE POUPANÇA</small><h4 style="margin-top:4px; font-weight:800; font-size:1.2rem;">${totalReceitas > 0 ? Math.round((resultado/totalReceitas)*100) : 0}%</h4></div>
                `;
            }

            // Tabela Transações
            const tbTx = document.getElementById('tb-tx');
            if (tbTx) {
                const search = (document.getElementById('tx-search')?.value || '').toLowerCase();
                tbTx.innerHTML = '';
                db.transacoes.filter(t => (t.desc || '').toLowerCase().includes(search) || (t.cat || '').toLowerCase().includes(search)).forEach(t => {
                    let nomeDestino = '-';
                    const targetId = String(t.contaId || '');
                    if(targetId.startsWith('conta_')) {
                        const acc = db.contas.find(c => c.id === parseInt(targetId.replace('conta_', '')));
                        if(acc) nomeDestino = acc.nome;
                    } else if(targetId.startsWith('cartao_')) {
                        const card = db.cartoes.find(c => c.id === parseInt(targetId.replace('cartao_', '')));
                        if(card) nomeDestino = card.nome;
                    }

                    tbTx.innerHTML += `
                        <tr>
                            <td>${t.date}</td>
                            <td><strong>${t.desc}</strong></td>
                            <td>${t.cat || 'Geral'} ${t.tag ? `<span class="badge">${t.tag}</span>` : ''}</td>
                            <td>${nomeDestino}</td>
                            <td><span class="badge">${t.status}</span></td>
                            <td class="${t.tipo==='receita'?'val-plus':'val-minus'}">R$ ${(t.val||0).toFixed(2)}</td>
                            <td>
                                <button class="btn-amber btn-sm" aria-label="Editar" onclick="editTx(${t.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-red btn-sm" aria-label="Excluir" onclick="deleteTx(${t.id})"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }

            // Contas
            const tbAcc = document.getElementById('tb-contas');
            if (tbAcc) {
                tbAcc.innerHTML = '';
                db.contas.forEach(c => {
                    tbAcc.innerHTML += `<tr><td><strong>${c.nome}</strong></td><td class="val-plus">R$ ${(c.saldo||0).toFixed(2)}</td><td><button class="btn-red btn-sm" aria-label="Excluir conta" onclick="deleteConta(${c.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
                });
            }

            // Cartões
            const tbCard = document.getElementById('tb-cartoes');
            if (tbCard) {
                tbCard.innerHTML = '';
                db.cartoes.forEach(c => {
                    tbCard.innerHTML += `<tr><td><strong>${c.nome}</strong></td><td>R$ ${(c.limite||0).toFixed(2)}</td><td><button class="btn-red btn-sm" aria-label="Excluir cartão" onclick="deleteCartao(${c.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
                });
            }

            // Categorias
            const tbCat = document.getElementById('tb-categorias');
            if(tbCat) {
                tbCat.innerHTML = '';
                db.categorias.forEach(c => {
                    tbCat.innerHTML += `<tr><td><strong>${c.nome}</strong></td><td><span class="${c.tipo==='receita'?'val-plus':'val-minus'}">${(c.tipo||'despesa').toUpperCase()}</span></td><td><button class="btn-red btn-sm" aria-label="Excluir categoria" onclick="deleteCategoria(${c.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
                });
            }

            // Orçamentos
            const limBox = document.getElementById('limites-list');
            if (limBox) {
                limBox.innerHTML = '';
                db.limites.forEach(l => {
                    const spent = db.transacoes.filter(t => t.tipo==='despesa' && (t.cat||'').toLowerCase()===(l.cat||'').toLowerCase()).reduce((a,b)=>a+(b.val||0),0);
                    const perc = l.val > 0 ? Math.min(Math.round((spent/l.val)*100), 100) : 0;
                    limBox.innerHTML += `
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600;">
                                <span>${l.cat}</span><span>R$ ${spent.toFixed(2)} de R$ ${(l.val||0).toFixed(2)} (${perc}%)</span>
                            </div>
                            <div style="background:var(--bg-input); height:8px; border-radius:4px; margin-top:6px; overflow:hidden;">
                                <div style="background:${perc>80?'var(--accent-red)':'var(--primary)'}; width:${perc}%; height:100%; border-radius:4px;"></div>
                            </div>
                        </div>
                    `;
                });
            }

            // Metas
            const metaBox = document.getElementById('metas-list');
            if (metaBox) {
                metaBox.innerHTML = '';
                db.metas.forEach(m => {
                    const perc = m.target > 0 ? Math.min(Math.round(((m.current||0)/(m.target||1))*100), 100) : 0;
                    metaBox.innerHTML += `
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600;">
                                <span>${m.desc}</span><span>R$ ${(m.current||0).toFixed(2)} / R$ ${(m.target||0).toFixed(2)} (${perc}%)</span>
                            </div>
                            <div style="background:var(--bg-input); height:8px; border-radius:4px; margin-top:6px; overflow:hidden;">
                                <div style="background:var(--accent-green); width:${perc}%; height:100%; border-radius:4px;"></div>
                            </div>
                        </div>
                    `;
                });
            }

            // Patrimônio
            const tbAst = document.getElementById('tb-ativos');
            if (tbAst) {
                tbAst.innerHTML = '';
                db.patrimonio.filter(p => p.tipo === 'ativo').forEach(p => {
                    tbAst.innerHTML += `<tr><td>${p.nome}</td><td class="val-plus">R$ ${(p.val||0).toFixed(2)}</td><td><button class="btn-red btn-sm" aria-label="Excluir ativo" onclick="deletePatrimonio(${p.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
                });
            }

            const tbPas = document.getElementById('tb-passivos');
            if (tbPas) {
                tbPas.innerHTML = '';
                db.patrimonio.filter(p => p.tipo === 'passivo').forEach(p => {
                    tbPas.innerHTML += `<tr><td>${p.nome}</td><td class="val-minus">R$ ${(p.val||0).toFixed(2)}</td><td><button class="btn-red btn-sm" aria-label="Excluir dívida" onclick="deletePatrimonio(${p.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
                });
            }

            // Relatórios
            const filterMonth = document.getElementById('rep-filter-month')?.value || '';
            const filterYear = document.getElementById('rep-filter-year')?.value || '';
            const filterCat = document.getElementById('rep-filter-cat')?.value || '';

            const txFiltradas = db.transacoes.filter(t => {
                if(!t.date) return false;
                const parts = t.date.split('-');
                if(filterYear && parts[0] !== filterYear) return false;
                if(filterMonth && parts[1] !== filterMonth) return false;
                if(filterCat && (t.cat || 'Geral').toLowerCase() !== filterCat.toLowerCase()) return false;
                return true;
            });

            const repRec = txFiltradas.filter(t => t.tipo === 'receita').reduce((a, b) => a + (b.val || 0), 0);
            const repDesp = txFiltradas.filter(t => t.tipo === 'despesa').reduce((a, b) => a + (b.val || 0), 0);
            const repBal = repRec - repDesp;

            if (document.getElementById('rep-total-rec')) document.getElementById('rep-total-rec').innerText = `R$ ${repRec.toFixed(2)}`;
            if (document.getElementById('rep-total-desp')) document.getElementById('rep-total-desp').innerText = `R$ ${repDesp.toFixed(2)}`;
            if (document.getElementById('rep-total-bal')) {
                const balEl = document.getElementById('rep-total-bal');
                balEl.innerText = `R$ ${repBal.toFixed(2)}`;
                balEl.className = repBal >= 0 ? 'val-plus' : 'val-minus';
            }
            if (document.getElementById('rep-total-count')) document.getElementById('rep-total-count').innerText = txFiltradas.length;

            const tbRepCat = document.getElementById('tb-rep-cat');
            if (tbRepCat) {
                tbRepCat.innerHTML = '';
                const catMap = {};
                const despesasFiltradas = txFiltradas.filter(t => t.tipo === 'despesa');
                const totalDespesasFiltrado = despesasFiltradas.reduce((a, b) => a + (b.val || 0), 0);

                despesasFiltradas.forEach(t => {
                    const category = t.cat || 'Geral';
                    catMap[category] = (catMap[category] || 0) + (t.val || 0);
                });

                const catKeys = Object.keys(catMap);
                if (catKeys.length === 0) {
                    tbRepCat.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted)">Sem registros.</td></tr>';
                } else {
                    catKeys.forEach(cat => {
                        const val = catMap[cat];
                        const pct = totalDespesasFiltrado > 0 ? ((val / totalDespesasFiltrado) * 100).toFixed(1) : 0;
                        tbRepCat.innerHTML += `<tr><td><strong>${cat}</strong></td><td>R$ ${val.toFixed(2)}</td><td>${pct}%</td></tr>`;
                    });
                }
            }

            const tbRepTx = document.getElementById('tb-rep-tx');
            if (tbRepTx) {
                tbRepTx.innerHTML = '';
                if (txFiltradas.length === 0) {
                    tbRepTx.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">Nenhum registro encontrado.</td></tr>';
                } else {
                    txFiltradas.forEach(t => {
                        tbRepTx.innerHTML += `
                            <tr>
                                <td>${t.date}</td>
                                <td><strong>${t.desc}</strong></td>
                                <td>${t.cat || 'Geral'}</td>
                                <td><span class="badge">${t.tipo}</span></td>
                                <td class="${t.tipo==='receita'?'val-plus':'val-minus'}">R$ ${(t.val||0).toFixed(2)}</td>
                            </tr>
                        `;
                    });
                }
            }

            // Alertas
            const alertBox = document.getElementById('sys-alerts');
            if (alertBox) {
                alertBox.innerHTML = '';
                if(totalDespesas > totalReceitas && totalReceitas > 0) {
                    alertBox.innerHTML += `<div class="badge badge-danger" style="display:block; padding:12px;"><i class="fa-solid fa-triangle-exclamation"></i> <strong>Atenção:</strong> Suas despesas ultrapassaram as receitas este mês.</div>`;
                }
                db.limites.forEach(l => {
                    const spent = db.transacoes.filter(t => t.tipo==='despesa' && (t.cat||'').toLowerCase()===(l.cat||'').toLowerCase()).reduce((a,b)=>a+(b.val||0),0);
                    if(spent > l.val) {
                        alertBox.innerHTML += `<div class="badge badge-warning" style="display:block; padding:12px;"><i class="fa-solid fa-triangle-exclamation"></i> Teto orçamentário estourado em <strong>${l.cat}</strong>.</div>`;
                    }
                });
                if(!alertBox.innerHTML) alertBox.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">Sua saúde financeira está sob controle.</span>`;
            }

            // Renderizar gráficos
            renderCharts(totalReceitas, totalDespesas, txFiltradas);
        }
