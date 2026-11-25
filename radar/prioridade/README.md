# Velora Radar · Prioridade de contas

Página principal do Radar como visão integrada em quatro eixos (ICP, Sinais, Clima do setor e Oportunidade digital), conforme o briefing v2 de 25/11/2026.

> **Modelo experimental 1 · pesos iguais · limites ainda não calibrados.** A nota integrada e as classes A1–C não substituem o VSCS nem o Tier ICP e não autorizam abordagem.

## Como rodar

```bash
npm test            # 37 testes (node:test), sem dependências
npm run typecheck   # tsc sobre JS com JSDoc + src/tipos.d.ts
npm run serve       # http://localhost:4173
```

- **Produção:** `index.html` → `src/main.js`. Não carrega fixtures.
- **Desenvolvimento:** `dev/index.html`, com dados fictícios (faixa "FIXTURE DE TESTE" sempre visível).
  - `?cenario=backlog`: o Clima fica indisponível, que é o estado atual do projeto.
  - `?apresentacao=1`: modo apresentação (o Clima fica oculto e conta como faltante).
  - `?estado=erro|vazio|carregando`: estados de carga.

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `src/config.js` | **Módulo único** com pesos, limites, mínimos, tolerância (`1e-9`), atalhos e `versaoModelo`. É consumido pelo cálculo, pelo painel de metodologia e pelos testes. |
| `src/modelo.js` | Funções puras: nota integrada, classificação C→A1→A2→B1→B2, critérios de A1, "Por que esta classe?" e a regra de 1 dimensão faltando (viabilidade e nota mínima). |
| `src/numeros.js` | O único ponto de comparação de limites (`valor >= limite - tolerância`) e a formatação pt-BR (nota integrada com duas casas). |
| `src/adaptador.js` | Snapshot → `VisaoIntegradaConta` (tipos da seção 10 em `src/tipos.d.ts`). Não escreve no snapshot e não corrige dados em silêncio. |
| `src/mapeamento.js` | Mapeamento do payload real. **Hoje fica todo pendente** (ver abaixo). |
| `src/metodologia.js` | Os cinco passos, a tabela de classes (com exemplos calculados pelo classificador real) e as definições. |
| `src/consulta.js` | Busca, filtros (OU dentro do grupo, E entre grupos), atalhos, ordenação múltipla, agrupamentos, Setor × Prioridade, cruzamento e resumo do setor. |
| `src/estado-url.js` | Estado da visão ↔ URL: filtros, busca, ordem, agrupamento, visão, conta aberta e comparação. |
| `src/ui/*` | Shell, faixa "Do ambiente ao sweet spot", lista, painel da conta, losango em SVG, comparação e folha de filtros no celular. |
| `dev/fixtures.teste.js` | Fixture fictícia e determinística, com 130 contas geradas e 11 casos de borda. Fica fora do caminho de produção. |
| `docs/capturas/` | Telas renderizadas com a fixture. |

Não há nenhuma dependência de execução. Os tokens visuais (Bone, Paper, Ink, Acid; Space Grotesk, Manrope e JetBrains Mono; raio de 2px) foram reaproveitados de `radar/evolucao-radar.html`, que está no branch `claude/blissful-heisenberg-xushb5`.

## Integração em produção

O app hospedeiro injeta a leitura do snapshot, que é só de leitura:

```html
<script>
  window.VELORA_RADAR = {
    carregar: async () => snapshotAtual,     // { atualizadoEm, contas: [...] }
    mapeamento: MAPEAMENTO_DOCUMENTADO,      // opcional; padrão: tudo pendente
    modoApresentacao: false,
    rotas: { clima: '/clima', sinais: '/sinais' },
    climaVinculadoAoSetor: false             // true só se a taxonomia de setor for a do Clima
  };
</script>
<script type="module" src="./src/main.js"></script>
```

## Origem das notas (tabela 5.3): estado atual

**O código do app e o contrato (`VELORA_RADAR_ADENDO_CONTRATO_V2.md`, `public.radar_snapshots`) não estavam acessíveis nesta implementação.** Por isso nenhuma dimensão tem mapeamento documentado em produção. Com dados reais, toda conta aparece hoje em "Sem métrica", sem nota nem classe, até alguém preencher `src/mapeamento.js`.

| Eixo | Fonte no projeto | Escala original | Transformação | Estado |
| --- | --- | --- | --- | --- |
| ICP | a confirmar no contrato | — | — | Pendente de mapeamento |
| Sinais | a confirmar; o VSCS **não** equivale só a Sinais | — | — | Pendente de mapeamento |
| Clima do setor | backlog | — | — | Indisponível |
| Oportunidade digital | a confirmar no contrato | — | — | Pendente de mapeamento |

