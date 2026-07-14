import { useCallback, useMemo, useState } from "react";
import type { UserUpdate } from "../../../types/api";
import type { UserProfile } from "../../shared/models";
import {
  buildProfileFormValues,
  hasProfileFormChanges,
  profileFormToUserUpdate,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormField,
  type ProfileFormValues,
} from "../utils";

interface UseProfileEditOptions {
  profile: UserProfile | null;
  displayName: string;
  updateProfile: (data: UserUpdate) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProfileEdit({
  profile,
  displayName,
  updateProfile,
  refresh,
}: UseProfileEditOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormValues>(() =>
    buildProfileFormValues(profile, displayName),
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validation = useMemo(() => validateProfileForm(form), [form]);
  const hasChanges = useMemo(
    () => hasProfileFormChanges(form, profile),
    [form, profile],
  );
  const canSave = isEditing && hasChanges && validation.isValid && !saving;

  const resetFormFromProfile = useCallback(() => {
    setForm(buildProfileFormValues(profile, displayName));
  }, [displayName, profile]);

  const enterEditMode = useCallback(() => {
    resetFormFromProfile();
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  }, [resetFormFromProfile]);

  const cancelEdit = useCallback(() => {
    resetFormFromProfile();
    setFieldErrors({});
    setSubmitError(null);
    setIsEditing(false);
  }, [resetFormFromProfile]);

  const updateField = useCallback(
    <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => {
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

  const save = useCallback(async () => {
    const nextValidation = validateProfileForm(form);
    setFieldErrors(nextValidation.errors);

    if (!nextValidation.isValid || !hasProfileFormChanges(form, profile)) {
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      await updateProfile(profileFormToUserUpdate(form));
      await refresh();
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }, [form, profile, refresh, updateProfile]);

  return {
    isEditing,
    form,
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
