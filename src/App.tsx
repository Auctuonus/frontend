import { Routes, Route, Link, useLocation } from "react-router-dom";
import AuctionSimPage from "./pages/AuctionSimPage";
import MyBidsPage from "./pages/MyBidsPage";

function App() {
  const location = useLocation();
  const activeIndex = location.pathname.startsWith("/me") ? 1 : 0;
  return (
    <div className="min-h-screen">
      <nav style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex flex-col items-center gap-3">
            <Link to="/" className="text-base md:text-lg font-semibold text-center whitespace-nowrap leading-tight">
              TG Gift Auctions
            </Link>
            <div className="flex justify-center w-full">
              <div
                className="relative inline-flex items-center rounded-full p-1 border border-white/10 overflow-hidden select-none w-full max-w-[260px]"
                style={{
                  color: "var(--tg-theme-text-color, #111)",
                  backgroundColor: "var(--tg-theme-secondary-bg-color)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                }}
              >
                <span
                  className="absolute top-1 bottom-1 w-1/2 rounded-full"
                  style={{
                    backgroundColor: "var(--tg-theme-button-color, #3b82f6)",
                    transform: `translateX(${activeIndex * 100}%)`,
                    transition: "transform 200ms ease",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
                  }}
                />
                <Link
                  to="/"
                  className={`relative z-10 px-2.5 py-1 text-xs md:text-sm font-medium text-center flex-1 whitespace-nowrap truncate ${
                    activeIndex === 0 ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ color: activeIndex === 0 ? "var(--tg-theme-button-text-color, #fff)" : "var(--tg-theme-text-color, #111)" }}
                >
                  Main
                </Link>
                <Link
                  to="/me"
                  className={`relative z-10 px-2.5 py-1 text-xs md:text-sm font-medium text-center flex-1 whitespace-nowrap truncate ${
                    activeIndex === 1 ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ color: activeIndex === 1 ? "var(--tg-theme-button-text-color, #fff)" : "var(--tg-theme-text-color, #111)" }}
                >
                  My Bids
                </Link>
              </div>
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
