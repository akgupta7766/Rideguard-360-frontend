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

import { useEffect, useState } from "react";
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
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}


// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    buses: 0,
    drivers: 0,
    students: 0,
    emergencies: 0,
    trips: 0,
  });

  const [buses, setBuses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


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


        setBuses(
          Array.isArray(busesData)
            ? busesData
            : []
        );


        setStats({
          buses: Array.isArray(busesData)
            ? busesData.length
            : 0,

          drivers: Array.isArray(drivers)
            ? drivers.length
            : 0,

          students: Array.isArray(students)
            ? students.length
            : 0,

          emergencies:
            Array.isArray(emergencies)
              ? emergencies.length
              : 0,

          trips:
            Array.isArray(trips)
              ? trips.filter(
                  (trip) =>
                    trip.status === "active"
                ).length
              : 0,
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
  // BUSES WITH GPS
  // ==========================================

  const busesWithLocation = buses.filter(
    (bus) =>
      bus.latitude !== null &&
      bus.latitude !== undefined &&
      bus.longitude !== null &&
      bus.longitude !== undefined
  );


  return (
    <div className="admin-dashboard">


      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>RideGuard</span>
            <strong>360</strong>
          </div>

        </div>


        <nav className="admin-nav">

          <button
            className="admin-nav-item active"
            onClick={() =>
              navigate("/admin")
            }
          >
            <MapIcon size={18} />
            <span>Overview</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/buses")
            }
          >
            <Bus size={18} />
            <span>Buses</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/drivers")
            }
          >
            <UserRound size={18} />
            <span>Drivers</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/students")
            }
          >
            <Users size={18} />
            <span>Students</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/parents")
            }
          >
            <Users size={18} />
            <span>Parents</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/routes")
            }
          >
            <Route size={18} />
            <span>Routes</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/notifications")
            }
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>


          <button
            className="admin-nav-item emergency"
            onClick={() =>
              navigate("/admin/emergencies")
            }
          >
            <AlertTriangle size={18} />
            <span>Emergencies</span>
          </button>

        </nav>

      </aside>


      {/* ======================================
          MAIN
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
              Monitor your school transportation
              network from one place.
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


          <div className="admin-stat-card">

            <div className="stat-icon blue">
              <Bus size={22} />
            </div>

            <div>
              <span>Total Buses</span>

              <strong>
                {loading
                  ? "..."
                  : stats.buses}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="stat-icon cyan">
              <UserRound size={22} />
            </div>

            <div>
              <span>Drivers</span>

              <strong>
                {loading
                  ? "..."
                  : stats.drivers}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="stat-icon blue">
              <Users size={22} />
            </div>

            <div>
              <span>Students</span>

              <strong>
                {loading
                  ? "..."
                  : stats.students}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="stat-icon yellow">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Active Alerts</span>

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
                Monitor buses equipped with GPS.
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


              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


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
                          {bus.bus_number}
                        </strong>

                        <span>
                          Registration:{" "}
                          {bus.registration_number}
                        </span>

                        <span>
                          Status:{" "}
                          {bus.status}
                        </span>

                      </div>

                    </Popup>

                  </Marker>

                )
              )}

            </MapContainer>


            {busesWithLocation.length === 0 && (

              <div className="map-overlay">

                <div className="map-overlay-icon">
                  <Navigation size={22} />
                </div>

                <strong>
                  Waiting for GPS locations
                </strong>

                <span>
                  Bus locations will appear here
                  when GPS coordinates are available.
                </span>

              </div>

            )}

          </div>


          <div className="map-footer">

            <span>
              <span className="map-dot"></span>

              {busesWithLocation.length}{" "}
              bus
              {busesWithLocation.length !== 1
                ? "es"
                : ""}{" "}
              currently visible
            </span>

            <span>
              Map updates when GPS data changes
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
                  : `${stats.trips} active trip(s)`}

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
                  : `${stats.emergencies} active emergency alert(s)`}

            </div>

          </div>


        </section>

      </main>

    </div>
  );
}


export default AdminDashboard;