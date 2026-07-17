import { CoachInsight, DailyContext, InsightPriority } from './types'
import { rules } from './rules'

export function generateDailyInsights(ctx: DailyContext): CoachInsight[] {
  const insights: CoachInsight[] = []
  for (const r of rules) {
    try {
      const res = r(ctx)
      if (res) insights.push(res)
    } catch (e) {
      // Rules must be deterministic and safe — swallow errors per requirement
    }
  }

  // Sort by priority (high -> low) then by id to keep deterministic order
  insights.sort((a, b) => {
    const p = (b.priority ?? InsightPriority.LOW) - (a.priority ?? InsightPriority.LOW)
    if (p !== 0) return p
    return a.id.localeCompare(b.id)
  })

  return insights
}

export default generateDailyInsights
