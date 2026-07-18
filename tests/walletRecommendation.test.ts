import {
  recommendWallet,
  detectDeviceType,
  scoreWallet,
} from '@/utils/walletRecommendation';
import { WalletInfo } from '@/types';

const wallet = (id: string, available = true): WalletInfo => ({
  id,
  name: id,
  icon: '',
  available,
});

describe('detectDeviceType', () => {
  it('classifies mobile user agents', () => {
    expect(detectDeviceType('... iPhone ...')).toBe('mobile');
    expect(detectDeviceType('... Android Mobile ...')).toBe('mobile');
  });

  it('classifies desktop user agents', () => {
    expect(detectDeviceType('Mozilla/5.0 (Macintosh)')).toBe('desktop');
    expect(detectDeviceType('')).toBe('desktop');
  });
});

describe('recommendWallet', () => {
  it('returns null when nothing is available', () => {
    expect(recommendWallet([wallet('freighter', false)], 'desktop')).toBeNull();
    expect(recommendWallet([], 'desktop')).toBeNull();
  });

  it('prefers the previously used wallet regardless of other signals', () => {
    const available = [wallet('freighter'), wallet('rabet')];
    // freighter outranks rabet by weights, but last-used rabet should win.
    const rec = recommendWallet(available, 'desktop', 'rabet');
    expect(rec?.walletId).toBe('rabet');
    expect(rec?.reason).toMatch(/last time/i);
  });

  it('recommends the highest-weighted wallet on desktop with no history', () => {
    const available = [wallet('rabet'), wallet('freighter')];
    const rec = recommendWallet(available, 'desktop');
    expect(rec?.walletId).toBe('freighter');
  });

  it('favors a mobile-friendly wallet on mobile devices', () => {
    // freighter is not mobileFriendly; lobstr is and is highly rated.
    const available = [wallet('freighter'), wallet('lobstr')];
    const rec = recommendWallet(available, 'mobile');
    expect(rec?.walletId).toBe('lobstr');
  });

  it('ignores unavailable wallets when scoring', () => {
    const available = [wallet('freighter', false), wallet('albedo', true)];
    const rec = recommendWallet(available, 'desktop');
    expect(rec?.walletId).toBe('albedo');
  });
});

describe('scoreWallet', () => {
  it('gives an unknown wallet a nonzero baseline score', () => {
    expect(scoreWallet(wallet('unknown'), 'desktop', null)).toBeGreaterThan(0);
  });
});
