# Momon

Um amigo gatinho para crianças de 3 a 5 anos. É um app web estático, sem build e sem dependências.

## Onde estamos

**V1, passo 1 de 5:** o desenho do Momon em SVG e a página de teste com os cinco estados de expressão. Este passo está esperando validação antes de seguir para a cena, o carinho, o "amassar pãozinho" e o dormir.

## Ver a página de teste

Abra `teste-expressoes.html` direto no navegador. Os scripts são clássicos, sem módulos ES, então a página funciona até aberta como arquivo.

Ou sirva a pasta:

```sh
npx serve momon
# http://localhost:3000/teste-expressoes
```

## Arquivos

| Arquivo | O que tem |
|---|---|
| `assets/momon.svg.js` | O desenho do Momon. `Momon.svg.criar({ humor })` devolve o `<svg>` com as 16 partes em `<g id>` separados. |
| `assets/momon.css` | As expressões (`data-humor` no `<svg>`) e as transições entre elas. |
| `teste-expressoes.html` | Mostra os cinco estados lado a lado, um palco para trocar de humor e a checagem das partes. |

Os humores são `neutro`, `feliz`, `ronronando`, `dormindo` e `surpreso`. Esquerda e direita (`pata-esq`, `orelha-dir` etc.) são as da tela, não as do gato.
