# QA · Playbook Viacredi + Ubots

Gerado em 2026-11-13 14:59 UTC

## Checklist

- [x] Nenhum azul ou teal nos elementos do layout: OK (o logo Viacredi é a marca original, imagem, e mantém as cores dela)
- [x] Nenhum travessão (— ou –) no texto visível: OK
- [x] Contraste ≥ 4,5:1 em todo texto: OK (tabela abaixo)
- [x] Contador de página 01 / 10 … 10 / 10: OK
- [x] Régua de título: no máximo 2 linhas e 940px de largura (capa e CTA têm régua própria): OK
  - 01: 2 linha(s), 547px · 02: 2 linha(s), 756px · 03: 2 linha(s), 587px · 04: 2 linha(s), 635px · 05: 2 linha(s), 749px · 06: 2 linha(s), 873px · 07: 2 linha(s), 764px · 08: 2 linha(s), 704px · 09: 2 linha(s), 393px · 10: 2 linha(s), 590px
- [ ] Copy idêntica ao .md (152 trechos conferidos): 1 trecho(s) para revisar
  - slide 5: "Conversa anonimizada. Dados da cooperada preservados"
- [ ] Nenhum [A CONFIRMAR] sobrando na versão final: PENDENTE, 8 marcações em magenta neste rascunho
  - slide 2: [cargo A CONFIRMAR]
  - slide 3: [cargo A CONFIRMAR]
  - slide 3: [Fala A CONFIRMAR com a Giovanna]
  - slide 4: [cargo A CONFIRMAR]
  - slide 4: [Fala A CONFIRMAR com a Giovanna]
  - slide 6: [cargo A CONFIRMAR]
  - slide 6: [Fala A CONFIRMAR com a Giovanna]
  - slide 10: [URL A CONFIRMAR, com UTM]
- [x] Dois slides escuros nunca em sequência: OK (escuros: 4, 10)
- [x] PDF com texto selecionável e 10 páginas de 1440×810 pt: OK (10 páginas, 1659 palavras extraídas por pdftotext, 25 campos de formulário)
- [x] Nenhum elemento vazando do slide ou da zona de conteúdo (exceto sangrias intencionais da capa e do celular do slide 5): OK

## Contraste por slide

| Slide | Menor contraste | Texto | Menor fonte |
|---|---|---|---|
| 01 | 5.14:1 | Para bancos, cooperativas de crédito e instituiçõe (12px) | 10.5px · 12.73:1 |
| 02 | 5.14:1 | / 10 (13px) | 12px · 7.07:1 |
| 03 | 5.14:1 | / 10 (13px) | 10px · 7.07:1 |
| 04 | 5.57:1 | [cargo A CONFIRMAR] (13px) | 12px · 10.10:1 |
| 05 | 5.14:1 | / 10 (13px) | 10px · 5.22:1 |
| 06 | 5.14:1 | / 10 (13px) | 9.5px · 5.22:1 |
| 07 | 5.14:1 | / 10 (13px) | 12px · 7.07:1 |
| 08 | 5.14:1 | / 10 (13px) | 12px · 7.07:1 |
| 09 | 5.14:1 | / 10 (13px) | 11px · 9.62:1 |
| 10 | 5.57:1 | [URL A CONFIRMAR, com UTM] (12px) | 12px · 10.10:1 |

Fundo considerado: a cor sólida do elemento ou do card mais próximo; nos slides claros sem card, o `--branco`. Títulos, numerais e aspas em ouro (≥ 40px) ficam fora da regra de 4,5:1 por serem texto grande decorativo, conforme a seção 2 do brief; não entram na tabela.

Trecho "Conversa anonimizada. Dados da cooperada preservados." (slide 5): substituído de propósito pela legenda "Reconstituição a partir do relato do projeto.", como o brief manda quando não há print aprovado. Volta quando entrar o print-cozinha.png.
