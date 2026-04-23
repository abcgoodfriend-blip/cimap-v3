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
              theme="light"
              toastOptions={{
                style: {
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  color: "#0a0a0a",
                  borderRadius: "2px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                },
              }}
            />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </div>
  );
}
