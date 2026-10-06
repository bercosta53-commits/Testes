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

- `src/DiagnosticoRecuperacaoIA.jsx`: o diagnóstico inteiro num arquivo só (configuração, perguntas, cálculo,
  vocabulário por tipo, leitura do resultado e telas). Depende só de React, Tailwind e lucide-react, para colar
  numa ferramenta de vibe code. Props opcionais: `onLead`, `onInteresse`, `onReiniciar`, `respostasIniciais`,
  `etapaInicial` e `formInicial`. Sem props, o lead vai para `CONFIG.webhookUrl` (ou para o console, se vazio).
- `src/pages/`: hub, artigo, diagnóstico (com o modo `?demo=1`) e painel.
- `src/lib/comercial.js`: rótulos de origem, sugestões por nível, linha do SDR e CSV.
- `src/lib/demo.js`: cenários e dados fictícios do modo demonstração.

## Notas

- O resultado cabe em uma página no desktop (no máximo uma rolagem).
- Os leads ficam em `localStorage` (`ubots_diag_leads`).
- Para usar o componente numa ferramenta de vibe code (Lovable, Bolt, v0), cole o arquivo
  `src/DiagnosticoRecuperacaoIA.jsx` inteiro. Mantenha a extensão `.jsx`; se o build rodar `tsc`,
  acrescente `"allowJs": true` em `tsconfig.app.json`. Funciona com Tailwind 3 ou 4 e React 18 ou 19.
- Antes de publicar, confirme com a Ubots o endereço de `CONFIG.ctaUrl` e defina `CONFIG.webhookUrl`.
