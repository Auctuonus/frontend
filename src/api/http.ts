import { showError } from './toast';

type TokenPair = { accessToken: string; refreshToken: string };

export type User = {
  id: string;
  telegramId: string;
  createdAt: string;
  updatedAt: string;
};

export type Wallet = {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  freeBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type AuctionSummary = {
  id: string;
  name: string;
  status: "active" | "ended" | "cancelled";
  sellerId: string;
  sellerWalletId: string;
  settings: {
    antisniping: number | null;
    minBid: number;
    minBidDifference: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type Auction = AuctionSummary & {
  rounds: Array<{
    startTime: string;
    endTime: string;
    itemIds: string[];
    items: Array<{
      id: string;
      num: number;
      collectionName: string;
      value: string;
      ownerId: string;
    }>;
  }>;
};

export type Bid = {
  id: string;
  userId: string;
  auctionId: string;
  amount: number;
  status: "active" | "won" | "lost";
  createdAt: string;
  updatedAt: string;
};

// Default to relative '/v1' so it works via Vite proxy and over remote tunnels
const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) || '/v1';

let tokens: TokenPair | null = null;
try {
  const raw = localStorage.getItem('tg_tokens');
  if (raw) tokens = JSON.parse(raw) as TokenPair;
} catch {}

function setTokens(next: TokenPair) {
  tokens = next;
  try {
    localStorage.setItem('tg_tokens', JSON.stringify(next));
  } catch {}
}

async function post<T>(path: string, body?: any, opts?: { auth?: boolean; tma?: string; silent?: boolean }) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.auth && tokens?.accessToken) headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  if (opts?.tma) headers['Authorization'] = `tma ${opts.tma}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let data: any = null;
    try { data = await res.json(); } catch {}
    const message = data?.message || `HTTP ${res.status}`;
    if (!opts?.silent) showError(message, res.status);
    const err: any = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return (await res.json()) as T;
}

function toAuctionSummary(x: any): AuctionSummary {
  return {
    id: String(x.id),
    name: typeof x.name === 'string' ? x.name : 'Auction',
    status: x.status,
    sellerId: String(x.sellerId),
    sellerWalletId: String(x.sellerWalletId),
    settings: {
      antisniping: x.settings?.antisniping ?? null,
      minBid: x.settings?.minBid ?? 0,
      minBidDifference: x.settings?.minBidDifference ?? 0,
    },
    createdAt: new Date(x.createdAt).toISOString(),
    updatedAt: new Date(x.updatedAt).toISOString(),
  };
}

function toAuction(x: any): Auction {
  return {
    ...toAuctionSummary(x),
    rounds: (x.rounds ?? []).map((r: any) => ({
      startTime: new Date(r.startTime).toISOString(),
      endTime: new Date(r.endTime).toISOString(),
      itemIds: (r.itemIds ?? []).map((id: any) => String(id)),
      items: (r.items ?? []).map((it: any) => ({
        id: String(it.id),
        num: Number(it.num),
        collectionName: String(it.collectionName),
        value: String(it.value),
        ownerId: String(it.ownerId),
      })),
    })),
  };
}

function toBid(x: any): Bid {
  return {
    id: String(x.id),
    userId: String(x.userId),
    auctionId: String(x.auctionId),
    amount: Number(x.amount),
    status: x.status,
    createdAt: new Date(x.createdAt).toISOString(),
    updatedAt: new Date(x.updatedAt).toISOString(),
  };
}

export const api = {
  auth: {
    async tg(initDataRaw: string): Promise<TokenPair> {
      // In dev, guard fakes init data; header optional
      const res = await post<TokenPair>('/auth/tg', undefined, { tma: initDataRaw || undefined });
      setTokens(res);
      return res;
    },
    async password(telegramId: number, password: string): Promise<TokenPair> {
      const res = await post<TokenPair>('/auth/password', { telegramId, password });
      setTokens(res);
      return res;
    },
    async refresh(refreshToken: string): Promise<TokenPair> {
      const res = await post<TokenPair>('/auth/refresh', { refreshToken });
      setTokens(res);
      return res;
    },
  },
  users: {
    async get_me(): Promise<{ user: User; wallet: Wallet | null }> {
      const res = await post<any>('/users/get_me', undefined, { auth: true, silent: true });
      const user: User = {
        id: String(res.user.id),
        telegramId: String(res.user.telegramId),
        createdAt: new Date(res.user.createdAt).toISOString(),
        updatedAt: new Date(res.user.updatedAt).toISOString(),
      };
      const wallet: Wallet | null = res.wallet ? {
        id: String(res.wallet.id),
        userId: String(res.wallet.userId),
        balance: Number(res.wallet.balance),
        lockedBalance: Number(res.wallet.lockedBalance),
        freeBalance: Number(res.wallet.freeBalance),
        createdAt: new Date(res.wallet.createdAt).toISOString(),
        updatedAt: new Date(res.wallet.updatedAt).toISOString(),
      } : null;
      return { user, wallet };
    },
  },
  auctions: {
    async get_list(params: {
      filters?: { status?: Array<'active' | 'ended' | 'cancelled'> | null; sellerId?: string | null; itemId?: string | null };
      pagination?: { page: number; pageSize: number };
    }): Promise<{ total: number; pagination: { page: number; pageSize: number }; auctions: AuctionSummary[] }> {
      const res = await post<any>('/auctions/get_list', params, { auth: true });
      return {
        total: Number(res.total ?? 0),
        pagination: { page: Number(res.pagination?.page ?? 1), pageSize: Number(res.pagination?.pageSize ?? 10) },
        auctions: (res.auctions ?? []).map(toAuctionSummary),
      };
    },
    async get(auctionId: string): Promise<{ auction: Auction }> {
      const res = await post<any>(`/auctions/get/${encodeURIComponent(auctionId)}`, undefined, { auth: true });
      return { auction: toAuction(res.auction) };
    },
  },
  bids: {
    async set_bid(body: { auctionId: string; amount: number }): Promise<{ status: 'ok' | 'not_enough' | 'error'; data?: { amount: number; newEndDate: string }; error?: { message: string; code?: number } }> {
      try {
        const res = await post<any>('/bids/set_bid', body, { auth: true });
        return {
          status: 'ok',
          data: res?.data ? { amount: Number(res.data.amount), newEndDate: new Date(res.data.newEndDate).toISOString() } : undefined,
        };
      } catch (e: any) {
        const msg = String(e?.data?.message || e?.message || '');
        const code = e?.status as number | undefined;
        if (code === 400 && (msg.toLowerCase().includes('min') || msg.toLowerCase().includes('not enough') || msg.toLowerCase().includes('difference'))) {
          return { status: 'not_enough', error: { message: msg, code } };
        }
        return { status: 'error', error: { message: msg || 'Unknown error', code } };
      }
    },
    async get_my(): Promise<{ bids: Bid[] }> {
      const res = await post<any>('/bids/get_my', undefined, { auth: true });
      return { bids: (res.bids ?? []).map(toBid) };
    },
    async get_by_auction(auctionId: string): Promise<{ my_bids: Bid | null; top_bids: Bid[] }> {
      const res = await post<any>(`/bids/get_by_auction/${encodeURIComponent(auctionId)}`, undefined, { auth: true });
      return {
        my_bids: res.my_bids ? toBid(res.my_bids) : null,
        top_bids: (res.top_bids ?? []).map(toBid),
      };
    },
  },
};

export default api;
