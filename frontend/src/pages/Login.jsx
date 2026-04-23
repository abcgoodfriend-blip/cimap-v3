import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Radio, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login, loginDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("executive");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Authenticated", { description: "Live backend session established" });
      nav("/", { replace: true });
    } else {
      toast.error("Login failed", { description: (res.error || "") + " — use demo mode to continue." });
    }
  };

  const handleDemo = () => {
    loginDemo(role);
    toast.success(`Demo session: ${role.toUpperCase()}`, { description: "Operating with mock intelligence feed" });
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] grid-bg relative overflow-hidden" data-testid="login-page">
      {/* Accent grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] min-h-screen">
        {/* Left side - branding */}
        <div className="hidden lg:flex flex-col justify-between p-10 border-r border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--sev-critical)] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-display text-sm tracking-widest uppercase">CIMAP</div>
              <div className="label-micro mt-0.5">Corporate Intelligence · Monitor · Assess · Predict</div>
            </div>
          </div>

          <div>
            <div className="label-micro mb-4">SYSTEM STATUS</div>
            <h1 className="font-display text-5xl xl:text-6xl leading-[0.95] tracking-tight">
              OSINT<br />
              <span className="text-white/60">INTELLIGENCE</span><br />
              COMMAND CENTER
            </h1>
            <p className="mt-6 text-sm text-white/60 max-w-md leading-relaxed">
              Real-time monitoring of public perception, risks, and emerging threats across
              social media, news, and digital ecosystems — for ventures, sites, and narratives at scale.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-px bg-white/10">
              {[
                { k: "Signals", v: "24/7" },
                { k: "Sources", v: "12+" },
                { k: "Latency", v: "<3s" },
              ].map((s) => (
                <div key={s.k} className="bg-[var(--bg-app)] p-4">
                  <div className="label-micro">{s.k}</div>
                  <div className="mt-1 font-display text-2xl">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <Radio className="w-3.5 h-3.5 text-[var(--sev-low)] pulse-dot" />
            <span>Uplink to Adani CIMAP backend · wss://... /ws/dashboard</span>
          </div>
        </div>

        {/* Right side - auth */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-9 h-9 bg-[var(--sev-critical)] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-black" />
              </div>
              <div className="font-display text-sm tracking-widest uppercase">CIMAP</div>
            </div>

            <div className="label-micro mb-2">Authorized Access</div>
            <h2 className="font-display text-3xl tracking-tight">Sign in</h2>
            <p className="mt-2 text-xs text-white/50">
              Connect to the live backend or continue with a demo role.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-3">
              <div>
                <label className="label-micro block mb-1.5">Email</label>
                <Input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@adani.local"
                  className="bg-[var(--bg-surface)] border-white/15 text-white h-10 rounded-none"
                />
              </div>
              <div>
                <label className="label-micro block mb-1.5">Password</label>
                <Input
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[var(--bg-surface)] border-white/15 text-white h-10 rounded-none"
                />
              </div>
              <Button
                type="submit"
                data-testid="login-submit-btn"
                disabled={loading}
                className="w-full h-10 rounded-none bg-white text-black hover:bg-white/90 font-medium tracking-wide"
              >
                {loading ? "Authenticating..." : "Authenticate"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center"><span className="bg-[var(--bg-app)] px-3 label-micro">Demo Access</span></div>
            </div>

            <div>
              <div className="label-micro mb-2">Choose role</div>
              <div className="grid grid-cols-3 gap-px bg-white/10 mb-3">
                {["executive", "analyst", "pr"].map((r) => (
                  <button
                    key={r}
                    data-testid={`role-select-${r}`}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                      role === r ? "bg-white text-black" : "bg-[var(--bg-surface)] text-white/60 hover:text-white hover:bg-[var(--bg-panel)]"
                    }`}
                  >
                    {r === "pr" ? "PR Team" : r}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                data-testid="login-demo-btn"
                onClick={handleDemo}
                variant="outline"
                className="w-full h-10 rounded-none border-white/20 bg-transparent text-white hover:bg-white/5"
              >
                Continue in Demo Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
