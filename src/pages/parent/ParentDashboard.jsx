import {
  AlertTriangle,
  Bell,
  Bus,
  CheckCircle2,
  LogOut,
  Map,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getParents,
  getStudents,
  getTrips,
  getRoutes,
  getActiveEmergencies,
  getNotifications,
  getBusGpsLocation,
  markNotificationAsRead,
} from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import "./ParentDashboard.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


const parentBusIcon = L.divIcon({
  className: "custom-bus-marker",
  html: '<div class="bus-marker">🚌</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});


function ParentBusMarker({ location }) {
  const map = useMap();
  const position = [Number(location.latitude), Number(location.longitude)];

  useEffect(() => {
    map.panTo(position, { animate: true, duration: 0.8 });
  }, [location.latitude, location.longitude, map]);

  return (
    <Marker position={position} icon={parentBusIcon}>
      <Popup>
        Live bus location<br />
        {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
      </Popup>
    </Marker>
  );
}


function ParentDashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [busLocation, setBusLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [selectedChild, setSelectedChild] =
    useState(null);


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        throw new Error(
          "Parent account information not found."
        );
      }

      const [
        parentsData,
        studentsData,
        tripsData,
        routesData,
        emergenciesData,
        notificationData,
      ] = await Promise.all([
        getParents(),
        getStudents(),
        getTrips(),
        getRoutes(),
        getActiveEmergencies(),
        getNotifications(user.id),
      ]);


      // ========================================
      // CURRENT PARENT
      // ========================================

      const currentParent =
        Array.isArray(parentsData)
          ? parentsData.find(
              (item) =>
                item.id === user.id ||
                item.email === user.email
            )
          : null;

      setParent(currentParent || null);


      // ========================================
      // CHILDREN
      // ========================================

      const childIds =
        currentParent?.student_ids || [];

      const parentStudents =
        Array.isArray(studentsData)
          ? studentsData.filter(
              (student) =>
                childIds.includes(student.id) ||
                childIds.includes(student.student_id) ||
                student.parent_id === user.id
            )
          : [];

      setStudents(parentStudents);


      // Automatically select first child
      if (parentStudents.length > 0) {
        setSelectedChild((previous) => {
          if (
            previous &&
            parentStudents.some(
              (student) =>
                student.id === previous.id
            )
          ) {
            return previous;
          }

          return parentStudents[0];
        });
      } else {
        setSelectedChild(null);
      }


      // ========================================
      // OTHER DATA
      // ========================================

      setTrips(
        Array.isArray(tripsData)
          ? tripsData
          : []
      );

      setRoutes(
        Array.isArray(routesData)
          ? routesData
          : []
      );

      setEmergencies(
        Array.isArray(emergenciesData)
          ? emergenciesData
          : []
      );

      setNotifications(
        Array.isArray(notificationData)
          ? notificationData
          : []
      );

    } catch (err) {
      console.error(
        "Parent dashboard error:",
        err
      );

      setError(
        err.message ||
          "Unable to load parent dashboard."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user?.id) {
      loadDashboard();
    }
  }, [user?.id]);


  // ==========================================
  // ACTIVE TRIP
  // ==========================================

  const activeTrip = useMemo(
    () =>
      trips.find(
        (trip) =>
          trip.status === "active"
      ) || null,
    [trips]
  );


  // ==========================================
  // CURRENT ROUTE
  // ==========================================

  const activeRoute = useMemo(
    () =>
      routes.find(
        (route) =>
          route.id ===
          activeTrip?.route_id
      ) || null,
    [routes, activeTrip]
  );


  // Keep the parent view in sync with the active bus. REST polling is also
  // used as a fallback for browsers or networks that drop WebSockets.
  useEffect(() => {
    if (!activeTrip?.bus_id) {
      setBusLocation(null);
      return undefined;
    }

    let active = true;

    const refreshLocation = async () => {
      try {
        const location = await getBusGpsLocation(activeTrip.bus_id);
        if (active) {
          setBusLocation(location);
        }
      } catch (err) {
        console.warn("Parent GPS refresh failed:", err);
      }
    };

    refreshLocation();
    const timer = window.setInterval(refreshLocation, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [activeTrip?.bus_id]);


  // ==========================================
  // UNREAD NOTIFICATIONS
  // ==========================================

  const unreadCount =
    notifications.filter(
      (item) => !item.is_read
    ).length;


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString();
  };


  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigation = (section) => {
    setActiveSection(section);

    const sectionIds = {
      dashboard: null,
      children: "children",
      notifications: "notifications",
      safety: "safety",
    };

    const targetId =
      sectionIds[section];

    if (!targetId) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setTimeout(() => {
      const element =
        document.getElementById(
          targetId
        );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };


  // ==========================================
  // SELECT CHILD
  // ==========================================

  const handleSelectChild = (student) => {
    setSelectedChild(student);

    setActiveSection("children");

    setTimeout(() => {
      const element =
        document.getElementById(
          "children"
        );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };


  // ==========================================
  // MARK NOTIFICATION AS READ
  // ==========================================

  const handleMarkNotificationRead =
    async (notificationId) => {
      try {
        await markNotificationAsRead(
          notificationId
        );

        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      is_read: true,
                    }
                  : notification
            )
        );

      } catch (err) {
        console.error(
          "Notification error:",
          err
        );

        setError(
          err.message ||
            "Unable to update notification."
        );
      }
    };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="parent-dashboard">

      {/* ======================================
          SIDEBAR
      ======================================= */}

      <aside className="parent-sidebar">

        {/* LOGO */}

        <div className="parent-logo">

          <div className="parent-logo-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>RideGuard</span>
            <strong>360</strong>
          </div>

        </div>


        {/* USER */}

        <div className="parent-profile">

          <div className="parent-profile-avatar">
            <UserRound size={20} />
          </div>

          <div>
            <strong>
              {parent?.name ||
                user?.name ||
                user?.email ||
                "Parent"}
            </strong>

            <span>
              Parent
            </span>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="parent-nav">

          {/* DASHBOARD */}

          <button
            type="button"
            className={`parent-nav-item ${
              activeSection ===
              "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "dashboard"
              )
            }
          >
            <Map size={18} />
            <span>Dashboard</span>
          </button>


          {/* CHILDREN */}

          <button
            type="button"
            className={`parent-nav-item ${
              activeSection ===
              "children"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "children"
              )
            }
          >
            <Users size={18} />
            <span>My Children</span>
          </button>


          {/* NOTIFICATIONS */}

          <button
            type="button"
            className={`parent-nav-item ${
              activeSection ===
              "notifications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "notifications"
              )
            }
          >
            <Bell size={18} />

            <span>
              Notifications
            </span>

            {unreadCount > 0 && (
              <small>
                {unreadCount}
              </small>
            )}

          </button>


          {/* SAFETY */}

          <button
            type="button"
            className={`parent-nav-item ${
              activeSection ===
              "safety"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "safety"
              )
            }
          >
            <AlertTriangle size={18} />

            <span>
              Safety Alerts
            </span>

            {emergencies.length > 0 && (
              <small>
                {emergencies.length}
              </small>
            )}

          </button>

        </nav>


        {/* LOGOUT */}

        <button
          type="button"
          className="parent-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </aside>


      {/* ======================================
          MAIN
      ======================================= */}

      <main className="parent-main">

        {/* HEADER */}

        <header className="parent-header">

          <div>

            <span className="parent-eyebrow">
              PARENT CONSOLE
            </span>

            <h1>
              Family Transport
            </h1>

            <p>
              Monitor your child's
              school transportation.
            </p>

          </div>


          <div className="parent-user">

            <div className="parent-avatar">
              <UserRound size={20} />
            </div>

            <div>
              <strong>
                {parent?.name ||
                  user?.name ||
                  user?.email ||
                  "Parent"}
              </strong>

              <span>
                Parent
              </span>
            </div>

          </div>

        </header>


        {/* ERROR */}

        {error && (
          <div className="parent-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}


        {/* ==================================
            STATS
        =================================== */}

        <section className="parent-stats">

          <div className="parent-stat-card">

            <div className="parent-stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Children</span>

              <strong>
                {loading
                  ? "..."
                  : students.length}
              </strong>
            </div>

          </div>


          <div className="parent-stat-card">

            <div className="parent-stat-icon">
              <Bus size={22} />
            </div>

            <div>
              <span>Trip Status</span>

              <strong>
                {activeTrip
                  ? "Active"
                  : "Not Active"}
              </strong>
            </div>

          </div>


          <div className="parent-stat-card">

            <div className="parent-stat-icon">
              <Bell size={22} />
            </div>

            <div>
              <span>Notifications</span>

              <strong>
                {loading
                  ? "..."
                  : notifications.length}
              </strong>
            </div>

          </div>


          <div className="parent-stat-card">

            <div className="parent-stat-icon danger">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Active Alerts</span>

              <strong>
                {loading
                  ? "..."
                  : emergencies.length}
              </strong>
            </div>

          </div>

        </section>


        {/* ==================================
            LIVE LOCATION PREVIEW
        =================================== */}

        <section className="parent-card">

          <div className="parent-section-title">

            <div>

              <span>
                LIVE TRANSPORT
              </span>

              <h2>
                Child Bus Tracking
              </h2>

              <p>
                Your child's bus location
                and trip status.
              </p>

            </div>

            <div className="parent-section-icon">
              <MapPin size={22} />
            </div>

          </div>


          {activeTrip ? (

            <div className="parent-live-card">

              <div className="live-bus-status">

                <div className="live-status-icon">
                  <Bus size={24} />
                </div>

                <div>
                  <span>
                    Bus currently on route
                  </span>

                  <strong>
                    {activeTrip.bus_id}
                  </strong>
                </div>

              </div>


              <div className="live-status-grid">

                <div>
                  <span>
                    Route
                  </span>

                  <strong>
                    {activeRoute?.name ||
                      activeTrip.route_id}
                  </strong>
                </div>


                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    🟢 On Trip
                  </strong>
                </div>


                <div>
                  <span>
                    Started
                  </span>

                  <strong>
                    {formatDate(
                      activeTrip.started_at
                    )}
                  </strong>
                </div>

              </div>


              {busLocation ? (
                <MapContainer
                  center={[
                    Number(busLocation.latitude),
                    Number(busLocation.longitude),
                  ]}
                  zoom={15}
                  scrollWheelZoom={true}
                  className="parent-live-map"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ParentBusMarker location={busLocation} />
                </MapContainer>
              ) : (
                <div className="live-map-placeholder">
                  <MapPin size={36} />
                  <strong>Waiting for live GPS</strong>
                  <span>The bus location will appear here shortly.</span>
                </div>
              )}

            </div>

          ) : (

            <div className="parent-empty">

              <Bus size={30} />

              <strong>
                Bus is not currently active
              </strong>

              <span>
                Live location will appear
                when your child's trip starts.
              </span>

            </div>

          )}

        </section>


        {/* ==================================
            CURRENT TRIP
        =================================== */}

        <section className="parent-card">

          <div className="parent-section-title">

            <div>

              <span>
                TRANSPORT
              </span>

              <h2>
                Current Trip
              </h2>

              <p>
                Current school transport
                status.
              </p>

            </div>

            <div className="parent-section-icon">
              <Bus size={22} />
            </div>

          </div>


          {activeTrip ? (

            <div className="parent-trip">

              <div className="trip-main-status">

                <div className="trip-status-icon">
                  <CheckCircle2 size={22} />
                </div>

                <div>

                  <span>
                    Current status
                  </span>

                  <strong>
                    Trip in progress
                  </strong>

                </div>

              </div>


              <div className="trip-info">

                <div>
                  <span>Bus</span>

                  <strong>
                    {activeTrip.bus_id}
                  </strong>
                </div>


                <div>
                  <span>Route</span>

                  <strong>
                    {activeRoute?.name ||
                      activeTrip.route_id}
                  </strong>
                </div>


                <div>
                  <span>Started</span>

                  <strong>
                    {formatDate(
                      activeTrip.started_at
                    )}
                  </strong>
                </div>

              </div>

            </div>

          ) : (

            <div className="parent-empty">

              <Bus size={28} />

              <strong>
                No active trip
              </strong>

              <span>
                Your child's bus is
                currently not on an active
                trip.
              </span>

            </div>

          )}

        </section>


        {/* ==================================
            CHILDREN
        =================================== */}

        <section
          className="parent-card"
          id="children"
        >

          <div className="parent-section-title">

            <div>

              <span>
                FAMILY
              </span>

              <h2>
                My Children
              </h2>

              <p>
                Select a child to view
                transport information.
              </p>

            </div>

            <div className="parent-section-icon">
              <Users size={22} />
            </div>

          </div>


          {students.length === 0 ? (

            <div className="parent-empty">

              <Users size={28} />

              <strong>
                {loading
                  ? "Loading children..."
                  : "No children linked"}
              </strong>

              {!loading && (
                <span>
                  No student is currently
                  linked to this parent
                  account.
                </span>
              )}

            </div>

          ) : (

            <div className="children-grid">

              {students.map(
                (student) => (

                  <button
                    type="button"
                    className={`child-card ${
                      selectedChild?.id ===
                      student.id
                        ? "selected"
                        : ""
                    }`}
                    key={student.id}
                    onClick={() =>
                      handleSelectChild(
                        student
                      )
                    }
                  >

                    <div className="child-top">

                      <div className="child-icon">
                        <UserRound size={20} />
                      </div>

                      <span
                        className={
                          student.status ===
                          "active"
                            ? "child-active"
                            : "child-inactive"
                        }
                      >
                        {student.status ||
                          "active"}
                      </span>

                    </div>


                    <div className="child-info">

                      <h3>
                        {student.name}
                      </h3>

                      <p>
                        Student ID:{" "}
                        {student.student_id}
                      </p>


                      <div className="child-meta">

                        <span>
                          Grade{" "}
                          {student.grade}
                        </span>

                        <span>
                          Section{" "}
                          {student.section}
                        </span>

                      </div>


                      <div className="child-track-hint">
                        <MapPin size={14} />
                        View transport status
                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}


          {/* SELECTED CHILD */}

          {selectedChild && (
            <div className="selected-child-panel">

              <div>

                <span>
                  SELECTED CHILD
                </span>

                <h3>
                  {selectedChild.name}
                </h3>

              </div>


              <div>

                <span>
                  Current Transport
                </span>

                <strong>
                  {activeTrip
                    ? `Bus ${activeTrip.bus_id}`
                    : "No active bus"}
                </strong>

              </div>


              <div>

                <span>
                  ETA
                </span>

                <strong>
                  {activeTrip
                    ? "Waiting for GPS"
                    : "—"}
                </strong>

              </div>

            </div>
          )}

        </section>


        {/* ==================================
            SAFETY
        =================================== */}

        <section
          className="parent-card"
          id="safety"
        >

          <div className="parent-section-title">

            <div>

              <span>
                SAFETY
              </span>

              <h2>
                Active Safety Alerts
              </h2>

              <p>
                Current transport
                emergencies.
              </p>

            </div>

            <div className="parent-section-icon danger">
              <AlertTriangle size={22} />
            </div>

          </div>


          {emergencies.length === 0 ? (

            <div className="safe-state">

              <ShieldCheck size={22} />

              <div>

                <strong>
                  Everything looks safe
                </strong>

                <span>
                  There are no active
                  transport emergencies.
                </span>

              </div>

            </div>

          ) : (

            <div className="emergency-list">

              {emergencies.map(
                (emergency) => (

                  <div
                    className="parent-emergency"
                    key={emergency.id}
                  >

                    <div className="emergency-icon">
                      <AlertTriangle size={20} />
                    </div>

                    <div className="emergency-content">

                      <strong>
                        {emergency.emergency_type}
                      </strong>

                      <p>
                        {emergency.message ||
                          "Emergency reported on bus."}
                      </p>

                      <span>
                        Bus:{" "}
                        {emergency.bus_id}
                      </span>

                    </div>

                    <span className="emergency-status">
                      ACTIVE
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ==================================
            NOTIFICATIONS
        =================================== */}

        <section
          className="parent-card"
          id="notifications"
        >

          <div className="parent-section-title">

            <div>

              <span>
                UPDATES
              </span>

              <h2>
                Notifications
              </h2>

              <p>
                Latest updates from
                RideGuard 360.
              </p>

            </div>

            <div className="parent-section-icon">
              <Bell size={22} />
            </div>

          </div>


          {notifications.length === 0 ? (

            <div className="parent-empty">

              <Bell size={28} />

              <strong>
                No notifications
              </strong>

              <span>
                You're all caught up.
              </span>

            </div>

          ) : (

            <div className="notification-list">

              {notifications
                .slice(0, 8)
                .map(
                  (notification) => (

                    <div
                      className={`notification-item ${
                        notification.is_read
                          ? ""
                          : "unread"
                      }`}
                      key={
                        notification.id
                      }
                    >

                      <div className="notification-icon">
                        <Bell size={17} />
                      </div>


                      <div className="notification-content">

                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                        <span>
                          {formatDate(
                            notification.created_at
                          )}
                        </span>

                      </div>


                      {!notification.is_read && (

                        <button
                          type="button"
                          className="notification-read-button"
                          onClick={() =>
                            handleMarkNotificationRead(
                              notification.id
                            )
                          }
                        >
                          Mark read
                        </button>

                      )}

                    </div>

                  )
                )}

            </div>

          )}

        </section>


        {/* ==================================
            FOOTER
        =================================== */}

        <footer className="parent-footer">

          <ShieldCheck size={16} />

          <span>
            RideGuard 360 • School
            Transportation Safety
          </span>

        </footer>

      </main>

    </div>
  );
}


export default ParentDashboard;
