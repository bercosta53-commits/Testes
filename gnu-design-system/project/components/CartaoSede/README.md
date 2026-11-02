# CartaoSede

Cartão de uma sede: foto aérea, nome, endereço e o que há lá. Substitui a polaroide com tachinha.

**Estrutura:** `a.gnu-sede` → `figure.gnu-imagem.gnu-imagem--4x3` com `figcaption.gnu-imagem__agua` (a linha d'água) → `gnu-sede__corpo` com `gnu-sede__nome` (condensado 36px), endereço (`corpo-p`, `tinta-suave`, `gnu-num`), `gnu-sede__lista` (até 4 itens curtos) e `gnu-sede__rodape` com a seta.

**O consumidor fornece:** foto (vista aérea ou retrato de uso, 4:3), nome da sede, endereço completo, de 2 a 4 diferenciais e o link.

**Comportamento:** o cartão inteiro é o link. No hover a foto aproxima 4% em `tempo-4` com `curva-deslize`, a seta avança e entra `sombra-1`. Foco de teclado com anel `foco`.

**Regras**
- Fotos retas, sem rotação, moldura, tachinha ou vinheta.
- Grade de 2 colunas no desktop para as quatro sedes; 1 coluna no celular.
- Diferenciais com fatos ("10 salões"), não adjetivos ("verdadeiro oásis").
- Na prévia, a sede náutica usa o texto do site atual; confirme o funcionamento antes de publicar.
