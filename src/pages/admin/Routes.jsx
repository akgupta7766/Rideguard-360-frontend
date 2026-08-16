import {
  ArrowLeft,
  Map,
  Plus,
  Pencil,
  X,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getRoutes,
  createRoute,
  updateRoute,
  getRouteStops,
  createStop,
  updateStop,
} from "../../services/api";

import "./Routes.css";


function RoutesPage() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [stopsLoading, setStopsLoading] = useState(false);

  const [error, setError] = useState("");

  const [showRouteForm, setShowRouteForm] =
    useState(false);

  const [showStopForm, setShowStopForm] =
    useState(false);

  const [editingRoute, setEditingRoute] =
    useState(null);

  const [editingStop, setEditingStop] =
    useState(null);


  const [routeForm, setRouteForm] = useState({
    name: "",
    description: "",
  });


  const [stopForm, setStopForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    sequence: "",
  });


  // ==========================================
  // LOAD ROUTES
  // ==========================================

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRoutes();

      setRoutes(data);

      if (
        selectedRoute &&
        data.some(
          (route) =>
            route.id === selectedRoute.id
        )
      ) {
        const updatedSelectedRoute =
          data.find(
            (route) =>
              route.id === selectedRoute.id
          );

        setSelectedRoute(updatedSelectedRoute);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to load routes."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadRoutes();
  }, []);


  // ==========================================
  // LOAD STOPS
  // ==========================================

  const loadStops = async (route) => {
    try {
      setStopsLoading(true);
      setError("");

      const data = await getRouteStops(
        route.id
      );

      setStops(data);
      setSelectedRoute(route);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to load route stops."
      );
    } finally {
      setStopsLoading(false);
    }
  };


  // ==========================================
  // ROUTE FORM
  // ==========================================

  const handleRouteChange = (event) => {
    const { name, value } = event.target;

    setRouteForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const openCreateRoute = () => {
    setEditingRoute(null);

    setRouteForm({
      name: "",
      description: "",
    });

    setShowRouteForm(true);
  };


  const openEditRoute = (route) => {
    setEditingRoute(route);

    setRouteForm({
      name: route.name,
      description:
        route.description || "",
    });

    setShowRouteForm(true);
  };


  const closeRouteForm = () => {
    setShowRouteForm(false);
    setEditingRoute(null);
  };


  const handleRouteSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        name: routeForm.name,
        description:
          routeForm.description || null,
      };


      let result;

      if (editingRoute) {
        result = await updateRoute(
          editingRoute.id,
          payload
        );
      } else {
        result = await createRoute(
          payload
        );
      }


      await loadRoutes();

      closeRouteForm();

      if (!editingRoute) {
        setSelectedRoute(result);
        setStops([]);
      } else if (
        selectedRoute &&
        selectedRoute.id === result.id
      ) {
        setSelectedRoute(result);
      }

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save route."
      );
    }
  };


  // ==========================================
  // STOP FORM
  // ==========================================

  const handleStopChange = (event) => {
    const { name, value } = event.target;

    setStopForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const openCreateStop = () => {
    if (!selectedRoute) {
      setError(
        "Please select a route first."
      );
      return;
    }

    setEditingStop(null);

    setStopForm({
      name: "",
      latitude: "",
      longitude: "",
      sequence: "",
    });

    setShowStopForm(true);
  };


  const openEditStop = (stop) => {
    setEditingStop(stop);

    setStopForm({
      name: stop.name,
      latitude: String(
        stop.latitude
      ),
      longitude: String(
        stop.longitude
      ),
      sequence: String(
        stop.sequence
      ),
    });

    setShowStopForm(true);
  };


  const closeStopForm = () => {
    setShowStopForm(false);
    setEditingStop(null);
  };


  const handleStopSubmit = async (event) => {
    event.preventDefault();

    if (!selectedRoute) {
      setError(
        "Please select a route first."
      );
      return;
    }


    try {
      setError("");

      const payload = {
        name: stopForm.name,
        latitude: Number(
          stopForm.latitude
        ),
        longitude: Number(
          stopForm.longitude
        ),
        sequence: Number(
          stopForm.sequence
        ),
      };


      if (editingStop) {
        await updateStop(
          editingStop.id,
          payload
        );
      } else {
        await createStop(
          selectedRoute.id,
          payload
        );
      }


      await loadStops(
        selectedRoute
      );

      closeStopForm();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save stop."
      );
    }
  };


  return (
    <div className="routes-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="routes-header">

        <div className="routes-title">

          <button
            className="route-back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={18} />
          </button>


          <div className="routes-title-icon">
            <Map size={24} />
          </div>


          <div>

            <span className="route-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>
              Routes & Stops
            </h1>

            <p>
              Manage transport routes and
              their boarding stops.
            </p>

          </div>

        </div>


        <button
          className="add-route-button"
          onClick={openCreateRoute}
        >
          <Plus size={18} />
          Add Route
        </button>

      </header>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div className="routes-error">
          {error}
        </div>
      )}


      {/* =====================================
          ROUTE FORM
      ====================================== */}

      {showRouteForm && (
        <section className="route-form-card">

          <div className="route-form-heading">

            <h2>
              {editingRoute
                ? "Edit Route"
                : "Create Route"}
            </h2>

            <button
              onClick={closeRouteForm}
              className="close-form-button"
            >
              <X size={18} />
            </button>

          </div>


          <form
            className="route-form"
            onSubmit={
              handleRouteSubmit
            }
          >

            <div className="route-field">

              <label>
                Route Name
              </label>

              <input
                name="name"
                value={routeForm.name}
                onChange={
                  handleRouteChange
                }
                placeholder="Route 1 - Main Campus"
                required
              />

            </div>


            <div className="route-field">

              <label>
                Description
              </label>

              <input
                name="description"
                value={
                  routeForm.description
                }
                onChange={
                  handleRouteChange
                }
                placeholder="Morning school route"
              />

            </div>


            <div className="route-form-actions">

              <button
                type="button"
                className="route-cancel-button"
                onClick={
                  closeRouteForm
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="route-save-button"
              >
                {editingRoute
                  ? "Update Route"
                  : "Create Route"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* =====================================
          ROUTES LIST
      ====================================== */}

      <section className="routes-list-card">

        <div className="routes-section-heading">

          <div>
            <h2>
              Transport Routes
            </h2>

            <p>
              {routes.length} route
              {routes.length !== 1
                ? "s"
                : ""} configured
            </p>
          </div>

        </div>


        {loading ? (

          <div className="routes-empty">
            Loading routes...
          </div>

        ) : routes.length === 0 ? (

          <div className="routes-empty">

            <Map size={40} />

            <h3>
              No routes found
            </h3>

            <p>
              Create your first transport
              route.
            </p>

          </div>

        ) : (

          <div className="routes-grid">

            {routes.map((route) => (

              <div
                key={route.id}
                className={`route-card ${
                  selectedRoute?.id ===
                  route.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  loadStops(route)
                }
              >

                <div className="route-card-top">

                  <div className="route-card-icon">
                    <Map size={20} />
                  </div>


                  <button
                    className="route-edit-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditRoute(route);
                    }}
                    title="Edit route"
                  >
                    <Pencil size={16} />
                  </button>

                </div>


                <h3>
                  {route.name}
                </h3>


                <p>
                  {route.description ||
                    "No description provided."}
                </p>


                <span className="route-view-text">
                  View stops →
                </span>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =====================================
          STOPS
      ====================================== */}

      {selectedRoute && (
        <section className="stops-card">

          <div className="stops-heading">

            <div>

              <span className="stops-eyebrow">
                SELECTED ROUTE
              </span>

              <h2>
                {selectedRoute.name}
              </h2>

              <p>
                Manage stops for this route.
              </p>

            </div>


            <button
              className="add-stop-button"
              onClick={
                openCreateStop
              }
            >
              <Plus size={18} />
              Add Stop
            </button>

          </div>


          {/* Stop Form */}

          {showStopForm && (
            <div className="stop-form-wrapper">

              <div className="stop-form-heading">

                <h3>
                  {editingStop
                    ? "Edit Stop"
                    : "Add Stop"}
                </h3>

                <button
                  onClick={
                    closeStopForm
                  }
                  className="close-form-button"
                >
                  <X size={18} />
                </button>

              </div>


              <form
                className="stop-form"
                onSubmit={
                  handleStopSubmit
                }
              >

                <div className="stop-field">

                  <label>
                    Stop Name
                  </label>

                  <input
                    name="name"
                    value={stopForm.name}
                    onChange={
                      handleStopChange
                    }
                    placeholder="City Center"
                    required
                  />

                </div>


                <div className="stop-field">

                  <label>
                    Latitude
                  </label>

                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={
                      stopForm.latitude
                    }
                    onChange={
                      handleStopChange
                    }
                    placeholder="28.6139"
                    required
                  />

                </div>


                <div className="stop-field">

                  <label>
                    Longitude
                  </label>

                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={
                      stopForm.longitude
                    }
                    onChange={
                      handleStopChange
                    }
                    placeholder="77.2090"
                    required
                  />

                </div>


                <div className="stop-field">

                  <label>
                    Sequence
                  </label>

                  <input
                    name="sequence"
                    type="number"
                    min="1"
                    value={
                      stopForm.sequence
                    }
                    onChange={
                      handleStopChange
                    }
                    placeholder="1"
                    required
                  />

                </div>


                <div className="stop-form-actions">

                  <button
                    type="button"
                    className="route-cancel-button"
                    onClick={
                      closeStopForm
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="route-save-button"
                  >
                    {editingStop
                      ? "Update Stop"
                      : "Create Stop"}
                  </button>

                </div>

              </form>

            </div>
          )}


          {/* Stop List */}

          {stopsLoading ? (

            <div className="stops-empty">
              Loading stops...
            </div>

          ) : stops.length === 0 ? (

            <div className="stops-empty">

              <MapPin size={38} />

              <h3>
                No stops added
              </h3>

              <p>
                Add the first boarding stop
                for this route.
              </p>

            </div>

          ) : (

            <div className="stops-list">

              {stops.map((stop) => (

                <div
                  className="stop-row"
                  key={stop.id}
                >

                  <div className="stop-sequence">
                    {stop.sequence}
                  </div>


                  <div className="stop-icon">
                    <MapPin size={18} />
                  </div>


                  <div className="stop-info">

                    <strong>
                      {stop.name}
                    </strong>

                    <span>
                      Lat: {stop.latitude}
                      {"  "}
                      Lon: {stop.longitude}
                    </span>

                  </div>


                  <button
                    className="stop-edit-button"
                    onClick={() =>
                      openEditStop(stop)
                    }
                    title="Edit stop"
                  >
                    <Pencil size={16} />
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>
      )}

    </div>
  );
}


export default RoutesPage;