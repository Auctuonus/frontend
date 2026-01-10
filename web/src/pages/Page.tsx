import { useEffect, useState } from "react";
import { apiDocs, setAuth, type AuctionListItem, type AuctionDetail, type Bid } from "../apiDocs";

// This page demonstrates a minimal React UI that calls stubbed API functions
// aligned with backend/docs/mini-swager.md. Replace stubs with real fetch calls
// later without changing this page's component logic.
export default function DemoDocsPage() {
  // React state: component memory that triggers re-render on change
  const [authRaw, setAuthRaw] = useState("");

  const [me, setMe] = useState<{ userId: string; balance: number } | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [auctionId, setAuctionId] = useState("");
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loadingAuction, setLoadingAuction] = useState(false);

  const [bids, setBids] = useState<{ my: Bid | null; top: Bid[] } | null>(null);
  const [loadingBids, setLoadingBids] = useState(false);

  // Example: restore a fake token from localStorage to show auth flow
  useEffect(() => {
    const saved = localStorage.getItem("demo_auth_raw") || "";
    setAuthRaw(saved);
  }, []);

  // Event handler: called on button click
  async function handleSetAuth() {
    setAuth(authRaw);
    localStorage.setItem("demo_auth_raw", authRaw);
  }

  async function handleGetMe() {
    setLoadingMe(true);
    try {
      const res = await apiDocs.users.getMe();
      setMe({ userId: res.user.id, balance: res.wallet.balance });
    } finally {
      setLoadingMe(false);
    }
  }

  async function handleGetList() {
    setLoadingList(true);
    try {
      const res = await apiDocs.auctions.getList({
        filters: { status: ["active"] },
        pagination: { page: 1, pageSize: 10 },
      });
      setAuctions(res.auctions);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleGetAuction() {
    if (!auctionId.trim()) return;
    setLoadingAuction(true);
    try {
      const res = await apiDocs.auctions.get(auctionId.trim());
      setAuction(res.auction);
    } finally {
      setLoadingAuction(false);
    }
  }

  async function handleGetBids() {
    if (!auctionId.trim()) return;
    setLoadingBids(true);
    try {
      const res = await apiDocs.bids.getByAuction(auctionId.trim());
      setBids({ my: res.my_bids, top: res.top_bids });
    } finally {
      setLoadingBids(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Minimal header to show React routing working separately in App.tsx */}
      <h1 className="text-2xl font-bold">Minimal Docs Demo</h1>
      <p className="text-gray-400">Stubbed API + simple React state/effects.</p>

      {/* Auth section */}
      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Authorization</h2>
        <p className="text-sm text-gray-400">
          When real backend is ready, pass header Authorization: tma ${"${initDataRaw}"}
        </p>
        <div className="flex gap-2">
          <input
            placeholder="initDataRaw"
            className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
            value={authRaw}
            onChange={(e) => setAuthRaw(e.target.value)}
          />
          <button onClick={handleSetAuth} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Set token
          </button>
        </div>
      </section>

      {/* GetMe demo */}
      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Users: get_me</h2>
          <button
            onClick={handleGetMe}
            disabled={loadingMe}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loadingMe ? "Loading..." : "Call /users/get_me"}
          </button>
        </div>
        {me && (
          <div className="text-sm text-gray-200">
            <div>User ID: <span className="font-mono">{me.userId}</span></div>
            <div>Wallet balance: <span className="font-semibold">{me.balance}</span></div>
          </div>
        )}
      </section>

      {/* Auctions list demo */}
      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Auctions: get_list</h2>
          <button
            onClick={handleGetList}
            disabled={loadingList}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loadingList ? "Loading..." : "Call /auctions/get_list"}
          </button>
        </div>
        {auctions.length > 0 && (
          <ul className="space-y-2">
            {auctions.map((a) => (
              <li key={a.id} className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.id}</div>
                    <div className="text-xs text-gray-400">status: {a.status}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    minBid: {a.settings.minBid}, diff: {a.settings.minBidDifference}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Auction detail + bids demo */}
      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Auction: get + bids/get_by_auction</h2>
        <div className="flex gap-2">
          <input
            placeholder="auction_id"
            className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
          />
          <button onClick={handleGetAuction} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Get auction
          </button>
          <button onClick={handleGetBids} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            Get bids
          </button>
        </div>

        {loadingAuction && <div className="text-gray-400">Loading auction...</div>}
        {auction && (
          <div className="bg-gray-700 rounded p-3">
            <div className="font-semibold">{auction.id}</div>
            <div className="text-xs text-gray-400">rounds: {auction.rounds.length}</div>
          </div>
        )}

        {loadingBids && <div className="text-gray-400">Loading bids...</div>}
        {bids && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 rounded p-3">
              <div className="font-semibold mb-1">My bid</div>
              {bids.my ? (
                <div className="text-sm">
                  amount: {bids.my.amount}
                </div>
              ) : (
                <div className="text-sm text-gray-400">No bid</div>
              )}
            </div>
            <div className="bg-gray-700 rounded p-3">
              <div className="font-semibold mb-1">Top bids</div>
              <ul className="text-sm space-y-1">
                {bids.top.map((b) => (
                  <li key={b.id} className="flex justify-between">
                    <span className="font-mono">{b.userId.slice(0, 8)}...</span>
                    <span>{b.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* How it works (short note) */}
      <section className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">How this React code works</h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li><b>State</b>: useState keeps data like <code>me</code>, <code>auctions</code>, and <code>bids</code>.</li>
          <li><b>Events</b>: Button onClick handlers call stubbed API and then update state.</li>
          <li><b>Effects</b>: useEffect restores a saved token on mount.</li>
          <li><b>Rendering</b>: JSX reads state and conditionally shows loaders and results.</li>
        </ul>
      </section>
    </div>
  );
}
