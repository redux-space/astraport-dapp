import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AITriggerSettings } from '@/components/ai/AITriggerSettings';
import { useAIStore } from '@/store';
import { DEFAULT_AI_PREFERENCES } from '@/utils/ai';

describe('AITriggerSettings', () => {
  beforeEach(() => {
    useAIStore.setState({ settings: { ...DEFAULT_AI_PREFERENCES } });
    window.localStorage.clear();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <AITriggerSettings open={false} onClose={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the preference controls when open', () => {
    render(<AITriggerSettings open onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /ai notifications/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum confidence to alert/i)).toBeInTheDocument();
  });

  it('persists changes only on save', () => {
    const onClose = jest.fn();
    render(<AITriggerSettings open onClose={onClose} />);

    fireEvent.click(screen.getByRole('switch', { name: /ai notifications/i }));
    // Draft change is not yet committed to the store.
    expect(useAIStore.getState().settings.notificationsEnabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(useAIStore.getState().settings.notificationsEnabled).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('discards draft changes on cancel', () => {
    render(<AITriggerSettings open onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('switch', { name: /ai notifications/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(useAIStore.getState().settings.notificationsEnabled).toBe(true);
  });

  it('toggles recommendation categories', () => {
    render(<AITriggerSettings open onClose={jest.fn()} />);
    const securityChip = screen.getByRole('checkbox', { name: /security/i });
    expect(securityChip).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(securityChip);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(
      useAIStore.getState().settings.enabledCategories,
    ).not.toContain('security');
  });
});
