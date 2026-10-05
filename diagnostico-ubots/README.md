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

- `src/DiagnosticoRecuperacaoIA.jsx`: componente original. Mudanças só de integração:
  exporta `QUESTIONS` e `calcular`, aceita `onLead`, `respostasIniciais`, `etapaInicial`
  e `formInicial` (usado pelo "Preencher formulário"), e chama `onLead(payload)` no lugar do webhook.
- `src/pages/`: hub, artigo, diagnóstico e painel.
- `src/lib/comercial.js`: rótulos de origem, sugestões por nível, linha do SDR e CSV.
- `src/lib/demo.js`: cenários e dados fictícios do modo demonstração.

## Notas

- Tailwind CSS 3: o componente usa `flex-shrink-0`, que não existe no Tailwind 4.
- O CSS global reforça o anel de foco do componente na navegação por teclado e
  desliga transições com `prefers-reduced-motion`, sem alterar o arquivo do componente.
