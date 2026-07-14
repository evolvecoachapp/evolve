export interface CoachMessageMock {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
}

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

export const coachMock: CoachMessageMock[] = [
  {
    id: "1",
    role: "coach",
    content:
      "Good morning! Based on your recovery score of 82%, you're in great shape for today's upper body session. Want me to adjust anything?",
    timestamp: "9:00 AM",
  },
  {
    id: "2",
    role: "user",
    content: "Should I increase the weight on bench press?",
    timestamp: "9:02 AM",
  },
  {
    id: "3",
    role: "coach",
    content:
      "Your last three sessions show consistent form at 80kg. I'd suggest adding 2.5kg today and aiming for 8 reps. If form breaks down, drop back to 80kg.",
    timestamp: "9:03 AM",
  },
];
