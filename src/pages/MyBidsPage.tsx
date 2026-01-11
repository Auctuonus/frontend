import { useEffect, useMemo, useState } from "react";
import api, { type Bid as ApiBid } from "../api/stubs";

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

function fmtStars(n: number) {
  return `${n.toLocaleString()} ⭐`;
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<ApiBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.bids.get_my();
        setBids(res.bids);
      } catch (e: any) {
        try {
          await api.auth.refresh("mock");
          const res = await api.bids.get_my();
          setBids(res.bids);
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...bids];
    arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return arr;
  }, [bids]);

  return (
    <div className="space-y-6">
      <section className="tg-card">
        <div className="text-lg font-semibold">My Bids</div>
      </section>

      <section className="tg-card">
        {loading ? (
          <div className="tg-muted">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="tg-muted">You have no bids yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left tg-muted">
                  <th className="pb-2">Auction</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 font-mono">{shortId(b.auctionId)}</td>
                    <td className="py-2 text-right font-semibold">{fmtStars(b.amount)}</td>
                    <td className="py-2 capitalize">{b.status}</td>
                    <td className="py-2 tg-muted">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="py-2 tg-muted">{new Date(b.updatedAt).toLocaleString()}</td>
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
