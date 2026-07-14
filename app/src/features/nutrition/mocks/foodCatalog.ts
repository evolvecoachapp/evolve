import type { Food } from "../models/Food";

export const mockFoodCatalog: Food[] = [
  {
    id: "food-oatmeal",
    name: "Rolled Oats",
    brand: "EVOLVE Pantry",
    servings: [
      { id: "serving-oatmeal-cup", label: "1 cup cooked", grams: 234, multiplier: 1 },
      { id: "serving-oatmeal-half", label: "1/2 cup cooked", grams: 117, multiplier: 0.5 },
    ],
    nutrients: {
      calories: 166,
      protein: 6,
      carbs: 28,
      fat: 3,
      micronutrients: { fiberGrams: 4, sugarGrams: 1, sodiumMg: 9 },
    },
  },
  {
    id: "food-eggs",
    name: "Large Eggs",
    brand: "EVOLVE Pantry",
    servings: [
      { id: "serving-eggs-whole", label: "2 large eggs", grams: 100, multiplier: 1 },
      { id: "serving-eggs-single", label: "1 large egg", grams: 50, multiplier: 0.5 },
    ],
    nutrients: {
      calories: 143,
      protein: 13,
      carbs: 1,
      fat: 10,
      micronutrients: { sodiumMg: 142 },
    },
  },
  {
    id: "food-chicken",
    name: "Grilled Chicken Breast",
    brand: "EVOLVE Pantry",
    servings: [
      { id: "serving-chicken-6oz", label: "6 oz", grams: 170, multiplier: 1 },
      { id: "serving-chicken-4oz", label: "4 oz", grams: 113, multiplier: 0.67 },
    ],
    nutrients: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 4,
      micronutrients: { sodiumMg: 74 },
    },
  },
  {
    id: "food-rice",
    name: "White Rice",
    brand: "EVOLVE Pantry",
    servings: [
      { id: "serving-rice-cup", label: "1 cup cooked", grams: 158, multiplier: 1 },
    ],
    nutrients: {
      calories: 206,
      protein: 4,
      carbs: 45,
      fat: 0,
      micronutrients: { fiberGrams: 1, sodiumMg: 2 },
    },
  },
  {
    id: "food-yogurt",
    name: "Greek Yogurt",
    brand: "EVOLVE Pantry",
    servings: [
      { id: "serving-yogurt-cup", label: "1 cup", grams: 245, multiplier: 1 },
    ],
    nutrients: {
      calories: 130,
      protein: 17,
      carbs: 8,
      fat: 0,
      micronutrients: { sugarGrams: 6, sodiumMg: 65 },
    },
  },
  {
    id: "food-salmon",
    name: "Atlantic Salmon",
    brand: "EVOLVE Pantry",
    servings: [
      { id: "serving-salmon-6oz", label: "6 oz", grams: 170, multiplier: 1 },
    ],
    nutrients: {
      calories: 350,
      protein: 39,
      carbs: 0,
      fat: 21,
      micronutrients: { sodiumMg: 98 },
    },
  },
];
