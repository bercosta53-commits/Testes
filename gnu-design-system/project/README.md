Sistema de design evolutivo do Grêmio Náutico União. Ele parte do que o clube já tem (o azul, o brasão com os remos cruzados, a assinatura "120 anos em movimento", as quatro sedes) e troca a linguagem de folheto por uma linguagem de clube: mais precisa, mais viva e com o estilo de vida no centro. Use estas regras para qualquer peça digital: site institucional, página de associação, app, redes sociais e e-mail.

## Essência

**Em movimento.** A ideia vem da assinatura dos 120 anos e da origem do clube no remo. Uma remada tem ataque, puxada e deslize, e o sistema inteiro segue esse ritmo: a tipografia comprime e estende, o movimento acelera e desliza, a Raia marca o compasso.

Três pilares orientam o que mostrar:

- **Ritmo.** Esporte da escolinha ao alto rendimento, rotina de treino, horário de piscina.
- **Pertencimento.** Família, gerações, o título que passa de pai para filho, a turma da confraria.
- **Natureza na cidade.** Sombra, área verde, água e o pôr do sol no Guaíba a poucos minutos de casa.

**O que "premium" quer dizer aqui.** Não é serifa nem dourado. É precisão (grade rígida, alinhamento à esquerda, números tabulares), confiança (uma ação por tela, frases curtas, nenhuma exclamação), luz natural (fotografia real de fim de tarde) e prova (fatos e números no lugar de adjetivos). O luxo do clube é ter tempo e espaço, e o layout precisa transmitir isso com respiro e calma.

## Conteúdo e voz

| Somos | Não somos |
| --- | --- |
| Confiantes | Arrogantes ou exclusivistas |
| Ativos | Frenéticos ou cheios de exclamação |
| Acolhedores | Informais demais ou cheios de gíria |
| Precisos | Técnicos ou frios |
| Tradicionais por história | Antigos na forma |

- Fale com **você**. O clube é "o União" ou "o GNU", nunca "nós oferecemos".
- Títulos e botões em **caixa normal**: "Agendar visita". Caixa alta só nos rótulos expandidos (`rotulo`, `rotulo-p`).
- Uma ideia por frase. Frases de até 20 palavras; parágrafos de até 3 frases.
- Troque adjetivo por fato. "Verdadeiro oásis" vira "sombra, raia aquecida e quadra a poucos minutos de casa".
- Números sempre em algarismos: "4 sedes", "10 salões", "19h31", "28 °C". Endereços com ponto médio: "Av. João Obino, 300 · Petrópolis".
- Sem emoji em site, app e e-mail. Nas redes, no máximo um, no fim.
- Botões com verbo no infinitivo e até 3 palavras.
- Evite: "experiência única e diferenciada", "tudo isso em um único lugar", "venha fazer parte", "mais que um clube".

| Antes | Depois |
| --- | --- |
| Seja Associado | Faça parte dos próximos *120*. |
| Oferecemos uma experiência única e diferenciada em quatro sedes localizadas em regiões tradicionais de Porto Alegre. | Quatro sedes em Porto Alegre. Três nos bairros onde você já vive e uma na Ilha do Pavão, de frente para o pôr do sol no Guaíba. |
| Descubra um verdadeiro oásis no coração do bairro Petrópolis. | Sombra, raia aquecida e quadra de tênis a poucos minutos de casa. |
| Mais que um clube, um legado para a sua vida inteira! | Um bem que fica na família, com a menor mensalidade. |
| QUERO SER ASSOCIADO | Agendar visita |
| QUERO CONSULTAR VALORES DISPONÍVEIS | Consultar valores |
| Enviar formulário | Agendar visita |

## Cor

A paleta tem dois temas, **Dia** (`light`) e **Noite** (`dark`). Todos os pares de texto abaixo passam 4,5:1 nos dois temas.

