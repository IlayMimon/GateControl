import { HashRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <HashRouter>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
