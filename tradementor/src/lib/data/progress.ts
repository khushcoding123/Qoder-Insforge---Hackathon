export interface UserProgress {
  userId: string;
  displayName: string;
  streak: number;
  longestStreak: number;
  completedLessons: string[];
  lessonsInProgress: string[];
  totalLessonsAvailable: number;
  strategiesBuilt: number;
  journalEntries: number;
  practiceSessionsCompleted: number;
  categoryProgress: {
    [category: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  stats: {
    totalStudyMinutes: number;
    winRateTracked: number;
    avgRMultiple: number;
    bestRMultiple: number;
    totalTradesJournaled: number;
    winningTrades: number;
    losingTrades: number;
  };
  badges: Badge[];
  joinedAt: string;
  lastActive: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export const mockUserProgress: UserProgress = {
  userId: "user_demo",
  displayName: "Alex Trader",
  streak: 7,
  longestStreak: 14,
  completedLessons: [
    "market-structure-basics",
    "support-resistance",
    "candlestick-patterns",
    "risk-management-fundamentals",
    "psychology-basics",
    "price-action-basics",
    "journal-basics",
  ],
  lessonsInProgress: [
    "trend-identification",
    "moving-averages",
  ],
  totalLessonsAvailable: 18,
  strategiesBuilt: 2,
  journalEntries: 6,
  practiceSessionsCompleted: 12,
  categoryProgress: {
    "Market Structure": {
      completed: 2,
      total: 4,
      percentage: 50,
    },
    "Technical Analysis": {
      completed: 2,
      total: 6,
      percentage: 33,
    },
    "Risk Management": {
      completed: 1,
      total: 3,
      percentage: 33,
    },
    "Psychology": {
      completed: 2,
      total: 3,
      percentage: 67,
    },
    "Order Flow": {
      completed: 0,
      total: 1,
      percentage: 0,
    },
    "Macroeconomics": {
      completed: 0,
      total: 1,
      percentage: 0,
    },
  },
  stats: {
    totalStudyMinutes: 320,
    winRateTracked: 57,
    avgRMultiple: 1.4,
    bestRMultiple: 2.9,
    totalTradesJournaled: 7,
    winningTrades: 4,
    losingTrades: 3,
  },
  badges: [
    {
      id: "first-lesson",
      name: "First Step",
      description: "Completed your first lesson",
      icon: "BookOpen",
      earned: true,
      earnedAt: "2024-03-10",
    },
    {
      id: "streak-7",
      name: "Week Warrior",
      description: "Maintained a 7-day learning streak",
      icon: "Flame",
      earned: true,
      earnedAt: "2024-03-17",
    },
    {
      id: "first-strategy",
      name: "Strategist",
      description: "Built your first trading strategy",
      icon: "Target",
      earned: true,
      earnedAt: "2024-03-12",
    },
    {
      id: "journal-5",
      name: "Journaler",
      description: "Logged 5 trade journal entries",
      icon: "PenLine",
      earned: true,
      earnedAt: "2024-03-20",
    },
    {
      id: "streak-30",
      name: "Dedicated",
      description: "Maintain a 30-day learning streak",
      icon: "Trophy",
      earned: false,
    },
    {
      id: "all-lessons",
      name: "Scholar",
      description: "Complete all available lessons",
      icon: "GraduationCap",
      earned: false,
    },
    {
      id: "risk-master",
      name: "Risk Master",
      description: "Complete all Risk Management lessons",
      icon: "Shield",
      earned: false,
    },
  ],
  joinedAt: "2024-03-08",
  lastActive: "2024-03-27",
};
