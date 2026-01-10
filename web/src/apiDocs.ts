// mocked data included
export type AuctionStatus = "active" | "ended" | "cancelled";

export interface User {
  id: string;
  telegramId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // docs: integer
  lockedBalance: number; // docs: integer
  createdAt: string;
  updatedAt: string;
}

export interface AuctionSettings {
  antisniping: boolean;
  minBid: number;
  minBidDifference: number;
}

export interface AuctionListItem {
  id: string;
  status: AuctionStatus;
  sellerId: string;
  sellerWalletId: string;
  settings: AuctionSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string; // `${collectionName}_${num}`
  num: number;
  collectionName: string;
  value: string;
  ownerId: string;
}

export interface Round {
  startTime: string;
  endTime: string;
  itemIds: string[];
  items: Item[];
}

export interface AuctionDetail extends AuctionListItem {
  rounds: Round[];
}

export interface Bid {
  id: string;
  userId: string;
  auctionId: string;
  amount: number;
  status: "active" | "won" | "lost";
}

export interface Pagination {
  page: number;
  pageSize: number;
}

// ----------------------
// Helpers
// ----------------------
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

let authToken: string | null = null;

export function setAuth(initDataRaw: string) {
  authToken = `tma ${initDataRaw}`;
  try {
    localStorage.setItem("authToken", authToken);
  } catch {}
}

(function restoreAuth() {
  try {
    const saved = localStorage.getItem("authToken");
    if (saved) authToken = saved;
  } catch {}
})();

function nowIso() {
  return new Date().toISOString();
}

function uuid(suffix = "") {
  return `uuid-${Math.random().toString(16).slice(2)}${suffix ? `-${suffix}` : ""}`;
}

// ----------------------
// API mocks
// ----------------------
export const apiDocs = {
  // In real calls, needed header tipa { Authorization: authToken }
  users: {
    async getMe(): Promise<{ user: User; wallet: Wallet }> {
      // simulate network
      await delay();
      const userId = uuid("user");
      return {
        user: {
          id: userId,
          telegramId: 123456789,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
        wallet: {
          id: uuid("wallet"),
          userId,
          balance: 10_000, // 10k units
          lockedBalance: 1_500,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      };
    },
  },

  auctions: {
    async getList(params?: {
      filters?: { status?: AuctionStatus[] | null; sellerId?: string | null };
      pagination?: Pagination;
    }): Promise<{
      total: number;
      pagination: Pagination;
      auctions: AuctionListItem[];
    }> {
      await delay();
      const page = params?.pagination?.page ?? 1;
      const pageSize = params?.pagination?.pageSize ?? 10;
      const auctions: AuctionListItem[] = [
        {
          id: uuid("auc1"),
          status: "active",
          sellerId: uuid("seller1"),
          sellerWalletId: uuid("sw1"),
          settings: { antisniping: true, minBid: 100, minBidDifference: 10 },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
        {
          id: uuid("auc2"),
          status: "ended",
          sellerId: uuid("seller2"),
          sellerWalletId: uuid("sw2"),
          settings: { antisniping: false, minBid: 50, minBidDifference: 5 },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ];
      return {
        total: auctions.length,
        pagination: { page, pageSize },
        auctions,
      };
    },

    async get(auctionId: string): Promise<{ auction: AuctionDetail }> {
      await delay();
      const base: AuctionListItem = {
        id: auctionId,
        status: "active",
        sellerId: uuid("seller"),
        sellerWalletId: uuid("sw"),
        settings: { antisniping: true, minBid: 100, minBidDifference: 10 },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      const items: Item[] = [
        {
          id: "collA_1",
          num: 1,
          collectionName: "collA",
          value: "Golden Gift",
          ownerId: base.sellerId,
        },
        {
          id: "collA_2",
          num: 2,
          collectionName: "collA",
          value: "Silver Gift",
          ownerId: base.sellerId,
        },
      ];
      const round: Round = {
        startTime: nowIso(),
        endTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        itemIds: items.map((i) => i.id),
        items,
      };
      return { auction: { ...base, rounds: [round] } };
    },
  },

  bids: {
    async getMy(): Promise<{ bids: Bid[] }> {
      await delay();
      return {
        bids: [
          {
            id: uuid("bid1"),
            userId: uuid("user"),
            auctionId: uuid("auc1"),
            amount: 250,
            status: "active",
          },
        ],
      };
    },

    async getByAuction(auctionId: string): Promise<{
      my_bids: Bid | null;
      top_bids: Bid[];
    }> {
      await delay();
      const top_bids: Bid[] = Array.from({ length: 5 }).map((_, i) => ({
        id: uuid(`top${i + 1}`),
        userId: uuid(`user${i + 1}`),
        auctionId,
        amount: 200 + i * 25,
        status: i === 0 ? "active" : "lost",
      }));
      return {
        my_bids: top_bids[2],
        top_bids,
      };
    },
  },
};

export type ApiDocs = typeof apiDocs;