Para documentar uma dimensão, preencha em `MAPEAMENTO_PRODUCAO.dimensoes.<eixo>` os campos `mapeamento: 'documentado'`, `campoOrigem`, `escalaOriginal`, `min`/`max`, `transformacao` e `converter` (por exemplo, `linear0a100` = `1 + 4 × v / 100`, só se o significado for compatível). Também podem entrar `campoResumo`, `campoData`, `campoFontes`, `campoSemAchados`, `campoDesatualizada` e a política de validade em `desatualizadaEntraNoCalculo`. Se a política ficar `null`, o dado desatualizado é exibido mas sai do cálculo.

**Campos de conta lidos:** `id`, `nome`, `score` (= `v2.vscs`), `vscsStatus` e `acaoRecomendada` vêm do contrato. Os campos `razaoSocial`, `nomeFantasia`, `nomeAlternativo`, `setor`, `vertical`, `segmento`, `uf`, `tierIcp` e `contatoAtivavel` são **nomes a confirmar**: o adaptador só lê o que existir e não cria campos. Os filtros de "Regras oficiais" e de UF só aparecem quando esses campos existem.

## Definido × proposta experimental

- **Definido por Bernardo:** quatro eixos com notas de 1 a 5, índice único, losango, classes A1–C, comparação, metodologia na tela, leitura do ambiente até o sweet spot e a regra de faltas (1 dimensão faltando = candidata com investigação; 2 ou mais = fora).
- **Proposta, configurável em `config.js`:** pesos iguais, limites das classes, rubrica, sweet spot = A1, "perto" = 4 de 5 critérios, corte de quadrante = 3 e faixas de 1 ponto no cruzamento.

## Decisões em aberto (padrão adotado)

| # | Decisão | Padrão implementado |
| --- | --- | --- |
| D1 | "Sem achados" vira nota? | Segue o método oficial. Sem nota: `null`, com o texto "Nenhum sinal relevante encontrado (busca em …)". Com nota: rótulo "Sem sinais encontrados", nunca a descrição da nota 1. |
| D2 | Sweet spot = só A1? | Só A1; A2 e B1 aparecem como "Aproximadas". |
| D3 | Dados faltando | Implementado conforme a decisão de 25/11. |
| D4 | Calibração | Selo experimental em todo lugar onde a classe aparece. |

## Escolhas que o briefing não fixava

- **1 dimensão faltando, mas um valor conhecido já impede A1** ("fora por critério") ganhou segmento próprio na faixa e coluna própria na matriz, para as somas fecharem com o total. O briefing omitia esse grupo no exemplo textual (6 + 9 + 11 + 24 + 31 + 18 + 41 = 140 de 142).
- **Filtro de nota por dimensão:** cada dimensão é um grupo próprio (combinação E) com mínimo (≥) e máximo estrito (<). É isso que expressa os atalhos "ICP ≥ 4 e Sinais < 3".
- **Nota mínima exibida** é arredondada para cima em centésimos, para que o número mostrado sempre baste (3,241 aparece como 3,25).
- **Modo apresentação:** o Clima é marcado `ocultaEmApresentacao` e conta como faltante nesse modo, sem vazar valor, resumo ou fonte.
- **Leitura da rubrica:** a nota 3,5 lê como nível 3, para não arredondar a descrição para cima.
- **Email:** a página não exibe e-mails nem contatos. As regras de contato ativável aparecem apenas como texto oficial e como filtro.

## Cobertura dos critérios de aceite

- `test/modelo.test.js`: fronteiras 2,4999 / 2,5 / … / 4,5; mínimos de A; trava de ICP; casos que divergem em `float` (ex.: 4,6 + 4,8 + 4,7 + 3,9 = 18 exato, mas a média em `float` dá 4,4999…); nota mínima (soma 12,5 pede 5,5; soma 14 pede 4,0; ICP pede ≥ 4; Clima pede ≥ 3).
- `test/adaptador.test.js`: ausência de cada dimensão; regra de faltas 0, 1, 1 com bloqueio e 2; valor de teste nunca no estado; candidata que completa; desatualizada sem política fora da cobertura; dado fora do intervalo; sem achados; modo apresentação; produção sem mapeamento; registros sem ID.
- `test/consulta.test.js`: normalização da busca; busca fora dos filtros; OU/E; sem nota não passa e é contada; sem setor; soma das células = total na faixa, na matriz e no cruzamento; ordenações; atalhos; resumo do setor com o n.
- `test/interface.test.js`: metodologia gerada da configuração; ida e volta da URL; losango só com segmentos adjacentes.

## Pendências que dependem de dados ou de decisão

1. Mapear os campos reais das quatro dimensões e dos atributos de conta contra o contrato atual.
2. Confirmar a política de validade por dimensão.
3. Confirmar se a taxonomia de setor das contas é a mesma do Clima (`climaVinculadoAoSetor`) e informar a rota da página Clima.
4. Confirmar o formato de `acaoRecomendada` (hoje: texto, ou objeto com `rotulo`/`titulo`/`texto`/`descricao` e `bloqueio`/`bloqueada`).
5. Calibrar limites e pesos com a base real (D4).
