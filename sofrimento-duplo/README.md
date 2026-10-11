# Sofrimento Duplo

Dashboard de página única que estima qual perfil de torcedor/eleitor tem mais chance de viver o pior cenário combinado: **o clube rebaixado e o candidato derrotado no 2º turno** (Gre-Nal × Eleição 2026, dados de 11/10/2026, após a 30ª rodada).

O formato segue o de um relatório de consultoria: resumo executivo com os quatro achados principais, figuras numeradas com título-conclusão gerado a partir dos números, nota e fonte sob cada gráfico, e as premissas num painel lateral.

Perfis: Gremista pró-Lula, Colorado pró-Lula, Gremista pró-Flávio e Colorado pró-Flávio.

São estimativas, não previsões. Tudo é calculado no navegador a partir das premissas abaixo, e nenhum dado é buscado online.

## Rodar

```sh
npm install
npm run dev       # servidor local com recarga
npm test          # testes unitários (Vitest)
npm run build     # gera dist/, que pode ser servido de qualquer pasta
npm run preview   # serve o build
```

## Estrutura

| Arquivo | O que faz |
|---|---|
| `src/calc.js` | `DEFAULTS` (todas as premissas, no topo) e `calcPerfis(params)`, função pura |
| `src/format.js` | Formatação pt-BR, cenários, cores de identidade e textos das fórmulas |
| `src/narrativa.js` | Resumo executivo e títulos-conclusão das figuras |
| `src/render.js` | Resumo executivo, ranking, matrizes 2×2, barras empilhadas e tabela |
| `src/main.js` | Estado, controles, tema claro/escuro |
| `src/dica.js` | Dica (tooltip) por mouse, toque e teclado |
| `src/exportar.js` | Exporta o ranking como PNG |
| `test/` | Testes do cálculo, da formatação e dos textos |

## Premissas padrão

Todas aparecem na tela, com fonte, e podem ser editadas. Ficam em `DEFAULTS`, no topo de `src/calc.js`. O botão "Ver pré-jogo" carrega `PREMISSAS_PRE_JOGO`, as premissas do briefing original.

- **2º turno (25/10/2026):** P(Flávio vence) = 65%, P(Lula) = 1 − P(Flávio). Slider de 40% a 70%. Referência: Datafolha de 06–07/10 (Flávio 52% × Lula 48% dos votos válidos) e 1º turno (Flávio 47,03% × Lula 45,16%).
- **Gre-Nal (30ª rodada, 11/10/2026):** terminou **empatado**. O Inter abriu o placar no 1º tempo e o Grêmio empatou. O padrão fixa o empate. No modo pré-jogo, as probabilidades são Grêmio vence 40,1%, empate 28% e Inter vence 31,9% (empate e vitória do Inter são suposição do autor do estudo).
- **Derrota do Corinthians na rodada:** o Corinthians, em má fase e perto da zona de rebaixamento, perdeu. Como concorrente direto que não pontuou, isso alivia Grêmio e Inter. O modelo do ValorFinal é anterior à rodada, então aplicamos um desconto de **3 p.p.** no risco final de cada clube. É uma estimativa desta análise, sem fonte externa, editável de 0 a 10 p.p.
- **Risco de rebaixamento por resultado** (ValorFinal, pré-jogo):

  | Resultado | Grêmio | Inter |
  |---|---|---|
  | Grêmio vence | 47,2% | 58,4% |
  | Empate | 67,6% | 46,1% |
  | Inter vence | 79,2% | 26,0% |

- **Independência:** clube e eleição são independentes.

## Cálculo

```
P(rebaixa) = Σ P(resultado) × risco(resultado) − ajuste_corinthians   // piso em 0
queda_e_derrota    = p_clube × (1 − p_cand)             // pior cenário
queda_e_vitoria    = p_clube × p_cand
fica_e_derrota     = (1 − p_clube) × (1 − p_cand)
fica_e_vitoria     = (1 − p_clube) × p_cand             // melhor cenário
derrotas_esperadas = p_clube + (1 − p_cand)             // 0 a 2; ordena o ranking
```

Risco de queda: Grêmio 64,6% e Inter 43,1% com os padrões (empate e desconto de 3 p.p.); 63,1% e 44,6% no pré-jogo.

| Perfil | Pior cenário (pós-rodada) | Derrotas esperadas | Pior cenário (pré-jogo) | Derrotas esperadas |
|---|---|---|---|---|
| Gremista pró-Lula | 42,0% | 1,30 | 41,0% | 1,28 |
| Colorado pró-Lula | 28,0% | 1,08 | 29,0% | 1,10 |
| Gremista pró-Flávio | 22,6% | 1,00 | 22,1% | 0,98 |
| Colorado pró-Flávio | 15,1% | 0,78 | 15,6% | 0,80 |

Se as três probabilidades do jogo não somarem 100%, o cálculo usa os valores normalizados e avisa na tela. Perfis empatados dividem a mesma posição no ranking (com P(Flávio) = 50%, os dois gremistas empatam em 1º).

## Cores

Cada clube e cada candidato tem a sua cor de identidade:

| Quem | Cor | Base |
|---|---|---|
| Grêmio | azul `#0d80bf` | azul do clube (Team Color Codes, PMS 113-6 C) |
| Inter | vermelho colorado `#a6192e` | vermelho do clube, num tom mais profundo |
| Lula | vermelho PT `#e8473f` | vermelho do Partido dos Trabalhadores |
| Flávio | amarelo `#e3a600` | o verde-amarelo associado ao bolsonarismo desde 2018 (Folha de Pernambuco) |

Inter e Lula são ambos vermelhos e aparecem lado a lado na barra do colorado pró-Lula. Por isso o Inter usa um vermelho mais escuro e o PT um mais vivo. O par passa no validador de paleta (diferença perceptível ≥ 15 em visão normal e ≥ 8 com daltonismo). Para o Flávio, o amarelo foi escolhido em vez do verde porque o verde ao lado do vermelho do Inter some para quem tem daltonismo. O tema escuro usa versões ajustadas das mesmas cores.

Nas figuras de cenários, o sofrimento duplo usa a tinta mais forte (navy), "nenhuma derrota" usa cinza claro, e os cenários de uma derrota só levam a cor de quem causou a dor: a do clube quando só ele cai, a do candidato quando só ele perde.

## Decisões de visualização

- Sem biblioteca de gráficos: as barras são elementos HTML com transições de CSS, o que deixa o pacote em cerca de 10 kB de JS (gzip) e anima tudo a cada mudança. O PNG do ranking é desenhado num canvas, no mesmo formato de figura.
- O ranking decompõe as derrotas esperadas nas duas parcelas (clube rebaixado + candidato derrotado) e mostra o efeito da rodada contra o pré-jogo, em pontos percentuais.
- Nas matrizes 2×2, a intensidade da cor cresce com a probabilidade da célula.
- A tabela com todos os números fica no anexo, para leitura sem depender de cor ou de dica.

## Fontes

- [Datafolha, 2º turno (Diario de Pernambuco, 08/10/2026)](https://www.diariodepernambuco.com.br/politica/2026/10/11726197-datafolha-flavio-bolsonaro-tem-52-dos-votos-validos-e-lula-48.html)
- [Resultado do 1º turno (O Povo, 05/10/2026)](https://mais.opovo.com.br/jornal/politica/2026/10/05/lula-fala-em-licao-da-democracia-e-considera-resultado-inesperado.html)
- [Risco de rebaixamento no Gre-Nal (ValorFinal)](https://valorfinal.com.br/brasileirao/2026/jogos/gremio-x-internacional)
