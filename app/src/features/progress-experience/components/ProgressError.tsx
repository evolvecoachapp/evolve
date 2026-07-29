import { View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { EmptyState } from "../../../components/EmptyState";
import type { ProgressErrorState } from "../models";

export interface ProgressErrorProps { readonly error: ProgressErrorState; readonly onRetry: () => void; }

export function ProgressError({ error, onRetry }: ProgressErrorProps) {
  return (
    <View>
      <EmptyState icon="alert-circle-outline" title="Analytics unavailable" subtitle={error.message} />
      <AppButton label="Retry" onPress={onRetry} />
    </View>
  );
}
