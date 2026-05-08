"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Stethoscope, Mail, Lock, AlertCircle } from "lucide-react"

interface Nurse {
  id: string
  name: string
  coren: string
  email: string
  password: string
}

export default function LoginEnfermeiro() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Verificar se já está logado
  useEffect(() => {
    const currentNurse = localStorage.getItem("currentNurse")
    if (currentNurse) {
      router.push("/enfermeiro")
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Simular delay de requisição
    setTimeout(() => {
      // Buscar enfermeiros cadastrados
      const nursesData = localStorage.getItem("nurses")
      const nurses: Nurse[] = nursesData ? JSON.parse(nursesData) : []

      // Buscar enfermeiro pelo email
      const nurse = nurses.find((n) => n.email.toLowerCase() === email.toLowerCase())

      if (!nurse) {
        setError("E-mail não encontrado")
        setLoading(false)
        return
      }

      if (nurse.password !== password) {
        setError("Senha incorreta")
        setLoading(false)
        return
      }

      // Login bem-sucedido - salvar sessão
      localStorage.setItem("currentNurse", JSON.stringify({
        id: nurse.id,
        name: nurse.name,
        coren: nurse.coren,
        email: nurse.email,
      }))

      router.push("/enfermeiro")
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d334a] via-[#2a4a6a] to-[#1d334a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c8516d] mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TRIA</h1>
          <p className="text-white/70">Painel do Enfermeiro</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-[#1d334a] mb-6 text-center">
            Entrar no Sistema
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1d334a]">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-11 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1d334a]">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 border-gray-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#c8516d] hover:bg-[#b04460] text-white font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/enfermeiro/cadastro" className="text-[#5d77e2] hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Voltar ao menu de perfis
          </Link>
        </div>

        <p className="text-center text-white/50 text-xs mt-4">
          Sistema de Triagem Inteligente - Acesso Restrito
        </p>
      </div>
    </div>
  )
}
