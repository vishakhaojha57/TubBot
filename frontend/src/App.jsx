// ─────────────────────────────────────────────────────────────
// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root application component with theme system.
// Manages light/dark theme state via localStorage.
// Passes theme + toggle to Navbar. All children inherit the
// CSS class-based theme via <html> element.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";

function App() {
  // ── Theme state — persisted in localStorage ────────────────
  const [theme, setTheme] = useState(
    localStorage.getItem("tubbot-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tubbot-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <ErrorBoundary>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Home />
      <ScrollToTop />
    </ErrorBoundary>
  );
}

export default App;