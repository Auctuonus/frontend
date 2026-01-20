import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import api, { type Bid as ApiBid, type Auction, type AuctionSummary } from "../api/http";

type SimUser = { id: string; name: string };

function fmtStars(n: number) {
  return `${n.toLocaleString()} ⭐`;
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

export default function AuctionSimPage() {
  // Auth: Telegram or mock
  const [user, setUser] = useState<SimUser | null>(null);

  useEffect(() => {
    // Try to read Telegram WebApp user (works inside Telegram only)
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser) {
      const id = String(tgUser.id);
      const name = tgUser.username || tgUser.first_name || "TelegramUser";
      setUser({ id, name });
      try {
        tg.ready?.();
        tg.expand?.();
        if (tg.initData) {
          api.auth.tg(tg.initData).catch(() => {});
        }
      } catch {}
    }
  }, []);

  const [loginTgId, setLoginTgId] = useState("449840517");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const mockLogin = useCallback(async () => {
    const tgId = parseInt(loginTgId, 10);
    if (!tgId || isNaN(tgId)) {
      setLoginError("Enter valid Telegram ID");
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      await api.auth.password(tgId, String(tgId));
      const { user: u } = await api.users.get_me();
      setUser({ id: u.id, name: `TG ${u.telegramId}` });
    } catch (e: any) {
      setLoginError(e?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }, [loginTgId]);
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Auction params (read-only for UI)
  const perRound = 3;

  // Runtime state
  const [roundIndex] = useState(1);
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [topBids, setTopBids] = useState<ApiBid[]>([]);
  const [myBid, setMyBid] = useState<ApiBid | null>(null);
  const [endAtMs, setEndAtMs] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [auctionDetails, setAuctionDetails] = useState<Auction | null>(null);
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);

  // Derived
  const sortedLeaderboard = useMemo(() => {
    const arr: ApiBid[] = [...topBids];
    arr.sort((a: ApiBid, b: ApiBid) => (b.amount - a.amount) || (a.updatedAt.localeCompare(b.updatedAt)));
    return arr;
  }, [topBids]);
  const minToWin = sortedLeaderboard[perRound - 1]?.amount ?? null;
  const myRank = user ? sortedLeaderboard.findIndex((b) => b.userId === user.id) : -1;

  const [amountInput, setAmountInput] = useState(100);
  const placeOrIncreaseBid = useCallback(async () => {
    if (!user || !auctionId) return;
    if (amountInput <= (myBid?.amount ?? 0)) return;
    const res = await api.bids.set_bid({ auctionId, amount: amountInput });
    if (res.status !== "ok") return;
    setAmountInput(res.data?.amount ?? amountInput);
    const { my_bids, top_bids } = await api.bids.get_by_auction(auctionId);
    setMyBid(my_bids);
    setTopBids(top_bids);
  }, [amountInput, auctionId, myBid, user]);

  const loadAuction = useCallback(async (id: string) => {
    setAuctionId(id);
    const { auction } = await api.auctions.get(id);
    const end = auction.rounds?.[0]?.endTime ? Date.parse(auction.rounds[0].endTime) : NaN;
    setEndAtMs(Number.isFinite(end) ? end : null);
    setAuctionDetails(auction);
    const { my_bids, top_bids } = await api.bids.get_by_auction(id);
    setMyBid(my_bids);
    setTopBids(top_bids);
  }, []);

  // Helpers
  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // Effects
  useEffect(() => {
    let t: any;
    if (endAtMs) {
      const tick = () => setTimeLeft(Math.max(0, endAtMs - Date.now()));
      tick();
      t = setInterval(tick, 500);
    } else {
      setTimeLeft(0);
    }
    return () => t && clearInterval(t);
  }, [endAtMs]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setAuctionsLoading(true);
      try {
        const list = await api.auctions.get_list({ filters: { status: ["active"] }, pagination: { page: 1, pageSize: 20 } });
        setAuctions(list.auctions);
        const toSelect = auctionId ?? list.auctions[0]?.id ?? null;
        if (toSelect) await loadAuction(toSelect);
      } finally {
        setAuctionsLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Auth */}
      <section className="tg-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Telegram Auth</div>
            <div className="tg-muted text-sm">
              {user ? (
                <>
                  Signed in as <span className="font-mono">{user.name}</span>
                </>
              ) : (
                <>Not signed in</>
              )}
            </div>
          </div>
          {user && (
            <button onClick={logout} className="tg-btn tg-btn-secondary">
              Logout
            </button>
          )}
        </div>
        {!user && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs tg-muted mb-1">Telegram ID</label>
              <input
                type="text"
                value={loginTgId}
                onChange={(e) => setLoginTgId(e.target.value)}
                className="w-full tg-input"
                placeholder="449840517"
              />
            </div>
            <button onClick={mockLogin} disabled={loginLoading} className="tg-btn disabled:opacity-60">
              {loginLoading ? "..." : "Login"}
            </button>
          </div>
        )}
        {loginError && <div className="text-red-400 text-sm">{loginError}</div>}
      </section>

      {/* Auctions */}
      <section className="tg-card space-y-3">
        <div className="text-lg font-semibold">Auctions</div>
        {!user ? (
          <div className="tg-muted">Sign in to view auctions</div>
        ) : auctionsLoading ? (
          <div className="tg-muted">Loading auctions...</div>
        ) : auctions.length === 0 ? (
          <div className="tg-muted">No active auctions</div>
        ) : (
          <ul className="space-y-2">
            {auctions.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => loadAuction(a.id)}
                  className={`w-full flex items-center justify-between rounded px-3 py-2 ${
                    a.id === auctionId ? "bg-white/10 border border-white/10" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <div className="font-medium">{shortId(a.id)}</div>
                    <div className="text-xs tg-muted">{a.status}</div>
                  </div>
                  <div className="text-xs tg-muted">
                    minBid: <b>{a.settings.minBid}</b>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Controls */}
      <section className="tg-card flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Round #{roundIndex}</div>
          <div className="tg-muted text-sm">State: {timeLeft > 0 ? "active" : "ended"}</div>
        </div>
        <div className="flex items-center">
          <div className={`text-2xl font-mono ${timeLeft < 10_000 ? "text-red-400" : "text-green-300"}`}>
            {timeLeft > 0 ? formatTime(timeLeft) : "--:--"}
          </div>
        </div>
      </section>

      <section className="tg-card space-y-3">
        <div className="text-lg font-semibold">Auction</div>
        {!auctionDetails ? (
          <div className="tg-muted">Loading auction...</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="tg-muted">Auction</div>
                <div className="font-mono">{shortId(auctionDetails.id)}</div>
              </div>
              <div>
                <div className="tg-muted">Status</div>
                <div className="font-medium capitalize">{auctionDetails.status}</div>
              </div>
              <div>
                <div className="tg-muted">Seller</div>
                <div className="font-mono">{shortId(auctionDetails.sellerId)}</div>
              </div>
              <div>
                <div className="tg-muted">Seller Wallet</div>
                <div className="font-mono">{shortId(auctionDetails.sellerWalletId)}</div>
              </div>
              <div>
                <div className="tg-muted">Settings</div>
                <div>
                  <span className="mr-3">Antisniping: <b>{auctionDetails.settings.antisniping ? "on" : "off"}</b></span>
                  <span className="mr-3">Min bid: <b>{auctionDetails.settings.minBid}</b></span>
                  <span>Min diff: <b>{auctionDetails.settings.minBidDifference}</b></span>
                </div>
              </div>
            </div>

            <div>
              <div className="tg-muted mb-1">Rounds</div>
              {(!auctionDetails.rounds || auctionDetails.rounds.length === 0) ? (
                <div className="tg-muted">No rounds</div>
              ) : (
                <ul className="space-y-2">
                  {auctionDetails.rounds.map((r, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                      <div>
                        <div className="font-semibold">Round #{idx + 1}</div>
                        <div className="text-xs tg-muted">
                          <span className="mr-3">Start: {r.startTime ? new Date(r.startTime).toLocaleString() : "—"}</span>
                          <span>End: {r.endTime ? new Date(r.endTime).toLocaleString() : "—"}</span>
                        </div>
                      </div>
                      <div className="text-xs">
                        itemIds: <span className="font-mono">{r.itemIds?.length ?? 0}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* My bid */}
      <section className="tg-card space-y-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-lg font-semibold mb-1">My bid (stars)</label>
            <input
              type="number"
              value={amountInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountInput(parseInt(e.target.value) || 0)}
              className="w-full tg-input"
            />
          </div>
          <button
            onClick={placeOrIncreaseBid}
            disabled={!user || amountInput <= (myBid?.amount ?? 0)}
            className="tg-btn disabled:opacity-60"
          >
            {myBid ? "Increase bid" : "Place bid"}
          </button>
        </div>
        <div className="text-sm tg-muted">
          {myBid ? (
            <>Your current bid: <span className="text-blue-300 font-semibold">{fmtStars(myBid.amount)}</span> {myRank >= 0 && <>· Position: #{myRank + 1}</>}</>
          ) : (
            <>You have no bid yet.</>
          )}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="tg-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Leaderboard</div>
          <div className="text-sm tg-muted">
            Min to win (#{perRound}): {minToWin ? fmtStars(minToWin) : "N/A"}
          </div>
        </div>
        {sortedLeaderboard.length === 0 ? (
          <div className="tg-muted">No bids yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left tg-muted">
                  <th className="pb-2 w-16">Rank</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedLeaderboard.map((b: ApiBid, i: number) => (
                  <tr key={b.userId} className={`${b.userId === user?.id ? "bg-blue-900/20" : ""} ${i < perRound ? "text-green-300" : ""}`}>
                    <td className="py-2">#{i + 1}</td>
                    <td className="py-2 font-mono">{shortId(b.userId)}</td>
                    <td className="py-2 text-right font-semibold">{fmtStars(b.amount)}</td>
                    <td className="py-2 text-right tg-muted">{new Date(b.updatedAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      
    </div>
  );
}
