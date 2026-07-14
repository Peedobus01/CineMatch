import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import MovieDetails from "./pages/MovieDetails";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth routes render without the navbar shell */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Everything else shares the navbar layout */}
        <Route element={<AppLayout />}>
          {/* Private routes — require a logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            {/* <Route
              path="/discover"
              element={
                <Placeholder title="Discover" phaseNote="Phase 5 — filters + ranked search land here." />
              }
            /> */}
            <Route path="/discover" element={<Discover />} />
            <Route path="/movie/:tmdbId" element={<MovieDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
