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
  eventData: {
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
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
      body: JSON.stringify(eventData),
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

  return response.json();
}export async function unregisterFromEvent(
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
  eventId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/participants`
  );

  return response.json();
}
export async function markAttendance(
  eventId: number,
  userId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attendance/${userId}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed"
    );
  }

  return data;
}

export async function getAttendance(
  eventId: number
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attendance`
  );

  return response.json();
}
export async function getRegistration(
  registrationId: number
) {
  const response = await fetch(
    `${API_URL}/registrations/${registrationId}`
  );

  return response.json();
}
