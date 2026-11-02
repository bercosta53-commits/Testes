# Formulario

O mesmo formulário de hoje, com os mesmos campos (nome, e-mail, telefone, motivo do contato, planos), com acabamento de alto padrão e correções de acessibilidade e LGPD.

**Estrutura:** `div.gnu-form-cartao` (fundo branco, `raio-2`, `sombra-cartao`) → título em dois pesos → `form.gnu-form` com `gnu-campo` (rótulo em caixa alta acima, campo só com fio inferior em `linha-forte`) → `gnu-consentimento` → botão primário em bloco.

**O que muda em relação a hoje**
- O rótulo sai de dentro do campo e fica sempre visível acima dele. O exemplo entra como placeholder.
- Os campos perdem a caixa cinza e ganham só um fio inferior, que engrossa em `foco` ao digitar.
- O consentimento passa a vir **desmarcado**. Caixa pré-marcada não vale como consentimento pela LGPD.
- O botão continua "Quero ser associado".

**O consumidor fornece:** `id` estável e `autocomplete` em cada campo, mensagens de erro específicas (`gnu-campo--erro` + `gnu-campo__erro`) e uma tela de confirmação com o próximo passo.
