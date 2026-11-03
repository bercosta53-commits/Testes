# Grêmio Náutico União · LP de novos associados

**Campanha:** O verão tem encontro marcado no União.
**Entrega B:** os sete blocos da landing em HTML/CSS/JS estático, mobile-first. A copy vem do briefing mestre v1.0 (02/11/2026). O sistema visual segue a recomendação da Entrega A: **Rota A** como sistema, com o **hero de sangria total** e as **faixas panorâmicas das sedes** da Rota B.

> Protótipo navegável. A copy é a "final proposta" do briefing e ainda não foi aprovada. As fotos são do acervo atual, extraídas do PDF da Entrega A, e não substituem a produção fotográfica (ver mapa abaixo).

## Como abrir

```bash
cd gnu-lp
python3 -m http.server 8000
# http://localhost:8000
```

Não tem etapa de build. As fontes vêm do Google Fonts (Instrument Sans e Instrument Serif).

## Estrutura

```
gnu-lp/
├── index.html            # 7 blocos + cabeçalho, rodapé e WhatsApp flutuante
├── assets/css/styles.css # tokens + componentes + responsivo
├── assets/js/main.js     # WhatsApp, barra, menu, sedes, formulário, analytics
├── assets/img/           # WebP em várias larguras + escudo PNG + og:image
├── tools/importar_foto.py # coloca uma foto nova num espaço F01–F14
├── tools/gerar_html_unico.py # gera o HTML único para compartilhar
├── compartilhar/          # gnu-uniao-lp-verao.html (arquivo único, ~3,5 MB)
└── PROMPTS-FOTOGRAFIA.md  # prompts de imagem por bloco + banco extra
```

## Compartilhar em um arquivo só

`compartilhar/gnu-uniao-lp-verao.html` é a página inteira num único arquivo: CSS, JS, escudo, ícone do WhatsApp e fotos embutidos. Ele abre com dois cliques, sem servidor, e pode ser enviado por e-mail, WhatsApp ou Drive. As fotos entram numa resolução só (1440–1600 px nas de largura total). Só as fontes vêm da internet; offline, a página usa as fontes do sistema.

Sempre que a página mudar, gere de novo:

```bash
python3 tools/gerar_html_unico.py
```

## Protótipo navegável (link de revisão)

`python3 tools/gerar_prototipo.py --saida prototipo.html` gera a versão publicada como link de revisão. Ela tem o mesmo visual e as mesmas interações da LP, com estas diferenças:
- uma faixa fixa no topo avisa que é um protótipo e não o site oficial;
- os botões de WhatsApp mostram um aviso em vez de abrir a conversa, e o número não vai no arquivo;
- o formulário valida os campos, mas não envia nada;
- a página não tem metadados de compartilhamento nem schema.org e não é indexada.

## Blocos

| # | Bloco | Âncora | CTA (placement) |
|---|---|---|---|
| 01 | Hero: "O verão tem encontro marcado no União." | `#topo` | `Quero conhecer o União` (`hero`) + `Explore o clube ↓` |
| 02 | A vida acontece aqui: piscina, tênis, família | `#viver` | `Conversar pelo WhatsApp`, discreto (`vida`) |
| 03 | Quatro sedes | `#sedes` | `Quero conhecer o União` (`sedes`) + `Ver localização` por sede |
| 04 | Encontros | — | `Saiba como fazer parte` (âncora para `#associacao`) |
| 05 | História: desde 1906 | — | — |
| 06 | Associação: uma conversa simples | `#associacao` | `Conversar pelo WhatsApp` (`associacao`) + link "Prefere que a gente chame você?" para o formulário |
| 07 | Fechamento + formulário de contato | `#contato` | `Quero conhecer o União` (`fechamento`) + formulário aberto ao lado |

O botão flutuante do canto inferior direito (`flutuante`) e a confirmação do formulário (`formulario_confirmacao`) também levam ao WhatsApp, cada um com seu `placement`. O cabeçalho e o menu têm só a navegação.

