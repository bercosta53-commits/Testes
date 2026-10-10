# Momon

Um amigo gatinho para crianças de 3 a 5 anos. É um app web estático, sem build e sem dependências.

O Momon é emburradinho, mas muito carinhoso. O carinho e a atenção vão deixando ele feliz e pertinho.

## Onde estamos

**V1, passo 1 de 5:** o desenho do Momon e a página de teste com as expressões. Este passo está esperando validação antes de seguir para a cena, o carinho, o "amassar pãozinho" e o dormir.

## Ver a página de teste

Abra `teste-expressoes.html` direto no navegador. Os scripts são clássicos, sem módulos ES, então a página funciona até aberta como arquivo.

Ou sirva a pasta:

```sh
npx serve momon
# http://localhost:3000/teste-expressoes
```

## Humores

- **Do emburrado ao feliz**, o caminho que o carinho faz: `emburrado`, `desconfiado`, `amolecendo`, `contente` e `feliz`. Emburrado é bico e nariz empinado, nunca bravo nem triste.
- **Momentos especiais:** `ronronando`, `dormindo` e `surpreso` (curioso).

## Arquivos

| Arquivo | O que tem |
|---|---|
| `assets/momon.svg.js` | O desenho do Momon. `Momon.svg.criar({ humor })` devolve o `<svg>` com as 16 partes em `<g id>` separados. |
| `assets/momon.css` | Os humores (`data-humor` no `<svg>`) e as transições entre eles. |
| `teste-expressoes.html` | A progressão, os momentos especiais, um palco para trocar de humor e a checagem das partes. |

O estilo é levemente 3D: sem contorno, com luz e sombra em gradientes e nenhum filtro, para animar leve em tablet. Esquerda e direita (`pata-esq`, `orelha-dir` etc.) são as da tela, não as do gato.
