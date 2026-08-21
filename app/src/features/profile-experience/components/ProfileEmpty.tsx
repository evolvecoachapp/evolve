import { View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { EmptyState } from "../../../components/EmptyState";
import { spacing } from "../../../theme/theme";

export interface ProfileEmptyProps {
  readonly onCompleteSetup?: () => void;
}

export function ProfileEmpty({ onCompleteSetup }: ProfileEmptyProps) {
  return (
    <View style={{ gap: spacing.lg }}>
      <EmptyState
        icon="person-outline"
        title="Finish your athlete setup"
        subtitle="Complete your profile so coaching, training, and nutrition can use your real numbers."
      />
      {onCompleteSetup ? (
        <AppButton
          label="Complete athlete setup"
          size="lg"
          onPress={onCompleteSetup}
        />
      ) : null}
    </View>
  );
}
