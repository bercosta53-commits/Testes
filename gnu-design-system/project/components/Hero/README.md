# Hero

Abertura de página: uma imagem que ocupa a tela, um título que afirma e uma ação.

**Estrutura:** `section.gnu-hero` (fundo `noite`) → `gnu-hero__img` (foto + degradê de `noite` de baixo para cima) → cabeçalho sobre foto → `gnu-hero__conteudo` com sobretítulo, `gnu-display-xxl`, `gnu-lead` e `gnu-hero__acoes`. Logo abaixo, a faixa HojeNoClube.

**O consumidor fornece:** uma foto com área calma no terço inferior esquerdo, título de até 7 palavras com no máximo uma ênfase em itálico (`gnu-enfase`), um parágrafo e no máximo duas ações (uma `gnu-btn--claro`, outra `gnu-btn--texto`).

**Movimento:** o conteúdo entra da esquerda para a direita (`gnu-entra`, `tempo-4`, `curva-deslize`), como o barco. A foto pode ter zoom de 1,00 a 1,04 em 8s, uma vez.

**Regras**
- Texto sempre à esquerda e embaixo; nunca centralizado sobre o meio da foto.
- Altura pelo conteúdo, até 88% da tela; o próximo bloco precisa aparecer.
- No celular, o display desce para 56px.
