# Grêmio Náutico União: LP de novos associados

Landing page responsiva de **uma página com 7 dobras narrativas**, feita a partir do *Briefing de produção v1.0 (02/11/2026)*.
O WhatsApp é o caminho principal de todos os CTAs comerciais. O formulário é a alternativa discreta.

> **Status: homologação.** A página está completa em layout, copy, interações e instrumentação.
> As **fotografias, o logo e os dados comerciais ainda dependem do GNU**. Cada foto ausente aparece como um *slot*
> identificado (ID do arquivo + briefing da foto). Não há foto genérica, de banco de imagens ou gerada por IA.

```bash
cd gnu-lp
npm run dev          # http://localhost:4173 (servidor estático sem dependências)
npm install          # uma vez, só para gerar imagens (instala o sharp)
npm run imagens      # gera AVIF/WebP/JPG a partir dos masters aprovados
npm run verificar    # checklist técnico de publicação (sai com erro se houver pendência bloqueante)
```

A página é HTML/CSS/JS estático, sem framework nem build. Pode ser publicada em qualquer hospedagem estática.

---

## Estrutura

```
gnu-lp/
├── index.html                 # as 7 dobras, header, rodapé, barra fixa e lightbox
├── assets/
│   ├── css/main.css           # tokens de cor/tipografia no topo (:root)
│   ├── js/config.js           # ← TUDO que muda entre homologação e produção
│   ├── js/main.js             # comportamento (sem dependências)
│   ├── fonts/                 # Newsreader + Instrument Sans (OFL, auto-hospedadas, ~88 KB)
│   ├── brand/                 # logo oficial (ver brand/README.md)
│   └── img/
│       ├── manifest.json      # lista das fotos: ID, dobra, proporção, obrigatoriedade, briefing
│       └── originais/         # masters em alta (fora do Git)
└── scripts/                   # serve.mjs · build-images.mjs · check.mjs
```

## As 7 dobras

| # | Âncora | Conteúdo | CTA |
|---|---|---|---|
| 01 | `#inicio` | Hero: H1, descrição, selo “Desde 1906”, panorama Alto Petrópolis | WhatsApp (geral) + link para `#sedes` |
| 02 | `#sedes` | Mosaico editorial 2 grandes + 2 menores, “Ver fotos” abre o lightbox | WhatsApp (modalidades) |
| 03 | `#convivencia` | Texto fixo à esquerda + 2 fotos assimétricas + assinatura | link para `#associacao` |
| 04 | `#familia` | Foto ampla (~60%), microtextos, foto infantil vertical | WhatsApp (família) |
| 05 | `#piscinas-tenis` | Duas faixas 62/38 alternadas, com a foto encostando na borda da tela | n/a |
| 06 | `#associacao` | Tradição (fundo azul) + Título Patrimonial / Contribuinte Efetivo | WhatsApp (modalidades) |
| 07 | `#conversar` | Fechamento sobre foto, FAQ (4 itens), formulário opcional | WhatsApp (geral) |

Nenhuma seção é travada em `100vh` e não há scroll-jacking. A rolagem suave respeita `prefers-reduced-motion`.

---

## Fotografias

O layout chama cada foto pelo **ID do briefing**. Para inserir uma foto aprovada:

1. Recorte o master na proporção pedida e salve como `assets/img/originais/<ID>.jpg` (também aceita `.png`, `.tif` e `.webp`).
2. `npm run imagens`: gera `<ID>-<largura>.avif|webp` e um `.jpg` de fallback, sem EXIF/GPS.
3. Recarregue a página. O slot some e a foto aparece. Ajuste o `alt` no `index.html` se a cena for diferente da descrita.

