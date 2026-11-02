# Movimento

O sistema de movimento vem da remada. Cada ciclo tem ataque (a pá entra na água), puxada (a força) e recuperação (o barco desliza). Na prévia, cada barco percorre a raia em dois terços do ciclo e descansa no terço final, no ritmo 1:2.

**Curvas** (tokens `curva-*`)
- `curva-deslize` — arranca rápido e desacelera longo. Entradas, hover, revelações. É a padrão.
- `curva-puxada` — acelera e freia com força. Deslocamentos de A para B.
- `curva-ataque` — acelera para fora. Saídas e fechamentos.

**Tempos** (tokens `tempo-*`): 120ms para cor, 240ms para pequenos controles, 420ms para cartões e painéis, 720ms para hero e página, 1800ms para loops (o ciclo da remada).

**Regras**
- A direção é da esquerda para a direita, como a leitura e o barco. Elementos entram deslocando 24px no eixo x, nunca de baixo para cima em cascata infinita.
- Escalonamento de 60ms entre itens de uma lista, até 6 itens.
- Nada de quique, giro, elástico ou parallax exagerado.
- Com `prefers-reduced-motion`, só troca de opacidade em `tempo-2`.
