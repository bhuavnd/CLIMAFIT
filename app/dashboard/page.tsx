"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // No user → redirect to landing page
      window.location.href = "/";
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  // Prevent rendering until user is loaded
  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );
  }

  return <Dashboard user={user} />;
}