- Página em `fundo`; cartões e formulários em `fundo-elevado`; faixas de apoio em `fundo-recuado`.
- Texto em `tinta`; secundário em `tinta-suave`. Sobre `noite`, texto em `sobre-noite` e secundário em `sobre-noite-suave`.
- `noite` é a superfície de impacto: hero, faixa Hoje no clube, cartão em destaque, rodapé. Use no máximo uma faixa `noite` a cada duas dobras.
- `uniao` é o azul do clube: links, ícones ativos, etiquetas, checks. O botão primário usa `acao` com `sobre-acao`, que no tema Noite vira quase branco com texto escuro.
- `agua` é cor de preenchimento: boias da Raia, gráficos, ponto de status sobre `noite`. **Nunca use `agua` como texto sobre fundo claro** (2,7:1). Sobre `noite`, ela é a cor de destaque.
- `remo` é sinal, não superfície: o ×, as boias das pontas da Raia, um ponto. No máximo 1% da tela e, como texto, só a partir de 24px.
- Estados: `sucesso`, `alerta` e `erro`, sempre com palavra ou ícone. `remo` não é erro.
- Proporção de referência numa página: 60% `fundo` e `fundo-elevado`, 25% `noite` e `tinta`, 10% `uniao`, 4% `agua`, 1% `remo`.
- Sem degradês decorativos. O único degradê permitido é o de `noite` sobre fotografia, para dar leitura ao texto.

## Tipografia

Uma família só: **Archivo**, variável, com eixos de peso e de largura (Google Fonts, licença OFL). Carregue com:

`https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap`

O eixo de largura é a assinatura do sistema, como a remada que comprime e estende:

- **Display a 78%** (`display-xxl`, `display-xl`, `display-l`, `numero`): condensado, peso 620–640, entrelinha 0,9–0,96, espaçamento negativo. É a energia.
- **Texto a 100%** (`titulo-1` a `titulo-3`, `lead`, `corpo`, `corpo-p`, `legenda`, `botao`): largura normal, leitura confortável.
- **Rótulos a 125%** (`rotulo`, `rotulo-p`): expandido, caixa alta, espaçamento aberto. É a calma.

Regras:
- Tudo alinhado à esquerda. Parágrafos nunca centralizados.
- Texto corrido com no máximo `coluna-texto` (64 caracteres).
- Hierarquia por tamanho e largura. Não misture peso fino e negrito na mesma linha ("Sede **Alto Petrópolis**").
- Uma ênfase por título, em itálico (`gnu-enfase`): a inclinação para frente é movimento. Nunca destaque palavras com cor dentro de parágrafos.
- Algarismos tabulares (`gnu-num`) em horários, endereços, preços e dados.
- No celular, desça dois degraus no display: `display-xxl` 56px, `display-xl` 44px, `display-l` 36px; `titulo-1` 30/34px.

## Grade e espaço

- 12 colunas no desktop com `calha` de 24px e conteúdo até `conteudo` (1200px); fotografia sangrada até `tela-larga`. No celular, 4 colunas e margem lateral de 16px.
- Espaçamento em base 8: `espaco-1` a `espaco-10`. Entre seções, `espaco-9` no desktop e `espaco-8` no celular. Antes de um `display-xxl`, `espaco-10`.
- Composição assimétrica: título e texto ocupam de 5 a 7 colunas à esquerda; a imagem pode sangrar à direita. Evite a pilha centralizada.

## Forma

- Raios: `raio-0` em fotografia e faixas, `raio-1` (2px) em botões, campos e cartões, `raio-2` só em molduras de app, `raio-boia` em chips, pontos e boias. Botão nunca é pílula.
- Hierarquia por cor e espaço, não por sombra. `sombra-1` só em hover de cartão e cabeçalho fixo; `sombra-2` só no que flutua (menus, Conversa).
- Divisores de 1px em `linha`; borda de campo em `linha-forte`.

## Elementos gráficos

- **Raia.** A corda de raia como fileira de boias (`gnu-raia`). Alterna `uniao` e `agua`, com as três boias das pontas em `remo`, como nos últimos 5 metros de uma piscina de competição. Serve de divisor, progresso e loader. Sempre horizontal.
- **Cruzamento.** O × dos remos cruzados (`gnu-x`, em `remo`) une dois mundos num título: "Treino × Pôr do sol". Um por peça.
- **Linha d'água.** Um fio branco que atravessa a foto a 78% da altura; as legendas pousam nele (`gnu-imagem__agua`).
- **Vista aérea.** Fotografia de drone e ilustração geométrica de cima: raias, quadras, copas, mesas. As ilustrações do grupo de assets **Vista aerea** são linguagem gráfica e placeholder até a sessão de fotos.

