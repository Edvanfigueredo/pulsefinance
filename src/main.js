        // Ponto único de inicialização; deve ser carregado depois dos demais módulos clássicos.
        function renderTxTable() { renderApp(); }

        document.addEventListener('DOMContentLoaded', () => {
            const dateInput = document.getElementById('tx-date');
            if(dateInput) dateInput.value = new Date().toISOString().split('T')[0];

            const dropZone = document.getElementById('drop-zone');
            if (dropZone) {
                dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary)'; });
                dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--border)'; });
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = 'var(--border)';
                    if(!document.getElementById('import-destino').value) {
                        alert('Selecione a Conta ou Cartão de destino!');
                        return;
                    }
                    if (e.dataTransfer.files.length > 0) {
                        const reader = new FileReader();
                        reader.onload = function(evt) { analisarEConciliar(evt.target.result); };
                        reader.readAsText(e.dataTransfer.files[0]);
                    }
                });
            }

            renderApp();
        });
