# Diagnóstico de recuperação com IA (protótipo On Nest para a Ubots)

Protótipo navegável para a reunião com a Ubots. Especificação em
`CLAUDE_prototipo_diagnostico.md`, textos em `COPY.md`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npx vercel --prod
```

## Rotas

| Rota | O que mostra |
|---|---|
| `/` | Hub da apresentação, com os três cartões na ordem da demonstração |
| `/artigo` | Mock do artigo do case, com os 3 pontos de entrada (botão "Mostrar pontos de entrada" no topo) |
| `/diagnostico` | O componente em tela cheia; `?demo=1` liga o seletor de cenários |
| `/painel` | Visão do comercial: lista, detalhe, CSV e limpeza |

Os leads ficam no `localStorage` (chave `ubots_diag_leads`), com o `utm_content` lido da URL.

## Estrutura

- `src/DiagnosticoRecuperacaoIA.jsx`: fluxo do diagnóstico (abertura com a pergunta 1, quiz, captação, análise e resultado).
  Props opcionais: `onLead`, `onInteresse`, `onReiniciar`, `respostasIniciais`, `etapaInicial`, `formInicial` e `persistir`.
- `src/diagnostico/modelo.js`: perguntas, níveis, `calcular` (do componente original, sem alteração) e formatação.
- `src/diagnostico/perfil.js`: vocabulário por tipo de instituição e redação adaptada das perguntas.
- `src/diagnostico/leitura.js`: leitura aprofundada, a mesma que o lead vê e que o painel mostra.
- `src/diagnostico/Resultado.jsx` e `ui.jsx`: tela de resultado e peças visuais.
- `src/pages/`: hub, artigo, diagnóstico e painel.
- `src/lib/comercial.js`: rótulos de origem, sugestões por nível, linha do SDR e CSV.
- `src/lib/demo.js`: cenários e dados fictícios do modo demonstração.

## Notas

- Tailwind CSS 3: o componente usa `flex-shrink-0`, que não existe no Tailwind 4.
- O progresso do diagnóstico fica em `sessionStorage` (`ubots_diag_progresso`); os leads, em `localStorage` (`ubots_diag_leads`).
- O CSS global reforça o anel de foco na navegação por teclado, desliga transições com
  `prefers-reduced-motion` e mantém fundos e barras ao salvar o resultado em PDF.
