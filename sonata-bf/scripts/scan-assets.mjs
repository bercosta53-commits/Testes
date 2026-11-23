// Lista o que existe em public/assets e escreve src/data/assets.generated.ts.
// Roda antes do studio e do render. Assim a composição sabe o que é real e o que é placeholder.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(process.cwd(), "public");
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(join(root, "assets"))
  .map((p) => relative(root, p).split("\\").join("/"))
  .filter((p) => !p.endsWith(".gitkeep"))
  .sort();

writeFileSync(
  join(process.cwd(), "src/data/assets.generated.ts"),
  `// GERADO por scripts/scan-assets.mjs. Não editar.\nexport const presentAssets: string[] = ${JSON.stringify(files, null, 2)};\n`,
);
console.log(`assets: ${files.length} arquivos`);
