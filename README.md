# Pulse — Gestão Financeira Pessoal

Aplicação estática e educativa para organização financeira, preparada para GitHub Pages.

## Diagnóstico técnico

O protótipo original estava concentrado em `Pulse.html`: interface, regras de negócio, gráficos, importação e persistência em `localStorage` no mesmo arquivo. As funções de renderização eram extensas e acessavam a persistência diretamente, o que aumentava o risco de regressões.

Esta evolução preserva as funcionalidades existentes (transações, contas, cartões, categorias, metas, patrimônio, importação, exportação e gráficos) e adiciona uma camada complementar em `app.js`. Ela isola o armazenamento IndexedDB, mantendo `localStorage` apenas como compatibilidade/migração para os dados do protótipo.

## Recursos adicionados

- Histórico mensal calculado pelas datas reais das transações;
- Persistência local em IndexedDB, sem servidor;
- Insights determinísticos baseados nos registros;
- Área de educação financeira e simuladores;
- Fluxo manual e seguro para ChatGPT, sem API nem envio automático de dados;
- Aviso de privacidade e melhoria de uso em telas pequenas.

## Organização do código

Os recursos novos estão separados por responsabilidade: `src/services` contém persistência e preferências, `src/features` contém regras de negócio como o relatório, `src/ui` contém componentes de interface e `src/styles` concentra os estilos complementares. O HTML legado foi preservado para evitar regressões graduais.

## Acessibilidade e relatório

Em **Ajustes**, é possível escolher fundo azul, rosa, preto ou branco, alterar o tamanho da fonte e ativar o modo daltônico de alto contraste. O botão **Emitir relatório** gera um **Resumo financeiro** para o mês selecionado (ou o atual) e abre a impressão nativa; selecione **Salvar como PDF** no navegador. O título não usa “extrato mensal”.

## Executar e publicar

Abra `index.html` em um navegador ou publique o conteúdo da raiz no GitHub Pages. Não há build, dependências ou backend. Chart.js, ícones e fonte são carregados por CDN; as funções essenciais de dados continuam locais.

## Privacidade e limitações

Os dados ficam somente no navegador/dispositivo. A tela de acesso do protótipo não é autenticação de segurança e não deve ser interpretada como tal. Faça exportações periódicas. Simulações são educacionais e não são recomendação financeira nem garantia de rendimento.
