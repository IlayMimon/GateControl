import { HashRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PeopleListPage from "./pages/PeopleListPage";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HashRouter>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/people" element={<PeopleListPage />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
