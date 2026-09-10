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

O `index.html` agora é exclusivamente a casca semântica da aplicação: dependências externas, estrutura visual e referências aos módulos. Estilos e regras foram extraídos sem alterar IDs, classes, eventos ou formatos de dados já usados pela interface.

```text
src/
├── core/
│   └── state.js                 # estado, persistência, autenticação e navegação
├── features/
│   ├── transactions.js          # transações, contas, cartões, categorias e patrimônio
│   ├── data-transfer.js         # importação, conciliação e assistente educativo
│   └── month-report.js          # emissão do relatório mensal
├── services/
│   ├── export-service.js        # exportação JSON e CSV
│   └── preferences-service.js   # preferências visuais persistidas
├── styles/
│   ├── base.css                 # tokens, layout e componentes principais
│   └── enhancements.css         # estilos dos recursos complementares
├── ui/
│   ├── dashboard.js             # gráficos e renderização das telas
│   └── accessibility-settings.js
└── main.js                      # inicialização única e eventos de infraestrutura
```

Os scripts continuam clássicos (sem etapa de build), carregados em ordem explícita no final da página. Isso mantém compatibilidade com GitHub Pages e com os `onclick` existentes, enquanto deixa cada domínio em seu próprio arquivo para manutenção futura.

## Acessibilidade e relatório

Em **Ajustes**, é possível escolher fundo azul, rosa, preto ou branco, alterar o tamanho da fonte e ativar o modo daltônico de alto contraste. O botão **Emitir relatório** gera um **Resumo financeiro** para o mês selecionado (ou o atual) e abre a impressão nativa; selecione **Salvar como PDF** no navegador. O título não usa “extrato mensal”.

## Uso em celular, importação e parcelas

Em telas pequenas, a navegação vira um menu hamburguer com painel lateral, fechamento por toque fora, seleção de página ou tecla Esc. Cards, cabeçalho, gráficos, formulários e tabelas usam composição adaptativa sem ocultar funções. Os ícones são vetoriais e monocromáticos e acompanham a cor ativa do tema.

Em **Importar dados**, escolha a conta ou cartão que receberá os lançamentos e envie um OFX, CSV, JSON ou planilha Excel (`.xlsx`). A tela apresenta uma conciliação antes de salvar. Em **Contas e Cartões**, o formulário de compras parceladas cria cada parcela no mês correspondente; as futuras ficam pendentes para acompanhamento. SheetJS é carregada somente para interpretar planilhas Excel.

## Executar e publicar

Abra `index.html` em um navegador ou publique o conteúdo da raiz no GitHub Pages. Não há build, dependências ou backend. Chart.js, ícones e fonte são carregados por CDN; as funções essenciais de dados continuam locais.

## Privacidade e limitações

Os dados ficam somente no navegador/dispositivo. A tela de acesso do protótipo não é autenticação de segurança e não deve ser interpretada como tal. Faça exportações periódicas. Simulações são educacionais e não são recomendação financeira nem garantia de rendimento.
