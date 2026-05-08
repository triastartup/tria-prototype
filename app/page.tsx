"use client"

import Link from "next/link"
import { TriaLogo } from "@/components/tria-logo"
import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { User, Stethoscope, FlaskConical } from "lucide-react"

export default function SelecionarPerfilPage() {
  return (
    <main className="min-h-screen bg-[#1d334a] flex flex-col relative overflow-hidden">
      {/* Radial gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, #5d77e2 0%, #2a4563 40%, #1d334a 70%)",
          opacity: 0.6
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 30% 20%, #5d77e280 0%, transparent 40%)",
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 70% 80%, #c8516d30 0%, transparent 35%)",
        }}
      />

      {/* Header with Logo */}
      <header className="w-full py-6 px-8 flex justify-center md:justify-start relative z-10">
        <TriaLogo className="h-23 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12 relative z-10">
        <TriageCard title="Selecione o Perfil de Acesso" animateTitle>
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Badge de Protótipo */}
            <div className="flex items-center gap-2 bg-[#f5c542]/20 text-[#b5941e] px-3 py-1.5 rounded-full text-xs font-medium">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Ambiente de Protótipo</span>
            </div>

            <p className="text-[#1d334a]/80 text-sm text-center leading-relaxed">
              Este é um protótipo do sistema TRIA. Selecione um perfil para explorar as diferentes interfaces.
            </p>

            <div className="w-full space-y-3">
              <Button
                asChild
                className="w-full bg-[#5d77e2] hover:bg-[#4a62c4] text-white py-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
              >
                <Link href="/paciente">
                  <User className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold text-base">Visão do Paciente</p>
                    <p className="text-xs opacity-80 font-normal">Triagem e acompanhamento de fila</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="w-full bg-[#c8516d] hover:bg-[#b04460] text-white py-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
              >
                <Link href="/enfermeiro/login">
                  <Stethoscope className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold text-base">Visão do Enfermeiro</p>
                    <p className="text-xs opacity-80 font-normal">Gerenciamento da fila de atendimento</p>
                  </div>
                </Link>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-[#1d334a]/5 rounded-lg w-full">
              <p className="text-[#1d334a]/60 text-xs text-center leading-relaxed">
                <strong>Nota:</strong> Em produção, cada perfil teria seu próprio sistema de autenticação e controle de acesso.
              </p>
            </div>

            <p className="text-[#1d334a]/50 text-xs text-center mt-2">
              TRIA | Salvando Tempo, Recursos e Vidas
            </p>
          </div>
        </TriageCard>
      </div>
    </main>
  )
}
