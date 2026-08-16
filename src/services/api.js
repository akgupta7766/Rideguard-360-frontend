const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";
// ==========================================
// BASE API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}


// ==========================================
// AUTH
// ==========================================

export async function registerUser(userData) {
  return apiRequest(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(userData),
    }
  );
}


export async function loginUser(credentials) {
  return apiRequest(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
}


export async function getCurrentUser(token) {
  return apiRequest(
    "/api/auth/me",
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}


// ==========================================
// BUSES
// ==========================================

export async function getBuses() {
  return apiRequest(
    "/api/buses/",
    {
      method: "GET",
    }
  );
}


export async function createBus(busData) {
  return apiRequest(
    "/api/buses/",
    {
      method: "POST",
      body: JSON.stringify(busData),
    }
  );
}


export async function updateBus(
  busId,
  busData
) {
  return apiRequest(
    `/api/buses/${busId}`,
    {
      method: "PUT",
      body: JSON.stringify(busData),
    }
  );
}


export async function deleteBus(busId) {
  return apiRequest(
    `/api/buses/${busId}`,
    {
      method: "DELETE",
    }
  );
}


// ==========================================
// DRIVERS
// ==========================================

export async function getDrivers() {
  return apiRequest(
    "/api/drivers/",
    {
      method: "GET",
    }
  );
}


export async function createDriver(
  driverData
) {
  return apiRequest(
    "/api/drivers/",
    {
      method: "POST",
      body: JSON.stringify(driverData),
    }
  );
}


export async function updateDriver(
  driverId,
  driverData
) {
  return apiRequest(
    `/api/drivers/${driverId}`,
    {
      method: "PUT",
      body: JSON.stringify(driverData),
    }
  );
}


export async function deleteDriver(
  driverId
) {
  return apiRequest(
    `/api/drivers/${driverId}`,
    {
      method: "DELETE",
    }
  );
}


// ==========================================
// STUDENTS
// ==========================================

export async function getStudents() {
  return apiRequest(
    "/api/students/",
    {
      method: "GET",
    }
  );
}


export async function createStudent(
  studentData
) {
  return apiRequest(
    "/api/students/",
    {
      method: "POST",
      body: JSON.stringify(studentData),
    }
  );
}


export async function updateStudent(
  studentId,
  studentData
) {
  return apiRequest(
    `/api/students/${studentId}`,
    {
      method: "PUT",
      body: JSON.stringify(studentData),
    }
  );
}


export async function deleteStudent(
  studentId
) {
  return apiRequest(
    `/api/students/${studentId}`,
    {
      method: "DELETE",
    }
  );
}


// ==========================================
// PARENTS
// ==========================================

export async function getParents() {
  return apiRequest(
    "/api/parents/",
    {
      method: "GET",
    }
  );
}


export async function createParent(
  parentData
) {
  return apiRequest(
    "/api/parents/",
    {
      method: "POST",
      body: JSON.stringify(parentData),
    }
  );
}


export async function updateParent(
  parentId,
  parentData
) {
  return apiRequest(
    `/api/parents/${parentId}`,
    {
      method: "PUT",
      body: JSON.stringify(parentData),
    }
  );
}


export async function deleteParent(
  parentId
) {
  return apiRequest(
    `/api/parents/${parentId}`,
    {
      method: "DELETE",
    }
  );
}


// ==========================================
// ROUTES
// ==========================================

export async function getRoutes() {
  return apiRequest(
    "/api/routes",
    {
      method: "GET",
    }
  );
}


export async function createRoute(
  routeData
) {
  return apiRequest(
    "/api/routes",
    {
      method: "POST",
      body: JSON.stringify(routeData),
    }
  );
}


export async function updateRoute(
  routeId,
  routeData
) {
  return apiRequest(
    `/api/routes/${routeId}`,
    {
      method: "PUT",
      body: JSON.stringify(routeData),
    }
  );
}


// ==========================================
// STOPS
// ==========================================

export async function getRouteStops(
  routeId
) {
  return apiRequest(
    `/api/routes/${routeId}/stops`,
    {
      method: "GET",
    }
  );
}


export async function createStop(
  routeId,
  stopData
) {
  return apiRequest(
    `/api/routes/${routeId}/stops`,
    {
      method: "POST",
      body: JSON.stringify(stopData),
    }
  );
}


export async function updateStop(
  stopId,
  stopData
) {
  return apiRequest(
    `/api/stops/${stopId}`,
    {
      method: "PUT",
      body: JSON.stringify(stopData),
    }
  );
}


// ==========================================
// TRIPS
// ==========================================

export async function getTrips() {
  return apiRequest(
    "/api/trips",
    {
      method: "GET",
    }
  );
}


export async function startTrip(
  tripData
) {
  return apiRequest(
    "/api/trips/start",
    {
      method: "POST",
      body: JSON.stringify(tripData),
    }
  );
}


export async function endTrip(
  tripId
) {
  return apiRequest(
    `/api/trips/${tripId}/end`,
    {
      method: "POST",
    }
  );
}


// ==========================================
// BOARDING
// ==========================================

export async function createBoarding(
  boardingData
) {
  return apiRequest(
    "/api/boarding",
    {
      method: "POST",
      body: JSON.stringify(boardingData),
    }
  );
}


export async function getBoardingByTrip(
  tripId
) {
  return apiRequest(
    `/api/boarding/trip/${tripId}`,
    {
      method: "GET",
    }
  );
}


export async function getBoardingByStop(
  stopId
) {
  return apiRequest(
    `/api/boarding/stop/${stopId}`,
    {
      method: "GET",
    }
  );
}


// ==========================================
// NOTIFICATIONS
// ==========================================

export async function createNotification(
  notificationData
) {
  return apiRequest(
    "/api/notifications/",
    {
      method: "POST",
      body: JSON.stringify(
        notificationData
      ),
    }
  );
}


export async function getNotifications(
  userId
) {
  return apiRequest(
    `/api/notifications/?user_id=${encodeURIComponent(
      userId
    )}`,
    {
      method: "GET",
    }
  );
}


export async function markNotificationAsRead(
  notificationId
) {
  return apiRequest(
    `/api/notifications/${notificationId}/read`,
    {
      method: "POST",
    }
  );
}


// ==========================================
// EMERGENCIES
// ==========================================

export async function getActiveEmergencies() {
  return apiRequest(
    "/api/emergencies/active",
    {
      method: "GET",
    }
  );
}


export async function createEmergency(
  emergencyData
) {
  return apiRequest(
    "/api/emergencies",
    {
      method: "POST",
      body: JSON.stringify(
        emergencyData
      ),
    }
  );
}


export async function getEmergencyById(
  emergencyId
) {
  return apiRequest(
    `/api/emergencies/${emergencyId}`,
    {
      method: "GET",
    }
  );
}


export async function resolveEmergency(
  emergencyId
) {
  return apiRequest(
    `/api/emergencies/${emergencyId}/resolve`,
    {
      method: "POST",
    }
  );
}