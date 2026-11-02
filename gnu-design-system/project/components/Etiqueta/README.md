# Etiqueta

Três peças pequenas que organizam a leitura: sobretítulo, etiqueta e chip, mais o ponto de status.

- **Sobretítulo** (`gnu-rotulo`, cor `tinta-suave`): Archivo expandido em caixa alta. Diz onde o leitor está ("Sede · Petrópolis"). Um por bloco, acima do título.
- **Etiqueta** (`gnu-tag`): fundo `uniao-suave`, texto `uniao-profundo`. Uma palavra ou duas. Use "Mais procurado", "Novo", "Esgotado". Sobre `noite`, `gnu-tag--noite`.
- **Chip** (`gnu-chip`): filtro ou escolha. `aria-pressed="true"` inverte para `tinta`. Raio `raio-boia`, como as boias da Raia.
- **Status** (`gnu-status` + `gnu-status__ponto`): ponto `sucesso` que pulsa num ciclo de `tempo-remada`; `gnu-status--alerta` para avisos. Sempre com texto: a cor nunca fala sozinha.

O consumidor fornece o texto e, nos chips, o estado. Não use emoji, nem ícone dentro de etiqueta.
