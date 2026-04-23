import React, { createContext, useContext, useEffect, useState } from "react";
import { loginExternal } from "@/lib/api";

const AuthCtx = createContext(null);

const MOCK_USERS = {
  executive: { id: "mock-exec", name: "A. Rao", email: "exec@demo", role: "executive" },
  analyst: { id: "mock-analyst", name: "N. Shah", email: "analyst@demo", role: "analyst" },
  pr: { id: "mock-pr", name: "K. Iyer", email: "pr@demo", role: "pr" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("executive");

  useEffect(() => {
    const stored = localStorage.getItem("osint_user");
    const storedRole = localStorage.getItem("osint_role");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) { /* noop */ }
    }
    if (storedRole) setRole(storedRole);
    setReady(true);
  }, []);

  const loginDemo = (selectedRole = "executive") => {
    const u = MOCK_USERS[selectedRole] || MOCK_USERS.executive;
    const token = `demo.${selectedRole}.${Date.now()}`;
    localStorage.setItem("osint_token", token);
    localStorage.setItem("osint_user", JSON.stringify(u));
    localStorage.setItem("osint_role", selectedRole);
    setUser(u);
    setRole(selectedRole);
    return { ok: true, mock: true };
  };

  const login = async (email, password) => {
    const res = await loginExternal(email, password);
    if (res.ok) {
      const token = res.data.token || res.data.access_token || res.data.jwt;
      const u = res.data.user || { email, name: email, role: "analyst" };
      if (token) localStorage.setItem("osint_token", token);
      localStorage.setItem("osint_user", JSON.stringify(u));
      localStorage.setItem("osint_role", u.role || "analyst");
      setUser(u);
      setRole(u.role || "analyst");
      return { ok: true };
    }
    return { ok: false, error: res.error };
  };

  const logout = () => {
    localStorage.removeItem("osint_token");
    localStorage.removeItem("osint_user");
    setUser(null);
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem("osint_role", newRole);
  };

  return (
    <AuthCtx.Provider value={{ user, role, ready, login, loginDemo, logout, switchRole }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