| ID | Dobra | Proporção | Status |
|---|---|---|---|
| `GNU_01_HERO_AP` | 01 | 21:9 ou 16:9, mín. 2400 px | **Obrigatória** (também gera a `og:image` 1200×630) |
| `GNU_01_HERO_AP_MOBILE` | 01 | 4:5 ou 3:4 (1080 px) | **Obrigatória**: corte vertical próprio |
| `GNU_02_AP_SEDE` … `GNU_05_UP_SEDE` | 02 | 4:3 | **Obrigatórias** |
| `GNU_06_CONVIVIO` | 03 | 3:2 | **Obrigatória** |
| `GNU_07_ENCONTRO` | 03 | 4:5 | Recomendada (já está no layout) |
| `GNU_09_FAMILIA`, `GNU_10_INFANTIL` | 04 | 3:2 · 4:5 | **Obrigatórias**: autorização de imagem de menores |
| `GNU_12_PISCINA`, `GNU_13_TENIS` | 05 | 16:9 | **Obrigatórias** |
| `GNU_14_HISTORIA` | 06 | 3:2 | Recomendada (já está no layout) |
| `GNU_15_FECHAMENTO` | 07 | 3:2 | Recomendada (já está no layout) |
| `GNU_16_GAL_*` | lightbox | 3:2 | Opcionais: manter em `config.js` só as que tiverem foto aprovada |

`GNU_08_EVENTO` e `GNU_11_KIDS` (opcionais no briefing) não entraram no layout para não congestionar as dobras 03 e 04.
Se forem aprovadas, há um comentário no `index.html` indicando onde entra a `GNU_08`.

Desempenho: só o hero é pré-carregado (com `fetchpriority="high"` e corte próprio para mobile). As demais fotos usam `loading="lazy"` e
têm proporção fixa via CSS, então não há layout shift. As fotos das galerias só entram no DOM quando o lightbox abre.

## Configuração (`assets/js/config.js`)

| Chave | Homologação | Produção |
|---|---|---|
| `whatsapp.numero` | `5551992387668` (número da LP atual) | **confirmar com o GNU** |
| `whatsapp.mensagens` | geral · família · modalidades (texto do briefing §5) | n/a |
| `formulario.endpoint` | vazio | URL que recebe `POST` JSON |
| `formulario.modoDemonstracao` | `true` (simula sucesso, não envia nada) | `false` |
| `mostrarSlotsPendentes` | `true` | `false` |
| `analytics.gtmId` | vazio (alimenta só o `dataLayer`) | `GTM-XXXXXXX` |
| `sedes` | galerias, legendas, endereços | revisar legendas com as fotos finais |

Os links `wa.me` também estão escritos no HTML, para funcionar sem JavaScript. O `main.js` os reescreve a partir do
`config.js`, e o `npm run verificar` acusa se os dois números divergirem.

### WhatsApp

| CTA | `data-cta` | Mensagem |
|---|---|---|
| Header (desktop e mobile), menu, hero, barra fixa, fechamento | `header`, `menu`, `hero`, `barra_mobile`, `fechamento` | geral |
| Sedes, Associação | `sedes`, `associacao` | modalidades |
| Família | `familia` | família |

Os links abrem em nova aba e nunca iniciam conversa automaticamente. A mensagem não leva UTM nem dados pessoais.
Não há pop-up de captação em nenhum momento.

### Formulário

Campos: Nome (obrigatório), WhatsApp (obrigatório, máscara BR) e Interesse (opcional). Há também um campo anti-spam invisível.
O envio faz `POST` para `formulario.endpoint` com:

```json
{ "nome": "…", "whatsapp": "+5551999999999", "interesse": "Associação familiar",
  "origem": { "utm_source": "…", "utm_campaign": "…" }, "pagina": "https://…", "enviado_em": "2026-11-02T…Z" }
```

Uma resposta 2xx mostra “Recebemos seu contato. Nossa equipe falará com você.” Em caso de erro de rede, de servidor ou de
configuração, a página mostra um alerta, **mantém os campos preenchidos** e oferece o WhatsApp. O timeout é de 15 s.

## Analytics (`window.dataLayer`)

