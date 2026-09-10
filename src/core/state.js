        // Estado compartilhado, persistência legada, autenticação e navegação.
        const DEFAULT_STATE = {
            theme: 'dark',
            authenticated: true,
            userEmail: 'usuario@pulse.com.br',
            categorias: [
                { id: 1, nome: 'Alimentação', tipo: 'despesa' },
                { id: 2, nome: 'Transporte', tipo: 'despesa' },
                { id: 3, nome: 'Moradia', tipo: 'despesa' },
                { id: 4, nome: 'Lazer', tipo: 'despesa' },
                { id: 5, nome: 'Saúde', tipo: 'despesa' },
                { id: 6, nome: 'Salário', tipo: 'receita' },
                { id: 7, nome: 'Investimentos', tipo: 'receita' }
            ],
            contas: [
                { id: 1, nome: 'Nubank', saldo: 2850.00 },
                { id: 2, nome: 'Itaú', saldo: 1420.50 }
            ],
            cartoes: [
                { id: 1, nome: 'Nubank Mastercard', limite: 6000.00 },
                { id: 2, nome: 'Itaú Visa Click', limite: 4500.00 }
            ],
            transacoes: [
                { id: 1, desc: 'Salário Mensal', val: 6500.00, tipo: 'receita', date: '2026-08-01', contaId: 'conta_1', cat: 'Salário', tag: 'Fixo', status: 'pago' },
                { id: 2, desc: 'Supermercado', val: 580.40, tipo: 'despesa', date: '2026-08-12', contaId: 'cartao_1', cat: 'Alimentação', tag: 'Mensal', status: 'pago' },
                { id: 3, desc: 'Internet Fibra', val: 129.90, tipo: 'despesa', date: '2026-08-28', contaId: 'conta_2', cat: 'Moradia', tag: 'Contas', status: 'pendente' }
            ],
            limites: [
                { id: 1, cat: 'Alimentação', val: 1200.00 }
            ],
            metas: [
                { id: 1, desc: 'Reserva de Emergência', target: 15000.00, current: 4270.50 }
            ],
            patrimonio: [
                { id: 1, tipo: 'ativo', nome: 'Ações / FIIs', val: 8500.00 },
                { id: 2, tipo: 'passivo', nome: 'Financiamento Veículo', val: 14000.00 }
            ]
        };

        let db = JSON.parse(localStorage.getItem('pulse_db_v1')) || DEFAULT_STATE;

        // Instâncias de Gráficos Chart.js
        let chartDashBalanceInstance = null;
        let chartDashCatsInstance = null;
        let chartRepPieInstance = null;

        function validarIntegridadeDB() {
            if (!db || typeof db !== 'object') db = JSON.parse(JSON.stringify(DEFAULT_STATE));
            if (!db.theme) db.theme = 'dark';
            if (!Array.isArray(db.categorias)) db.categorias = [];
            if (!Array.isArray(db.contas)) db.contas = [];
            if (!Array.isArray(db.cartoes)) db.cartoes = [];
            if (!Array.isArray(db.transacoes)) db.transacoes = [];
            if (!Array.isArray(db.limites)) db.limites = [];
            if (!Array.isArray(db.metas)) db.metas = [];
            if (!Array.isArray(db.patrimonio)) db.patrimonio = [];
        }

        validarIntegridadeDB();

        let filaImportacaoStaging = [];

        function saveDB() {
            localStorage.setItem('pulse_db_v1', JSON.stringify(db));
            renderApp();
        }

        function resetData() {
            if(confirm("Deseja realmente zerar todas as informações da conta? Todas as transações, contas, cartões, categorias, metas e patrimônios serão apagados permanentemente.")) {
                db = {
                    theme: db.theme || 'dark',
                    authenticated: true,
                    userEmail: db.userEmail || 'usuario@pulse.com.br',
                    categorias: [],
                    contas: [],
                    cartoes: [],
                    transacoes: [],
                    limites: [],
                    metas: [],
                    patrimonio: []
                };
                saveDB();
            }
        }

        // TEMA CLARO E ESCURO
        function toggleTheme() {
            db.theme = db.theme === 'dark' ? 'light' : 'dark';
            saveDB();
        }

        function applyTheme() {
            document.documentElement.setAttribute('data-theme', db.theme || 'dark');
            const btn = document.getElementById('theme-toggle-btn');
            if(btn) {
                btn.innerText = db.theme === 'dark' ? '🌙 Escuro' : '☀️ Claro';
            }
        }

        // AUTENTICAÇÃO E NAVEGAÇÃO
        function handleAuth(e) {
            e.preventDefault();
            db.authenticated = true;
            db.userEmail = document.getElementById('auth-email').value;
            saveDB();
            checkAuth();
        }

        function logout() {
            db.authenticated = false;
            saveDB();
            checkAuth();
        }

        function checkAuth() {
            const authScreen = document.getElementById('auth-screen');
            if(db.authenticated) {
                authScreen.style.display = 'none';
                document.getElementById('user-display').innerText = db.userEmail || 'usuario@pulse.com.br';
            } else {
                authScreen.style.display = 'flex';
            }
        }

        function toggleAuthMode(mode) {
            const btn = document.getElementById('auth-btn');
            if(mode === 'register') {
                btn.innerText = "Cadastrar Conta Pulse";
            } else if(mode === 'recovery') {
                btn.innerText = "Enviar Instruções";
            }
        }

        function navigate(view) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            
            const targetNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick')?.includes(view));
            if(targetNav) targetNav.classList.add('active');
            
            const targetView = document.getElementById(`view-${view}`);
            if (targetView) {
                targetView.classList.add('active');
                document.getElementById('page-title').innerText = targetNav ? targetNav.innerText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : view;
            }
        }

        // TRANSAÇÕES
