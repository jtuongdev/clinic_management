export type ActionToolbarClickContext<T = unknown> = {
  action: ActionToolbarItem<T>;
  payload?: T;
};

export type ActionToolbarItem<T = unknown> = {
  key: string;
  label: string;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'ghost';
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  payload?: T;
  onClick?: (context: ActionToolbarClickContext<T>) => void;
};

export interface ActionToolbarProps<T = unknown> {
  actions: ActionToolbarItem<T>[];
  align?: 'left' | 'right';
  className?: string;
}