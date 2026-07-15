import { createUserIntelligence, defaultUserIntelligence } from '../factory'

describe('UserIntelligence domain', () => {
  test('defaultUserIntelligence returns safe defaults', () => {
    const def = defaultUserIntelligence()
    expect(def).toBeDefined()
    expect(def.goals.primaryGoal).toBeNull()
    expect(def.training.availableTrainingDays).toBeGreaterThanOrEqual(0)
    expect(def.lifestyle.sleepTargetHours).toBe(8)
    expect(Array.isArray(def.nutrition.allergies)).toBe(true)
    expect(def.nutrition.mealFrequency).toBe(3)
    expect(def.aiPreferences.notificationStyle).toBe('concise')
  })

  test('createUserIntelligence allows partial overrides', () => {
    const custom = createUserIntelligence({
      goals: { primaryGoal: 'Lose weight', targetWeight: 75 },
      training: { experienceLevel: 'intermediate', availableTrainingDays: 5 },
    })

    expect(custom.goals.primaryGoal).toBe('Lose weight')
    expect(custom.goals.targetWeight).toBe(75)
    expect(custom.training.experienceLevel).toBe('intermediate')
    expect(custom.training.availableTrainingDays).toBe(5)
    // unchanged defaults remain
    expect(custom.nutrition.mealFrequency).toBe(3)
  })
})
