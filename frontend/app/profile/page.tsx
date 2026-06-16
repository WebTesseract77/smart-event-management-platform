"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  User,
  Mail,
} from "lucide-react";

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
      try {
       const data =
  await getCurrentUser(token!);

        setUser(data);
      } catch (error) {
        localStorage.removeItem(
          "token"
        );

        router.push("/login");
      }
    }

    loadUser();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            My Profile
          </h1>

          <p className="text-muted-foreground text-lg mt-3">
            Manage your account information.
          </p>
        </div>

        <Card className="overflow-hidden shadow-lg rounded-2xl">
          <div className="h-36 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

          <CardContent className="p-10">

            <div className="-mt-20 mb-6">
              <div className="w-20 h-20 rounded-full bg-violet-100 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-violet-700">
                  {user.name
                    ?.charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">

              <div>
                <h2 className="text-3xl font-bold">
                  {user.name}
                </h2>

                <p className="text-muted-foreground mt-1">
                  {user.email}
                </p>

                <Badge
                  className={
                    user.role === "admin"
                      ? "bg-red-100 text-red-700 mt-2"
                      : "bg-violet-100 text-violet-700 mt-2"
                  }
                >
                  {user.role === "admin"
                    ? "Administrator"
                    : "Member"}
                </Badge>
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">

              <Card className="bg-violet-50/40 border-violet-100">
                <CardContent className="p-5 flex items-center gap-4">

                  <div className="p-3 rounded-xl bg-violet-100">
                    <User className="w-5 h-5 text-violet-600" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Full Name
                    </p>

                    <p className="font-semibold">
                      {user.name}
                    </p>
                  </div>

                </CardContent>
              </Card>

              <Card className="bg-violet-50/40 border-violet-100">
                <CardContent className="p-5 flex items-center gap-4">

                  <div className="p-3 rounded-xl bg-violet-100">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Email Address
                    </p>

                    <p className="font-semibold break-all">
                      {user.email}
                    </p>
                  </div>

                </CardContent>
              </Card>

            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}