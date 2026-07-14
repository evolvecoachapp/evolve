export interface MacroMock {
  current: number;
  target: number;
}

export interface MealMock {
  name: string;
  time: string;
  calories: number;
}

export interface NutritionMock {
  calories: MacroMock;
  protein: MacroMock;
  carbs: MacroMock;
  fat: MacroMock;
  meals: MealMock[];
}

export const nutritionMock: NutritionMock = {
  calories: { current: 1840, target: 2400 },
  protein: { current: 142, target: 180 },
  carbs: { current: 198, target: 280 },
  fat: { current: 58, target: 75 },
  meals: [
    { name: "Breakfast — Oatmeal & Eggs", time: "7:30 AM", calories: 520 },
    { name: "Lunch — Chicken & Rice Bowl", time: "12:30 PM", calories: 680 },
    { name: "Snack — Greek Yogurt & Berries", time: "3:30 PM", calories: 240 },
    { name: "Dinner — Salmon & Vegetables", time: "7:00 PM", calories: 400 },
  ],
};
