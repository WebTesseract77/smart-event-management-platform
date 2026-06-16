"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const emptyMember = {
  name: "",
  email: "",
  college: "",
  branch: "",
  year: "",
  semester: "",
  is_leader: false,
};

export default function TeamRegistrationPage() {
  const params = useParams();
  const router = useRouter();

  const [teamName, setTeamName] =
    useState("");

  const [members, setMembers] =
    useState([
      {
        ...emptyMember,
        is_leader: true,
      },
    ]);

  function addMember() {
    setMembers([
      ...members,
      { ...emptyMember },
    ]);
  }

  function removeMember(index: number) {
    const updated =
      [...members];

    updated.splice(index, 1);

    setMembers(updated);
  }

  function updateMember(
    index: number,
    field: string,
    value: string
  ) {
    const updated =
      [...members];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setMembers(updated);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      alert(
        "Please login first"
      );
      return;
    }

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/api/v1/teams/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              event_id: Number(
                params.id
              ),
              team_name:
                teamName,
              members,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Registration failed"
        );
      }

      alert(
        "Team registered successfully"
      );

      router.push(
        "/events"
      );
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto bg-background border rounded-xl p-8 shadow">

        <h1 className="text-3xl font-bold mb-6">
          Team Registration
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          <div>
            <label className="block mb-2 font-medium">
              Team Name
            </label>

            <input
              className="w-full border rounded-lg p-3"
              value={teamName}
              onChange={(e) =>
                setTeamName(
                  e.target.value
                )
              }
              required
            />
          </div>

          {members.map(
            (
              member,
              index
            ) => (
              <div
                key={index}
                className="border rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between">

                  <h2 className="font-semibold">
                    Member{" "}
                    {index + 1}
                    {member.is_leader &&
                      " (Leader)"}
                  </h2>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeMember(
                          index
                        )
                      }
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  )}

                </div>

                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="Name"
                  value={
                    member.name
                  }
                  onChange={(e) =>
                    updateMember(
                      index,
                      "name",
                      e.target
                        .value
                    )
                  }
                  required
                />

                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="Email"
                  type="email"
                  value={
                    member.email
                  }
                  onChange={(e) =>
                    updateMember(
                      index,
                      "email",
                      e.target
                        .value
                    )
                  }
                  required
                />

                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="College"
                  value={
                    member.college
                  }
                  onChange={(e) =>
                    updateMember(
                      index,
                      "college",
                      e.target
                        .value
                    )
                  }
                  required
                />

                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="Branch"
                  value={
                    member.branch
                  }
                  onChange={(e) =>
                    updateMember(
                      index,
                      "branch",
                      e.target
                        .value
                    )
                  }
                  required
                />

                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="Year"
                  value={
                    member.year
                  }
                  onChange={(e) =>
                    updateMember(
                      index,
                      "year",
                      e.target
                        .value
                    )
                  }
                  required
                />

                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="Semester"
                  value={
                    member.semester
                  }
                  onChange={(e) =>
                    updateMember(
                      index,
                      "semester",
                      e.target
                        .value
                    )
                  }
                  required
                />

              </div>
            )
          )}

          <button
            type="button"
            onClick={addMember}
            className="border rounded-lg px-4 py-2"
          >
            + Add Member
          </button>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg p-3"
          >
            Register Team
          </button>

        </form>
      </div>
    </div>
  );
}