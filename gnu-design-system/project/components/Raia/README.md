# Raia

A corda de raia da piscina, desenhada como uma fileira de boias. É o elemento gráfico assinatura do sistema: diz "esporte" sem precisar de foto.

**Estrutura:** `div.gnu-raia` com de 10 a 32 elementos `i` vazios. As boias alternam `uniao` e `agua`; as três de cada ponta ficam em `remo`, como nas piscinas de competição, onde as boias dos últimos 5 metros mudam de cor para avisar a parede. Raio `raio-boia`, vão `espaco-1`, altura 8px.

**Variações**
- `gnu-raia--noite`: boias brancas e `agua` sobre `noite`.
- `gnu-raia--progresso`: boias em `linha`; as concluídas recebem `.on` (`uniao`). Para formulários em etapas e carrosséis.
- `gnu-raia--carregando`: loader. Cada boia recebe `style="--n:<índice>"` e acende em sequência num ciclo de `tempo-remada` com `curva-puxada`.

**Regras**
- Sempre horizontal e de ponta a ponta do seu contêiner. Nunca diagonal, nunca como moldura.
- No máximo uma Raia decorativa por tela (as de progresso não contam).
- Nunca sobre fotografia, exceto encostada na base da imagem.
