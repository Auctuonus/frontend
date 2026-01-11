import { Routes, Route, Link } from "react-router-dom";
import AuctionSimPage from "./pages/AuctionSimPage";
import MyBidsPage from "./pages/MyBidsPage";

function App() {
  return (
    <div className="min-h-screen">
      <nav style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center">
            <div />
            <div className="flex justify-center">
              <Link to="/" className="text-xl font-semibold">
                TG Gift Auctions
              </Link>
            </div>
            <div className="flex justify-end">
              <Link to="/me" className="text-sm opacity-80 hover:opacity-100">My Bids</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<AuctionSimPage />} />
          <Route path="/me" element={<MyBidsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
