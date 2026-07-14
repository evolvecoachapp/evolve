import type { ProgressInsight } from "../models/ProgressInsight";

export const mockProgressInsightsData: ProgressInsight[] = [
  {
    id: "insight-1",
    type: "positive",
    title: "Strength trending up",
    message: "Your compound lifts improved 12% over the last 4 weeks.",
    metric: "+12%",
  },
  {
    id: "insight-2",
    type: "positive",
    title: "Consistent training",
    message: "You hit 5 consecutive workout days — keep the momentum going.",
    metric: "5 days",
  },
  {
    id: "insight-3",
    type: "action",
    title: "Protein target",
    message: "Aim for 150g protein on training days to support recovery.",
    metric: "150g",
  },
];
