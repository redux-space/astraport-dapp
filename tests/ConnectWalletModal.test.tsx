import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { ConnectWalletModal } from '@/components/wallet/ConnectWalletModal';
import { useWalletStore } from '@/store';
import { WalletInfo } from '@/types';

// The kit service touches the browser wallet runtime, so we stub it and drive
// the flow through its resolved values.
const mockWallets: WalletInfo[] = [
  { id: 'freighter', name: 'Freighter', icon: '', available: true },
  { id: 'lobstr', name: 'LOBSTR', icon: '', available: false, url: 'https://lobstr.co' },
];

const getAvailableWallets = jest.fn();
const connectWallet = jest.fn();

jest.mock('@/services/walletKit', () => ({
  getAvailableWallets: (...args: unknown[]) => getAvailableWallets(...args),
  connectWallet: (...args: unknown[]) => connectWallet(...args),
}));

const resetStore = () =>
  useWalletStore.setState({ connected: false, account: null, error: null });

/** Advance from the network step into the wallet step and wait for the list. */
const goToWalletStep = async () => {
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  await waitFor(() =>
    expect(screen.getByText(/choose a wallet/i)).toBeInTheDocument(),
  );
};

describe('ConnectWalletModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
    getAvailableWallets.mockResolvedValue(mockWallets);
    connectWallet.mockResolvedValue({ publicKey: 'GABC1234', network: 'testnet' });
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ConnectWalletModal open={false} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('starts on the network step', () => {
    render(<ConnectWalletModal open onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/select a network/i)).toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: /select network/i }),
    ).toBeInTheDocument();
  });

  it('advances to the wallet step and lists detected wallets', async () => {
    render(<ConnectWalletModal open onClose={jest.fn()} />);
    await goToWalletStep();

    expect(getAvailableWallets).toHaveBeenCalled();
    // Available wallet is an actionable connect button.
    expect(screen.getByRole('button', { name: /freighter/i })).toBeInTheDocument();
    // Unavailable wallet becomes an install link.
    expect(screen.getByRole('link', { name: /lobstr/i })).toHaveAttribute(
      'href',
      'https://lobstr.co',
    );
  });

  it('connects the chosen wallet, updates the store, and closes', async () => {
    const onClose = jest.fn();
    render(<ConnectWalletModal open onClose={onClose} />);
    await goToWalletStep();

    fireEvent.click(screen.getByRole('button', { name: /freighter/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(connectWallet).toHaveBeenCalledWith('freighter', 'testnet');
    const state = useWalletStore.getState();
    expect(state.connected).toBe(true);
    expect(state.account?.publicKey).toBe('GABC1234');
  });

  it('surfaces a connection error and stays on the wallet step', async () => {
    connectWallet.mockRejectedValueOnce(new Error('User rejected the request'));
    const onClose = jest.fn();
    render(<ConnectWalletModal open onClose={onClose} />);
    await goToWalletStep();

    fireEvent.click(screen.getByRole('button', { name: /freighter/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/user rejected/i),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(useWalletStore.getState().connected).toBe(false);
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    render(<ConnectWalletModal open onClose={onClose} />);

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('can go back from the wallet step to the network step', async () => {
    render(<ConnectWalletModal open onClose={jest.fn()} />);
    await goToWalletStep();

    fireEvent.click(
      screen.getByRole('button', { name: /back to network selection/i }),
    );
    expect(screen.getByText(/select a network/i)).toBeInTheDocument();
  });
});
