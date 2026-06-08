"use client";

import Link from "next/link";

export default function Navbar() {
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <nav
      style={{
        padding: "15px",
        borderBottom: "1px solid #ddd",
        marginBottom: "20px",
      }}
    >
      <Link href="/">
        Home
      </Link>

      {" | "}
      <Link href="/dashboard">
  Dashboard
</Link>

{" | "}

      <Link href="/register">
        Register
      </Link>

      {" | "}

      <Link href="/login">
        Login
      </Link>

      {" | "}

      <Link href="/events">
        Events
      </Link>
{" | "}

      <Link href="/profile">
  Profile
</Link>

{" | "}


<Link href="/my-registrations">
  My Registrations
</Link>
      {" | "}


      <Link href="/create-event">
        Create Event
      </Link>

      {" | "}

      <button onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
