"use client"

import Link from "next/link"
import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { ClipboardList, Users, ArrowLeft } from "lucide-react"

interface MenuStepProps {
  onStartTriage: () => void
  onViewQueue: () => void
}

export function MenuStep({ onStartTriage, onViewQueue }: MenuStepProps) {
  return (
    <TriageCard title="Bem-vindo(a) à TRIA! Como posso ajudar?" animateTitle>
      <div className="flex flex-col items-center gap-6 py-4">
        <p className="text-[#1d334a]/80 text-sm text-center leading-relaxed">
          Selecione uma opção para continuar
        </p>

        <div className="w-full space-y-3">
          <Button
            onClick={onStartTriage}
            className="w-full bg-[#c8516d] hover:bg-[#b04460] text-white py-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
          >
            <ClipboardList className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold text-base">Iniciar Triagem</p>
              <p className="text-xs opacity-80 font-normal">Realizar nova triagem médica</p>
            </div>
          </Button>

          <Button
            onClick={onViewQueue}
            variant="outline"
            className="w-full border-2 border-[#5d77e2] text-[#5d77e2] hover:bg-[#5d77e2]/10 py-6 rounded-xl flex items-center justify-center gap-3 transition-all bg-transparent"
          >
            <Users className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold text-base">Ver Fila de Espera</p>
              <p className="text-xs opacity-70 font-normal">Consultar posição na fila</p>
            </div>
          </Button>
        </div>

        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-[#5d77e2] hover:text-[#4a62c4] text-xs font-medium transition-colors mt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao menu de perfis
        </Link>

        <p className="text-[#1d334a]/50 text-xs text-center mt-4">
          TRIA | Triagem Rápida Inteligente e Automatizada
        </p>
      </div>
    </TriageCard>
  )
}
