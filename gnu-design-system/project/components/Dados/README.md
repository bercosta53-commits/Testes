# Dados

Números como prova. Substituem os cartões brancos que só repetiam um rótulo ("10 salões de eventos sociais e corporativos").

**Estrutura:** `gnu-dados` (grade que se ajusta de 1 a 4 colunas) com itens `gnu-dado` → `gnu-dado__valor` (Archivo condensado, estilo `numero`, algarismos tabulares) e `gnu-dado__rotulo` (`tinta-suave`, até 24 caracteres por linha). A linha de 1px em `tinta` no topo de cada dado é a régua da raia. Sobre `noite`, `gnu-dados--noite`. Versão menor: `gnu-dados--p`.

**O consumidor fornece:** valores reais e verificáveis, unidade curta em `small` e um rótulo que diz o que o número conta.

**Regras**
- Só números que o clube pode comprovar. Nada de "+ de mil sorrisos".
- De 2 a 4 dados por linha. Um dado sozinho vira título.
- Não centralizar. Não colocar ícone acima do número.
