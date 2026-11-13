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

## Sistema de diagramação

Vale para todos os slides (definido no topo de `src/deck.mjs`):

- Margens laterais de 96px; header em y=40 com logos à esquerda e, à direita, a pílula de seção e o contador.
- Zona de título a partir de y=118. Régua de título de 940px (no máximo 2 linhas, checado no QA) e régua de subtítulo de 860px.
- A zona de conteúdo ocupa toda a altura restante até o rodapé (y=766), e o QA falha se algo vazar dela.
- As sangrias intencionais são só duas: a ilustração da capa e o celular do slide 5.

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

- Conversas: todas as mensagens têm texto real (revisão de 13/11). No slide 5, as falas 4 a 6 foram reconstituídas a partir do relato do case, com a legenda "Reconstituição a partir do relato do projeto." No slide 6, os mini chats (custos, encaminhamento e passo a passo no app) também são reconstituições. Validar com a Viacredi ou trocar pelos prints aprovados.
- Capa: os valores da simulação (R$ 15.000,00 em 24x) são fictícios, só ilustram a contratação.
- Slide 2: a faixa "Resultados do teste" traz as métricas do case marcadas como fase de teste.
- As telas de produto (WhatsApp e console Ubots) usam a fonte Inter para dar realismo de interface. O resto do material segue em Poppins e Nunito.
- Cores fora da paleta só em imagens: o logo Viacredi e o ícone de IA da capa. O verde do WhatsApp aparece nas telas de produto.
- Uso do logo Viacredi e menção ao Sistema Ailos: precisam de aprovação da Viacredi. A capa usa só o logo Ubots.
- Sem retrato da Giovanna: o card da protagonista usa um monograma "G".