| Evento | Quando | Parâmetros |
|---|---|---|
| `lp_view` | carregamento | `utm_source`, `utm_medium`, `utm_campaign`, `device_type` |
| `lp_section_view` | dobra com ≥ 40% visível (uma vez por dobra) | `section_id` |
| `lp_sede_gallery_open` | abriu galeria | `sede` |
| `lp_whatsapp_click` | clique em qualquer CTA WhatsApp, antes da navegação | `cta_location`, `cta_label`, `section_id`, `campaign` |
| `lp_form_start` | primeiro campo editado | `form_id` |
| `lp_form_submit` | envio aceito pelo backend | `form_id`, `interest` |
| `lp_form_error` | erro que impediu o envio | `error_type` (`validacao`, `rede`, `servidor`, `configuracao`) |

Nenhum evento leva nome, telefone ou conteúdo de mensagem. Lembrete do briefing: **clique no WhatsApp não é conversa iniciada.**
Para medir conversas, é preciso cruzar com o atendimento/CRM. Para ver os eventos no console, use `analytics.debug = true`.

## Acessibilidade e responsividade

* Um `h1`, um `h2` por dobra e `h3`/`h4` só dentro das seções. Há link “Pular para o conteúdo” e foco visível em tudo.
* Contraste AA: o azul `#005091` sobre branco dá 8,2:1. O azul claro `#0092d4` só é usado em detalhes gráficos.
* Lightbox em `<dialog>` nativo: foco preso, `Esc` fecha, setas ← →, gesto de arrastar, miniaturas e retorno do foco ao botão.
* Menu mobile em painel, com o restante da página `inert`. `Esc` fecha o painel.
* Barra fixa (< 960 px): aparece depois do CTA do hero, some perto do CTA final, com o menu ou a galeria abertos e enquanto um campo está em foco (teclado aberto). Respeita `safe-area-inset-bottom`.
* Botões e alvos de toque têm ≥ 44 px. O corpo de texto é de 17 px.
* Testada em 360, 390, 768, 1024 e 1440 px, sem rolagem horizontal.

---

## Pendências de validação com o GNU (briefing §8)

- [ ] **Logo vetorial e manual de identidade.** As cores e fontes atuais são provisórias: os azuis foram extraídos da LP atual e as fontes são Newsreader + Instrument Sans. Para trocar, basta editar os tokens no topo de `main.css`.
- [ ] **Acervo fotográfico** aprovado, com sede e ambiente identificados e direitos de uso, **inclusive de menores**.
- [ ] **Número de WhatsApp** comercial e horários do atendimento. A frase “Atendimento humano…” da dobra 07 depende disso.
- [ ] **Textos das modalidades** (Título Patrimonial / Contribuinte Efetivo), aprovados pelo jurídico/comercial.
- [ ] **Respostas do FAQ**: acesso às sedes, dependentes e visitas.
- [ ] **Texto de privacidade/LGPD** do formulário e URL da política. Hoje o link aponta para a política da LP atual.
- [ ] **Destino do formulário** (endpoint/CRM) e fluxo de armazenamento.
- [ ] **Endereços das sedes**, copiados da LP atual (rodapé e lightbox).
- [ ] **Legendas das galerias**, conforme as fotos finais.
- [ ] **Consentimento de cookies** antes de ativar o GTM, se a política do GNU exigir.
- [ ] Depoimento de associado: só entra com autorização, foto e texto validados. Hoje não há nenhum.

## Checklist de publicação

1. Todas as fotos obrigatórias geradas com `npm run imagens`, e o logo em `assets/brand/`.
2. Em `config.js`: `modoDemonstracao: false`, `endpoint` preenchido, `mostrarSlotsPendentes: false` e `gtmId`.
3. No `index.html`: remover `<meta name="robots" content="noindex, nofollow">`, definir `canonical` e usar URLs absolutas em `og:url`/`og:image`.
4. `npm run verificar` sem itens ✖.
5. Testar os eventos no GTM Preview e conferir que nenhum dado pessoal vai para o analytics.
6. QA em iOS Safari, Android Chrome e desktop (Chrome, Safari, Firefox, Edge), mais Lighthouse mobile (metas: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1).
