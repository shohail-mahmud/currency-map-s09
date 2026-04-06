import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AdminLogin() {
  const { user, loading, signIn, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;

  if (user) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="fixed left-3 top-3 z-40 px-2 py-1 text-[10px] text-[#9CA3AF] opacity-60 hover:opacity-100 transition-opacity sm:left-4 sm:top-4 sm:text-[11px]"
        style={{ fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif', letterSpacing: "0.06em" }}
      >
        Logout
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-3 z-40 px-2 py-1 text-[10px] text-[#9CA3AF] opacity-40 hover:opacity-80 transition-opacity sm:left-4 sm:top-4 sm:text-[11px]"
        style={{ fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif', letterSpacing: "0.06em", fontWeight: 600 }}
      >
        Admin
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
    } else {
      setIsOpen(false);
      setEmail("");
      setPassword("");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed left-3 top-3 z-40 sm:left-4 sm:top-4">
      <form
        onSubmit={handleSubmit}
        className="w-[220px] border border-[#1F2933] bg-[#111827] p-3 text-[11px] sm:w-[240px]"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#E5E7EB]">Admin Login</span>
          <button
            type="button"
            onClick={() => { setIsOpen(false); setError(""); }}
            className="text-[10px] text-[#9CA3AF] hover:text-[#E5E7EB]"
          >
            ✕
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mb-1.5 w-full border border-[#1F2933] bg-[#0F172A] px-2 py-1.5 text-[11px] text-[#E5E7EB] placeholder-[#6B7280] outline-none focus:border-[#374151]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mb-2 w-full border border-[#1F2933] bg-[#0F172A] px-2 py-1.5 text-[11px] text-[#E5E7EB] placeholder-[#6B7280] outline-none focus:border-[#374151]"
        />

        {error && (
          <p className="mb-1.5 text-[10px] text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-[#1F2933] bg-[#1F2933] px-2 py-1.5 text-[11px] text-[#E5E7EB] hover:bg-[#374151] disabled:opacity-50"
        >
          {submitting ? "..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
