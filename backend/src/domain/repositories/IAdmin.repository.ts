export interface AdminUserSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
  blocked?: boolean;
  created_at: Date;
}
export interface AdminUsersPage {
  users: AdminUserSummary[];
  total: number;
  admins: number;
  totalUsers: number;
  regularUsers: number;
  newUsersLast30Days: number;
  page: number;
  pageSize: number;
}

export interface IAdminRepository {
  isActiveAdmin(userId: string): Promise<boolean>;
  findUsers(query: {
    page: number;
    pageSize: number;
    search: string;
  }): Promise<AdminUsersPage>;
  findUser(id: string): Promise<AdminUserSummary | null>;
  updateUser(
    id: string,
    update: AdminUserUpdate,
    options: { excludeAdmins: boolean },
  ): Promise<AdminUserSummary | null>;
  findActivity(query: {
    start: Date;
    end: Date;
    userId?: string;
  }): Promise<AdminActivityData>;
  findUserWorkStatistics(query: {
    userId: string;
    start: Date;
    end: Date;
  }): Promise<AdminUserWorkData>;
}

export interface AdminUserUpdate {
  name?: string;
  role?: 'user' | 'admin';
  blocked?: boolean;
}

export interface AdminActivityData {
  daily: { date: string; sessions: number; activeUsers: number }[];
  hourly: { hour: number; sessions: number }[];
  summary: { sessions: number; activeUsers: number };
}

export interface AdminActivity extends AdminActivityData {
  user: AdminUserSummary | null;
  days: number;
}

export interface AdminUserWorkData {
  totalLists: number;
  totalTasks: number;
  daily: { date: string; completedTasks: number }[];
}

export interface AdminUserWorkStatistics extends AdminUserWorkData {
  days: number;
  completedTasks: number;
  averageCompletedPerDay: number;
}
