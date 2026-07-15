import React from "react"
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}))
jest.mock("expo-asset", () => ({}), { virtual: true })
jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}))
import { render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ThemeProvider } from "../../../../theme/ThemeContext"
import { RecommendationWidgetPlain as RecommendationWidget } from "../RecommendationWidget"
import { recommendationStore } from "../../service"
import type { RecommendationFeed } from "../../types"

describe("RecommendationWidget", () => {
  beforeEach(() => {
    recommendationStore.clear()
  })

  it("shows empty state when no feed exists", () => {
    const { getByTestId } = render(<RecommendationWidget />)

    expect(getByTestId("rec-empty-title").props.children).toBe("No recommendations yet.")
    expect(getByTestId("rec-empty-subtitle").props.children).toBe(
      "Complete your first workout to unlock personalized coaching.",
    )
  })

  it("renders a recommendation", () => {
    const feed: RecommendationFeed = {
      recommendations: [
        {
          id: "r1",
          category: "recovery",
          priority: 80,
          title: "Take a Rest Day",
          description: "Resting today helps support recovery.",
          reason: "High soreness",
          confidence: 90,
        },
      ],
      generatedAt: new Date(),
      contextVersion: "v1",
    }

    recommendationStore.save(feed)

    const { getByTestId } = render(<RecommendationWidget />)

    expect(getByTestId("rec-title").props.children).toBe("Take a Rest Day")
    expect(getByTestId("rec-desc").props.children).toBe("Resting today helps support recovery.")
  })

  it("displays only the highest priority recommendation when multiple exist", () => {
    const feed: RecommendationFeed = {
      recommendations: [
        { id: "a", category: "workout", priority: 50, title: "A", description: "a", reason: "", confidence: 10 },
        { id: "b", category: "nutrition", priority: 95, title: "B", description: "b", reason: "", confidence: 80 },
      ],
      generatedAt: new Date(),
      contextVersion: "v1",
    }

    recommendationStore.save(feed)

    const { queryByText, getByTestId } = render(<RecommendationWidget />)

    expect(getByTestId("rec-title").props.children).toBe("B")
    expect(queryByText("A")).toBeNull()
  })
})
