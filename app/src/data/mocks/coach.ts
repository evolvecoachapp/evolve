export interface CoachHeroMock {
  aiStatus: "active" | "thinking" | "idle";
  recoveryScore: number;
  readinessDetail: string;
  trainingRecommendation: string;
  trainingDetail: string;
}

export const coachHeroMock: CoachHeroMock = {
  aiStatus: "active",
  recoveryScore: 82,
  readinessDetail: "Well recovered",
  trainingRecommendation: "Upper body strength",
  trainingDetail: "Moderate intensity · 45 min",
};
