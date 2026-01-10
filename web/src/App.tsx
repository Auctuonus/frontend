import { Routes, Route, Link } from "react-router-dom";
import DemoDocsPage from "./pages/Page";

function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-400">
              TG Gift Auctions
            </Link>
            <div />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DemoDocsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
