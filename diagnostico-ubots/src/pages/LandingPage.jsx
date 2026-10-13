import { ArrowRight, Check, ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { usePageTitle } from "../lib/util";

const fotoEquipe = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85";
const fotoConversa = "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1300&q=85";
const botao = "inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#FFC800] px-7 py-3 font-semibold text-[#141414] transition hover:bg-[#f0bc00] focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#141414]";
const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const titulo = "font-bold leading-[1.12] tracking-[-0.035em] text-[clamp(2rem,4vw,3.6rem)]";

function Cta({ children = "Fazer meu diagnóstico gratuito" }) {
  return <Link to="/diagnostico?utm_content=lp-humanizada" className={botao}>{children}<ArrowRight size={19} aria-hidden="true"/></Link>;
}
export default function LandingPage() {
  usePageTitle("Diagnóstico de recuperação de crédito com IA | Ubots");
  return <div className="bg-[#FFFBEF] text-[#141414]">
    <header className={container + " flex items-center justify-between gap-4 py-6"}>
      <Logo />
      <a href="#como-funciona" className="hidden text-sm font-semibold underline underline-offset-4 sm:inline">Como funciona</a>
      <Link to="/diagnostico?utm_content=lp-header" className="rounded-full border border-[#141414] px-4 py-2 text-sm font-semibold hover:bg-white">Iniciar diagnóstico</Link>
    </header>
    <main>
      <section className={container + " grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-16"}>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[.14em] text-[#6B6558]">Recuperação de crédito com inteligência artificial</p>
          <h1 className={titulo + " max-w-[680px]"}>Sua carteira em atraso não espera. <span className="bg-[linear-gradient(transparent_66%,#FFC800_66%)]">Sua equipe não consegue estar em todas as negociações.</span></h1>
          <p className="mt-7 max-w-[590px] text-lg leading-[1.7] text-[#474238]">Recuperar crédito exige mais do que disparar mensagens. Exige entender a realidade de cada pessoa, negociar dentro de regras claras e ter tempo para acompanhar cada conversa.</p>
          <p className="mt-3 max-w-[590px] text-lg leading-[1.7] text-[#474238]">Descubra como a IA pode ampliar a capacidade da sua operação — e o que precisa estar preparado antes de começar.</p>
          <div className="mt-8"><Cta /></div>
          <p className="mt-4 text-sm text-[#6B6558]">10 perguntas · Cerca de 2 minutos · Resultado personalizado</p>
        </div>
        <figure className="relative overflow-hidden rounded-[28px] bg-[#E7E0D0]">
          <img src={fotoEquipe} alt="Profissionais colaborando em um ambiente de trabalho" className="h-[340px] w-full object-cover sm:h-[440px] lg:h-[520px]" fetchPriority="high"/>
          <figcaption className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 px-4 py-3 text-xs text-[#514C42] shadow-sm">Mais capacidade para negociar, sem perder de vista as pessoas. Fotografia ilustrativa.</figcaption>
        </figure>
      </section>
      <section className="bg-white py-20 sm:py-24">
        <div className={container + " grid gap-9 md:grid-cols-[.8fr_1.2fr] md:gap-20"}>
          <div><p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#6B6558]">A realidade da operação</p><h2 className={titulo}>Por trás de cada contrato em atraso, existe uma conversa que ainda precisa acontecer.</h2></div>
          <div className="space-y-5 text-lg leading-[1.75] text-[#474238]"><p>A equipe liga, envia mensagens, consulta sistemas, verifica condições e solicita aprovações. Enquanto isso, novas pendências entram na carteira.</p><p>Nem todo contato se transforma em acordo — e nem todo acordo se sustenta. A questão não é pressionar mais pessoas; é conseguir conversar melhor, com consistência e no momento certo.</p><p className="border-l-4 border-[#FFC800] pl-5 font-semibold text-[#141414]">E se a tecnologia cuidasse das etapas repetitivas para que sua equipe pudesse se concentrar nas negociações que realmente exigem uma pessoa?</p></div>
        </div>
      </section>
      <section className={container + " py-20 sm:py-24"}>
        <div className="max-w-3xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#6B6558]">Tecnologia + pessoas</p><h2 className={titulo}>IA não substitui a relação. Ajuda a dar escala a ela.</h2><p className="mt-6 text-lg leading-[1.7] text-[#474238]">Com regras de negociação definidas, acesso às informações necessárias e autorização para contato, um agente de IA pode iniciar conversas pelo WhatsApp, entender a capacidade de pagamento, apresentar alternativas compatíveis com a política da instituição e transferir exceções para um analista com o histórico organizado.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["01","Iniciar conversas","Abordar carteiras elegíveis pelo canal autorizado, de forma consistente."],
            ["02","Negociar com contexto","Apresentar condições dentro das regras e da capacidade de pagamento."],
            ["03","Envolver especialistas","Direcionar situações complexas para quem precisa decidir, com histórico."],
          ].map(([n,t,d])=><div key={n} className="rounded-2xl border border-[#ECE4CF] bg-white p-7"><span className="text-sm font-bold text-[#947000]">{n}</span><h3 className="mt-5 text-xl font-bold">{t}</h3><p className="mt-3 leading-relaxed text-[#6B6558]">{d}</p></div>)}
        </div>
      </section>
      <section className="bg-[#141414] py-20 text-white sm:py-24">
        <div className={container + " grid items-center gap-10 md:grid-cols-2 md:gap-16"}>
          <figure className="overflow-hidden rounded-[26px]"><img src={fotoConversa} alt="Pessoas em um ambiente de atendimento e conversa profissional" loading="lazy" className="h-[310px] w-full object-cover sm:h-[470px]"/><figcaption className="p-3 text-xs text-white/65">Imagem editorial ilustrativa, não um registro da operação Crediauc.</figcaption></figure>
          <div><p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#FFC800]">Na prática · Sicoob Crediauc</p><h2 className={titulo}>Mais conversas com inteligência. Mais atenção aos casos complexos.</h2><p className="mt-6 text-lg leading-[1.7] text-white/80">Na campanha Desenrola Brasil, a Crediauc utilizou um agente de IA da Ubots para apoiar negociações pelo WhatsApp. Com acompanhamento de um colaborador, foram renegociados:</p><div className="mt-7 flex flex-wrap gap-x-9 gap-y-5"><div><p className="text-4xl font-bold text-[#FFC800]">R$ 23,4 mil</p><p className="mt-2 text-sm text-white/70">Valor renegociado</p></div><div><p className="text-4xl font-bold text-[#FFC800]">6 contratos</p><p className="mt-2 text-sm text-white/70">Em cinco dias de campanha</p></div></div><p className="mt-7 text-sm leading-relaxed text-white/65">Resultado específico observado no case. Não representa garantia ou previsão de desempenho para outras instituições.</p></div>
        </div>
      </section>
      <section id="como-funciona" className={container + " py-20 sm:py-24"}>
        <div className="max-w-3xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#6B6558]">Seu diagnóstico</p><h2 className={titulo}>E na sua instituição? O que faz sentido automatizar primeiro?</h2><p className="mt-6 text-lg leading-[1.7] text-[#474238]">Responda dez perguntas simples sobre a carteira, a equipe, o ritmo dos acordos e as condições para iniciar a operação com IA. Receba uma análise aplicada à sua realidade — com limites claros e prioridades práticas.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[["Capacidade e potencial","Compare renegociações por mês, tempo para percorrer a carteira e valor renegociado estimado no primeiro mês."],["Prontidão em cinco dimensões","Avalie régua de cobrança, canais, política de negociação, acesso aos dados e consentimento/LGPD."],["Próximos passos personalizados","Descubra a prioridade da sua instituição: preparar a base, estruturar um piloto ou ampliar a operação."]].map(([a,b])=><article key={a} className="rounded-2xl border border-[#ECE4CF] bg-white p-7"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4C7]"><Check size={20}/></div><h3 className="text-xl font-bold">{a}</h3><p className="mt-3 leading-relaxed text-[#6B6558]">{b}</p></article>)}
        </div>
        <div className="mt-10"><Cta>Descobrir minha capacidade de recuperação</Cta><p className="mt-3 text-sm text-[#6B6558]">Gratuito · Estimativas, não garantias</p></div>
      </section>
      <section className="border-y border-[#ECE4CF] bg-white py-20">
        <div className={container}><h2 className="text-[clamp(1.8rem,3vw,2.7rem)] font-bold tracking-tight">Dois minutos para entender por onde começar.</h2><div className="mt-9 grid gap-7 md:grid-cols-3">{[["1","Conte como sua equipe negocia hoje."],["2","Mostre como funcionam as condições, os canais e os dados."],["3","Veja sua análise completa e decida os próximos passos."]].map(([n,t])=><div key={n} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFC800] font-bold">{n}</span><p className="pt-2 font-semibold leading-relaxed">{t}</p></div>)}</div><p className="mt-8 flex items-start gap-2 text-sm text-[#6B6558]"><ShieldCheck size={18} className="shrink-0"/>Antes de ver o resultado, solicitamos dados profissionais de contato e autorização para que a Ubots possa dar continuidade à conversa.</p></div>
      </section>
      <section className={container + " py-20 text-center sm:py-24"}><p className="mx-auto mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#6B6558]">Próximo passo</p><h2 className={titulo + " mx-auto max-w-3xl"}>A próxima conversa sobre recuperação de crédito pode começar com um diagnóstico melhor.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-[1.7] text-[#474238]">Nem toda operação está no mesmo momento. Descubra o que faz sentido para a sua instituição, com números estimados e prioridades práticas.</p><div className="mt-8 flex flex-wrap items-center justify-center gap-5"><Cta/><a href="https://ubots.com.br/" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">Entender a solução Ubots <ChevronRight size={16} className="inline"/></a></div></section>
    </main>
    <footer className={container + " flex flex-wrap items-center justify-between gap-3 border-t border-[#ECE4CF] py-7"}><Logo/><p className="text-xs leading-relaxed text-[#6B6558]">Estimativas ilustrativas baseadas nas respostas. Valor renegociado não é valor recebido.</p></footer>
  </div>;
}
