import { Outlet, useLocation, useNavigate } from "react-router";
import { Compass, CalendarDays, Map, Trophy, User } from "lucide-react";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: "/", icon: Compass, label: "Discover" },
    { path: "/my-events", icon: CalendarDays, label: "My Events" },
    { path: "/map", icon: Map, label: "Map" },
    { path: "/achievements", icon: Trophy, label: "Achievements" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative w-full max-w-[430px] h-[932px] bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col overflow-hidden shadow-2xl">
        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center h-20 px-2">
            {tabs.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? "text-purple-600 bg-purple-100"
                      : "text-gray-500 active:text-gray-700"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
