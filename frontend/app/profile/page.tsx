"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<any>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadUser() {
     const data =
  await getCurrentUser(token!);

      setUser(data);
    }

    loadUser();
  }, [router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>My Profile</h1>

      <div
        className="border rounded-lg p-4 mt-4 shadow"
      >
        <p>
          <strong>Name:</strong>{" "}
          {user.name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user.role}
        </p>

        <p>
          <strong>User ID:</strong>{" "}
          {user.id}
        </p>
      </div>
    </div>
  );
}