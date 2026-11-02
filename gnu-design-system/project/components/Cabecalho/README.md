# Cabecalho

Barra superior única para o site institucional e a página de associação, que hoje têm cabeçalhos diferentes.

**Estrutura:** `header.gnu-cabecalho` → marca à esquerda → `nav` com `ul.gnu-nav` → um botão compacto à direita. Sobre fotografia: `gnu-cabecalho--sobre-foto` (transparente, texto `sobre-noite`, botão `gnu-btn--claro`). No celular, a navegação vira o botão `gnu-menu` (ícone de duas linhas desiguais, rótulo "Menu").

**Marca:** o selo oficial (brasão) não foi fornecido nesta versão. Até a entrega dos vetores oficiais, a marca é tipográfica: `gnu-marca` com "Grêmio Náutico · 1906" e "União" em Archivo expandido. O selo entra à esquerda do texto, com 32px de altura.

**Regras**
- No máximo 5 itens de navegação, com nomes que o sócio reconhece.
- O link atual ganha o sublinhado (`aria-current="page"`); o hover desenha o sublinhado da esquerda para a direita em `tempo-3`.
- Ao rolar, o cabeçalho sobre foto vira `fundo` com `sombra-1`.
- Sem breadcrumb em faixa escura separada: se necessário, entra como `gnu-rotulo` acima do título da página.
