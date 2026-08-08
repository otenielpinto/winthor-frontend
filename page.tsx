import Head from 'next/head'
import Header from './components/Header'
import Hero from './components/Hero'
import Benefits from './components/Benefits'
import SocialProof from './components/SocialProof'
import ServiceDetails from './components/ServiceDetails'
import FAQ from './components/FAQ'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import Reveal from './components/Reveal'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100">
      <Head>
        <title>Integração WinThor com Marketplaces | Otimize sua Gestão de Estoque</title>
        <meta name="description" content="Conecte seu sistema TOTVS WinThor aos maiores marketplaces. Aumente vendas, automatize processos e reduza erros com nossa solução de integração completa." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="flex-grow">
        <Hero />
        <Reveal>
          <Benefits />
        </Reveal>
        <Reveal delay={100}>
          <SocialProof />
        </Reveal>
        <Reveal delay={200}>
          <ServiceDetails />
        </Reveal>
        <Reveal delay={300}>
          <FAQ />
        </Reveal>
        <Reveal delay={400}>
          <CTASection />
        </Reveal>
      </main>

      <Footer />
    </div>
  )
}

