import './ActionToolbar.css';

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

interface ActionToolbarProps<T = unknown> {
  actions: ActionToolbarItem<T>[];
  align?: 'left' | 'right';
  className?: string;
}

const ActionToolbar = <T,>({
  actions,
  align = 'right',
  className = '',
}: ActionToolbarProps<T>) => {
  if (!actions.length) {
    return null;
  }

  return (
    <div className={`action-toolbar ${align} ${className}`.trim()}>
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          className={`action-toolbar-btn ${action.color || 'secondary'} ${action.variant || 'solid'}`}
          disabled={action.disabled}
          onClick={() => action.onClick?.({ action, payload: action.payload })}
        >
          <i className={`fa-solid fa-${action.icon}`} />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ActionToolbar;
