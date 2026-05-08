"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Stethoscope, Mail, Lock, User, FileText, AlertCircle, CheckCircle2 } from "lucide-react"

interface Nurse {
  id: string
  name: string
  coren: string
  email: string
  password: string
}

export default function CadastroEnfermeiro() {
  const [name, setName] = useState("")
  const [coren, setCoren] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validações
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    if (!coren.trim()) {
      setError("O número do COREN é obrigatório")
      setLoading(false)
      return
    }

    // Simular delay de requisição
    setTimeout(() => {
      // Buscar enfermeiros existentes
      const nursesData = localStorage.getItem("nurses")
      const nurses: Nurse[] = nursesData ? JSON.parse(nursesData) : []

      // Verificar se email já existe
      if (nurses.some((n) => n.email.toLowerCase() === email.toLowerCase())) {
        setError("Este e-mail já está cadastrado")
        setLoading(false)
        return
      }

      // Verificar se COREN já existe
      if (nurses.some((n) => n.coren.toLowerCase() === coren.toLowerCase())) {
        setError("Este número de COREN já está cadastrado")
        setLoading(false)
        return
      }

      // Criar novo enfermeiro
      const newNurse: Nurse = {
        id: `nurse_${Date.now()}`,
        name: name.trim(),
        coren: coren.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      }

      // Salvar no localStorage
      nurses.push(newNurse)
      localStorage.setItem("nurses", JSON.stringify(nurses))

      setSuccess(true)
      setLoading(false)
    }, 800)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1d334a] via-[#2a4a6a] to-[#1d334a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d334a] mb-2">
              Conta Criada com Sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua conta foi criada. Você já pode fazer login no sistema.
            </p>
            <Link href="/enfermeiro/login">
              <Button className="w-full bg-[#5d77e2] hover:bg-[#4a64c9] text-white">
                Ir para o Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d334a] via-[#2a4a6a] to-[#1d334a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c8516d] mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TRIA</h1>
          <p className="text-white/70">Criar Conta de Enfermeiro</p>
        </div>

        {/* Card de Cadastro */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-[#1d334a] mb-6 text-center">
            Preencha seus dados
          </h2>

          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1d334a]">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="pl-10 h-11 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coren" className="text-[#1d334a]">Número do COREN</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="coren"
                  type="text"
                  value={coren}
                  onChange={(e) => setCoren(e.target.value)}
                  placeholder="Ex: 123456-SP"
                  className="pl-10 h-11 border-gray-200"
                  required
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10 h-11 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#1d334a]">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
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
                  Criando conta...
                </span>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/enfermeiro/login" className="text-[#5d77e2] hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Sistema de Triagem Inteligente - Acesso Restrito
        </p>
      </div>
    </div>
  )
}
