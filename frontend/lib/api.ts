const API_URL = "http://127.0.0.1:8000/api/v1";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  return response.json();
}

export async function loginUser(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return response.json();
}

export async function getEvents() {
  const response = await fetch(
    `${API_URL}/events`
  );

  return response.json();
}
export async function createEvent(
  token: string,
  event: {
    title: string;
    description: string;
    location: string;
    image_url?: string;
    capacity: number;
    start_date: string;
    end_date: string;
    is_team_event?: boolean;
    min_team_size?: number;
    max_team_size?: number;
  }
) {
  const response = await fetch(
    `${API_URL}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    }
  );

  return response.json();
}
export async function deleteEvent(
  token: string,
  eventId: number
) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/v1/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response;
}
export async function updateEvent(
  token: string,
  eventId: number,
  data: any
) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/v1/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}
export async function registerForEvent(
  token: string,
  eventId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/register`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

export async function getMyRegistrations(
  token: string
) {
  const response = await fetch(
    `${API_URL}/me/registrations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

export async function getMyTeamRegistrations(
  token: string
) {
  const response = await fetch(
    `${API_URL}/me/team-registrations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}
export async function getCurrentUser(
  token: string
) {
  const response = await fetch(
    `${API_URL}/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Authentication failed"
    );
  }

  return response.json();
}
export async function unregisterFromEvent(
  token: string,
  eventId: number
) {
  return fetch(
    `${API_URL}/events/${eventId}/register`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
export async function getEvent(
  eventId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}`
  );

  return response.json();
}
export async function getParticipants(
  token: string,
  eventId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/participants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load participants"
    );
  }

  return response.json();
}
export async function markAttendance(
  token: string,
  eventId: number,
  userId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attendance/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark attendance"
    );
  }

  return response.json();
}

export async function getAttendance(
  token: string,
  eventId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attendance`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load attendance"
    );
  }

  return response.json();
}
export async function getRegistration(
  token: string,
  registrationId: number
) {
  const response = await fetch(
    `${API_URL}/registrations/${registrationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
  console.log(
    "REGISTRATION STATUS:",
    response.status
  );

  console.log(
    "REGISTRATION RESPONSE:",
    await response.text()
  );

  throw new Error(
    "Failed to load registration"
  );
}

  return response.json();
}
export async function getAnalytics(
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/analytics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load analytics"
    );
  }

  return response.json();
}
export async function getTeam(
  teamId: number
) {
  const response =
    await fetch(
      `${API_URL}/teams/${teamId}`
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load team"
    );
  }

  return response.json();
}