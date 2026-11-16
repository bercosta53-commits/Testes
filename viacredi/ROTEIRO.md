# Campanha playbook Viacredi × Ubots: roteiros dos 2 vídeos

Formato: 9:16, 1080×1920, 30 fps. Linguagem nova: editorial em grade (ver "Sistema visual" no fim).

---

## Vídeo 1: "Regra atrás de regra" (atração, ~25 s)

Papel na campanha: parar o scroll com a ideia do ebook (empilhar regras deixa o agente robótico). Fala com quem já testou bot de fluxo ou IA e se frustrou.

### Locução (colar no ElevenLabs)

```
Não fale sobre isso. Não responda aquilo. Não ofereça. Não saia do roteiro. <break time="0.6s" />
A Viacredi começou assim o agente de IA que vende crédito no WhatsApp: uma regra nova a cada ajuste. E a conversa foi ficando com cara de robô. <break time="0.5s" />
Em julho, eles cortaram regras e escreveram o papel do agente. <break time="0.4s" />
Ainda na fase de testes, foram mais de 150 mil reais em crédito liberado. <break time="0.5s" />
O método completo está no playbook. Baixe grátis.
```

### Decupagem

| Tempo (aprox.) | Locução | Tela |
|---|---|---|
| 0–5 s | "Não fale sobre isso… Não saia do roteiro." | Fundo creme. Cada regra entra em Poppins enorme, alinhada à esquerda, com número de linha e marca-texto amarelo (o editor da pág. 3 do ebook). A cada regra o bloco encolhe e outra entra; contador no topo: REGRAS 01 → 37. No fim a tela está lotada e ilegível. |
| 5–11 s | "A Viacredi começou assim… cara de robô." | Corte seco para preto. Bolha macro, cortada pela borda: "Não entendi sua resposta. Responda SIM ou NÃO." Ela se repete 3× empilhada (o loop do bot). Linha de anotação: "Conversa resultante · tom robótico". |
| 11–16 s | "Em julho, eles cortaram regras e escreveram o papel do agente." | Corte seco para amarelo. As regras voltam e são riscadas uma a uma e caem. Sobra um formulário limpo "Papel do agente": 01 Objetivo, 02 Público, 03 Oferta, 04 Tom, 05 Transbordo, 06 Fechamento (pág. 9). |
| 16–21 s | "Ainda na fase de testes… crédito liberado." | Preto. "+R$ 150 mil" ocupando a largura toda, entrando por máscara. Rodapé legal: "Os resultados da Viacredi não constituem projeção para outras instituições." |
| 21–25 s | "O método completo está no playbook. Baixe grátis." | Creme. Capa do playbook montada em grade, botão "Baixe o playbook grátis", logos Ubots | Viacredi. |

---

## Vídeo 2: "A cozinha" (caso + conversão, ~32 s)

Papel na campanha: provar com uma conversa real (reconstituída) que o método funciona, e fechar com o número.

### Locução (colar no ElevenLabs)

```
Uma cooperada da Viacredi recebeu uma oferta de crédito pelo WhatsApp. E respondeu que já tinha um. <break time="0.5s" />
O agente de IA não insistiu. Perguntou o que ela estava planejando. <break time="0.5s" />
Ela contou que estava reformando a cozinha. O agente seguiu o assunto e mostrou como a linha de crédito ajudava na obra. <break time="0.4s" />
Ela decidiu contratar, numa conversa que não seguiu roteiro nenhum. <break time="0.6s" />
Ainda na fase de testes, foram mais de 150 mil reais em crédito liberado. <break time="0.5s" />
Como a Viacredi chegou nisso está no playbook. Baixe grátis.
```

### Decupagem

| Tempo (aprox.) | Locução | Tela |
|---|---|---|
| 0–4 s | "Uma cooperada… já tinha um." | Preto. Bolha verde macro: "Já tenho um crédito contratado, mas achei bom saber que tem outro disponível." Metadado: COOPERADA · 14:21. |
| 4–9 s | "O agente de IA não insistiu…" | Creme. Bolha do agente entra; linha de anotação puxa o rótulo "01 Escuta". |
| 9–15 s | "Ela contou que estava reformando a cozinha…" | A palavra COZINHA em tipografia gigante, vazando da tela; bolha "Estou reformando a cozinha." por cima. Rótulo "02 Contexto". |
| 15–21 s | "…mostrou como a linha de crédito ajudava na obra." | Bolha do agente com a oferta. Rótulo "03 Oferta com sentido". |
| 21–25 s | "Ela decidiu contratar…" | "Quero! Vou contratar para terminar a obra." + selo "✓ Contratação". Rótulo "04 Decisão da cooperada". A câmera recua e mostra a conversa inteira com as 4 anotações ligadas por linhas (pág. 5 do ebook). |
| 25–29 s | "Ainda na fase de testes…" | Amarelo. "+R$ 150 mil" gigante. Rodapé legal. |
| 29–32 s | "Como a Viacredi chegou nisso…" | CTA igual ao do vídeo 1 (mesma assinatura de campanha). |

Rodapé nas cenas de conversa: "Reconstituição a partir do relato do projeto." (mesma nota da pág. 5).

---

## ElevenLabs: como gerar

**Locução**
- Modelo: Eleven Multilingual v2 (aceita as tags `<break>`). Se usar o v3, apague as tags e deixe só a pontuação.
- Voz: brasileira, feminina ou masculina, tom de conversa, sem "voz de locutor de rádio".
- Ajustes de partida: Stability 45, Similarity 75, Style 15–20, Speed 1.0.
- Exportar em WAV (ou MP3 320), um arquivo por vídeo.

**Trilha** (Eleven Music, sem vocal, um arquivo por vídeo, exportar separada da locução)
- V1 (25 s): "Minimal electronic, 112 BPM. First 5 seconds: tight percussive clicks stacking up, tension rising. Hard stop to near-silence at 5s. From 11s, warm open synth chords and a soft kick enter. Single deep impact hit at 16s. Short confident outro. No vocals."
- V2 (32 s): "Warm intimate lo-fi house, 100 BPM, soft electric piano and light shaker, gentle build. Short riser at 24s into a bright impact at 25s. End on a sustained chord. No vocals."

Mandem locução e trilha em arquivos separados. A mixagem (trilha abaixando sob a voz) e o sincronismo palavra a palavra das legendas eu faço aqui.

---

## Sistema visual (vale para os dois)

- Grade assimétrica, alinhada à esquerda, margem de 72 px. Barra de metadados no topo (PLAYBOOK · VIACREDI × UBOTS / contador).
- Só Poppins (títulos) e Nunito (texto e interface), como no ebook. Contraste por escala: palavras de 180–260 px que vazam da tela.
- Blocos de cor chapada: amarelo #FDC348, preto #070401, creme #FFFDF9. Sem bokeh, sem desfoque.
- Interface só em recorte macro (a bolha, o valor), nunca o celular inteiro.
- As ondas (≈) do ebook viram elemento animado.
- Cortes secos no tempo da trilha.
- Legenda: sem pílula. Texto alinhado à esquerda no terço inferior; as palavras acendem conforme a fala.
- Área segura do Reels: nada importante acima de 220 px nem abaixo de 1500 px.