## Decisões de linguagem

- **Tipografia:** Instrument Sans 400/500/600 em títulos, interface e corpo, como na Entrega A. Instrument Serif itálico aparece **uma única vez**, na frase-manifesto do bloco 02. O briefing sugere DM Sans no corpo: para trocar, carregue a fonte e altere `--font-body` em `styles.css`.
- **Cor:** `paper #F8F7F3`, `white`, `stone #EBEBE5`, `sand #F1EFE8` (fundo alternado), `deep-ink #102A3B`, `muted-ink #4B5961` e `brand-blue #004F91` (CTA, hover `#003E73`, pressionado `#00335F`). O ciano não aparece em títulos nem em ornamentos.
- **Hero:**
  - Desktop: foto de ponta a ponta abaixo de um cabeçalho claro, sem véu azul. Uma vinheta neutra e quente, contínua, fica forte sob o texto e some suavemente logo depois dele (o ponto de queda acompanha a coluna do texto); no céu ela é mais leve. Título de 32 a 56 px.
  - Celular e tablet: foto limpa no topo e texto escuro sobre fundo claro logo abaixo, com o CTA azul. O texto nunca fica sobre a água ou sobre rostos.
- **Sedes:**
  - Desktop: quatro faixas empilhadas. A sede em foco abre (hover, foco do teclado ou clique) e as outras continuam visíveis, com nome e frase.
  - Celular: uma sede por vez, com foto grande de borda a borda e sem carrossel.
- **Associação:** foto à esquerda e conversa à direita. As modalidades ocupam duas linhas cada, sem cards de preço nem selo de "mais buscado". Um link leva ao formulário do fim da página.

## Variantes de teste (URL)

| Parâmetro | Efeito | Hipótese do briefing |
|---|---|---|
| *(nenhum)* | Hero de sangria total | Recomendação da Entrega A |
| `?hero=split` | Hero editorial dividido, com a imagem em ~62% da largura (Rota A) | Entregável 1: duas composições do hero |
| `?cta=associacao` | CTA do hero vira "Conversar sobre associação" | Teste 2 |
| `?barra=imediata` | O WhatsApp flutuante aparece desde o início, sem esperar o hero sair da tela | Teste 4 |
| `?pauta` | Mostra sobre cada foto o ID da pauta (F01–F14) e a intenção | Entregável 5: mapa de assets |
| `?debug` | Registra no console os eventos e o envio simulado do formulário | — |

Os parâmetros podem ser combinados, por exemplo `?hero=split&cta=associacao`. As variantes de hero e de CTA entram no `<head>`, antes da pintura, e não causam flash nem CLS.

## Mensuração (`window.dataLayer`)

Todo evento leva `campaign`, `hero_variant` e `cta_variant`. **Nenhum dado pessoal vai para o dataLayer.**

| Evento | Quando | Parâmetros extras |
|---|---|---|
| `lp_view` | Ao carregar | `bar_variant` |
| `hero_cta_click` | Clique no CTA do hero | `placement`, `cta_label` |
| `whatsapp_click` | Qualquer CTA de WhatsApp | `placement`, `cta_label` |
| `sede_view` | Cada sede com ≥ 50% na tela (uma vez) | `sede` |
| `sede_location_click` | Clique em "Ver localização" | `sede` |
| `association_section_view` | Chegada ao bloco 06 (uma vez) | — |
| `contact_form_link_click` | Clique em "Prefere que a gente chame você?" no bloco 06 | `placement` |
| `contact_form_open` | Primeira interação com o formulário (foco em um campo) | `placement` |
| `contact_form_submit` | Envio concluído | `placement` |

`qualified_conversation`, `visit_scheduled` e `association_closed` vêm do atendimento e do CRM, não da página.

## Configuração (`assets/js/main.js`)

