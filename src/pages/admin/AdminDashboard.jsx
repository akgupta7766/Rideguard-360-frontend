import {
  AlertTriangle,
  Bus,
  Map as MapIcon,
  Users,
  UserRound,
  Route,
  Bell,
  ShieldCheck,
  Navigation,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  getBuses,
  getBusGpsLocation,
  getDrivers,
  getStudents,
  getActiveEmergencies,
  getTrips,
} from "../../services/api";

import "leaflet/dist/leaflet.css";
import "./AdminDashboard.css";


// ==========================================
// DEFAULT MAP LOCATION
// ==========================================

const DEFAULT_CENTER = [26.8467, 80.9462];


function isNewerLocation(nextLocation, currentLocation) {
  if (!currentLocation?.timestamp || !nextLocation?.timestamp) {
    return true;
  }

  return (
    new Date(nextLocation.timestamp).getTime() >=
    new Date(currentLocation.timestamp).getTime()
  );
}


// ==========================================
// BUS ICON
// ==========================================

const busIcon = L.divIcon({
  className: "custom-bus-marker",

  html: `
    <div class="bus-marker">
      🚌
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});


// ==========================================
// MAP RESIZE FIX
// ==========================================

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}


function MapLocationFollower({ buses }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (buses.length === 0) {
      return;
    }

    const firstBus = buses[0];
    const position = [
      Number(firstBus.latitude),
      Number(firstBus.longitude),
    ];

    if (!hasCenteredRef.current) {
      map.setView(position, 15, { animate: false });
      hasCenteredRef.current = true;
      return;
    }

    map.panTo(position, { animate: true, duration: 0.8 });
  }, [buses, map]);

  return null;
}


// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard() {
  const navigate = useNavigate();


  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  const [stats, setStats] = useState({
    buses: 0,
    drivers: 0,
    students: 0,
    emergencies: 0,
    trips: 0,
  });


  // ==========================================
  // BUSES
  // ==========================================

  const [buses, setBuses] = useState([]);


  // ==========================================
  // LIVE GPS LOCATIONS
  // ==========================================

  const [liveLocations, setLiveLocations] =
    useState({});


  // ==========================================
  // LOADING / ERROR
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // WEBSOCKET REFERENCE
  // ==========================================

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          busesData,
          drivers,
          students,
          emergencies,
          trips,
        ] = await Promise.all([
          getBuses(),
          getDrivers(),
          getStudents(),
          getActiveEmergencies(),
          getTrips(),
        ]);


        const safeBuses =
          Array.isArray(busesData)
            ? busesData
            : [];


        const safeDrivers =
          Array.isArray(drivers)
            ? drivers
            : [];


        const safeStudents =
          Array.isArray(students)
            ? students
            : [];


        const safeEmergencies =
          Array.isArray(emergencies)
            ? emergencies
            : [];


        const safeTrips =
          Array.isArray(trips)
            ? trips
            : [];


        setBuses(safeBuses);


        setStats({
          buses: safeBuses.length,

          drivers: safeDrivers.length,

          students: safeStudents.length,

          emergencies:
            safeEmergencies.length,

          trips:
            safeTrips.filter(
              (trip) =>
                trip.status === "active"
            ).length,
        });

      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard data."
        );

      } finally {
        setLoading(false);
      }
    };


    loadDashboard();
  }, []);


  // ==========================================
  // LOAD LAST KNOWN GPS LOCATIONS
  // ==========================================

  useEffect(() => {
    if (buses.length === 0) {
      return undefined;
    }

    let active = true;

    const loadLastKnownLocations = async () => {
      const results = await Promise.allSettled(
        buses.flatMap((bus) => [
          getBusGpsLocation(bus.id),
          getBusGpsLocation(bus.bus_number),
        ])
      );

      if (!active) {
        return;
      }

      setLiveLocations((previous) => {
        const next = { ...previous };

        results.forEach((result) => {
          if (
            result.status === "fulfilled" &&
            isNewerLocation(
              result.value,
              next[result.value.bus_id]
            )
          ) {
            next[result.value.bus_id] = result.value;
          }
        });

        return next;
      });
    };

    loadLastKnownLocations();

    // The WebSocket is the primary live channel. This lightweight refresh
    // recovers an update if a proxy temporarily drops that connection.
    const refreshTimer = window.setInterval(
      loadLastKnownLocations,
      5000
    );

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [buses]);


  // ==========================================
  // LIVE GPS WEBSOCKET
  // ==========================================

  useEffect(() => {
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000";
    const wsUrl = apiUrl
      .replace(/^https:\/\//, "wss://")
      .replace(/^http:\/\//, "ws://")
      .replace(/\/$/, "");
    const socketUrl = `${wsUrl}/api/gps/ws`;
    let disposed = false;
    let socket = null;

    const connect = () => {
      if (disposed) {
        return;
      }

      console.log("Connecting to GPS WebSocket:", socketUrl);
      socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!disposed) {
          reconnectAttemptsRef.current = 0;
          console.log("GPS WebSocket connected");
        }
      };

      socket.onmessage = (event) => {
        if (disposed) {
          return;
        }

        try {
          const message = JSON.parse(event.data);
          const location = message?.data;

          if (
            message?.type === "bus_location" &&
            location?.bus_id &&
            Number.isFinite(Number(location.latitude)) &&
            Number.isFinite(Number(location.longitude))
          ) {
            setLiveLocations((previous) => {
              if (
                !isNewerLocation(
                  location,
                  previous[location.bus_id]
                )
              ) {
                return previous;
              }

              return {
                ...previous,
                [location.bus_id]: location,
              };
            });
          }
        } catch (err) {
          console.error("GPS WebSocket message error:", err);
        }
      };

      socket.onerror = () => {
        console.warn("GPS WebSocket error; waiting to reconnect.");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (disposed) {
          return;
        }

        const delay = Math.min(
          1000 * 2 ** reconnectAttemptsRef.current,
          30000
        );
        reconnectAttemptsRef.current += 1;
        console.warn(`GPS WebSocket disconnected; reconnecting in ${delay}ms.`);
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;

      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close();
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, []);


  // ==========================================
  // LIVE GPS WEBSOCKET
  // ==========================================

  useEffect(() => {

    /* Replaced by the guarded connection effect above.

    const apiUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000";


    const wsUrl = apiUrl
      .replace(/^https:\/\//, "wss://")
      .replace(/^http:\/\//, "ws://");


    const socketUrl =
      `${wsUrl}/api/gps/ws`;


    console.log(
      "Connecting to GPS WebSocket:",
      socketUrl
    );


    const socket =
      new WebSocket(socketUrl);


    socketRef.current = socket;


    // ========================================
    // CONNECTION OPEN
    // ========================================

    socket.onopen = () => {
      console.log(
        "🟢 GPS WebSocket connected"
      );
    };


    // ========================================
    // RECEIVE GPS DATA
    // ========================================

    socket.onmessage = (event) => {

      try {

        const message =
          JSON.parse(event.data);


        console.log(
          "📍 GPS WebSocket message:",
          message
        );


        if (
          message.type ===
            "bus_location" &&
          message.data
        ) {

          const location =
            message.data;


          setLiveLocations(
            (previous) => ({
              ...previous,

              [location.bus_id]:
                location,
            })
          );

        }

      } catch (err) {

        console.error(
          "GPS WebSocket message error:",
          err
        );

      }
    };


    // ========================================
    // CONNECTION ERROR
    // ========================================

    socket.onerror = (event) => {

      console.error(
        "🔴 GPS WebSocket error:",
        event
      );

    };


    // ========================================
    // CONNECTION CLOSED
    // ========================================

    socket.onclose = () => {

      console.log(
        "🔴 GPS WebSocket disconnected"
      );

    };


    // ========================================
    // CLEANUP
    // ========================================

    return () => {

      if (
        socket.readyState ===
          WebSocket.OPEN ||
        socket.readyState ===
          WebSocket.CONNECTING
      ) {
        socket.close();
      }

      socketRef.current = null;

    };

    */
  }, []);


  // ==========================================
  // MERGE API BUS DATA + LIVE GPS DATA
  // ==========================================

  const busesWithLocation =
    buses
      .map((bus) => {

        /*
         * IMPORTANT:
         *
         * Backend GPS uses bus_id as
         * MongoDB ObjectId string.
         *
         * API bus data uses bus.id.
         *
         * So we use bus.id to find the
         * matching live GPS location.
         */

        const liveLocation =
          liveLocations[bus.id] ||
          liveLocations[bus.bus_number];


        if (liveLocation) {

          return {
            ...bus,

            latitude:
              liveLocation.latitude,

            longitude:
              liveLocation.longitude,

            speed:
              liveLocation.speed,

            heading:
              liveLocation.heading,

            gps_timestamp:
              liveLocation.timestamp,

            gps_live: true,
          };

        }


        return {
          ...bus,
          gps_live: false,
        };

      })

      .filter(
        (bus) =>
          bus.latitude !== null &&
          bus.latitude !== undefined &&
          bus.longitude !== null &&
          bus.longitude !== undefined
      );


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="admin-dashboard">


      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="admin-sidebar">


        {/* LOGO */}

        <div className="admin-logo">

          <div className="admin-logo-icon">
            <ShieldCheck size={22} />
          </div>


          <div>

            <span>
              RideGuard
            </span>

            <strong>
              360
            </strong>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="admin-nav">


          {/* OVERVIEW */}

          <button
            className="admin-nav-item active"
            onClick={() =>
              navigate("/admin")
            }
          >

            <MapIcon size={18} />

            <span>
              Overview
            </span>

          </button>


          {/* BUSES */}

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/buses")
            }
          >

            <Bus size={18} />

            <span>
              Buses
            </span>

          </button>


          {/* DRIVERS */}

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/drivers")
            }
          >

            <UserRound size={18} />

            <span>
              Drivers
            </span>

          </button>


          {/* STUDENTS */}

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/students")
            }
          >

            <Users size={18} />

            <span>
              Students
            </span>

          </button>


          {/* PARENTS */}

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/parents")
            }
          >

            <Users size={18} />

            <span>
              Parents
            </span>

          </button>


          {/* ROUTES */}

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/routes")
            }
          >

            <Route size={18} />

            <span>
              Routes
            </span>

          </button>


          {/* NOTIFICATIONS */}

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/notifications")
            }
          >

            <Bell size={18} />

            <span>
              Notifications
            </span>

          </button>


          {/* EMERGENCIES */}

          <button
            className="admin-nav-item emergency"
            onClick={() =>
              navigate("/admin/emergencies")
            }
          >

            <AlertTriangle size={18} />

            <span>
              Emergencies
            </span>

          </button>


        </nav>

      </aside>


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="admin-main">


        {/* HEADER */}

        <header className="admin-header">

          <div>

            <span className="admin-eyebrow">
              ADMIN CONSOLE
            </span>


            <h1>
              Transport Overview
            </h1>


            <p>
              Monitor your school
              transportation network
              from one place.
            </p>

          </div>


          <div className="admin-user">

            <div className="admin-avatar">
              A
            </div>


            <div>

              <strong>
                Administrator
              </strong>

              <span>
                Admin
              </span>

            </div>

          </div>

        </header>


        {/* ERROR */}

        {error && (

          <div className="dashboard-error">
            {error}
          </div>

        )}


        {/* ======================================
            STAT CARDS
        ====================================== */}

        <section className="admin-stats">


          {/* BUSES */}

          <div className="admin-stat-card">

            <div className="stat-icon blue">
              <Bus size={22} />
            </div>


            <div>

              <span>
                Total Buses
              </span>


              <strong>

                {loading
                  ? "..."
                  : stats.buses}

              </strong>

            </div>

          </div>


          {/* DRIVERS */}

          <div className="admin-stat-card">

            <div className="stat-icon cyan">
              <UserRound size={22} />
            </div>


            <div>

              <span>
                Drivers
              </span>


              <strong>

                {loading
                  ? "..."
                  : stats.drivers}

              </strong>

            </div>

          </div>


          {/* STUDENTS */}

          <div className="admin-stat-card">

            <div className="stat-icon blue">
              <Users size={22} />
            </div>


            <div>

              <span>
                Students
              </span>


              <strong>

                {loading
                  ? "..."
                  : stats.students}

              </strong>

            </div>

          </div>


          {/* ALERTS */}

          <div className="admin-stat-card">

            <div className="stat-icon yellow">
              <AlertTriangle size={22} />
            </div>


            <div>

              <span>
                Active Alerts
              </span>


              <strong>

                {loading
                  ? "..."
                  : stats.emergencies}

              </strong>

            </div>

          </div>


        </section>


        {/* ======================================
            LIVE BUS MAP
        ====================================== */}

        <section className="admin-map-card">


          <div className="section-heading">

            <div>

              <h2>
                Live Bus Map
              </h2>


              <p>
                Monitor buses equipped
                with GPS.
              </p>

            </div>


            <span className="live-status">

              <span></span>

              Live

            </span>

          </div>


          <div className="live-map-container">


            <MapContainer
              center={DEFAULT_CENTER}
              zoom={11}
              scrollWheelZoom={true}
              className="live-map"
            >


              <MapResizeHandler />
              <MapLocationFollower buses={busesWithLocation} />


              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              {/* =================================
                  LIVE BUS MARKERS
              ================================= */}

              {busesWithLocation.map(
                (bus) => (

                  <Marker
                    key={bus.id}
                    position={[
                      Number(bus.latitude),
                      Number(bus.longitude),
                    ]}
                    icon={busIcon}
                  >

                    <Popup>

                      <div className="bus-popup">


                        <strong>
                          🚌{" "}
                          {bus.bus_number}
                        </strong>


                        <span>
                          Registration:{" "}
                          {bus.registration_number}
                        </span>


                        <span>
                          Status:{" "}
                          {bus.status ||
                            "Active"}
                        </span>


                        {bus.speed !==
                          undefined && (

                          <span>
                            Speed:{" "}
                            {bus.speed} km/h
                          </span>

                        )}


                        <span>
                          Location:{" "}
                          {Number(
                            bus.latitude
                          ).toFixed(5)}
                          ,{" "}
                          {Number(
                            bus.longitude
                          ).toFixed(5)}
                        </span>


                        <span>
                          GPS:{" "}

                          {bus.gps_live
                            ? "🟢 Live"
                            : "⚪ Waiting"}
                        </span>


                      </div>

                    </Popup>

                  </Marker>

                )
              )}


            </MapContainer>


            {/* =================================
                EMPTY MAP OVERLAY
            ================================= */}

            {busesWithLocation.length ===
              0 && (

              <div className="map-overlay">


                <div className="map-overlay-icon">

                  <Navigation
                    size={22}
                  />

                </div>


                <strong>
                  Waiting for GPS
                  locations
                </strong>


                <span>
                  Bus locations will appear
                  here when GPS coordinates
                  are available.
                </span>


              </div>

            )}


          </div>


          {/* ==================================
              MAP FOOTER
          ================================== */}

          <div className="map-footer">


            <span>

              <span className="map-dot"></span>


              {busesWithLocation.length}{" "}

              bus
              {busesWithLocation.length !==
              1
                ? "es"
                : ""}{" "}

              currently visible

            </span>


            <span>

              {Object.keys(
                liveLocations
              ).length > 0
                ? "Live GPS connected"
                : "Waiting for live GPS"}

            </span>


          </div>


        </section>


        {/* ======================================
            BOTTOM PANELS
        ====================================== */}

        <section className="admin-bottom-grid">


          {/* ACTIVE TRIPS */}

          <div className="admin-panel">


            <div className="section-heading">

              <div>

                <h2>
                  Active Trips
                </h2>


                <p>
                  Currently running trips
                </p>

              </div>


              <strong>

                {loading
                  ? "..."
                  : stats.trips}

              </strong>

            </div>


            <div className="empty-state">

              {loading

                ? "Loading trips..."

                : stats.trips === 0

                  ? "No active trips"

                  : `${stats.trips} active trip(s)`

              }

            </div>


          </div>


          {/* EMERGENCIES */}

          <div className="admin-panel">


            <div className="section-heading">

              <div>

                <h2>
                  Recent Emergencies
                </h2>


                <p>
                  Latest safety alerts
                </p>

              </div>

            </div>


            <div className="empty-state">

              {loading

                ? "Loading emergencies..."

                : stats.emergencies === 0

                  ? "No active emergencies"

                  : `${stats.emergencies} active emergency alert(s)`

              }

            </div>


          </div>


        </section>


      </main>

    </div>
  );
}


export default AdminDashboard;
