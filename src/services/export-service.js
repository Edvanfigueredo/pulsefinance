        // Serviço de exportação. Mantém o formato JSON/CSV já suportado pela interface.
        function exportData(format) {
            let str = "";
            if(format === 'json') {
                str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
            } else {
                let csv = "Data,Descricao,Tipo,Categoria,Valor\n";
                db.transacoes.forEach(t => { csv += `${t.date},${t.desc},${t.tipo},${t.cat},${t.val}\n`; });
                str = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            }
            const a = document.createElement('a');
            a.setAttribute("href", str);
            a.setAttribute("download", `pulse_backup.${format}`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        }

        // SUPORTE A GRÁFICOS CHART.JS
