import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ProfileSection } from "../models";

export interface ProfileSectionCardProps {
  readonly section: ProfileSection;
}

export function ProfileSectionCard({ section }: ProfileSectionCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: { flexDirection: "row" as const, alignItems: "center" as const, gap: spacing.md },
    text: { flex: 1, gap: 2 },
    title: { ...typography.callout },
    subtitle: { ...typography.caption, color: colors.inkMuted },
    icon: { color: colors.inkMuted },
    chevron: { color: colors.inkMuted },
  }));

  return (
    <AppCard variant="surface">
      <View style={styles.row}>
        <Ionicons name={section.icon as keyof typeof Ionicons.glyphMap} size={22} color={styles.icon.color} />
        <View style={styles.text}>
          <Text style={styles.title}>{section.title}</Text>
          <Text style={styles.subtitle}>{section.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={styles.chevron.color} />
      </View>
    </AppCard>
  );
}