Os valores ficam em `CONFIG`, no topo do arquivo. Também dá para sobrescrevê-los com `window.GNU_LP_CONFIG = {...}` antes do script:

- `whatsappNumber`: hoje `5551992387668`, o número divulgado no site atual. **Confirmar.**
- `whatsappMessage`: a mensagem sugerida no briefing.
- `formEndpoint`: o endpoint do CRM. Enquanto estiver vazio, o envio é simulado. O payload leva `nome`, `whatsapp` (só dígitos), `mensagem`, `consentimento`, `consentimento_texto`, `origem`, `pagina`, `enviado_em` e os `utm_*` da URL.
- `privacyUrl`: o link da política de privacidade. Enquanto estiver vazio, o link fica inerte.

O HTML já traz os links `wa.me` prontos, então os CTAs funcionam mesmo sem JS.

## Mapa de fotos

Desde a rodada de 03/11, a página usa imagens **geradas por IA** a partir da pauta em [`PROMPTS-FOTOGRAFIA.md`](PROMPTS-FOTOGRAFIA.md). Só duas faixas de sede seguem com fotos reais do acervo. O rodapé avisa que algumas imagens são ilustrativas.

| ID | Bloco | Cena | Arquivo | Origem |
|---|---|---|---|---|
| F01 | Hero | Fim de tarde dourado na piscina, famílias e amigos | `hero-piscina-alto-petropolis` | IA (cor da versão solar sobre o detalhe da original em 2752 px) |
| F02 | 02 · Verão em família | Pai e filhos nadando debaixo d'água | `vida-familia-piscina` | IA |
| F03 | 02 · Beach tennis entre amigos | Duplas na areia ao pôr do sol | `vida-tenis-petropole` | IA |
| F04 | 02 · Mais tempo juntos | Três amigos rindo juntos nas espreguiçadeiras | `vida-convivencia` | IA (765 px) |
| X7 | 02 · detalhe (desktop) | Pés na borda da piscina, óculos de natação | `vida-detalhe-borda` | IA, decorativa |
| F05 | 03 · Alto Petrópolis | Deck, quiosque, família e piscina com tobogã | `sede-alto-petropolis` | IA, **validar com a sede real** |
| F06 | 03 · Moinhos de Vento | Piscina com tobogã | `sede-moinhos-de-vento` | Acervo real |
| F07 | 03 · União Petrópole | Quadras de saibro em uso | `sede-uniao-petropole` | IA, **validar com a sede real** |
| F08 | 03 · Ilha do Pavão | Vista aérea | `sede-ilha-do-pavao` | Acervo real |
| F11 | 04 · Depois do jogo… | Amigos à mesa do café | `encontro-espaco-cooks` | IA |
| F10 | 04 · Uma tarde inteira… | Piquenique em família no gramado | `encontro-piscina-moinhos` | IA |
| F09 | 04 · Novas histórias… | Avô ensina o neto a segurar a raquete | `encontro-geracoes` | IA |
| F12 | 05 · História | Remo no Guaíba com Porto Alegre no horizonte | `historia-ilha-do-pavao` | IA |
| F13 | 06 · Associação | Mãe e filha na borda da piscina | `associacao-area-verde` | IA |
| X5 | 06 · detalhe sobreposto (desktop) | Raquete, limonada e toalha listrada | `associacao-detalhe` | IA, decorativa |
| F14 | 07 · Fechamento | Amigos e crianças no gramado da sede náutica ao entardecer | `fechamento-guaiba` | IA, **tem letreiro ilegível na fachada** |

Os nomes dos arquivos são fixos por espaço (o script depende deles) e podem não descrever a cena atual. Abra `?pauta` para ver o mapa sobre a página.

