import { useState, createContext, useContext } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Context para compartilhar estado entre steps
const WizardContext = createContext();

/**
 * Wizard - Componente de formulário multipasso
 *
 * Permite criar fluxos com múltiplas etapas, validação por step e navegação.
 *
 * Exemplo de uso:
 * ```jsx
 * <Wizard onComplete={handleComplete}>
 *   <Wizard.Step title="Dados Básicos">
 *     <form>...</form>
 *   </Wizard.Step>
 *   <Wizard.Step title="Endereço">
 *     <form>...</form>
 *   </Wizard.Step>
 * </Wizard>
 * ```
 */
export default function Wizard({ children, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepData, setStepData] = useState({});

  const steps = Array.isArray(children) ? children : [children];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const goToStep = (index) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStep(index);
    }
  };

  const nextStep = () => {
    if (!isLastStep) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    onComplete?.(stepData);
  };

  const updateStepData = (key, value) => {
    setStepData((prev) => ({ ...prev, [key]: value }));
  };

  const contextValue = {
    currentStep,
    totalSteps,
    completedSteps,
    stepData,
    updateStepData,
    nextStep,
    prevStep,
    goToStep,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            const stepNumber = index + 1;

            return (
              <div key={index} className="flex-1 relative">
                {/* Step Circle */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : isCompleted
                      ? 'border-success bg-success text-white'
                      : 'border-border bg-card text-muted'
                  }`}
                  onClick={() => isCompleted && goToStep(index)}
                  role="button"
                  tabIndex={isCompleted ? 0 : undefined}
                  aria-label={`Etapa ${stepNumber}: ${step.props.title}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check size={18} /> : stepNumber}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${isActive ? 'text-text' : 'text-muted'}`}>
                    {step.props.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < totalSteps - 1 && (
                  <div
                    className={`absolute top-5 left-full w-full h-0.5 -translate-x-1/2 transition-colors ${
                      isCompleted ? 'bg-success' : 'bg-border'
                    }`}
                    style={{ width: 'calc(100% - 2.5rem)' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-lg p-6 min-h-[300px]">
          {steps[currentStep]}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            {!isFirstStep && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft size={18} />
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            {isLastStep ? (
              <Button onClick={handleComplete}>
                <Check size={18} />
                Concluir
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Próximo
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}

// Step Component
Wizard.Step = function WizardStep({ children, title }) {
  return <div>{children}</div>;
};

// Hook para usar contexto do Wizard
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard deve ser usado dentro de um Wizard');
  }
  return context;
}
