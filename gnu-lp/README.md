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
├── index.html            # 7 blocos + cabeçalho, rodapé e barra fixa
├── assets/css/styles.css # tokens + componentes + responsivo
├── assets/js/main.js     # WhatsApp, barra, menu, sedes, formulário, analytics
├── assets/img/           # WebP em várias larguras + escudo PNG + og:image
├── tools/importar_foto.py # coloca uma foto nova num espaço F01–F14
└── PROMPTS-FOTOGRAFIA.md  # prompts de imagem por bloco + banco extra
```

## Blocos

| # | Bloco | Âncora | CTA (placement) |
|---|---|---|---|
| 01 | Hero: "O verão tem encontro marcado no União." | `#topo` | `Quero conhecer o União` (`hero`) + `Explore o clube ↓` |
| 02 | A vida acontece aqui: piscina, tênis, família | `#viver` | `Conversar pelo WhatsApp`, discreto (`vida`) |
| 03 | Quatro sedes | `#sedes` | `Quero conhecer o União` (`sedes`) + `Ver localização` por sede |
| 04 | Encontros | — | `Saiba como fazer parte` (âncora para `#associacao`) |
| 05 | História: desde 1906 | — | — |
| 06 | Associação: uma conversa simples | `#associacao` | `Conversar pelo WhatsApp` (`associacao`) + formulário fechado por padrão |
| 07 | Fechamento | — | `Quero conhecer o União` (`fechamento`) |

O cabeçalho (`header`), o menu do celular (`menu`), a barra fixa (`barra_fixa`) e a confirmação do formulário (`formulario_confirmacao`) também levam ao WhatsApp, cada um com seu `placement`.

## Decisões de linguagem

- **Tipografia:** Instrument Sans 400/500/600 em títulos, interface e corpo, como na Entrega A. Instrument Serif itálico aparece **uma única vez**, na frase-manifesto do bloco 02. O briefing sugere DM Sans no corpo: para trocar, carregue a fonte e altere `--font-body` em `styles.css`.
- **Cor:** `paper #F8F7F3`, `white`, `stone #EBEBE5`, `sand #F1EFE8` (fundo alternado), `deep-ink #102A3B`, `muted-ink #4B5961` e `brand-blue #004F91` (CTA, hover `#003E73`, pressionado `#00335F`). O ciano não aparece em títulos nem em ornamentos.
- **Hero:**
  - Desktop: foto de ponta a ponta com véu deep-ink à esquerda e no topo, e CTA branco sobre a foto.
  - Celular e tablet: foto no topo, abaixo de um cabeçalho sólido, e texto sobre um plano deep-ink. O texto nunca fica sobre a água ou sobre rostos.
- **Sedes:**
  - Desktop: quatro faixas empilhadas. A sede em foco abre (hover, foco do teclado ou clique) e as outras continuam visíveis, com nome e frase.
  - Celular: uma sede por vez, com foto grande de borda a borda e sem carrossel.
- **Associação:** foto à esquerda e conversa à direita. As modalidades ocupam duas linhas cada, sem cards de preço nem selo de "mais buscado". O formulário alternativo fica dentro de um `<details>` e funciona sem JS.

## Variantes de teste (URL)

| Parâmetro | Efeito | Hipótese do briefing |
|---|---|---|
| *(nenhum)* | Hero de sangria total | Recomendação da Entrega A |
| `?hero=split` | Hero editorial dividido, com a imagem em ~62% da largura (Rota A) | Entregável 1: duas composições do hero |
| `?cta=associacao` | CTA do hero vira "Conversar sobre associação" | Teste 2 |
| `?barra=imediata` | A barra do WhatsApp aparece desde o início no celular | Teste 4 |
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
| `contact_form_open` | Abertura do formulário alternativo | `placement` |
| `contact_form_submit` | Envio concluído | `placement` |

`qualified_conversation`, `visit_scheduled` e `association_closed` vêm do atendimento e do CRM, não da página.

## Configuração (`assets/js/main.js`)

Os valores ficam em `CONFIG`, no topo do arquivo. Também dá para sobrescrevê-los com `window.GNU_LP_CONFIG = {...}` antes do script:

- `whatsappNumber`: hoje `5551992387668`, o número divulgado no site atual. **Confirmar.**
- `whatsappMessage`: a mensagem sugerida no briefing.
- `formEndpoint`: o endpoint do CRM. Enquanto estiver vazio, o envio é simulado. O payload leva `nome`, `whatsapp` (só dígitos), `mensagem`, `consentimento`, `consentimento_texto`, `origem`, `pagina`, `enviado_em` e os `utm_*` da URL.
- `privacyUrl`: o link da política de privacidade. Enquanto estiver vazio, o link fica inerte.

