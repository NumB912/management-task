
export interface MenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export type MenuActionGroup = MenuAction[];