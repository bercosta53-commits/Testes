# Formulario

Campos para captar interesse e agendar visitas. Pede pouco, explica por quê e respeita a LGPD.

**Estrutura:** `form.gnu-form` → `gnu-campo` (rótulo `label` sempre visível acima, campo de 52px, `gnu-campo__ajuda` opcional) → `gnu-escolha` com chips para respostas curtas → `gnu-consentimento` → botão primário em bloco. Erro: `gnu-campo--erro` + `gnu-campo__erro` com ícone e frase que diz como corrigir. Progresso em etapas com a Raia (`gnu-raia--progresso`, boias `.on`).

**O consumidor fornece:** `id` estável em cada campo, `autocomplete` correto, mensagens de erro específicas e o destino do envio.

**Regras**
- Rótulo nunca dentro do campo: placeholder some ao digitar e prejudica a acessibilidade.
- Consentimento **desmarcado** por padrão. A caixa pré-marcada do formulário atual não vale como consentimento pela LGPD.
- No máximo 5 campos por etapa; "Motivo do contato" e "Planos" viram chips de escolha, não listas suspensas.
- Botão diz o que acontece ("Agendar visita"), não "Enviar formulário".
- Depois do envio: tela de confirmação com o próximo passo e prazo de retorno.
