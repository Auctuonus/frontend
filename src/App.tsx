import { Routes, Route, Link } from "react-router-dom";
import AuctionSimPage from "./pages/AuctionSimPage";

function App() {
  return (
    <div className="min-h-screen">
      <nav style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Link to="/" className="text-xl font-semibold">
              TG Gift Auctions
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<AuctionSimPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
