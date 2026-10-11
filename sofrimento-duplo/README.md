# Sofrimento Duplo

Dashboard de página única que estima qual perfil de torcedor/eleitor tem mais chance de viver o pior cenário combinado: **o clube rebaixado e o candidato derrotado no 2º turno** (Gre-Nal × Eleição 2026, dados de 11/10/2026).

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
| `src/format.js` | Formatação pt-BR e textos das fórmulas mostradas nas dicas |
| `src/render.js` | Destaque, ranking, matrizes 2×2, barras empilhadas e tabela |
| `src/main.js` | Estado, controles, tema claro/escuro |
| `src/dica.js` | Dica (tooltip) por mouse, toque e teclado |
| `src/exportar.js` | Exporta o ranking como PNG |
| `test/` | Testes do cálculo e da formatação |

## Premissas padrão

Todas aparecem na tela, com fonte, e podem ser editadas.

- **2º turno (25/10/2026):** P(Flávio vence) = 65%, P(Lula) = 1 − P(Flávio). Slider de 40% a 70%. Referência: Datafolha de 06–07/10 (Flávio 52% × Lula 48% dos votos válidos) e 1º turno (Flávio 47,03% × Lula 45,16%).
- **Gre-Nal (30ª rodada, 11/10/2026):** Grêmio vence 40,1%, empate 28%, Inter vence 31,9%. Empate e vitória do Inter são suposição do autor do estudo. Também dá para fixar o resultado (Grêmio venceu, Empate ou Inter venceu).
- **Risco de rebaixamento por resultado** (ValorFinal, pré-jogo):

  | Resultado | Grêmio | Inter |
  |---|---|---|
  | Grêmio vence | 47,2% | 58,4% |
  | Empate | 67,6% | 46,1% |
  | Inter vence | 79,2% | 26,0% |

- **Independência:** clube e eleição são independentes.

## Cálculo

```
P(rebaixa) = Σ P(resultado) × risco(resultado)         // Grêmio ≈ 63,1%, Inter ≈ 44,6%
queda_e_derrota    = p_clube × (1 − p_cand)             // pior cenário
queda_e_vitoria    = p_clube × p_cand
fica_e_derrota     = (1 − p_clube) × (1 − p_cand)
fica_e_vitoria     = (1 − p_clube) × p_cand             // melhor cenário
derrotas_esperadas = p_clube + (1 − p_cand)             // 0 a 2; ordena o ranking
```

Com os padrões:

| Perfil | Pior cenário | Derrotas esperadas |
|---|---|---|
| Gremista pró-Lula | 41,0% | 1,28 |
| Colorado pró-Lula | 29,0% | 1,10 |
| Gremista pró-Flávio | 22,1% | 0,98 |
| Colorado pró-Flávio | 15,6% | 0,80 |

Se as três probabilidades do jogo não somarem 100%, o cálculo usa os valores normalizados e avisa na tela. Perfis empatados dividem a mesma posição no ranking (com P(Flávio) = 50%, os dois gremistas empatam em 1º).

## Decisões de visualização

- Sem biblioteca de gráficos: as barras são elementos HTML com transições de CSS, o que deixa o pacote em cerca de 8 kB de JS (gzip) e anima tudo a cada mudança. O PNG do ranking é desenhado num canvas.
- O ranking decompõe as derrotas esperadas nas duas parcelas (clube rebaixado + candidato derrotado), com a fórmula de cada parcela na dica.
- O vermelho do pior cenário e o verde do melhor foram escolhidos para continuar distinguíveis com daltonismo (deuteranopia e protanopia) nos dois temas. Os cenários mistos usam cinzas, e cada célula ou segmento também traz o rótulo em texto.
- Nas matrizes 2×2, a intensidade da cor é proporcional à probabilidade da célula.
- A tabela com todos os números fica no fim da página, para leitura sem depender de cor ou de dica.

## Fontes

- [Datafolha, 2º turno (Diario de Pernambuco, 08/10/2026)](https://www.diariodepernambuco.com.br/politica/2026/10/11726197-datafolha-flavio-bolsonaro-tem-52-dos-votos-validos-e-lula-48.html)
- [Resultado do 1º turno (O Povo, 05/10/2026)](https://mais.opovo.com.br/jornal/politica/2026/10/05/lula-fala-em-licao-da-democracia-e-considera-resultado-inesperado.html)
- [Risco de rebaixamento no Gre-Nal (ValorFinal)](https://valorfinal.com.br/brasileirao/2026/jogos/gremio-x-internacional)
