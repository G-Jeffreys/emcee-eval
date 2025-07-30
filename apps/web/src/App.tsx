import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { KaraokeDemo } from "@/pages/KaraokeDemo";
import { KaraokeTest } from "@/pages/KaraokeTest";
import { Button } from "@/components/ui/button";

function App(): React.JSX.Element {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-lg font-bold">
                AI Rap Battle
              </Link>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/">🏠 Home</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/karaoke">🎤 Karaoke</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/karaoke-test">🧪 Test</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/karaoke" element={<KaraokeDemo />} />
          <Route path="/karaoke-test" element={<KaraokeTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