## Imagem

- Duas famílias: **vista aérea** (geometria, escala, o clube como lugar) e **retrato de uso** (sócios reais em atividade, luz natural, câmera na altura dos olhos, desfoque de movimento permitido).
- A luz da marca é o fim de tarde: sombras longas, pele natural, sombras levemente frias. Nada de HDR, vinheta escura ou filtro quente artificial.
- Proporções: 16:9 e 4:3 para paisagem, 4:5 para retrato e redes, 9:16 para stories. Nunca faixas finas de 4:1.
- Proibido: banco de imagem genérico (o chef, o cantor no palco), polaroide, tachinha, rotação, texto com textura de água, foto com borda branca.

## Movimento

O movimento segue a remada, no ritmo 1:2: a puxada dura um terço do ciclo e a recuperação, dois terços.

- `curva-deslize` para entradas e hover (a padrão), `curva-puxada` para deslocamentos de A para B, `curva-ataque` para saídas.
- `tempo-1` 120ms (cor), `tempo-2` 240ms (controles), `tempo-3` 420ms (cartões e painéis), `tempo-4` 720ms (hero e página), `tempo-remada` 1800ms (loops).
- Direção da esquerda para a direita, deslocando 24px. Escalonamento de 60ms, até 6 itens.
- Sem quique, giro ou elástico. Com `prefers-reduced-motion`, só opacidade.

## Iconografia

- Ícones de traço de 1,5px numa grade de 24px, cantos retos, sem preenchimento. Recomendação: Lucide (licença ISC) com `stroke-width` 1.5, ou desenho próprio na mesma regra. Os ícones das prévias são desenhos simples nessa regra, para substituir pela biblioteca escolhida.
- Cor do ícone igual à do texto ao lado; ícones ativos em `uniao`, sobre `noite` em `agua`.
- Ícone acompanha texto, nunca substitui (exceção: fechar, menu, voltar com rótulo acessível).
- Sem emoji como ícone. O WhatsApp aparece pelo nome, sem o logotipo verde.

## Marca

O selo oficial (brasão com os remos cruzados, 1906) **não foi fornecido nesta versão**. Até a entrega dos arquivos vetoriais oficiais, peças digitais usam a marca tipográfica `gnu-marca` ("Grêmio Náutico · 1906" sobre "União", Archivo expandido). Com o vetor em mãos:

- O selo vai à esquerda da marca tipográfica, com 32px de altura no cabeçalho e no mínimo 24px.
- Área de proteção igual à altura do "U" de União em volta do selo.
- Só sobre `fundo`, `fundo-elevado`, `noite` ou zona calma de foto. Sem sombra, contorno, brilho ou rotação.
- A assinatura "120 anos em movimento" acompanha a marca em 2026 e depois vira o conceito do sistema.

## Acessibilidade

- Texto com 4,5:1 sobre o fundo indicado em cada token, nos dois temas; textos de 24px ou mais com 3:1.
- Anel de foco: 2px de `fundo` e depois 2px de `foco`, em todo elemento interativo.
- Rótulo visível em todo campo. Placeholder é exemplo, não rótulo.
- Consentimento (LGPD) sempre desmarcado por padrão e com link para a política de privacidade.
- Áreas de toque de no mínimo 44×44px. Nada flutuante cobrindo conteúdo.

## Componentes

| Componente | Use para |
| --- | --- |
| Botao | A ação principal e as secundárias |
| Conversa | Atalho para a secretaria no WhatsApp |
| Etiqueta | Sobretítulos, etiquetas, chips e status |
| Dados | Números como prova |
| HojeNoClube | O clube acontecendo agora |
| CartaoSede | Cada uma das quatro sedes |
| CartaoTitulo | Comparar Título Patrimonial e Contribuinte Efetivo |
| Formulario | Agendar visita e captar interesse |
| Cabecalho | Navegação única dos dois sites |
| Raia, Cruzamento, Imagem | Os elementos gráficos |
| Hero | Abertura de página |
| Movimento | Curvas e tempos em ação |
| Aplicacoes, AntesDepois | Composições de referência |

As classes estão em `components/bundle.css`, com prefixo `gnu-`, e leem todas as cores, espaços, raios, curvas e tempos de `tokens.css`.
