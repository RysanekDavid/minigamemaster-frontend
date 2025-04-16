import { useState, useEffect, useCallback } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"; // Import router komponent
import "./App.css";
// Import stránek
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
// Login komponentu už nepotřebujeme importovat zde

// Definice typu pro uživatelská data zůstává stejná
interface UserData {
  twitchId: string;
  login: string;
  displayName: string;
  email?: string;
  profileImageUrl?: string;
}

// Komponenta pro chráněné trasy (Private Route)
interface ProtectedRouteProps {
  user: UserData | null;
  children: React.ReactNode; // Typ pro React komponenty jako potomky
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) {
    // Pokud uživatel není přihlášen, přesměrujeme na login
    return <Navigate to="/login" replace />;
  }
  // Pokud je přihlášen, zobrazíme požadovanou komponentu
  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Funkce pro ověření stavu přihlášení (zůstává stejná)
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
  }, []); // useCallback zde

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Přidána závislost na checkAuthStatus

  // Funkce pro odhlášení (zůstává stejná)
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        // Po odhlášení můžeme explicitně přesměrovat na login,
        // i když ProtectedRoute by to měla zajistit také.
        // window.location.href = '/login'; // Jednodušší varianta
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  // Zobrazení během načítání (zůstává stejné)
  if (loading) {
    return <div>Loading...</div>;
  }

  // Nastavení routeru a tras
  // BrowserRouter by měl být ideálně v main.tsx, ale pro jednoduchost ho dáme sem
  return (
    <BrowserRouter>
      <Routes>
        {/* Trasa pro přihlášení */}
        <Route path="/login" element={<LoginPage />} />

        {/* Hlavní (chráněná) trasa pro dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              {/* Předáme user a onLogout do DashboardPage */}
              <DashboardPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* TODO: Přidat další trasy podle potřeby */}
        {/* Např. <Route path="/settings" element={<ProtectedRoute user={user}><SettingsPage /></ProtectedRoute>} /> */}

        {/* Fallback trasa pro neexistující cesty (volitelné) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
        {/* Nebo jednoduché přesměrování na hlavní stránku */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
