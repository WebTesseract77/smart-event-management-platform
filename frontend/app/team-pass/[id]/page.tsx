"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Users,
  Crown,
  Download,
  Mail,
  Ticket,
} from "lucide-react";

import { getTeam } from "@/lib/api";

export default function TeamPassPage() {
  const params = useParams();

  const [team, setTeam] =
    useState<any>(null);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data =
          await getTeam(
            Number(params.id)
          );

        setTeam(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadTeam();
  }, [params]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading Team Pass...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-6">

        {/* Page Header */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Team Pass
          </h1>

          <p className="text-muted-foreground mt-2">
            Manage team member QR passes
          </p>
        </div>

        {/* Team Summary */}

        <div
          className="
            bg-background
            border
            rounded-2xl
            shadow-sm
            p-8
            mb-8
          "
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <h2 className="text-3xl font-bold">
                {team.name}
              </h2>

              <p className="text-muted-foreground mt-2">
                Registered Team
              </p>
            </div>

            <div className="flex gap-8">

              <div className="text-center">
                <Users className="w-5 h-5 text-violet-600 mx-auto mb-2" />

                <p className="text-2xl font-bold">
                  {team.members.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  Members
                </p>
              </div>

              

            </div>

          </div>
        </div>

        {/* Member Cards */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          "
        >
          {team.members.map(
            (member: any) => {
              const qrUrl =
                `http://127.0.0.1:8000/${member.qr_code_path.replaceAll(
                  "\\",
                  "/"
                )}`;

              return (
                <div
                  key={member.id}
                  className="
                    bg-background
                    rounded-2xl
                    border
                    shadow-sm
                    hover:shadow-md
                    hover:-translate-y-1
                    transition-all
                    duration-300
                    p-6
                    flex
                    flex-col
                  "
                >
                  <div className="flex justify-between items-start">

                    <div className="flex gap-3">

                      <div
                        className="
                          h-12
                          w-12
                          rounded-full
                          bg-violet-100
                          text-violet-700
                          flex
                          items-center
                          justify-center
                          font-bold
                        "
                      >
                        {member.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {member.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 shrink-0" />

                          <span className="truncate max-w-[220px]">
                            {member.email}
                          </span>
                        </div>
                      </div>

                    </div>

                    {member.is_leader && (
                      <div
                        className="
                          flex
                          items-center
                          gap-1
                          px-3
                          py-1
                          rounded-full
                          bg-violet-100
                          text-violet-700
                          text-xs
                          font-medium
                        "
                      >
                        <Crown className="w-3 h-3" />
                        Leader
                      </div>
                    )}

                  </div>

                  <div className="flex justify-center my-6">

                    <img
                      src={qrUrl}
                      alt="QR Pass"
                      className="
                        w-56
                        h-56
                        object-contain
                      "
                    />

                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Member ID: {member.id}
                  </div>

                  <div className="mt-auto pt-4">

                    <a
                      href={qrUrl}
                      download
                      className="
                        w-full
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-primary
                        text-primary-foreground
                        py-3
                        font-medium
                        hover:opacity-90
                        transition
                      "
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </a>

                  </div>

                </div>
              );
            }
          )}
        </div>

      </div>
    </div>
  );
}