# Protótipo: Diagnóstico de recuperação com IA (Ubots)

## Contexto

Este protótipo serve para **vender a ideia para a Ubots** em uma reunião. Ele precisa mostrar três coisas, nesta ordem:

1. **Onde o diagnóstico vive:** dentro do artigo do case Sicoob Crediauc, com os pontos de entrada.
2. **A experiência do lead:** o quiz, a estimativa e o diagnóstico completo.
3. **O que o comercial recebe:** o lead qualificado, com respostas, nível e estimativas.

O resultado deve parecer publicável: visual fiel à marca Ubots, sem placeholders aparentes, sem erros no console e sem quebras no celular. Ele não precisa de backend real.

A apresentação é feita por On Nest. Não incluir marca da Velora.

## Arquivo de origem

O componente `DiagnosticoRecuperacaoIA.jsx` está na raiz desta pasta. Ele é a fonte da verdade:

- **Não alterar** perguntas, opções, valores, multiplicadores, textos nem a função `calcular`. Os textos do componente já seguem a seção 4 do `COPY.md`.
- **Pode alterar** apenas o necessário para integração: exportar `QUESTIONS` e `calcular`, aceitar props opcionais (`onLead`, `respostasIniciais`, `etapaInicial`) e trocar o `fetch` do webhook pela chamada `onLead(payload)` quando a prop existir.

## Copy

Todos os textos do hub, do artigo, dos pontos de entrada, do modo demonstração e do painel estão em `COPY.md`, na raiz desta pasta. Usar literalmente, sem reescrever nem completar com texto próprio. Se faltar algum texto, usar a frase mais curta possível no mesmo tom e listar o que foi criado no resumo final.

## Stack

- Vite + React + Tailwind CSS
- `react-router-dom` para as rotas
- `lucide-react` para os ícones
- Fonte Sora via Google Fonts no `index.html`
- Sem backend: leads ficam em `localStorage` (chave `ubots_diag_leads`)

## Rotas

### `/`: hub da apresentação
Página curta de abertura da reunião, com título, subtítulo e três cartões que levam às rotas abaixo, na ordem da demonstração. Textos na seção 1 do `COPY.md`.

### `/artigo`: mock do artigo do case
Reproduzir o layout do blog da Ubots (fundo creme, amarelo de destaque, coluna central, índice lateral no desktop). Todo o texto do artigo está na seção 2 do `COPY.md`.

Incluir os três pontos de entrada, cada um com destaque visual sutil (contorno pontilhado amarelo e etiqueta "Ponto de entrada 1/2/3") ligável por um botão "Mostrar pontos de entrada" no topo:

1. **Bloco após a tabela de resultados** (variante A).
2. **CTA final do artigo**, com link secundário para contato.
3. **Barra fixa no rodapé** que aparece após 40% de scroll, com botão de fechar. Texto curto no mobile.

Textos na seção 3 do `COPY.md`.

Todos os CTAs levam a `/diagnostico?utm_content=<ponto>`.

### `/diagnostico`: o produto
Renderiza o componente em tela cheia. Recebe `onLead` que salva o payload em `localStorage`, com `utm_content` lido da URL.

**Modo demonstração** (só na apresentação, nunca no publicável): quando a URL tiver `?demo=1`, mostrar um seletor flutuante no canto inferior direito com três cenários pré-preenchidos que pulam direto para a prévia:

| Cenário | tipo | pessoas | contratos | ticket | ritmo | régua | canal | política | integração | consentimento |
|---|---|---|---|---|---|---|---|---|---|---|
| Cooperativa média | cooperativa | 35 | 6000 | 5000 | 2 | 1 | 2 | 1 | 2 | 1 |
| Banco regional maduro | banco | 100 | 25000 | 20000 | 6 | 2 | 3 | 3 | 3 | 3 |
| Cooperativa no início | cooperativa | 12 | 1200 | 1500 | 0.5 | 0 | 0 | 0 | 0 | 0 |

Os cenários devem cair em níveis diferentes ("Pronta para piloto", "Pronta para escalar", "Preparar a base"). O seletor também tem "Preencher formulário" com dados fictícios (Ana Souza, ana@cooperativa-exemplo.com.br, (51) 99999-0000, Cooperativa Exemplo, aceite marcado).

### `/painel`: o lead no comercial
Simula a visão do time de vendas. Lista os leads salvos, mais recentes primeiro. Cada linha mostra nome, instituição, tipo, nível (com selo colorido), capacidade atual contra a capacidade com IA, valor adicional por mês e `utm_content`. Ao clicar, abre o detalhe com as 10 respostas em linguagem legível (rótulo da opção, não o valor numérico), as notas por dimensão, a "Sugestão de abordagem" do nível e a linha de abertura para o SDR, com botão de copiar. Todos os textos estão na seção 5 do `COPY.md`.

Regra para o campo `[dimensão ou resultado]` da linha do SDR: usar o nome da dimensão de menor nota em minúsculas (ex.: "política de negociação"). Se todas tiverem nota 2 ou mais, usar "capacidade de renegociação".

Incluir exportação CSV, limpeza com confirmação e o estado de lista vazia.

## Critérios de aceite

- [ ] `npm run dev` sobe sem erros nem avisos no console
- [ ] `npm run build` gera o build sem erros
- [ ] Fluxo completo funciona em 375px, 768px e 1280px de largura
- [ ] O quiz avança ao clicar, "Voltar" e "Revisar respostas" funcionam sem perder respostas
- [ ] Os três cenários de demonstração caem em níveis diferentes
- [ ] O lead enviado aparece em `/painel` com o `utm_content` certo
- [ ] Navegação completa só com teclado, com foco visível
- [ ] Movimento reduzido respeitado
- [ ] Nenhum texto em inglês, placeholder "Lorem" ou "TODO" visível

Ao terminar, rodar o fluxo pelas três rotas com Playwright (ou capturas manuais) nas três larguras, revisar as capturas e corrigir o que estiver desalinhado antes de declarar pronto.

## Publicação para a reunião

Deploy na Vercel (`npx vercel --prod`) para gerar um link compartilhável. Configurar o rewrite de SPA (`vercel.json` com `{"rewrites":[{"source":"/(.*)","destination":"/"}]}`) para as rotas abrirem direto.

## Roteiro da demonstração (5 minutos)

1. `/artigo`: ligar "Mostrar pontos de entrada" e rolar até a barra fixa aparecer.
2. Clicar no ponto 1 e responder o quiz ao vivo, como uma cooperativa média.
3. Mostrar a prévia, preencher o formulário e abrir o diagnóstico completo.
4. `/diagnostico?demo=1`: alternar entre os cenários para mostrar como o resultado muda com a prontidão.
5. `/painel`: abrir o lead recém-criado e mostrar a sugestão de abordagem para o comercial.

## Pontos em aberto para validar com a Ubots

- Multiplicadores por nível (2–3x, 3–5x, 4–7x) são premissas da On Nest, não dados da Ubots.
- Uso do "15x" do case Crediauc em material de captação.
- Texto de consentimento e link para a política de privacidade.
- Destino real do lead (HubSpot, RD ou outro CRM).
