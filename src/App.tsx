import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HotspotWorkbench } from "./pages/HotspotWorkbench";
import { WeatherPage } from "./pages/WeatherPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HotspotWorkbench />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}