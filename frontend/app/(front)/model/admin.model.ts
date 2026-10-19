export interface AdminUsersPage {
  users: {
    _id: string;
    name: string;
    email: string;
    role: string;
    blocked?: boolean;
    created_at: string;
  }[];
  total: number;
  admins: number;
  totalUsers: number;
  regularUsers: number;
  newUsersLast30Days: number;
  page: number;
  pageSize: number;
}

export interface AdminUserWorkStatistics {
  totalLists: number;
  totalTasks: number;
  days: number;
  completedTasks: number;
  averageCompletedPerDay: number;
  daily: { date: string; completedTasks: number }[];
}
