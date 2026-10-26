"use client";

import { BookOpen } from "lucide-react";
import { useState } from "react";
import { DemoAccountSelector } from "@/components/login/demo-account-selector";
import { LoginForm } from "@/components/login/login-form";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const handleLogin = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(email, pass);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail: string) => {
    setError(null);
    setActiveDemo(demoEmail);
    try {
      await demoLogin(demoEmail);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in with demo account",
      );
    } finally {
      setActiveDemo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          BookLeaf Publishing
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Author Support & Communication Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <DemoAccountSelector
            onSelect={handleDemoSelect}
            activeDemo={activeDemo}
            disabled={loading}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                Or sign in with email
              </span>
            </div>
          </div>

          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            disabled={activeDemo !== null}
          />
        </div>
      </div>
    </div>
  );
}
