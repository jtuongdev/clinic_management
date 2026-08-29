import './ActionToolbar.css';
import type { ActionToolbarProps } from '../types/examination.types';

export type {
  ActionToolbarClickContext,
  ActionToolbarItem,
} from '../types/examination.types';

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
