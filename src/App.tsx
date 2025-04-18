import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// Import ThemeProvider and Shell
import { CustomThemeProvider } from "./components/ThemeProvider";
import { DashboardShell } from "./components/DashboardShell";

// Import Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
// Placeholder imports for other pages (create these files later)
// import ChatbotPage from "./pages/ChatbotPage";
import GamesPage from "./pages/GamesPage";
// import ModerationPage from "./pages/ModerationPage";
// import AnalyticsPage from "./pages/AnalyticsPage";
// import SettingsPage from "./pages/SettingsPage";

// Define UserData type
interface UserData {
  twitchId: string;
  login: string;
  displayName: string;
  email?: string;
  profileImageUrl?: string;
}

// ProtectedRoute component remains the same
interface ProtectedRouteProps {
  user: UserData | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// AppContent Component to use router hooks
const AppContent = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page from current path
  const getActivePageFromPath = (path: string) => {
    if (path === "/") return "dashboard";
    return path.substring(1); // Remove leading slash
  };

  const activePage = getActivePageFromPath(location.pathname);

  // Function to handle navigation within the shell
  const handleNavigate = (page: string) => {
    navigate(`/${page === "dashboard" ? "" : page}`);
  };

  // Function to check auth status (remains the same)
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/status");
      if (response.ok) {
        const userData: UserData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Function for logout (remains the same)
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        navigate("/"); // Navigate to dashboard on logout
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [navigate]);

  // Loading state display (remains the same)
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CustomThemeProvider>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Main Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <DashboardShell
                user={user!}
                onLogout={handleLogout}
                activePage={activePage}
                onNavigate={handleNavigate}
              >
                <DashboardPage user={user} onLogout={handleLogout} />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/games"
          element={
            <ProtectedRoute user={user}>
              <DashboardShell
                user={user!}
                onLogout={handleLogout}
                activePage={activePage}
                onNavigate={handleNavigate}
              >
                <GamesPage />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        {/* Add routes for other pages as they are implemented */}
        {/* <Route path="/chatbot" element={...} /> */}
        {/* <Route path="/moderation" element={...} /> */}
        {/* <Route path="/analytics" element={...} /> */}
        {/* <Route path="/settings" element={...} /> */}

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomThemeProvider>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
