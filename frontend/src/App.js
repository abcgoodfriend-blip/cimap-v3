import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "sonner";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="h-screen w-screen bg-[var(--bg-app)]" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#121212",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: "2px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                },
              }}
            />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </div>
  );
}
