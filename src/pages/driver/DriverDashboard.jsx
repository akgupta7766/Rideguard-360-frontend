import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Clock3,
  LogOut,
  Map,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createBoarding,
  createEmergency,
  endTrip,
  getBuses,
  getCurrentUser,
  getRouteStops,
  getRoutes,
  getStudents,
  getTrips,
  getBoardingByTrip,
  startTrip,
} from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import "./DriverDashboard.css";


function DriverDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  // ==========================================
  // DATA
  // ==========================================

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stops, setStops] = useState([]);
  const [boardingRecords, setBoardingRecords] =
    useState([]);

  // ==========================================
  // STATE
  // ==========================================

  const [selectedBus, setSelectedBus] =
    useState("");

  const [selectedRoute, setSelectedRoute] =
    useState("");

  const [activeTrip, setActiveTrip] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [boardingLoading, setBoardingLoading] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // Emergency form
  const [emergencyType, setEmergencyType] =
    useState("general");

  const [emergencyMessage, setEmergencyMessage] =
    useState("");

  const [emergencyLoading, setEmergencyLoading] =
    useState(false);


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    loadDashboard();
  }, []);


  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        busesData,
        routesData,
        studentsData,
        tripsData,
      ] = await Promise.all([
        getBuses(),
        getRoutes(),
        getStudents(),
        getTrips(),
      ]);

      setBuses(
        Array.isArray(busesData)
          ? busesData
          : []
      );

      setRoutes(
        Array.isArray(routesData)
          ? routesData
          : []
      );

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : []
      );

      setTrips(
        Array.isArray(tripsData)
          ? tripsData
          : []
      );


      const currentTrip =
        Array.isArray(tripsData)
          ? tripsData.find(
              (trip) =>
                trip.status === "active"
            )
          : null;


      setActiveTrip(
        currentTrip || null
      );


      // If an active trip exists,
      // automatically select its bus and route.
      if (currentTrip) {
        setSelectedBus(
          currentTrip.bus_id || ""
        );

        setSelectedRoute(
          currentTrip.route_id || ""
        );


        try {
          const routeStops =
            await getRouteStops(
              currentTrip.route_id
            );

          setStops(
            Array.isArray(routeStops)
              ? routeStops
              : []
          );
        } catch (stopError) {
          console.error(
            "Stops loading error:",
            stopError
          );

          setStops([]);
        }


        try {
          const records =
            await getBoardingByTrip(
              currentTrip.id
            );

          setBoardingRecords(
            Array.isArray(records)
              ? records
              : []
          );
        } catch (boardingError) {
          console.error(
            "Boarding records loading error:",
            boardingError
          );

          setBoardingRecords([]);
        }
      }

    } catch (err) {
      console.error(
        "Driver dashboard loading error:",
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


  // ==========================================
  // SELECT ROUTE
  // ==========================================

  const handleRouteChange = async (
    event
  ) => {
    const routeId =
      event.target.value;

    setSelectedRoute(routeId);
    setStops([]);

    if (!routeId) {
      return;
    }

    try {
      const routeStops =
        await getRouteStops(routeId);

      setStops(
        Array.isArray(routeStops)
          ? routeStops
          : []
      );

    } catch (err) {
      console.error(
        "Route stops error:",
        err
      );

      setError(
        err.message ||
          "Unable to load route stops."
      );
    }
  };


  // ==========================================
  // START TRIP
  // ==========================================

  const handleStartTrip = async () => {
    if (!selectedBus) {
      setError(
        "Please select a bus first."
      );
      return;
    }

    if (!selectedRoute) {
      setError(
        "Please select a route first."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const result =
        await startTrip({
          bus_id: selectedBus,
          route_id: selectedRoute,
        });

      setActiveTrip(result);

      setSuccess(
        "Trip started successfully."
      );

      // Load stops
      try {
        const routeStops =
          await getRouteStops(
            selectedRoute
          );

        setStops(
          Array.isArray(routeStops)
            ? routeStops
            : []
        );
      } catch (stopError) {
        console.error(
          "Stops loading error:",
          stopError
        );
      }

      setBoardingRecords([]);

      await loadDashboard();

    } catch (err) {
      console.error(
        "Start trip error:",
        err
      );

      setError(
        err.message ||
          "Unable to start trip."
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ==========================================
  // END TRIP
  // ==========================================

  const handleEndTrip = async () => {
    if (!activeTrip) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to end this trip?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const result =
        await endTrip(
          activeTrip.id
        );

      setActiveTrip(result);

      setSuccess(
        "Trip ended successfully."
      );

      await loadDashboard();

    } catch (err) {
      console.error(
        "End trip error:",
        err
      );

      setError(
        err.message ||
          "Unable to end trip."
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ==========================================
  // BOARDING
  // ==========================================

  const handleBoarding = async (
    studentId,
    stopId,
    action
  ) => {
    if (!activeTrip) {
      setError(
        "There is no active trip."
      );
      return;
    }

    const key =
      `${studentId}-${stopId}-${action}`;

    try {
      setBoardingLoading(key);
      setError("");
      setSuccess("");

      const result =
        await createBoarding({
          trip_id: activeTrip.id,
          student_id: studentId,
          stop_id: stopId,
          action,
        });

      setBoardingRecords(
        (previous) => [
          result,
          ...previous,
        ]
      );

      setSuccess(
        action === "boarded"
          ? "Student marked as boarded."
          : "Student marked as dropped."
      );

    } catch (err) {
      console.error(
        "Boarding error:",
        err
      );

      setError(
        err.message ||
          "Unable to update boarding status."
      );
    } finally {
      setBoardingLoading("");
    }
  };


  // ==========================================
  // CHECK STUDENT STATUS
  // ==========================================

  const getStudentBoardingStatus = (
    studentId,
    action
  ) => {
    if (!activeTrip) {
      return false;
    }

    return boardingRecords.some(
      (record) =>
        record.student_id === studentId &&
        record.action === action
    );
  };


  // ==========================================
  // EMERGENCY
  // ==========================================

  const handleEmergency = async (
    event
  ) => {
    event.preventDefault();

    if (!activeTrip) {
      setError(
        "Start a trip before reporting an emergency."
      );
      return;
    }

    const busId =
      activeTrip.bus_id ||
      selectedBus;

    if (!busId) {
      setError(
        "No bus is associated with the current trip."
      );
      return;
    }

    try {
      setEmergencyLoading(true);
      setError("");
      setSuccess("");

      await createEmergency({
        bus_id: busId,
        emergency_type: emergencyType,
        message:
          emergencyMessage.trim() ||
          null,
      });

      setEmergencyMessage("");

      setSuccess(
        "Emergency reported successfully."
      );

    } catch (err) {
      console.error(
        "Emergency error:",
        err
      );

      setError(
        err.message ||
          "Unable to report emergency."
      );
    } finally {
      setEmergencyLoading(false);
    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  // ==========================================
  // HELPERS
  // ==========================================

  const selectedBusData =
    buses.find(
      (bus) =>
        bus.id === selectedBus
    );

  const selectedRouteData =
    routes.find(
      (route) =>
        route.id === selectedRoute
    );


  const getStopName = (stopId) => {
    const stop =
      stops.find(
        (item) =>
          item.id === stopId
      );

    return (
      stop?.name ||
      "Unknown stop"
    );
  };


  const getStudentName = (
    studentId
  ) => {
    const student =
      students.find(
        (item) =>
          item.id === studentId
      );

    return (
      student?.name ||
      "Unknown student"
    );
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="driver-dashboard">

      {/* ======================================
          SIDEBAR
      ======================================= */}

      <aside className="driver-sidebar">

        <div className="driver-logo">

          <div className="driver-logo-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>RideGuard</span>
            <strong>360</strong>
          </div>

        </div>


        <div className="driver-profile">

          <div className="driver-avatar">
            <UserRound size={20} />
          </div>

          <div>
            <strong>
              {user?.name ||
                user?.email ||
                "Driver"}
            </strong>

            <span>
              Driver
            </span>
          </div>

        </div>


        <nav className="driver-nav">

          <button
            className="driver-nav-item active"
            type="button"
          >
            <Map size={18} />
            <span>Dashboard</span>
          </button>

        </nav>


        <button
          className="driver-logout"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </aside>


      {/* ======================================
          MAIN
      ======================================= */}

      <main className="driver-main">

        {/* HEADER */}

        <header className="driver-header">

          <div>

            <span className="driver-eyebrow">
              DRIVER CONSOLE
            </span>

            <h1>
              Driver Dashboard
            </h1>

            <p>
              Manage your trip, students
              and transport safety.
            </p>

          </div>


          <div className="driver-status">

            <span className="driver-status-dot"></span>

            <span>
              {activeTrip
                ? "Trip Active"
                : "Ready"}
            </span>

          </div>

        </header>


        {/* ==================================
            MESSAGES
        =================================== */}

        {error && (
          <div className="driver-alert error">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}


        {success && (
          <div className="driver-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}


        {/* ==================================
            OVERVIEW CARDS
        =================================== */}

        <section className="driver-stats">

          <div className="driver-stat-card">

            <div className="driver-stat-icon">
              <Bus size={22} />
            </div>

            <div>
              <span>Bus</span>

              <strong>
                {loading
                  ? "..."
                  : selectedBusData?.bus_number ||
                    "Not selected"}
              </strong>
            </div>

          </div>


          <div className="driver-stat-card">

            <div className="driver-stat-icon">
              <MapPin size={22} />
            </div>

            <div>
              <span>Route</span>

              <strong>
                {loading
                  ? "..."
                  : selectedRouteData?.name ||
                    "Not selected"}
              </strong>
            </div>

          </div>


          <div className="driver-stat-card">

            <div className="driver-stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Students</span>

              <strong>
                {loading
                  ? "..."
                  : students.length}
              </strong>
            </div>

          </div>


          <div className="driver-stat-card">

            <div className="driver-stat-icon">
              <Clock3 size={22} />
            </div>

            <div>
              <span>Trip Status</span>

              <strong>
                {activeTrip
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

          </div>

        </section>


        {/* ==================================
            TRIP CONTROL
        =================================== */}

        <section className="driver-card">

          <div className="driver-section-heading">

            <div>

              <h2>
                Trip Control
              </h2>

              <p>
                Select your bus and route
                before starting a trip.
              </p>

            </div>

            {activeTrip && (
              <span className="trip-active-badge">
                ● Active
              </span>
            )}

          </div>


          <div className="driver-form-grid">

            {/* BUS */}

            <div className="driver-input-group">

              <label>
                Bus
              </label>

              <select
                value={selectedBus}
                onChange={(event) =>
                  setSelectedBus(
                    event.target.value
                  )
                }
                disabled={Boolean(activeTrip)}
              >

                <option value="">
                  Select bus
                </option>

                {buses.map((bus) => (
                  <option
                    key={bus.id}
                    value={bus.id}
                  >
                    {bus.bus_number}
                    {bus.registration_number
                      ? ` — ${bus.registration_number}`
                      : ""}
                  </option>
                ))}

              </select>

            </div>


            {/* ROUTE */}

            <div className="driver-input-group">

              <label>
                Route
              </label>

              <select
                value={selectedRoute}
                onChange={
                  handleRouteChange
                }
                disabled={Boolean(activeTrip)}
              >

                <option value="">
                  Select route
                </option>

                {routes.map((route) => (
                  <option
                    key={route.id}
                    value={route.id}
                  >
                    {route.name}
                  </option>
                ))}

              </select>

            </div>

          </div>


          <div className="driver-trip-actions">

            {!activeTrip ? (

              <button
                type="button"
                className="driver-primary-button"
                onClick={handleStartTrip}
                disabled={actionLoading}
              >
                <Bus size={18} />

                {actionLoading
                  ? "Starting..."
                  : "Start Trip"}
              </button>

            ) : (

              <button
                type="button"
                className="driver-danger-button"
                onClick={handleEndTrip}
                disabled={actionLoading}
              >
                <XCircle size={18} />

                {actionLoading
                  ? "Ending..."
                  : "End Trip"}
              </button>

            )}

          </div>

        </section>


        {/* ==================================
            ROUTE STOPS
        =================================== */}

        <section className="driver-card">

          <div className="driver-section-heading">

            <div>

              <h2>
                Route Stops
              </h2>

              <p>
                Stops available on the
                selected route.
              </p>

            </div>

          </div>


          {!selectedRoute ? (

            <div className="driver-empty-state">
              <MapPin size={28} />

              <p>
                Select a route to view stops.
              </p>
            </div>

          ) : stops.length === 0 ? (

            <div className="driver-empty-state">
              <MapPin size={28} />

              <p>
                No stops found for this route.
              </p>
            </div>

          ) : (

            <div className="driver-stops-list">

              {stops.map((stop) => (

                <div
                  className="driver-stop-item"
                  key={stop.id}
                >

                  <div className="driver-stop-number">
                    {stop.sequence}
                  </div>

                  <div>

                    <strong>
                      {stop.name}
                    </strong>

                    <span>
                      {stop.latitude},
                      {" "}
                      {stop.longitude}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ==================================
            STUDENT BOARDING
        =================================== */}

        <section className="driver-card">

          <div className="driver-section-heading">

            <div>

              <h2>
                Student Boarding
              </h2>

              <p>
                Mark students as boarded
                or dropped during the trip.
              </p>

            </div>

            <span>
              {students.length} students
            </span>

          </div>


          {!activeTrip ? (

            <div className="driver-empty-state">

              <Bus size={28} />

              <p>
                Start a trip to manage
                student boarding.
              </p>

            </div>

          ) : students.length === 0 ? (

            <div className="driver-empty-state">

              <Users size={28} />

              <p>
                No students available.
              </p>

            </div>

          ) : stops.length === 0 ? (

            <div className="driver-empty-state">

              <MapPin size={28} />

              <p>
                No stops are available
                for this route.
              </p>

            </div>

          ) : (

            <div className="driver-boarding-list">

              {students.map((student) => (

                <div
                  className="driver-student-card"
                  key={student.id}
                >

                  <div className="driver-student-info">

                    <div className="driver-student-avatar">
                      <UserRound size={18} />
                    </div>

                    <div>

                      <strong>
                        {student.name}
                      </strong>

                      <span>
                        {student.student_id}
                        {" · "}
                        Grade {student.grade}
                        {" - "}
                        {student.section}
                      </span>

                    </div>

                  </div>


                  <div className="driver-boarding-actions">

                    <select
                      className="driver-stop-select"
                      id={`stop-${student.id}`}
                      defaultValue=""
                      disabled={
                        !activeTrip ||
                        boardingLoading !== ""
                      }
                    >

                      <option value="">
                        Select stop
                      </option>

                      {stops.map((stop) => (
                        <option
                          key={stop.id}
                          value={stop.id}
                        >
                          {stop.sequence}.{" "}
                          {stop.name}
                        </option>
                      ))}

                    </select>


                    <button
                      type="button"
                      className="driver-board-button"
                      disabled={
                        !activeTrip ||
                        boardingLoading !== ""
                      }
                      onClick={() => {

                        const select =
                          document.getElementById(
                            `stop-${student.id}`
                          );

                        const stopId =
                          select?.value;

                        if (!stopId) {
                          setError(
                            "Please select a stop first."
                          );
                          return;
                        }

                        handleBoarding(
                          student.id,
                          stopId,
                          "boarded"
                        );
                      }}
                    >
                      <CheckCircle2 size={16} />

                      {getStudentBoardingStatus(
                        student.id,
                        "boarded"
                      )
                        ? "Boarded"
                        : "Board"}
                    </button>


                    <button
                      type="button"
                      className="driver-drop-button"
                      disabled={
                        !activeTrip ||
                        boardingLoading !== ""
                      }
                      onClick={() => {

                        const select =
                          document.getElementById(
                            `stop-${student.id}`
                          );

                        const stopId =
                          select?.value;

                        if (!stopId) {
                          setError(
                            "Please select a stop first."
                          );
                          return;
                        }

                        handleBoarding(
                          student.id,
                          stopId,
                          "dropped"
                        );
                      }}
                    >
                      <XCircle size={16} />

                      {getStudentBoardingStatus(
                        student.id,
                        "dropped"
                      )
                        ? "Dropped"
                        : "Drop"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ==================================
            BOARDING HISTORY
        =================================== */}

        <section className="driver-card">

          <div className="driver-section-heading">

            <div>

              <h2>
                Boarding History
              </h2>

              <p>
                Recent boarding events
                for this trip.
              </p>

            </div>

          </div>


          {boardingRecords.length === 0 ? (

            <div className="driver-empty-state">

              <Clock3 size={28} />

              <p>
                No boarding events yet.
              </p>

            </div>

          ) : (

            <div className="driver-history-list">

              {boardingRecords.map(
                (record) => (

                  <div
                    className="driver-history-item"
                    key={record.id}
                  >

                    <div>

                      <strong>
                        {getStudentName(
                          record.student_id
                        )}
                      </strong>

                      <span>
                        {getStopName(
                          record.stop_id
                        )}
                      </span>

                    </div>

                    <span
                      className={
                        record.action ===
                        "boarded"
                          ? "history-boarded"
                          : "history-dropped"
                      }
                    >
                      {record.action}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ==================================
            EMERGENCY
        =================================== */}

        <section className="driver-card emergency-card">

          <div className="driver-section-heading">

            <div>

              <h2>
                Emergency Reporting
              </h2>

              <p>
                Report a safety emergency
                to the transport administration.
              </p>

            </div>

            <AlertTriangle
              size={28}
            />

          </div>


          <form
            onSubmit={handleEmergency}
            className="driver-emergency-form"
          >

            <div className="driver-form-grid">

              <div className="driver-input-group">

                <label>
                  Emergency type
                </label>

                <select
                  value={emergencyType}
                  onChange={(event) =>
                    setEmergencyType(
                      event.target.value
                    )
                  }
                  disabled={
                    emergencyLoading
                  }
                >

                  <option value="general">
                    General
                  </option>

                  <option value="accident">
                    Accident
                  </option>

                  <option value="medical">
                    Medical
                  </option>

                  <option value="vehicle">
                    Vehicle problem
                  </option>

                  <option value="security">
                    Security
                  </option>

                </select>

              </div>


              <div className="driver-input-group">

                <label>
                  Message
                </label>

                <input
                  type="text"
                  placeholder="Describe the emergency..."
                  value={emergencyMessage}
                  onChange={(event) =>
                    setEmergencyMessage(
                      event.target.value
                    )
                  }
                  disabled={
                    emergencyLoading
                  }
                />

              </div>

            </div>


            <button
              type="submit"
              className="driver-emergency-button"
              disabled={
                emergencyLoading ||
                !activeTrip
              }
            >
              <AlertTriangle size={18} />

              {emergencyLoading
                ? "Reporting..."
                : "Report Emergency"}
            </button>

          </form>

        </section>

      </main>

    </div>
  );
}


export default DriverDashboard;