import generateDailyInsights from '../engine'
import { InsightPriority } from '../types'

describe('Daily Coach Engine', () => {
  test('protein deficit', () => {
    const ctx = { nutrition: { protein: 40, targetProtein: 80 } }
    const out = generateDailyInsights(ctx as any)
    expect(out.some((i) => i.id === 'daily:protein-deficit')).toBe(true)
  })

  test('calorie deficit', () => {
    const ctx = { nutrition: { calories: 1500, targetCalories: 1900 } }
    const out = generateDailyInsights(ctx as any)
    expect(out.some((i) => i.id === 'daily:calorie-deficit')).toBe(true)
  })

  test('recovery too low', () => {
    const ctx = { recoveryScore: 30 }
    const out = generateDailyInsights(ctx as any)
    const r = out.find((i) => i.id === 'daily:low-recovery')
    expect(r).toBeDefined()
    expect(r!.priority).toBe(InsightPriority.HIGH)
  })

  test('skipped workout', () => {
    const ctx = { workoutsPlanned: ['w1'], workoutsCompleted: [] }
    const out = generateDailyInsights(ctx as any)
    expect(out.some((i) => i.id === 'daily:skipped-workout')).toBe(true)
  })

  test('personal record', () => {
    const ctx = { personalRecords: [{ exerciseId: 'squat', isNewPR: true }] }
    const out = generateDailyInsights(ctx as any)
    expect(out.some((i) => i.id === 'daily:personal-record')).toBe(true)
  })

  test('multiple insights and priority ordering', () => {
    const ctx = {
      nutrition: { protein: 30, targetProtein: 100, calories: 1400, targetCalories: 2000 },
      recoveryScore: 20,
      sleepHours: 5,
      waterLiters: 1,
      workoutsPlanned: ['a', 'b'],
      workoutsCompleted: ['a'],
      personalRecords: [{ exerciseId: 'bench', isNewPR: true }],
    }

    const out = generateDailyInsights(ctx as any)
    // Should include several insights
    const ids = out.map((i) => i.id)
    expect(ids).toEqual(expect.arrayContaining([
      'daily:low-recovery',
      'daily:protein-deficit',
      'daily:calorie-deficit',
      'daily:poor-sleep',
      'daily:hydration-reminder',
      'daily:skipped-workout',
      'daily:personal-record',
    ]))

    // Ensure ordering: high priority (low-recovery, skipped-workout) come first
    expect(out[0].priority).toBeGreaterThanOrEqual(out[out.length - 1].priority)
    // Specifically, top insight should be HIGH priority
    expect(out[0].priority).toBe(InsightPriority.HIGH)
  })
})
