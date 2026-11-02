# HojeNoClube

Faixa viva que mostra o clube acontecendo agora: temperatura da piscina, hora do pôr do sol, horários e ocupação. É o que separa um clube vivo de um folheto.

**Estrutura:** `gnu-hoje` (fundo `noite`) → `gnu-hoje__titulo` com status pulsante em `agua` → itens `gnu-hoje__item` com `gnu-rotulo-p` (`sobre-noite-suave`) e `gnu-hoje__valor` (condensado, tabular). Divisores em `linha-noite`.

**O consumidor fornece:** de 3 a 5 itens vindos de dados reais (sistema da secretaria, previsão do tempo, agenda). Os valores da prévia são exemplos.

**Regras**
- Atualize ou esconda: um dado velho é pior que nenhum. Se a fonte falhar, mostre só os horários fixos.
- Use logo abaixo do hero, no app e nas telas das sedes.
- Rola horizontalmente no celular, sem quebrar o valor em duas linhas.
