# Diagnóstico de recuperação com IA (Ubots)

Reconstrução do protótipo https://diagnostico-ubots.vercel.app (proposta On Nest / case Sicoob Crediauc).
Vite + React 18 + React Router + Tailwind CSS 3 + lucide-react.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (dist/)
```

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Índice do protótipo |
| `/artigo` | Artigo do blog com 3 pontos de entrada para o diagnóstico (`?utm_content=` registra a origem) |
| `/diagnostico` | Quiz de 10 perguntas → captura de dados → resultado. `?demo=1` abre o painel de cenários |
| `/painel` | Visão do comercial: leads salvos no `localStorage`, detalhe, CSV, abordagem sugerida |

## Estrutura

- `src/lib/dados.js`: perguntas, níveis, textos por tipo de instituição, cenários de demo
- `src/lib/calculo.js`: pontuação, capacidade com/sem IA, análise exibida no resultado, validação do formulário
- `src/lib/formatar.js`: números, moeda, prazos, telefone
- `src/lib/leads.js` / `painel.js`: persistência local e regras do painel (CSV, linha de abertura do SDR)
- `src/lib/config.js`: `webhookUrl` (vazio = modo de teste), `ctaUrl`, `diasUteisMes`
- `src/pages/`: Home, Artigo, Diagnostico, Resultado, Painel, DetalheLead
