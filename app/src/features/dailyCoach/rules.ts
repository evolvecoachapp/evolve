import { CoachInsight, DailyContext, InsightCategory, InsightPriority } from './types'

type Rule = (ctx: DailyContext) => CoachInsight | null

const idFor = (slug: string) => `daily:${slug}`

export const rules: Rule[] = [
  // Protein deficit: protein < 80% of target
  (ctx) => {
    const p = ctx.nutrition?.protein
    const tp = ctx.nutrition?.targetProtein
    if (p == null || tp == null) return null
    if (p < tp * 0.8) {
      return {
        id: idFor('protein-deficit'),
        title: 'Protein intake low',
        message: `You ate ${p}g protein vs target ${tp}g. Increase protein to support recovery.`,
        category: InsightCategory.NUTRITION,
        priority: InsightPriority.MEDIUM,
      }
    }
    return null
  },

  // Calorie deficit: calories < targetCalories - 300
  (ctx) => {
    const c = ctx.nutrition?.calories
    const tc = ctx.nutrition?.targetCalories
    if (c == null || tc == null) return null
    if (c < tc - 300) {
      return {
        id: idFor('calorie-deficit'),
        title: 'Calorie deficit',
        message: `Calories ${c} are below target ${tc}. Consider increasing intake.`,
        category: InsightCategory.NUTRITION,
        priority: InsightPriority.MEDIUM,
      }
    }
    return null
  },

  // Recovery too low: recoveryScore < 50
  (ctx) => {
    const r = ctx.recoveryScore
    if (r == null) return null
    if (r < 50) {
      return {
        id: idFor('low-recovery'),
        title: 'Low recovery',
        message: `Recovery score is ${r}. Favor rest or lighter training today.`,
        category: InsightCategory.RECOVERY,
        priority: InsightPriority.HIGH,
      }
    }
    return null
  },

  // Skipped workout: planned but not completed
  (ctx) => {
    const planned = ctx.workoutsPlanned || []
    const done = ctx.workoutsCompleted || []
    const skipped = planned.filter((id) => !done.includes(id))
    if (skipped.length > 0) {
      return {
        id: idFor('skipped-workout'),
        title: 'Missed workout',
        message: `You skipped ${skipped.length} planned workout(s). Consider rescheduling.`,
        category: InsightCategory.WORKOUT,
        priority: InsightPriority.HIGH,
      }
    }
    return null
  },

  // Poor sleep: sleepHours < 6
  (ctx) => {
    const s = ctx.sleepHours
    if (s == null) return null
    if (s < 6) {
      return {
        id: idFor('poor-sleep'),
        title: 'Low sleep',
        message: `You slept ${s} hours. Aim for 7-9 hours for recovery.`,
        category: InsightCategory.LIFESTYLE,
        priority: InsightPriority.MEDIUM,
      }
    }
    return null
  },

  // Hydration reminder: waterLiters < 2
  (ctx) => {
    const w = ctx.waterLiters
    if (w == null) return null
    if (w < 2) {
      return {
        id: idFor('hydration-reminder'),
        title: 'Hydration',
        message: `Water intake ${w}L. Aim for at least 2L per day.`,
        category: InsightCategory.LIFESTYLE,
        priority: InsightPriority.LOW,
      }
    }
    return null
  },

  // Weight change progress insight
  (ctx) => {
    const current = ctx.currentWeightKg
    const previous = ctx.previousWeightKg
    if (current == null || previous == null) return null
    const delta = current - previous
    if (delta === 0) return null

    return {
      id: idFor(delta > 0 ? 'weight-gain' : 'weight-loss'),
      title: delta > 0 ? 'Weight trending up' : 'Weight trending down',
      message:
        delta > 0
          ? `Your weight increased by ${delta.toFixed(1)} kg. Adjust your plan to stay aligned with your goals.`
          : `Your weight decreased by ${Math.abs(delta).toFixed(1)} kg. Keep up the consistent habits.`,
      category: InsightCategory.PROGRESS,
      priority: InsightPriority.MEDIUM,
    }
  },

  // Personal record achieved
  (ctx) => {
    const prs = ctx.personalRecords || []
    const any = prs.some((p) => p.isNewPR)
    if (any) {
      return {
        id: idFor('personal-record'),
        title: 'New personal record',
        message: `Nice work — you set a new personal record. Celebrate the progress!`,
        category: InsightCategory.PROGRESS,
        priority: InsightPriority.MEDIUM,
      }
    }
    return null
  },
]
