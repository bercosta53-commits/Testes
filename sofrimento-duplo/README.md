# Sofrimento Duplo

Estudo de dados interativo: qual torcedor-eleitor gaúcho tem mais chance de ver **o clube rebaixado e o candidato derrotado no 2º turno** (Gre-Nal × Eleição 2026, dados de 11/10/2026).

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

## PDF

[`sofrimento-duplo.pdf`](sofrimento-duplo.pdf) traz o estudo em 2 páginas A4, com as premissas padrão. A página tem estilos próprios para impressão: os controles viram um resumo das premissas, a tabela do anexo aparece aberta, o tema fica claro e a metodologia sobe para a página 1.

Para gerar de novo com outras premissas, abra a página no Chrome, ajuste os valores e use Imprimir → Salvar como PDF, com papel A4, escala 75% e gráficos de fundo ativados.

## O que a página mostra

1. **Premissas**, numa barra no topo: a chance de vitória de cada candidato e o risco de queda de cada clube. Mudar qualquer valor recalcula tudo na hora.
2. **Quem se dá pior?**: o perfil com mais derrotas esperadas, a chance de sofrimento duplo dele e o perfil na outra ponta.
3. **Mapa do sofrimento**: cada perfil é um ponto (chance de o candidato perder × chance de o clube cair) sobre curvas de mesma chance de sofrimento duplo.
4. **Ranking**: derrotas esperadas de 0 a 2, divididas em clube (1º trecho) e candidato (2º trecho). Dá para baixar como PNG.
5. **Cruzamentos**: matrizes 2×2 e barras de 100% com os quatro cenários de cada perfil.
6. **Anexo**: tabela com todos os números.

## Estrutura

| Arquivo | O que faz |
|---|---|
| `src/calc.js` | `DEFAULTS` (todas as premissas, no topo) e `calcPerfis(params)`, função pura |
| `src/format.js` | Formatação pt-BR, cenários, cores de identidade e textos das fórmulas |
| `src/narrativa.js` | Títulos que dizem a conclusão de cada bloco |
| `src/mapa.js` | Mapa do sofrimento (SVG desenhado no tamanho real) |
| `src/render.js` | Destaque, ranking, matrizes, barras empilhadas e tabela |
| `src/main.js` | Estado, controles e tema claro/escuro |
| `src/dica.js` | Dica (tooltip) por mouse, toque e teclado |
| `src/exportar.js` | Exporta o ranking como PNG |
| `test/` | Testes do cálculo, da formatação e dos textos |

## Premissas padrão

| Premissa | Valor | Fonte |
|---|---|---|
| Chance de vitória no 2º turno (25/10) | Flávio 52% × Lula 48% | Divisão dos votos válidos no Datafolha de 06–07/10. No 1º turno: Flávio 47,03% × Lula 45,16%. |
| Risco de o Grêmio cair | 67,6% | ValorFinal, risco dado o empate no Gre-Nal da 30ª rodada |
| Risco de o Inter cair | 46,1% | ValorFinal, risco dado o empate no Gre-Nal da 30ª rodada |

Clube e eleição são tratados como independentes. O controle de chance de vitória vai de Lula 70% a Flávio 70%.

## Cálculo

```
sofrimento_duplo   = p_clube × (1 − p_cand)      // pior cenário
so_o_clube_cai     = p_clube × p_cand
so_o_candidato     = (1 − p_clube) × (1 − p_cand)
nenhuma_derrota    = (1 − p_clube) × p_cand      // melhor cenário
derrotas_esperadas = p_clube + (1 − p_cand)      // 0 a 2; ordena o ranking
```

Com os padrões:

| Perfil | Sofrimento duplo | Derrotas esperadas |
|---|---|---|
| Gremista pró-Lula | 35,2% | 1,20 |
| Gremista pró-Flávio | 32,4% | 1,16 |
| Colorado pró-Lula | 24,0% | 0,98 |
| Colorado pró-Flávio | 22,1% | 0,94 |

Com a eleição tão apertada, o clube pesa mais que o voto: os dois perfis gremistas lideram. Perfis empatados dividem a mesma posição no ranking (com 50% × 50%, os dois gremistas empatam em 1º).

## Cores

| Quem | Cor | Base |
|---|---|---|
| Grêmio | azul `#0d80bf` | azul do clube |
| Inter | vermelho colorado `#a6192e` | vermelho do clube, num tom mais profundo |
| Lula | vermelho PT `#e8473f` | vermelho do Partido dos Trabalhadores |
| Flávio | amarelo `#e3a600` | o verde-amarelo associado ao bolsonarismo |
| Sofrimento duplo | roxo `#5b34d6` | cor de destaque do estudo, sem ligação com clube ou partido |

As cores de identidade aparecem só onde identificam alguém (fichas, ranking, controles). Nos cruzamentos, só o roxo e cinzas: o roxo marca o sofrimento duplo, e nas matrizes a intensidade do roxo mostra a chance de cada célula. Inter e Lula, ambos vermelhos, usam tons separados por luminosidade, e todos os pares que ficam lado a lado passam no validador de paleta para daltonismo, nos dois temas.

## Decisões de implementação

- Sem biblioteca de gráficos: as barras são HTML com transições de CSS e o mapa é SVG gerado à mão, o que deixa o pacote em cerca de 9 kB de JS (gzip).
- Os títulos de cada bloco são gerados a partir do cálculo e mudam quando as premissas mudam.
- No visualizador de artefatos do claude.ai, o PNG é oferecido pelo recurso de downloads do visualizador; fora dele, por um link comum.
