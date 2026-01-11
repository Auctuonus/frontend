import { useCallback, useEffect, useMemo, useState } from "react";

type SimUser = { id: string; name: string };

type Bid = {
  userId: string;
  amount: number;
  updatedAt: number; // used to break ties: earlier beats later
};

type Winner = {
  round: number;
  userId: string;
  amount: number;
  giftNumber: number;
};

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
      } catch {}
    }
  }, []);

  const mockLogin = useCallback(() => {
    const id = `mock-${Math.random().toString(16).slice(2, 10)}`;
    setUser({ id, name: `Mock ${id.slice(-4)}` });
  }, []);
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Auction config
  const [totalGifts, setTotalGifts] = useState(10);
  const [perRound, setPerRound] = useState(3);
  const [roundDurationSec, setRoundDurationSec] = useState(60);

  // Runtime state
  const [roundIndex, setRoundIndex] = useState(1);
  const [state, setState] = useState<"idle" | "running" | "ended">("idle");
  const [endAt, setEndAt] = useState<number | null>(null);

  const [bids, setBids] = useState<Bid[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (state !== "running" || !endAt) {
      setTimeLeft(0);
      return;
    }
    const tick = () => setTimeLeft(Math.max(0, endAt - Date.now()));
    tick();
    const t = setInterval(tick, 200);
    return () => clearInterval(t);
  }, [state, endAt]);

  // Derived
  const giftsAssigned = winners.length;
  const giftsLeft = Math.max(0, totalGifts - giftsAssigned);
  const sortedLeaderboard = useMemo(() => {
    const arr = [...bids];
    arr.sort((a, b) => (b.amount - a.amount) || (a.updatedAt - b.updatedAt));
    return arr;
  }, [bids]);
  const minToWin = sortedLeaderboard[perRound - 1]?.amount ?? null;
  const myBid = user ? bids.find((b) => b.userId === user.id) ?? null : null;
  const myRank = user ? sortedLeaderboard.findIndex((b) => b.userId === user.id) : -1;

  // Actions
  const startRound = useCallback(() => {
    if (state === "ended") return;
    if (giftsLeft <= 0) return;
    setState("running");
    setEndAt(Date.now() + roundDurationSec * 1000);
  }, [giftsLeft, roundDurationSec, state]);

  const endRound = useCallback(() => {
    if (state !== "running") return;
    const capacity = Math.min(perRound, giftsLeft);
    if (capacity <= 0) {
      setState("ended");
      return;
    }

    const sorted = [...sortedLeaderboard];
    const winnersNow = sorted.slice(0, capacity);
    const nextGiftStart = giftsAssigned + 1;

    const roundWinners: Winner[] = winnersNow.map((b, i) => ({
      round: roundIndex,
      userId: b.userId,
      amount: b.amount,
      giftNumber: nextGiftStart + i,
    }));

    const remainingBids = bids.filter((b) => !winnersNow.some((w) => w.userId === b.userId));

    const allWinners = [...winners, ...roundWinners];
    setWinners(allWinners);
    setBids(remainingBids);

    const finished = allWinners.length >= totalGifts;
    if (finished) {
      setState("ended");
      setEndAt(null);
    } else {
      setState("idle");
      setEndAt(null);
      setRoundIndex((i) => i + 1);
    }
  }, [bids, giftsAssigned, giftsLeft, perRound, roundIndex, sortedLeaderboard, state, totalGifts, winners]);

  const [amountInput, setAmountInput] = useState(100);
  const placeOrIncreaseBid = useCallback(() => {
    if (!user) return;
    if (amountInput <= 0) return;
    setBids((prev) => {
      const idx = prev.findIndex((b) => b.userId === user.id);
      const now = Date.now();
      if (idx === -1) {
        return [...prev, { userId: user.id, amount: amountInput, updatedAt: now }];
      }
      if (amountInput <= prev[idx].amount) {
        return prev;
      }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], amount: amountInput, updatedAt: now };
      return copy;
    });
  }, [amountInput, user]);

  // Helpers
  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // Refunds for my user (when auction ended)
  const myRefund = useMemo(() => {
    if (!user || state !== "ended") return 0;
    const b = bids.find((x) => x.userId === user.id);
    return b?.amount ?? 0;
  }, [user, state, bids]);

  return (
    <div className="space-y-6">
      {/* Auth */}
      <section className="tg-card flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Telegram Auth</div>
          <div className="tg-muted text-sm">
            {user ? (
              <>
                Signed in as <span className="font-mono">{user.name}</span>
              </>
            ) : (
              <>Not signed in (use Telegram or Mock Login)</>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!user && (
            <button onClick={mockLogin} className="tg-btn">
              Mock Login
            </button>
          )}
          {user && (
            <button onClick={logout} className="tg-btn tg-btn-secondary">
              Logout
            </button>
          )}
        </div>
      </section>

      {/* Config */}
      <section className="tg-card space-y-3">
        <div className="text-lg font-semibold">Auction Config</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm tg-muted mb-1">Total gifts</label>
            <input
              type="number"
              value={totalGifts}
              onChange={(e) => setTotalGifts(parseInt(e.target.value) || 0)}
              className="w-full tg-input"
            />
          </div>
          <div>
            <label className="block text-sm tg-muted mb-1">Per round</label>
            <input
              type="number"
              value={perRound}
              onChange={(e) => setPerRound(parseInt(e.target.value) || 0)}
              className="w-full tg-input"
            />
          </div>
          <div>
            <label className="block text-sm tg-muted mb-1">Round duration (sec)</label>
            <input
              type="number"
              value={roundDurationSec}
              onChange={(e) => setRoundDurationSec(parseInt(e.target.value) || 0)}
              className="w-full tg-input"
            />
          </div>
        </div>
        <div className="text-sm tg-muted">Assigned: {giftsAssigned} / {totalGifts}</div>
      </section>

      {/* Controls */}
      <section className="tg-card flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Round #{roundIndex}</div>
          <div className="tg-muted text-sm">State: {state}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-mono ${timeLeft < 10_000 ? "text-red-400" : "text-green-300"}`}>
            {state === "running" ? formatTime(timeLeft) : "--:--"}
          </div>
          {state !== "running" && giftsLeft > 0 && (
            <button onClick={startRound} className="tg-btn tg-btn-success">
              Start round
            </button>
          )}
          {state === "running" && (
            <button onClick={endRound} className="tg-btn tg-btn-danger">
              End round
            </button>
          )}
        </div>
      </section>

      {/* My bid */}
      <section className="tg-card space-y-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm tg-muted mb-1">My bid (stars)</label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(parseInt(e.target.value) || 0)}
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
                {sortedLeaderboard.map((b, i) => (
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

      {/* Winners history */}
      <section className="tg-card space-y-3">
        <div className="text-lg font-semibold">Winners</div>
        {winners.length === 0 ? (
          <div className="tg-muted">No winners yet</div>
        ) : (
          <ul className="space-y-2">
            {winners.map((w) => (
              <li key={`${w.giftNumber}-${w.userId}`} className="flex justify-between tg-card">
                <div>
                  <span className="font-semibold">Gift #{w.giftNumber}</span>
                  <span className="ml-2 text-xs tg-muted">(round {w.round})</span>
                </div>
                <div className="text-sm">
                  <span className="font-mono mr-3">{shortId(w.userId)}</span>
                  <span className="text-yellow-300">{fmtStars(w.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {state === "ended" && (
        <section className="tg-card text-sm" style={{ borderColor: "#2ab673" }}>
          Auction ended. {user && <>Your refund: <b>{fmtStars(myRefund)}</b></>}
        </section>
      )}
    </div>
  );
}
