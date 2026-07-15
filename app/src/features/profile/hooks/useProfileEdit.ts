import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserUpdate } from "../../../types/api";
import type { UserProfile } from "../../shared/models";
import {
  buildProfileFormValues,
  hasFormValuesChanges,
  profileFormToUserUpdate,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormField,
  type ProfileFormValues,
} from "../utils";

interface UseProfileEditOptions {
  profile: UserProfile | null;
  displayName: string;
  username?: string | null;
  updateProfile: (data: UserUpdate) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProfileEdit({
  profile,
  displayName,
  username,
  updateProfile,
  refresh,
}: UseProfileEditOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormValues>(() =>
    buildProfileFormValues(profile, displayName, username),
  );
  const [baseline, setBaseline] = useState<ProfileFormValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validation = useMemo(() => validateProfileForm(form), [form]);
  const hasChanges = useMemo(
    () => (baseline ? hasFormValuesChanges(form, baseline) : false),
    [baseline, form],
  );
  const canSave = isEditing && hasChanges && validation.isValid && !saving;

  const resetFormFromProfile = useCallback(() => {
    setForm(buildProfileFormValues(profile, displayName, username));
  }, [displayName, profile, username]);

  const enterEditMode = useCallback(() => {
    const values = buildProfileFormValues(profile, displayName, username);
    setForm(values);
    setBaseline(values);
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    setIsEditing(true);

    const enterValidation = validateProfileForm(values);
    const enterFailingFields = Object.keys(enterValidation.errors) as ProfileFormField[];
    console.debug("[ProfileSaveState:validationAudit]", {
      validation: enterValidation,
      "validation.errors": enterValidation.errors,
      "validation.failingFields": enterFailingFields,
      "validation.messages": Object.values(enterValidation.errors),
    });
    console.debug("[ProfileSaveState:enterEditMode]", {
      profile,
      form: values,
      initialValues: values,
      hasChanges: false,
      "validation.isValid": enterValidation.isValid,
      canSave: false,
    });
  }, [displayName, profile, username]);

  const cancelEdit = useCallback(() => {
    if (baseline) {
      setForm(baseline);
    } else {
      resetFormFromProfile();
    }
    setBaseline(null);
    setFieldErrors({});
    setSubmitError(null);
    setIsEditing(false);
  }, [baseline, resetFormFromProfile]);

  const updateField = useCallback(
    <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => {
      console.debug("[ProfileSaveState:fieldChange]", { field, value });
      setForm((current) => ({ ...current, [field]: value }));
      setFieldErrors((current) => {
        if (!(field in current)) {
          return current;
        }
        const next = { ...current };
        delete next[field as ProfileFormField];
        return next;
      });
      setSubmitError(null);
    },
    [],
  );

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const failingFields = Object.keys(validation.errors) as ProfileFormField[];
    const failingMessages = Object.values(validation.errors);

    console.debug("[ProfileSaveState:validationAudit]", {
      validation,
      "validation.errors": validation.errors,
      "validation.failingFields": failingFields,
      "validation.messages": failingMessages,
      hasChanges,
      canSave,
      form,
    });

    console.debug("[ProfileSaveState:afterFieldChange]", {
      profile,
      form,
      initialValues: baseline,
      hasChanges,
      "validation.isValid": validation.isValid,
      canSave,
    });
  }, [baseline, canSave, form, hasChanges, isEditing, profile, validation]);

  const save = useCallback(async () => {
    const nextValidation = validateProfileForm(form);
    setFieldErrors(nextValidation.errors);

    if (!nextValidation.isValid || !baseline || !hasFormValuesChanges(form, baseline)) {
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      await updateProfile(profileFormToUserUpdate(form));
      await refresh();
      setBaseline(null);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }, [baseline, form, refresh, updateProfile]);

  return {
    isEditing,
    form,
    baseline,
    hasChanges,
    fieldErrors,
    submitError,
    successMessage,
    saving,
    canSave,
    enterEditMode,
    cancelEdit,
    updateField,
    save,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}
