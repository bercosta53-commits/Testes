# QA · Playbook Viacredi + Ubots

Gerado em 2026-11-16 12:52 UTC

## Checklist

- [x] Nenhum azul ou teal nos elementos do layout: OK (exceções em imagem: o logo Viacredi e o ícone de IA da capa mantêm as cores originais)
- [x] Nenhum travessão (— ou –) no texto visível: OK
- [x] Contraste ≥ 4,5:1 em todo texto: OK (tabela abaixo)
- [x] Contador de página 01 / 11 … 11 / 11: OK
- [x] Régua de título: no máximo 2 linhas e 940px de largura (capa até 3 linhas; capa e CTA têm régua própria): OK
  - 01: 3 linha(s), 642px · 02: 1 linha(s), 344px · 03: 1 linha(s), 333px · 04: 1 linha(s), 399px · 05: 1 linha(s), 396px · 06: 2 linha(s), 562px · 07: 1 linha(s), 430px · 08: 1 linha(s), 450px · 09: 1 linha(s), 368px · 10: 1 linha(s), 393px · 11: 2 linha(s), 310px
- [x] Subtítulos (tese) com até 140 caracteres: OK
- [ ] Copy idêntica ao .md (169 trechos conferidos): 1 trecho(s) para revisar
  - slide 5: "Conversa anonimizada. Dados da cooperada preservados"
- [ ] Nenhum [A CONFIRMAR] sobrando na versão final: PENDENTE, 8 marcações em magenta neste rascunho
  - slide 2: [cargo A CONFIRMAR]
  - slide 3: [cargo A CONFIRMAR]
  - slide 3: [Fala A CONFIRMAR com a Giovanna]
  - slide 4: [cargo A CONFIRMAR]
  - slide 4: [Fala A CONFIRMAR com a Giovanna]
  - slide 6: [cargo A CONFIRMAR]
  - slide 6: [Fala A CONFIRMAR com a Giovanna]
  - slide 11: [URL A CONFIRMAR, com UTM]
- [x] Dois slides escuros nunca em sequência: OK (escuros: 4, 8, 11)
- [x] PDF com texto selecionável e 11 páginas de 1440×810 pt: OK (11 páginas, 1798 palavras extraídas por pdftotext, 25 campos de formulário)
- [x] Nenhum elemento vazando do slide ou da zona de conteúdo (exceto sangrias intencionais da capa e do celular do slide 5): OK

## Contraste por slide

| Slide | Menor contraste | Texto | Menor fonte |
|---|---|---|---|
| 01 | 5.14:1 | O método de uma cooperativa que liberou mais de R$ (22px) | 10.5px · 7.07:1 |
| 02 | 5.14:1 | / 11 (13px) | 12px · 7.07:1 |
| 03 | 5.14:1 | / 11 (13px) | 11px · 12.73:1 |
| 04 | 5.57:1 | [cargo A CONFIRMAR] (13px) | 12px · 10.10:1 |
| 05 | 5.14:1 | / 11 (13px) | 11px · 5.69:1 |
| 06 | 5.14:1 | / 11 (13px) | 10px · 5.69:1 |
| 07 | 5.14:1 | / 11 (13px) | 11px · 7.07:1 |
| 08 | 8.60:1 | Quando acontece, o agente envia uma nota com o con (15px) | 11px · 10.31:1 |
| 09 | 5.14:1 | / 11 (13px) | 12px · 7.07:1 |
| 10 | 5.14:1 | / 11 (13px) | 11px · 9.62:1 |
| 11 | 5.57:1 | [URL A CONFIRMAR, com UTM] (12px) | 11px · 8.60:1 |

Fundo considerado: a cor sólida do elemento ou do card mais próximo; nos slides claros sem card, o `--branco`. Títulos, numerais e aspas em ouro (≥ 40px) ficam fora da regra de 4,5:1 por serem texto grande decorativo, conforme a seção 2 do brief; não entram na tabela.

Trecho "Conversa anonimizada. Dados da cooperada preservados." (slide 5): substituído de propósito pela legenda "Reconstituição a partir do relato do projeto.", como o brief manda quando não há print aprovado. Volta quando entrar o print-cozinha.png.
