import { Text, View, type TextStyle } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  parseCoachMarkdown,
  type CoachMarkdownInline,
} from "../utils/coachMarkdown";

interface CoachMarkdownTextProps {
  readonly content: string;
  readonly style: TextStyle;
}

function InlineText({
  inlines,
  style,
  boldStyle,
}: {
  readonly inlines: readonly CoachMarkdownInline[];
  readonly style: TextStyle;
  readonly boldStyle: TextStyle;
}) {
  return (
    <Text style={style}>
      {inlines.map((inline, index) =>
        inline.type === "bold" ? (
          <Text key={`b-${index}`} style={boldStyle}>
            {inline.value}
          </Text>
        ) : (
          inline.value
        ),
      )}
    </Text>
  );
}

/** Renders coach reply text with bold, line breaks, and simple lists. */
export function CoachMarkdownText({ content, style }: CoachMarkdownTextProps) {
  const styles = useThemedStyles(() => ({
    stack: {
      gap: spacing.sm,
    },
    list: {
      gap: spacing.xs,
    },
    listRow: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      gap: spacing.sm,
    },
    itemBody: {
      flex: 1,
      minWidth: 0,
    },
    bold: {
      fontWeight: "700" as const,
    },
  }));

  const blocks = parseCoachMarkdown(content);

  if (blocks.length === 0) {
    return <Text style={style} />;
  }

  if (blocks.length === 1 && blocks[0]?.type === "paragraph") {
    return (
      <InlineText
        inlines={blocks[0].inlines}
        style={style}
        boldStyle={styles.bold}
      />
    );
  }

  return (
    <View style={styles.stack}>
      {blocks.map((block, blockIndex) => {
        if (block.type === "list") {
          return (
            <View key={`list-${blockIndex}`} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <View key={`item-${itemIndex}`} style={styles.listRow}>
                  <Text style={style}>
                    {block.ordered ? `${itemIndex + 1}.` : "•"}
                  </Text>
                  <View style={styles.itemBody}>
                    <InlineText
                      inlines={item}
                      style={style}
                      boldStyle={styles.bold}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        return (
          <InlineText
            key={`p-${blockIndex}`}
            inlines={block.inlines}
            style={style}
            boldStyle={styles.bold}
          />
        );
      })}
    </View>
  );
}
