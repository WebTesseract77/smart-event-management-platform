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
  Shield,
  Hash,
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
  localStorage.removeItem("token");
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            My Profile
          </h1>

          <p className="text-muted-foreground text-lg mt-3">
            Manage your account information.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="overflow-hidden shadow-lg">
          <div className="h-36 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

          <CardContent className="p-8">

            {/* Avatar */}
            <div className="-mt-20 mb-6">
              <div className="w-28 h-28 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
            </div>

            {/* Main Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">
                  {user.name}
                </h2>

                <p className="text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>

              <Badge className="w-fit">
                {user.role}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mt-8">

              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <User className="w-5 h-5" />

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

              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Mail className="w-5 h-5" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Email Address
                    </p>

                    <p className="font-semibold">
                      {user.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Shield className="w-5 h-5" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Role
                    </p>

                    <p className="font-semibold">
                      {user.role}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Hash className="w-5 h-5" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      User ID
                    </p>

                    <p className="font-semibold">
                      #{user.id}
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