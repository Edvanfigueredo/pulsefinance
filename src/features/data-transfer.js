        // Caso de uso: assistente educativo e importação/concilição de lançamentos.
        function sendAiMessage(e) {
            e.preventDefault();
            const input = document.getElementById('ai-input');
            const txt = input.value.trim();
            if(!txt) return;

            const box = document.getElementById('ai-messages');
            box.innerHTML += `<div class="msg msg-user">${txt}</div>`;
            input.value = '';

            setTimeout(() => {
                let resp = "Não entendi sua solicitação. Posso fornecer seu 'saldo', 'despesas' ou 'balanço'.";
                const q = txt.toLowerCase();
                
                if(q.includes('saldo')) {
                    const saldoContas = db.contas.reduce((a,b)=>a+(b.saldo||0),0);
                    resp = `Seu saldo acumulado nas contas é de <strong>R$ ${saldoContas.toFixed(2)}</strong>.`;
                } else if(q.includes('despesa') || q.includes('gasto')) {
                    const totalDesp = db.transacoes.filter(t=>t.tipo==='despesa').reduce((a,b)=>a+(b.val||0),0);
                    resp = `Suas despesas registradas somam <strong>R$ ${totalDesp.toFixed(2)}</strong>.`;
                } else if(q.includes('balanço') || q.includes('resultado')) {
                    const rec = db.transacoes.filter(t=>t.tipo==='receita').reduce((a,b)=>a+(b.val||0),0);
                    const desp = db.transacoes.filter(t=>t.tipo==='despesa').reduce((a,b)=>a+(b.val||0),0);
                    resp = `Seu resultado atual (Receitas - Despesas) é <strong>R$ ${(rec - desp).toFixed(2)}</strong>.`;
                }

                box.innerHTML += `<div class="msg msg-ai">${resp}</div>`;
                box.scrollTop = box.scrollHeight;
            }, 250);
        }

        // PARSER E IMPORTAÇÃO
        function iniciarImportacaoManual() {
            const destino = document.getElementById('import-destino').value;
            if(!destino) {
                alert('Escolha a Conta ou Cartão de destino antes de importar o arquivo!');
                return;
            }
            document.getElementById('file-input').click();
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                analisarEConciliar(e.target.result);
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        function parseConteudoEntrada(raw) {
            const transacoesExtraidas = [];
            const catPadrao = db.categorias[0]?.nome || 'Geral';

            if(raw.includes('<STMTTRN>') || raw.includes('OFXHEADER')) {
                const trnBlocks = raw.split(/<\/STMTTRN>|<STMTTRN>/i);
                trnBlocks.forEach(block => {
                    if(block.includes('<TRNAMT>') || block.includes('<AMT>')) {
                        const amtMatch = block.match(/<(?:TRNAMT|AMT)>([\d\.\-]+)/i);
                        const memoMatch = block.match(/<(?:MEMO|NAME)>([^<\n\r]+)/i);
                        const dateMatch = block.match(/<(?:DTPOSTED|DTSTART)>(\d{8})/i);

                        if(amtMatch) {
                            const rawVal = parseFloat(amtMatch[1]);
                            const val = Math.abs(rawVal);
                            const tipo = rawVal >= 0 ? 'receita' : 'despesa';
                            const desc = memoMatch ? memoMatch[1].trim() : 'Lançamento OFX';
                            
                            let dateStr = new Date().toISOString().split('T')[0];
                            if(dateMatch) {
                                const y = dateMatch[1].substring(0,4);
                                const m = dateMatch[1].substring(4,6);
                                const d = dateMatch[1].substring(6,8);
                                dateStr = `${y}-${m}-${d}`;
                            }

                            transacoesExtraidas.push({ date: dateStr, desc, val, tipo, cat: catPadrao });
                        }
                    }
                });
                return transacoesExtraidas;
            }

            const lines = raw.split('\n');
            lines.forEach(line => {
                if(!line.trim() || line.startsWith('Data') || line.startsWith('Date')) return;
                
                const parts = line.split(/[,;\t]/);
                if(parts.length >= 3) {
                    const dataImp = parts[0]?.trim() || new Date().toISOString().split('T')[0];
                    const descImp = parts[1]?.trim() || 'Lançamento Importado';
                    const valImp = parseFloat(parts[2]?.trim().replace('R$', '').replace(',', '.')) || 0;
                    const tipoImp = (parts[3]?.trim().toLowerCase() === 'receita' || valImp > 0) ? 'receita' : 'despesa';
                    const catImp = parts[4]?.trim() || catPadrao;

                    transacoesExtraidas.push({ date: dataImp, desc: descImp, val: Math.abs(valImp), tipo: tipoImp, cat: catImp });
                }
            });

            return transacoesExtraidas;
        }

        function updateStagingItem(index, key, value) {
            if (filaImportacaoStaging[index]) {
                filaImportacaoStaging[index][key] = value;
            }
        }

        function analisarEConciliar(raw) {
            if(!raw || !raw.trim()) {
                alert("Selecione um arquivo válido.");
                return;
            }

            const transacoesParsed = parseConteudoEntrada(raw);
            if(transacoesParsed.length === 0) {
                alert("Formato de arquivo não reconhecido.");
                return;
            }

            const destinoSelecionado = document.getElementById('import-destino').value;
            filaImportacaoStaging = [];

            transacoesParsed.forEach((item, index) => {
                let matchStatus = 'novo';

                const duplicataExata = db.transacoes.find(t => 
                    t.date === item.date && 
                    t.val === item.val && 
                    (t.desc || '').toLowerCase() === (item.desc || '').toLowerCase()
                );

                if (duplicataExata) {
                    matchStatus = 'duplicado_exato';
                } else {
                    const duplicataParcial = db.transacoes.find(t => {
                        const diffDias = Math.abs((new Date(t.date) - new Date(item.date)) / (1000 * 60 * 60 * 24));
                        return t.val === item.val && diffDias <= 3;
                    });

                    if (duplicataParcial) matchStatus = 'duplicado_parcial';
                }

                filaImportacaoStaging.push({
                    idTemp: index,
                    date: item.date,
                    desc: item.desc,
                    val: item.val,
                    tipo: item.tipo,
                    cat: db.categorias.some(c => c.nome.toLowerCase() === (item.cat || '').toLowerCase()) ? item.cat : (db.categorias[0]?.nome || 'Geral'),
                    contaId: destinoSelecionado,
                    status: 'pago',
                    matchStatus,
                    acaoSugerida: ''
                });
            });

            renderizarPainelConciliacao();
        }

        function renderizarPainelConciliacao() {
            const card = document.getElementById('card-conciliacao');
            const tbody = document.getElementById('tb-conciliacao');
            tbody.innerHTML = '';

            if(filaImportacaoStaging.length === 0) {
                card.style.display = 'none';
                return;
            }

            card.style.display = 'block';

            filaImportacaoStaging.forEach((item, index) => {
                let badgeClass = 'badge-success';
                let statusLabel = 'Novo';

                if(item.matchStatus === 'duplicado_exato') {
                    badgeClass = 'badge-danger';
                    statusLabel = 'Duplicado';
                } else if(item.matchStatus === 'duplicado_parcial') {
                    badgeClass = 'badge-warning';
                    statusLabel = 'Suspeito';
                }

                let catOptionsHtml = '';
                db.categorias.forEach(c => {
                    const selected = (c.nome.toLowerCase() === (item.cat || '').toLowerCase()) ? 'selected' : '';
                    catOptionsHtml += `<option value="${c.nome}" ${selected}>${c.nome}</option>`;
                });

                tbody.innerHTML += `
                    <tr>
                        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                        <td>${item.date}</td>
                        <td><strong>${item.desc}</strong></td>
                        <td class="${item.tipo==='receita'?'val-plus':'val-minus'}">R$ ${item.val.toFixed(2)}</td>
                        <td>
                            <select onchange="updateStagingItem(${index}, 'cat', this.value)" style="width: 100%;">
                                ${catOptionsHtml}
                            </select>
                        </td>
                        <td>
                            <input type="text" value="${item.acaoSugerida || ''}" 
                                oninput="updateStagingItem(${index}, 'acaoSugerida', this.value)" 
                                placeholder="Observação..." style="width: 100%;">
                        </td>
                    </tr>
                `;
            });
        }

        function confirmarImportacao(modo) {
            let importados = 0;

            filaImportacaoStaging.forEach(item => {
                if (modo === 'tudo' || (modo === 'apenas_novos' && item.matchStatus === 'novo')) {
                    db.transacoes.push({
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        desc: item.desc,
                        val: item.val,
                        tipo: item.tipo,
                        cat: item.cat,
                        tag: item.acaoSugerida || '',
                        date: item.date,
                        contaId: item.contaId,
                        status: item.status
                    });
                    importados++;
                }
            });

            alert(`Importação concluída! ${importados} lançamentos sincronizados.`);
            cancelarConciliacao();
            saveDB();
        }

        function cancelarConciliacao() {
            filaImportacaoStaging = [];
            const fileInput = document.getElementById('file-input');
            if(fileInput) fileInput.value = '';
            document.getElementById('card-conciliacao').style.display = 'none';
        }
