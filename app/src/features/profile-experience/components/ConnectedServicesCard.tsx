import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ConnectedServices } from "../models";

export interface ConnectedServicesCardProps {
  readonly connectedServices: ConnectedServices;
}

export function ConnectedServicesCard({ connectedServices }: ConnectedServicesCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    item: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    label: { ...typography.body },
    status: { ...typography.caption, color: colors.inkMuted },
    connected: { ...typography.caption, color: colors.pulse },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Connected Services</Text>
        {connectedServices.services.map((s) => (
          <View key={s.kind} style={styles.item}>
            <Text style={styles.label}>{s.label}</Text>
            <Text style={s.isConnected ? styles.connected : styles.status}>
              {s.isConnected ? "Connected" : "Not connected"}
            </Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