O HTML já traz os links `wa.me` prontos, então os CTAs funcionam mesmo sem JS.

## Mapa de fotos (pauta × acervo provisório)

| ID | Bloco | Pauta do briefing | Arquivo atual | Situação |
|---|---|---|---|---|
| F01 | Hero | Piscina e entorno com pessoas, 16:9 e 4:5 | `hero-piscina-alto-petropolis` | Acervo. Baixa resolução para sangria total; sem pessoas |
| F02 | 02 | Família na piscina, 4:5 | `vida-familia-piscina` | Acervo panorâmico, recortado em 4:3 no celular |
| F03 | 02 | Dupla jogando tênis recreativo, 3:2 | `vida-tenis-petropole` | Quadras sem pessoas. Produzir |
| F04 | 02 | Amigos em área verde ou deck, 4:5 | `vida-convivencia` | Retrato individual. Produzir cena de grupo |
| F05 | 03 | Alto Petrópolis, piscinas | `sede-alto-petropolis` | Mostra a área verde/lago, não as piscinas-lago |
| F06 | 03 | Moinhos de Vento, piscinas | `sede-moinhos-de-vento` | OK |
| F07 | 03 | União Petrópole, quadras | `sede-uniao-petropole` | OK |
| F08 | 03 | Ilha do Pavão, Guaíba | `sede-ilha-do-pavao` | Confirmar se a foto é posterior à reconstrução |
| F09 | 04 | Amigos após o tênis, 4:5 | — | Sem foto no acervo; o bloco usa 2 cenas |
| F10 | 04 | Família ou crianças em área de lazer, 4:5 | `encontro-piscina-moinhos` | Recorte de F06. Produzir |
| F11 | 04 | Mesa de café ou almoço no GNU, 4:5 | `encontro-espaco-cooks` | Salão vazio. Produzir com pessoas |
| F12 | 05 | Arquitetura/área social, 3:2 | `historia-ilha-do-pavao` | Recorte de F08 |
| F13 | 06 | Área tranquila com pessoas ao fundo, 4:5 | `associacao-area-verde` | Recorte de F05 |
| F14 | 07 | Fim de tarde com amigos/família, 16:9 e 4:5 | `fechamento-guaiba` | Remo no Guaíba. Ótima luz, mas é esporte |

Com o acervo atual, quatro fotos se repetem em recortes diferentes (F05, F06, F08 e o tênis). A produção nova deve dar uma foto própria a cada seção. Abra `?pauta` para ver o mapa sobre a página.

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

- Contraste do texto branco sobre a foto do hero, medido pixel a pixel em 390, 834, 1280×720, 1366×640, 1440 e 1920 px. Todo texto fica em ≥ 5,6:1 no p95, acima dos 4,5:1 exigidos pelo AA; a navegação fica em ≥ 9:1.
- Nenhuma rolagem horizontal em 360, 390, 834 e 1440 px. CLS = 0. O LCP é a foto do hero, pré-carregada com `srcset`/`sizes`.
- O CTA do hero aparece completo na primeira tela em 390×844, 834×1112, 1280×720 e 1440×900.
- Barra fixa: entra quando o CTA do hero sai da tela. Some no bloco de associação, no fechamento, no rodapé, com o menu aberto e com o formulário aberto. Respeita a safe area do aparelho.
- Menu: o foco vai para o primeiro link e `Esc` fecha. Também há link de pular para o conteúdo, `prefers-reduced-motion` é respeitado e os alvos de toque têm ≥ 44 px (botões com 52 px).
- Formulário: máscara de telefone, erros descritivos (`aria-invalid` + `aria-describedby`), foco no primeiro erro, consentimento sem pré-marcação, campo-armadilha anti-spam e confirmação com foco.

## Pendências antes de publicar

1. Confirmar o número oficial de WhatsApp da equipe de associação e os horários de atendimento.
2. Validar com o jurídico e o comercial os nomes e textos das modalidades (Título Patrimonial e Título Contribuinte Efetivo).
3. Definir a URL da política de privacidade e a base legal do formulário (LGPD). Plugar `formEndpoint` no CRM.
4. Fazer a produção fotográfica (F01–F14), com autorização de imagem. As fotos atuais têm resolução limitada.
5. Confirmar as condições atuais da Ilha do Pavão e o endereço de embarque usado em "Ver localização".
6. Confirmar se haverá visita guiada. A página não oferece visita até que isso seja validado.
7. Usar a versão positiva oficial do escudo em vetor. O PNG atual foi rasterizado a partir do PDF.
