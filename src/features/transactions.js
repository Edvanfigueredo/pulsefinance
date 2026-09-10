        // Caso de uso: transações, contas, cartões, categorias, limites e patrimônio.
        function saveTx(e) {
            e.preventDefault();
            const id = document.getElementById('tx-id').value;
            const txData = {
                id: id ? parseInt(id) : Date.now(),
                desc: document.getElementById('tx-desc').value,
                val: parseFloat(document.getElementById('tx-val').value) || 0,
                tipo: document.getElementById('tx-tipo').value,
                date: document.getElementById('tx-date').value,
                contaId: document.getElementById('tx-conta').value,
                cat: document.getElementById('tx-cat').value || 'Geral',
                tag: document.getElementById('tx-tag').value || '',
                status: document.getElementById('tx-status').value
            };

            if(id) {
                const index = db.transacoes.findIndex(t => t.id === parseInt(id));
                if(index !== -1) db.transacoes[index] = txData;
            } else {
                db.transacoes.push(txData);
            }

            clearTxForm();
            saveDB();
        }

        function editTx(id) {
            const t = db.transacoes.find(x => x.id === id);
            if(!t) return;
            document.getElementById('tx-id').value = t.id;
            document.getElementById('tx-desc').value = t.desc || '';
            document.getElementById('tx-val').value = t.val || 0;
            document.getElementById('tx-tipo').value = t.tipo || 'despesa';
            document.getElementById('tx-date').value = t.date || new Date().toISOString().split('T')[0];
            document.getElementById('tx-conta').value = t.contaId || '';
            document.getElementById('tx-cat').value = t.cat || 'Geral';
            document.getElementById('tx-tag').value = t.tag || '';
            document.getElementById('tx-status').value = t.status || 'pago';

            document.getElementById('form-tx-title').innerText = "Editar Transação";
            document.getElementById('btn-cancel-tx').style.display = "inline-block";
            navigate('financeiro');
        }

        function clearTxForm() {
            document.getElementById('tx-id').value = '';
            document.getElementById('form-tx').reset();
            document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('form-tx-title').innerText = "Nova Transação";
            document.getElementById('btn-cancel-tx').style.display = "none";
        }

        function deleteTx(id) {
            if(confirm("Deseja apagar esta transação?")) {
                db.transacoes = db.transacoes.filter(t => t.id !== id);
                saveDB();
            }
        }

        // CONTAS E CARTÕES
        function saveConta(e) {
            e.preventDefault();
            db.contas.push({ id: Date.now(), nome: document.getElementById('acc-name').value, saldo: parseFloat(document.getElementById('acc-bal').value) || 0 });
            document.getElementById('acc-name').value = ''; document.getElementById('acc-bal').value = '';
            saveDB();
        }

        function deleteConta(id) {
            db.contas = db.contas.filter(c => c.id !== id);
            saveDB();
        }

        function saveCartao(e) {
            e.preventDefault();
            db.cartoes.push({ id: Date.now(), nome: document.getElementById('card-name').value, limite: parseFloat(document.getElementById('card-lim').value) || 0 });
            document.getElementById('card-name').value = ''; document.getElementById('card-lim').value = '';
            saveDB();
        }

        function deleteCartao(id) {
            db.cartoes = db.cartoes.filter(c => c.id !== id);
            saveDB();
        }

        // CATEGORIAS
        function saveCategoria(e) {
            e.preventDefault();
            const nomeInput = document.getElementById('cat-new-name');
            const tipoInput = document.getElementById('cat-new-tipo');
            if(!nomeInput.value.trim()) return;

            db.categorias.push({ id: Date.now(), nome: nomeInput.value.trim(), tipo: tipoInput.value });
            nomeInput.value = '';
            saveDB();
        }

        function deleteCategoria(id) {
            if(confirm("Excluir categoria?")) {
                db.categorias = db.categorias.filter(c => c.id !== id);
                saveDB();
            }
        }

        // PLANEJAMENTO
        function saveLimite(e) {
            e.preventDefault();
            db.limites.push({ id: Date.now(), cat: document.getElementById('lim-cat').value, val: parseFloat(document.getElementById('lim-val').value) || 0 });
            document.getElementById('lim-val').value = '';
            saveDB();
        }

        function saveMeta(e) {
            e.preventDefault();
            db.metas.push({
                id: Date.now(),
                desc: document.getElementById('meta-desc').value,
                target: parseFloat(document.getElementById('meta-target').value) || 0,
                current: parseFloat(document.getElementById('meta-current').value) || 0
            });
            document.getElementById('meta-desc').value = ''; document.getElementById('meta-target').value = ''; document.getElementById('meta-current').value = '';
            saveDB();
        }

        // PATRIMÔNIO
        function savePatrimonio(e, tipo) {
            e.preventDefault();
            const nameEl = document.getElementById(tipo === 'ativo' ? 'ast-name' : 'pas-name');
            const valEl = document.getElementById(tipo === 'ativo' ? 'ast-val' : 'pas-val');
            db.patrimonio.push({ id: Date.now(), tipo, nome: nameEl.value, val: parseFloat(valEl.value) || 0 });
            nameEl.value = ''; valEl.value = '';
            saveDB();
        }

        function deletePatrimonio(id) {
            db.patrimonio = db.patrimonio.filter(p => p.id !== id);
            saveDB();
        }

        // IA ASSISTENTE