**Correções pendentes nas imagens**
- **F14:** o letreiro da sede náutica saiu com letras embaralhadas e um brasão inventado. Corrija no Nano Banana, anexando a imagem: `Remove the lettering and the crest from the brick facade of the building; keep the bricks, windows, light and everything else exactly as it is.` Depois rode de novo `python3 tools/importar_foto.py F14 …`.
- **F04:** há logotipos muito pequenos nos calções e no boné. Não chegam a ser legíveis, mas fogem da regra "sem marcas".

### Trocar as fotos

Os prompts para gerar cada imagem (Nano Banana) estão em [`PROMPTS-FOTOGRAFIA.md`](PROMPTS-FOTOGRAFIA.md). Para colocar uma imagem no site, use um comando:

```bash
pip install pillow                       # uma vez
python3 tools/importar_foto.py --listar  # espaços F01–F14
python3 tools/importar_foto.py F05 alto-petropolis.png
python3 tools/importar_foto.py F03 beach.png --alt "Descrição da cena" --foco 0.5,0.4
python3 tools/importar_foto.py F01 hero.png --simular   # só mostra o que faria
```

O script recorta na proporção do espaço, exporta os WebP (até 2048 px no hero, nas sedes e no fechamento), atualiza `src`, `srcset`, preload, `width`/`height` e `alt` no `index.html` e apaga as variantes antigas. No F01, também refaz a imagem de compartilhamento (`og-uniao-verao.jpg`).

## Qualidade verificada

- Contraste do texto branco sobre a foto do hero no desktop, medido linha a linha de texto (p95) em 1280×720, 1366×640, 1440 e 1920 px: título ≥ 6:1 (exige 3:1) e texto pequeno ≥ 6:1 (exige 4,5:1). No celular e no tablet o texto fica sobre fundo claro.
- Nenhuma rolagem horizontal em 360, 390, 834 e 1440 px. CLS = 0. O LCP é a foto do hero, pré-carregada com `srcset`/`sizes`.
- O CTA do hero aparece completo na primeira tela em 390×844, 834×1112, 1280×720 e 1440×900.
- WhatsApp flutuante: um botão no canto inferior direito, com o símbolo do WhatsApp e a frase "Fale com nosso time e seja sócio", em todas as larguras. Entra quando o CTA do hero sai da tela e some quando outro botão de WhatsApp está à vista (bloco de associação, fechamento com o formulário, rodapé) e com o menu aberto. No celular, vira só o ícone enquanto a pessoa rola para baixo e mostra a frase de novo ao parar ou subir. Respeita a safe area do aparelho. O cabeçalho tem só a marca e a navegação.
- Menu: o foco vai para o primeiro link e `Esc` fecha. Também há link de pular para o conteúdo, `prefers-reduced-motion` é respeitado e os alvos de toque têm ≥ 44 px (botões com 52 px).
- Formulário: máscara de telefone, erros descritivos (`aria-invalid` + `aria-describedby`), foco no primeiro erro, consentimento sem pré-marcação, campo-armadilha anti-spam e confirmação com foco.

## Pendências antes de publicar

1. Confirmar o número oficial de WhatsApp da equipe de associação e os horários de atendimento.
2. Validar com o jurídico e o comercial os nomes e textos das modalidades (Título Patrimonial e Título Contribuinte Efetivo).
3. Definir a URL da política de privacidade e a base legal do formulário (LGPD). Plugar `formEndpoint` no CRM.
4. Substituir as imagens geradas por fotos reais (F01–F14), com autorização de imagem, ou validar com o clube o uso de imagens ilustrativas. As faixas de sede F05 e F07 precisam mostrar o lugar real antes da publicação. A pauta de prompts serve como roteiro da sessão de fotos.
5. Confirmar as condições atuais da Ilha do Pavão e o endereço de embarque usado em "Ver localização".
6. Confirmar se haverá visita guiada. A página não oferece visita até que isso seja validado.
7. O escudo já é o arquivo oficial enviado pelo clube (2000 px). Para impressão ou tamanhos maiores, pedir a versão vetorial.
