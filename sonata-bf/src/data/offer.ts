// Fonte da verdade da oferta. Nenhum número vive direto nos componentes.
// Todo valor pendente aparece como [A CONFIRMAR]. `npm run check:offer` falha se sobrar algum.

export const PENDING = "[A CONFIRMAR]";

const precoDe = 9600;
const precoPor = 6490;
const parcelas = 18;
const valorParcela = 400;

const brl = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export const offer = {
  // Números
  precoDe,
  precoPor,
  desconto: precoDe - precoPor, // 3110
  parcelas,
  valorParcela,
  totalParcelado: parcelas * valorParcela, // 7200

  // Textos formatados
  precoDeTxt: brl(precoDe),
  precoPorTxt: brl(precoPor),
  descontoTxt: "Mais de R$ 3 mil de desconto",
  parcelaTxt: `${parcelas}x de ${brl(valorParcela)}`,
  totalParceladoTxt: brl(parcelas * valorParcela),

  // Marca e contato (pendentes)
  marca: "Sonata",
  modelo: "RIC Recarregável", // tipo do aparelho (nome comercial do modelo segue sem confirmação)
  whatsapp: PENDING,
  endereco: PENDING,
  logo: "SONATA / aparelhos auditivos", // placeholder até chegar o logo
  juros: `juros de cerca de 1,1% ao mês ${PENDING}`,
  textoLegal: PENDING, // texto legal fornecido pela Sonata
  protecaoAgua: null as string | null, // só aparece se confirmada

  // Fixos
  estoque: "Oferta válida enquanto durarem os estoques",
  data: "27/11/2026",
};

export const seloFixo = `${offer.parcelaTxt} ou ${offer.precoPorTxt} à vista`;

export const rodapeLegal =
  `Preço à vista ${offer.precoPorTxt}. Parcelado em ${offer.parcelaTxt}, ` +
  `total ${offer.totalParceladoTxt}, ${offer.juros}. ${offer.textoLegal}`;

// Conferência por código
if (offer.desconto !== 3110) throw new Error("Desconto errado");
if (offer.totalParcelado !== 7200) throw new Error("Total parcelado errado");
