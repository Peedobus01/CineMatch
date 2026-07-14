import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
