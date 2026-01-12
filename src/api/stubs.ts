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
  createdAt: string;
  updatedAt: string;
};

export type AuctionSummary = {
  id: string;
  status: "active" | "ended" | "cancelled";
  sellerId: string;
  sellerWalletId: string;
  settings: {
    antisniping: boolean;
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

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

const db = {
  tokens: null as TokenPair | null,
  me: {
    user: { id: uid("user"), telegramId: "449840517", createdAt: nowIso(), updatedAt: nowIso() } as User,
    wallet: { id: uid("wallet"), userId: "", balance: 123456, lockedBalance: 0, createdAt: nowIso(), updatedAt: nowIso() } as Wallet,
  },
  auctions: [] as Auction[],
  bids: [] as Bid[],
};

db.me.wallet.userId = db.me.user.id;

const sampleAuction: Auction = {
  id: uid("auc"),
  status: "active",
  sellerId: uid("seller"),
  sellerWalletId: uid("wallet"),
  settings: { antisniping: true, minBid: 100, minBidDifference: 10 },
  createdAt: nowIso(),
  updatedAt: nowIso(),
  rounds: [
    {
      startTime: new Date(Date.now() - 60_000).toISOString(),
      endTime: new Date(Date.now() + 60_000).toISOString(),
      itemIds: [uid("item1"), uid("item2"), uid("item3")],
      items: [
        { id: "gifts_1", num: 1, collectionName: "gifts", value: "Gold", ownerId: uid("owner") },
        { id: "gifts_2", num: 2, collectionName: "gifts", value: "Silver", ownerId: uid("owner") },
        { id: "gifts_3", num: 3, collectionName: "gifts", value: "Bronze", ownerId: uid("owner") },
      ],
    },
    {
      startTime: new Date(Date.now() + 120_000).toISOString(),
      endTime: new Date(Date.now() + 300_000).toISOString(),
      itemIds: [uid("item4"), uid("item5"), uid("item6")],
      items: [
        { id: "gifts_4", num: 1, collectionName: "gifts", value: "Diamond", ownerId: uid("owner") },
        { id: "gifts_5", num: 2, collectionName: "gifts", value: "Platinum", ownerId: uid("owner") },
        { id: "gifts_6", num: 3, collectionName: "gifts", value: "Ruby", ownerId: uid("owner") },
      ],
    },
  ],
};

const sampleAuction2: Auction = {
  id: uid("auc"),
  status: "active",
  sellerId: uid("seller"),
  sellerWalletId: uid("wallet"),
  settings: { antisniping: false, minBid: 200, minBidDifference: 20 },
  createdAt: nowIso(),
  updatedAt: nowIso(),
  rounds: [
    {
      startTime: new Date(Date.now() - 120_000).toISOString(),
      endTime: new Date(Date.now() + 90_000).toISOString(),
      itemIds: [uid("item1"), uid("item2"), uid("item3")],
      items: [
        { id: "gifts2_1", num: 1, collectionName: "gifts", value: "Gold", ownerId: uid("owner") },
        { id: "gifts2_2", num: 2, collectionName: "gifts", value: "Silver", ownerId: uid("owner") },
        { id: "gifts2_3", num: 3, collectionName: "gifts", value: "Bronze", ownerId: uid("owner") },
      ],
    },
    {
      startTime: new Date(Date.now() + 180_000).toISOString(),
      endTime: new Date(Date.now() + 360_000).toISOString(),
      itemIds: [uid("item4"), uid("item5"), uid("item6")],
      items: [
        { id: "gifts2_4", num: 1, collectionName: "gifts", value: "Emerald", ownerId: uid("owner") },
        { id: "gifts2_5", num: 2, collectionName: "gifts", value: "Sapphire", ownerId: uid("owner") },
        { id: "gifts2_6", num: 3, collectionName: "gifts", value: "Amethyst", ownerId: uid("owner") },
      ],
    },
  ],
};

const sampleAuction3: Auction = {
  id: uid("auc"),
  status: "active",
  sellerId: uid("seller"),
  sellerWalletId: uid("wallet"),
  settings: { antisniping: true, minBid: 50, minBidDifference: 5 },
  createdAt: nowIso(),
  updatedAt: nowIso(),
  rounds: [
    {
      startTime: new Date(Date.now() - 30_000).toISOString(),
      endTime: new Date(Date.now() + 90_000).toISOString(),
      itemIds: [uid("item1"), uid("item2")],
      items: [
        { id: "gifts3_1", num: 1, collectionName: "gifts", value: "Gold", ownerId: uid("owner") },
        { id: "gifts3_2", num: 2, collectionName: "gifts", value: "Silver", ownerId: uid("owner") },
      ],
    },
    {
      startTime: new Date(Date.now() + 150_000).toISOString(),
      endTime: new Date(Date.now() + 300_000).toISOString(),
      itemIds: [uid("item3"), uid("item4")],
      items: [
        { id: "gifts3_3", num: 1, collectionName: "gifts", value: "Crystal", ownerId: uid("owner") },
        { id: "gifts3_4", num: 2, collectionName: "gifts", value: "Pearl", ownerId: uid("owner") },
      ],
    },
  ],
};

db.auctions.push(sampleAuction, sampleAuction2, sampleAuction3);

function ensureAuth() {
  if (!db.tokens?.accessToken) {
    const e = new Error("unauthorized");
    // @ts-expect-error attach status
    e.status = 401;
    throw e;
  }
}

export const api = {
  auth: {
    tg(initDataRaw: string): Promise<TokenPair> {
      const t: TokenPair = { accessToken: `acc_${btoa(initDataRaw).slice(0, 12)}`, refreshToken: uid("ref") };
      db.tokens = t;
      return delay(t, 200);
    },
    refresh(refreshToken: string): Promise<TokenPair> {
      const t: TokenPair = { accessToken: uid("acc"), refreshToken: refreshToken || uid("ref") };
      db.tokens = t;
      return delay(t, 150);
    },
  },
  users: {
    get_me(): Promise<{ user: User; wallet: Wallet }> {
      ensureAuth();
      return delay({ user: db.me.user, wallet: db.me.wallet });
    },
  },
  auctions: {
    get_list(params: {
      filters?: { status?: Array<"active" | "ended" | "cancelled"> | null; sellerId?: string | null; itemId?: string | null };
      pagination?: { page: number; pageSize: number };
    }): Promise<{ total: number; pagination: { page: number; pageSize: number }; auctions: AuctionSummary[] }> {
      ensureAuth();
      const page = params.pagination?.page ?? 1;
      const pageSize = params.pagination?.pageSize ?? 10;
      let list = db.auctions;
      const status = params.filters?.status ?? ["active"];
      if (status) list = list.filter((a) => status.includes(a.status));
      const total = list.length;
      const paged = list.slice((page - 1) * pageSize, page * pageSize).map((a) => ({ ...a } as AuctionSummary));
      return delay({ total, pagination: { page, pageSize }, auctions: paged });
    },
    get(auctionId: string): Promise<{ auction: Auction }> {
      ensureAuth();
      const auction = db.auctions.find((a) => a.id === auctionId) || db.auctions[0];
      return delay({ auction });
    },
  },
  bids: {
    set_bid(body: { auctionId: string; amount: number }): Promise<{ status: "ok" | "not_enough" | "error"; data?: { amount: number; newEndDate: string } }> {
      ensureAuth();
      const selected = db.auctions.find((a) => a.id === body.auctionId) || db.auctions[0];
      const min = selected.settings.minBid;
      if (body.amount < min) {
        return delay({ status: "not_enough" });
      }
      const bid: Bid = {
        id: uid("bid"),
        userId: db.me.user.id,
        auctionId: body.auctionId,
        amount: body.amount,
        status: "active",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.bids = db.bids.filter((b) => !(b.userId === bid.userId && b.auctionId === bid.auctionId));
      db.bids.push(bid);
      const newEndDate = new Date(Date.now() + 30_000).toISOString();
      return delay({ status: "ok", data: { amount: bid.amount, newEndDate } });
    },
    get_my(): Promise<{ bids: Bid[] }> {
      ensureAuth();
      const bids = db.bids.filter((b) => b.userId === db.me.user.id);
      return delay({ bids });
    },
    get_by_auction(auctionId: string): Promise<{ my_bids: Bid | null; top_bids: Bid[] }> {
      ensureAuth();
      const list = db.bids.filter((b) => b.auctionId === auctionId);
      const my = list.find((b) => b.userId === db.me.user.id) || null;
      const top = [...list].sort((a, b) => b.amount - a.amount || a.createdAt.localeCompare(b.createdAt)).slice(0, 50);
      return delay({ my_bids: my, top_bids: top });
    },
  },
};

export default api;
