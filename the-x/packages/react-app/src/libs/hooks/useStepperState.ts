import { useState } from "react";
import { StepStates } from "../../components/Stepper";

function useStepperState(steps: string[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [states, setStates] = useState<StepStates[]>(
    steps.map((step, index) => {
      if (index === 0) {
        return StepStates.current;
      }
      return StepStates.todo;
    })
  );

  function updateCurrentStep(next: number) {
    let newStates = [...states];
    newStates[currentStep] = StepStates.started;
    newStates[next] = StepStates.current;
    setCurrentStep(next);
    setStates(newStates);
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      updateCurrentStep(currentStep + 1);
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      updateCurrentStep(currentStep - 1);
    }
  }

  return {
    currentStep,
    updateCurrentStep,
    states,
    steps,
    nextStep,
    previousStep,
  };
}

export default useStepperState;
