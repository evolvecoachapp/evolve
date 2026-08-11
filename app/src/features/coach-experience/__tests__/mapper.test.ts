import { createTestWorkspace } from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { mapWorkspaceCoachToExperienceDto } from "../mappers/mapWorkspaceCoachToExperienceDto";

describe("mapWorkspaceCoachToExperienceDto", () => {
  it("routes the Recovery recommendation to the Recovery screen, not the Progress tab", () => {
    const workspace = createTestWorkspace();
    const dto = mapWorkspaceCoachToExperienceDto({ workspace });

    const recommendations = dto.recommendations ?? [];
    const recoveryRecommendation = recommendations.find(
      (recommendation) => recommendation.domain === "recovery",
    );

    if (workspace.recovery.present) {
      expect(recoveryRecommendation?.destination).toBe("/(app)/recovery");
    }
    expect(
      recommendations.some(
        (recommendation) =>
          recommendation.domain === "recovery" &&
          recommendation.destination === "/(app)/(tabs)/progress",
      ),
    ).toBe(false);
  });
});
