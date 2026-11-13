# Playbook · Agentes de IA na Oferta de Crédito (case Viacredi + Ubots)

Deck de 10 slides (1440×810), mesmo modelo do Playbook Sicoob Crediauc. A copy vem de `playbook-viacredi-ubots.md`.

## Saídas (`dist/`)

- `playbook-viacredi-ubots.pdf`: 10 páginas de 1440×810 pt (mesmo tamanho do PDF do Crediauc), texto selecionável, fontes embutidas e 25 campos preenchíveis (slides 8, 9 e 10).
- `playbook-viacredi-ubots.html`: deck navegável e autocontido, com fontes e logos embutidos. Navegue com as setas ou PageUp/PageDown.
- `previews/slide-01.png` … `slide-10.png`: previews em 2x.
- `qa-report.md`: resultado do QA da seção 7.

## Como gerar

```bash
npm install
npm run build   # HTML, previews e PDF
npm run qa      # gera dist/qa-report.md
```

Requer Node 18+ e o Playwright com Chromium (`require('playwright')`).

## Estrutura

- `src/deck.mjs`: tokens, componentes e os 10 slides (HTML/CSS; wireframes em HTML/CSS/SVG inline).
- `src/build.mjs`: exporta previews e PDF e adiciona os campos de formulário com pdf-lib.
- `src/qa.mjs`: checa azul/teal, travessões, contraste, contador, copy contra o .md, escuros em sequência e o PDF.
- `src/logos.py`: recorta os logos e gera as versões para fundo escuro.
- `assets/`: logos (claro e escuro) e fontes Poppins e Nunito.

## Pendências antes de publicar

As marcações em magenta (`[... A CONFIRMAR]`) precisam sumir:

- Cargo da Giovanna (slides 2, 3, 4 e 6)
- Falas da Giovanna nos slides 3, 4 e 6: adaptadas do relato, precisam de aprovação dela e da Viacredi
- URL do CTA com UTM (slide 10, também no `href` do botão)

Outros pontos:

- Slide 5 usa a reconstituição da conversa com a legenda "Reconstituição a partir do relato do projeto." Quando entrar o `print-cozinha.png` aprovado, voltar a legenda "Conversa anonimizada. Dados da cooperada preservados."
- Slide 6: as frases curtas dos mini chats ("Quais são os custos da retirada?", "É um crédito com juros e IOF.", "Dá para fechar aqui mesmo, pelo WhatsApp?", "Por segurança, a contratação é 100% digital pelo aplicativo.") foram reconstituídas a partir do case. Validar ou trocar pelos prints `print-iof.png` e `print-app.png`.
- Uso do logo Viacredi e menção ao Sistema Ailos: aprovação da Viacredi. O logo mantém as cores originais da marca (inclui azul); é a única exceção à regra "nenhum azul".
- Sem retrato da Giovanna: o card da protagonista usa um monograma "G" e os cards de citação usam só aspas e assinatura.
