import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export const AdminLoginPage = () => {
  useDocumentMeta("Admin Login", "Secure admin access for Johnny Fishing Tackle product management.");

  const { isAdmin, login } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await login(username, password);
    if (!ok) {
      setError("Invalid admin credentials.");
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-3xl text-slate-900">Admin Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in to access product management tools.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </label>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button type="submit" className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          Login as Admin
        </button>
      </form>
    </div>
  );
};
