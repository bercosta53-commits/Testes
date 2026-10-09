# Integração: LP da Ubots (Lovable) + HubSpot

## Como o diagnóstico entra na LP

O build gera `dist/ubots-diagnostico.js`: um único arquivo que registra o elemento `<ubots-diagnostico>`.
O CSS fica num Shadow DOM, então não herda nem vaza estilos da LP (testado com CSS global agressivo na página).

1. `npm run build` e publique o `dist/` (hoje no Vercel; o arquivo é servido com CORS aberto, ver `vercel.json`).
2. Na LP, carregue o script e use o elemento:

```html
<ubots-diagnostico
  portal-id="SEU_PORTAL_ID"
  form-guid="GUID_DO_FORM_DO_HUBSPOT"
  playbook-url="https://ubots.com.br/..."
  lista-interesse-url="https://ubots.com.br/..."
></ubots-diagnostico>
<script src="https://SEU-DOMINIO/ubots-diagnostico.js" defer></script>
```

Atributos opcionais: `form-guid-interesse` (form separado para o pedido de conversa; padrão: o mesmo form),
`utm-content` (padrão: o `utm_content` da URL). Também dá para configurar antes de carregar o script:
`window.UbotsDiagnosticoConfig = { hubspot: { portalId, formGuid } }`.

### Prompt para o Lovable

> Crie o componente `src/components/DiagnosticoUbots.tsx` que carrega o script
> `https://SEU-DOMINIO/ubots-diagnostico.js` uma única vez (com `useEffect`, criando a tag `<script>` se ainda não
> existir) e renderiza `React.createElement("ubots-diagnostico", { "portal-id": "...", "form-guid": "...", "playbook-url": "...", "lista-interesse-url": "..." })`.
> Use o componente na página `/diagnostico`, dentro de uma `<section>` com largura máxima de 1152px centralizada
> (`max-w-6xl mx-auto px-4`). Não altere o conteúdo nem os estilos do elemento: ele é autocontido (Shadow DOM) e já
> traz seu próprio visual. Mantenha o header e o footer padrão do site.

Se o TypeScript reclamar do elemento, use `createElement` (como acima) em vez de JSX.

## HubSpot

O envio usa a API pública de formulários (`POST api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`),
sem token. Cria/atualiza o contato pelo e-mail, associa o cookie `hubspotutk` (se o tracking do HubSpot estiver na LP)
e registra o consentimento.

**Importante:** a API só aceita campos que existam no formulário. Crie as propriedades abaixo no HubSpot e adicione-as ao
form como campos **ocultos** (exceto os 5 primeiros, que podem ser visíveis ou ocultos). Os nomes internos podem ser
trocados em `src/lib/config.js` (`hubspot.campos`).

| Campo do app | Propriedade (padrão) | Tipo sugerido |
| --- | --- | --- |
| Nome | `firstname` | padrão |
| E-mail | `email` | padrão |
| WhatsApp | `phone` | padrão |
| Instituição | `company` | padrão |
| Cargo/área | `diag_area_atuacao` | lista (as 6 áreas do formulário) ou texto |
| Tipo de instituição | `diag_tipo_instituicao` | texto |
| Nível | `diag_nivel_prontidao` | texto (Preparar a base / Pronta para piloto / Pronta para escalar) |
| Pontos | `diag_pontos` | texto (ex.: "7 de 15") |
| Renegociações/mês hoje | `diag_renegociacoes_mes_hoje` | número |
| Renegociações/mês com IA (mín./máx.) | `diag_renegociacoes_mes_ia_min`, `_max` | número |
| Potencial adicional 1º mês (mín./máx., R$) | `diag_potencial_adicional_min`, `_max` | número |
| Saldo em atraso estimado (R$) | `diag_saldo_atraso` | número |
| Ponto crítico | `diag_ponto_critico` | texto |
| Estimativa aproximada ("Não sei") | `diag_estimativa_aproximada` | texto (Sim/Não) |
| Respostas completas | `diag_respostas` | texto de várias linhas |
| Origem | `diag_origem` | texto (pos-tabela / cta-final / barra-fixa) |
| Pediu conversa | `diag_pediu_conversa` | texto (Sim) |
| Data do pedido | `diag_pedido_conversa_em` | texto (ISO 8601) |

- **Pedido de conversa:** o botão "Conversar com um especialista" faz um segundo envio do mesmo contato com
  `diag_pediu_conversa = Sim`. Use isso em um workflow do HubSpot (criar tarefa/negócio, notificar o SDR).
  Se o envio falhar, a pessoa vê um aviso e pode tentar de novo.
- **Lead nunca se perde:** se o envio do diagnóstico falhar, o resultado aparece mesmo assim e o lead fica numa fila no
  navegador (`ubots_diag_pendentes`), reenviada na próxima vez que o diagnóstico abrir.
- **Variáveis de build** (`.env`): `VITE_HUBSPOT_PORTAL_ID`, `VITE_HUBSPOT_FORM_GUID`,
  `VITE_HUBSPOT_FORM_GUID_INTERESSE`, `VITE_PLAYBOOK_URL`, `VITE_LISTA_INTERESSE_URL`. No embed, os atributos do
  elemento têm prioridade.
- Sem portal/form configurados, nada é enviado (modo de teste, só `console.info`).

## Eventos para analytics

O app dispara `window` `CustomEvent("ubots-diagnostico", { detail: { evento, ... } })` e faz `dataLayer.push`
(para o GTM) com `diagnostico_visualizado`, `diagnostico_iniciado`, `diagnostico_concluido`,
`diagnostico_lead_enviado` e `diagnostico_pedido_conversa`.
