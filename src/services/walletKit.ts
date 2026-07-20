/**
 * Runtime bridge to @creit.tech/stellar-wallets-kit (v2.x).
 *
 * The kit ships its own connect modal, but this app drives a custom
 * network-first flow, so we only use the kit's programmatic surface:
 *   - refreshSupportedWallets() to enumerate wallets and their install status
 *   - setWallet(id) + getAddress() to connect to a chosen wallet
 *
 * In v2.x `StellarWalletsKit` is a static class initialised once via `init()`.
 * The kit touches `window`, so init happens lazily and only in the browser.
 * Exports are safe to import from server components: they no-op or throw during
 * SSR rather than crashing the render.
 */

import { StellarNetwork, WalletInfo } from '@/types';

const isBrowser = (): boolean => typeof window !== 'undefined';

// Loaded lazily so nothing browser-only runs at module load / on the server.
type KitSdk = typeof import('@creit.tech/stellar-wallets-kit');

let sdkPromise: Promise<KitSdk> | null = null;
const loadSdk = (): Promise<KitSdk> => {
  if (!sdkPromise) sdkPromise = import('@creit.tech/stellar-wallets-kit');
  return sdkPromise;
};

let initialized = false;
let currentNetwork: StellarNetwork | null = null;

/** Map our network union to the kit's Networks enum (passphrase-valued). */
const toKitNetwork = (sdk: KitSdk, network: StellarNetwork) =>
  network === 'public' ? sdk.Networks.PUBLIC : sdk.Networks.TESTNET;

/**
 * Assemble the wallet modules we support. Each is imported from its own
 * subpath so unused wallets can still tree-shake, and so a single failing
 * module import does not take down the rest.
 */
const buildModules = async () => {
  const [freighter, xbull, albedo, rabet, lobstr] = await Promise.all([
    import('@creit.tech/stellar-wallets-kit/modules/freighter'),
    import('@creit.tech/stellar-wallets-kit/modules/xbull'),
    import('@creit.tech/stellar-wallets-kit/modules/albedo'),
    import('@creit.tech/stellar-wallets-kit/modules/rabet'),
    import('@creit.tech/stellar-wallets-kit/modules/lobstr'),
  ]);
  return [
    new freighter.FreighterModule(),
    new xbull.xBullModule(),
    new albedo.AlbedoModule(),
    new rabet.RabetModule(),
    new lobstr.LobstrModule(),
  ];
};

/** Initialise the static kit once, then keep its network in sync. */
const ensureKit = async (network: StellarNetwork): Promise<KitSdk> => {
  if (!isBrowser()) {
    throw new Error('Wallet kit is only available in the browser.');
  }
  const sdk = await loadSdk();
  if (!initialized) {
    sdk.StellarWalletsKit.init({
      network: toKitNetwork(sdk, network),
      modules: await buildModules(),
    });
    initialized = true;
    currentNetwork = network;
  } else if (currentNetwork !== network) {
    sdk.StellarWalletsKit.setNetwork(toKitNetwork(sdk, network));
    currentNetwork = network;
  }
  return sdk;
};

/**
 * List every supported wallet with its runtime availability for the given
 * network. Returns [] during SSR so callers can render a loading state.
 */
export const getAvailableWallets = async (
  network: StellarNetwork,
): Promise<WalletInfo[]> => {
  if (!isBrowser()) return [];
  const sdk = await ensureKit(network);
  const wallets = await sdk.StellarWalletsKit.refreshSupportedWallets();
  return wallets.map((w) => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    available: w.isAvailable,
    url: w.url,
  }));
};

export interface ConnectResult {
  publicKey: string;
  network: StellarNetwork;
}

/**
 * Normalise the many shapes a wallet/kit can throw into a readable message.
 * The kit and underlying wallet extensions do not always throw `Error`
 * instances — they may throw plain strings, `{ message }`, or `{ error }`
 * objects, which is why a raw failure otherwise collapses to a generic label.
 */
const extractWalletError = (err: unknown): string => {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  if (err && typeof err === 'object') {
    const obj = err as { message?: unknown; error?: unknown };
    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (typeof obj.error === 'string' && obj.error) return obj.error;
  }
  return 'Wallet connection failed. Ensure the wallet is unlocked and you approved the request.';
};

/**
 * Connect to a specific wallet on a network and return the resolved address.
 * Throws a descriptive Error if the wallet rejects, is unavailable, or the user
 * cancels — the underlying reason is preserved and also logged to the console.
 */
export const connectWallet = async (
  walletId: string,
  network: StellarNetwork,
): Promise<ConnectResult> => {
  const sdk = await ensureKit(network);
  try {
    sdk.StellarWalletsKit.setWallet(walletId);
    const { address } = await sdk.StellarWalletsKit.getAddress();
    if (!address) {
      throw new Error(
        'Wallet did not return an address. Make sure it is unlocked and the connection was approved.',
      );
    }
    return { publicKey: address, network };
  } catch (err) {
    // Surface the real reason: the kit sometimes throws non-Error values that
    // would otherwise be lost behind the generic fallback message.
    // eslint-disable-next-line no-console
    console.error(`[walletKit] connect to "${walletId}" failed:`, err);
    throw new Error(extractWalletError(err));
  }
};
