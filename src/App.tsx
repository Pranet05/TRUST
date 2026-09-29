import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ErrorMemory from './pages/ErrorMemory';
import ReplayLab from './pages/ReplayLab';
import Validation from './pages/Validation';
import WeatherSuite from './pages/WeatherSuite';
import HeatMapPage from './pages/HeatMapPage';
import About from './pages/About';

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/heatmap" element={<HeatMapPage />} />
          <Route path="/error-memory" element={<ErrorMemory />} />
          <Route path="/replay-lab" element={<ReplayLab />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/weather-suite" element={<WeatherSuite />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);
}
