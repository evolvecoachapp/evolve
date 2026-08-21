import { useCallback, useMemo, useState } from "react";
import {
  ATHLETE_SETUP_STEP_COUNT,
  ATHLETE_SETUP_STEPS,
  createEmptyAthleteSetupValues,
  needsTargetWeight,
  type AthleteSetupErrors,
  type AthleteSetupField,
  type AthleteSetupStep,
  type AthleteSetupValues,
} from "./models";
import { validateAthleteSetupStep } from "./validation";

export function useAthleteSetup(initial: AthleteSetupValues = createEmptyAthleteSetupValues()) {
  const [step, setStep] = useState<AthleteSetupStep>(ATHLETE_SETUP_STEPS.IDENTITY);
  const [values, setValues] = useState<AthleteSetupValues>(initial);
  const [fieldErrors, setFieldErrors] = useState<AthleteSetupErrors>({});

  const stepValidation = useMemo(
    () => validateAthleteSetupStep(values, step),
    [values, step],
  );

  const updateField = useCallback(
    <K extends AthleteSetupField>(field: K, value: AthleteSetupValues[K]) => {
      setValues((current) => {
        const next = { ...current, [field]: value };
        if (field === "goal" && !needsTargetWeight(value as AthleteSetupValues["goal"])) {
          next.targetWeightKg = "";
        }
        return next;
      });
      setFieldErrors((current) => {
        if (!(field in current)) {
          return current;
        }
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const goNext = useCallback((): boolean => {
    const result = validateAthleteSetupStep(values, step);
    setFieldErrors(result.errors);
    if (!result.isValid) {
      return false;
    }
    if (step < ATHLETE_SETUP_STEP_COUNT - 1) {
      setStep((current) => (current + 1) as AthleteSetupStep);
    }
    return true;
  }, [step, values]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    setStep((current) => Math.max(ATHLETE_SETUP_STEPS.IDENTITY, current - 1) as AthleteSetupStep);
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const result = validateAthleteSetupStep(values, step);
    setFieldErrors(result.errors);
    return result.isValid;
  }, [step, values]);

  return {
    step,
    values,
    fieldErrors,
    stepValidation,
    isLastStep: step === ATHLETE_SETUP_STEPS.INTENT,
    showTargetWeight: needsTargetWeight(values.goal),
    updateField,
    goNext,
    goBack,
    validateCurrentStep,
  };
}
