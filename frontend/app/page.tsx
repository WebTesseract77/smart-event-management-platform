import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">

      <h1 className="text-5xl font-bold text-center">
        Smart Event Management
      </h1>

      <p className="mt-6 text-lg text-center max-w-2xl">
        Create events, manage registrations,
        track participants and organize
        everything from one platform.
      </p>

      <div className="flex gap-4 mt-8">

        <Link
          href="/register"
          className="border rounded-lg px-5 py-3"
        >
          Get Started
        </Link>

        <Link
          href="/events"
          className="border rounded-lg px-5 py-3"
        >
          View Events
        </Link>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">

        <div className="border rounded-lg p-6 shadow">
          <h3 className="font-bold">
            Create Events
          </h3>

          <p className="mt-2">
            Organize workshops,
            conferences and meetups.
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow">
          <h3 className="font-bold">
            Register Easily
          </h3>

          <p className="mt-2">
            Join events with a
            single click.
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow">
          <h3 className="font-bold">
            Manage Participation
          </h3>

          <p className="mt-2">
            Track registrations and
            event activity.
          </p>
        </div>

      </div>

    </main>
  );
}