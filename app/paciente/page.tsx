"use client"

import { useState } from "react"
import { TriaLogo } from "@/components/tria-logo"
import { MenuStep } from "@/components/triage-steps/menu-step"
import { PublicQueueStep } from "@/components/triage-steps/public-queue-step"
import { PersonalDataStep, type PersonalData } from "@/components/triage-steps/personal-data-step"
import { SymptomsStep } from "@/components/triage-steps/symptoms-step"
import { SymptomsDurationStep } from "@/components/triage-steps/symptoms-duration-step"
import { PainScaleStep } from "@/components/triage-steps/pain-scale-step"
import { ComorbiditiesStep, type Comorbidities } from "@/components/triage-steps/comorbidities-step"
import { ClassificationStep } from "@/components/triage-steps/classification-step"

type Step = "menu" | "public-queue" | "personal-data" | "symptoms" | "symptoms-duration" | "pain-scale" | "comorbidities" | "classification"

export default function TriagePage() {
  const [currentStep, setCurrentStep] = useState<Step>("menu")
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: "",
    birthDate: "",
    ethnicity: "",
    gender: "",
    genderOther: "",
  })
  const [symptoms, setSymptoms] = useState("")
  const [symptomsDuration, setSymptomsDuration] = useState("")
  const [painScale, setPainScale] = useState(0)
  const [comorbidities, setComorbidities] = useState<Comorbidities>({
    pressaoAlta: false,
    diabetes: false,
    cardiopatia: false,
    doencaRenal: false,
    doencaRespiratoria: false,
    outro: false,
  })

  const handleStartTriage = () => {
    setCurrentStep("personal-data")
  }

  const handleViewQueue = () => {
    setCurrentStep("public-queue")
  }

  const handleBackToMenu = () => {
    setCurrentStep("menu")
  }

  const handlePersonalDataConfirm = () => {
    setCurrentStep("symptoms")
  }

  const handleSymptomsConfirm = () => {
    setCurrentStep("symptoms-duration")
  }

  const handleSymptomsDurationConfirm = () => {
    setCurrentStep("pain-scale")
  }

  const handlePainScaleConfirm = () => {
    setCurrentStep("comorbidities")
  }

  const handleComorbiditiesConfirm = () => {
    setCurrentStep("classification")
  }

  const handleRestart = () => {
    setPersonalData({ name: "", birthDate: "", ethnicity: "", gender: "", genderOther: "" })
    setSymptoms("")
    setSymptomsDuration("")
    setPainScale(0)
    setComorbidities({
      pressaoAlta: false,
      diabetes: false,
      cardiopatia: false,
      doencaRenal: false,
      doencaRespiratoria: false,
      outro: false,
    })
    setCurrentStep("menu")
  }

  const getProgressSteps = () => {
    // Não mostrar progresso no menu ou fila pública
    if (currentStep === "menu" || currentStep === "public-queue") {
      return []
    }
    return ["personal-data", "symptoms", "symptoms-duration", "pain-scale", "comorbidities", "classification"]
  }

  const progressSteps = getProgressSteps()
  const currentIndex = progressSteps.indexOf(currentStep)

  const handleGoBackToPersonalData = () => {
    setCurrentStep("personal-data")
  }

  const handleGoBackToSymptoms = () => {
    setCurrentStep("symptoms")
  }

  const handleGoBackToSymptomsDuration = () => {
    setCurrentStep("symptoms-duration")
  }

  const handleGoBackToPainScale = () => {
    setCurrentStep("pain-scale")
  }

  const handleGoBackToComorbidities = () => {
    setCurrentStep("comorbidities")
  }

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
        {currentStep === "menu" && (
          <MenuStep onStartTriage={handleStartTriage} onViewQueue={handleViewQueue} />
        )}
        {currentStep === "public-queue" && (
          <PublicQueueStep onGoBack={handleBackToMenu} />
        )}
        {currentStep === "personal-data" && (
          <PersonalDataStep
            data={personalData}
            onDataChange={setPersonalData}
            onConfirm={handlePersonalDataConfirm}
            onGoBack={handleBackToMenu}
          />
        )}
        {currentStep === "symptoms" && (
          <SymptomsStep
            symptoms={symptoms}
            onSymptomsChange={setSymptoms}
            onConfirm={handleSymptomsConfirm}
            onGoBack={handleGoBackToPersonalData}
          />
        )}
        {currentStep === "symptoms-duration" && (
          <SymptomsDurationStep
            duration={symptomsDuration}
            onDurationChange={setSymptomsDuration}
            onConfirm={handleSymptomsDurationConfirm}
            onGoBack={handleGoBackToSymptoms}
          />
        )}
        {currentStep === "pain-scale" && (
          <PainScaleStep
            painScale={painScale}
            onPainScaleChange={setPainScale}
            onConfirm={handlePainScaleConfirm}
            onGoBack={handleGoBackToSymptomsDuration}
          />
        )}
        {currentStep === "comorbidities" && (
          <ComorbiditiesStep
            comorbidities={comorbidities}
            onComorbiditiesChange={setComorbidities}
            onConfirm={handleComorbiditiesConfirm}
            onGoBack={handleGoBackToPainScale}
          />
        )}
        {currentStep === "classification" && (
          <ClassificationStep
            symptoms={symptoms}
            patientData={personalData}
            symptomsDuration={symptomsDuration}
            painScale={painScale}
            comorbidities={comorbidities}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 pb-8">
        {progressSteps.map((step, index) => {
          const isActive = index <= currentIndex
          const isCurrent = index === currentIndex
          return (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                isCurrent ? "w-6 bg-[#cbfefe]" : isActive ? "w-2 bg-[#cbfefe]" : "w-2 bg-[#3d5570]"
              }`}
            />
          )
        })}
      </div>
    </main>
  )
}
