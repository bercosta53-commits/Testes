# Botão

Um botão primário por tela, para a ação que a página existe para provocar.

**Classes:** `gnu-btn` + uma variante: `gnu-btn--primario` (preenchido em `acao`, texto `sobre-acao`), `gnu-btn--secundario` (contorno em `tinta`), `gnu-btn--texto` (sublinhado, herda a cor), e para faixas `noite` e fotografia: `gnu-btn--claro` e `gnu-btn--contorno-claro`. Tamanho compacto: `gnu-btn--p`. Largura total no celular: `gnu-btn--bloco`.

**O consumidor fornece:** o rótulo (verbo no infinitivo, caixa normal, até 3 palavras) e, no primário, a seta `gnu-seta` opcional, que avança 4px no hover com `curva-deslize`.

**Faça**
- "Agendar visita", "Consultar valores", "Ver títulos", "Quero me associar".
- Primário + texto lado a lado; o secundário só quando as duas ações têm peso parecido.
- Estado desabilitado com rótulo que explica: "Enviando…".

**Não faça**
- CAIXA ALTA ("QUERO CONSULTAR VALORES DISPONÍVEIS"), frases longas, dois primários juntos.
- Raio de boia (pílula) em botão: pílula é chip.
- Verde do WhatsApp como cor de botão. Use o componente Conversa.
