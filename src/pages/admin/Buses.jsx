import {
  Bus as BusIcon,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getBuses,
  createBus,
  updateBus,
  deleteBus,
} from "../../services/api";

import "./Buses.css";


function Buses() {
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [formData, setFormData] = useState({
    bus_number: "",
    registration_number: "",
    capacity: "",
    model: "",
    status: "active",
  });


  const loadBuses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBuses();

      setBuses(data);
    } catch (err) {
      console.error("Failed to load buses:", err);

      setError(
        err.message || "Failed to load buses."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadBuses();
  }, []);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const resetForm = () => {
    setFormData({
      bus_number: "",
      registration_number: "",
      capacity: "",
      model: "",
      status: "active",
    });

    setEditingBus(null);
    setShowForm(false);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const payload = {
        bus_number: formData.bus_number,
        registration_number:
          formData.registration_number,
        capacity: Number(formData.capacity),
        model: formData.model || null,
        status: formData.status,
      };


      if (editingBus) {
        await updateBus(
          editingBus.id,
          payload
        );
      } else {
        await createBus(payload);
      }


      await loadBuses();

      resetForm();

    } catch (err) {
      console.error(
        "Bus save error:",
        err
      );

      setError(
        err.message ||
        "Unable to save bus."
      );
    }
  };


  const handleEdit = (bus) => {
    setEditingBus(bus);

    setFormData({
      bus_number: bus.bus_number,
      registration_number:
        bus.registration_number,
      capacity: bus.capacity,
      model: bus.model || "",
      status: bus.status || "active",
    });

    setShowForm(true);
  };


  const handleDelete = async (bus) => {
    const confirmed = window.confirm(
      `Delete bus ${bus.bus_number}?`
    );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      await deleteBus(bus.id);

      await loadBuses();

    } catch (err) {
      console.error(
        "Bus delete error:",
        err
      );

      setError(
        err.message ||
        "Unable to delete bus."
      );
    }
  };


  return (
    <div className="buses-page">

      {/* Header */}

      <header className="buses-header">

        <div className="buses-title">

          <button
            className="back-button"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={18} />
          </button>


          <div className="buses-title-icon">
            <BusIcon size={24} />
          </div>


          <div>
            <span className="page-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>
              Bus Management
            </h1>

            <p>
              Manage school buses and their
              operational status.
            </p>
          </div>

        </div>


        <button
          className="add-bus-button"
          onClick={() => {
            setEditingBus(null);

            setFormData({
              bus_number: "",
              registration_number: "",
              capacity: "",
              model: "",
              status: "active",
            });

            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add New Bus
        </button>

      </header>


      {/* Error */}

      {error && (
        <div className="buses-error">
          {error}
        </div>
      )}


      {/* Form */}

      {showForm && (
        <section className="bus-form-card">

          <div className="form-heading">

            <div>
              <h2>
                {editingBus
                  ? "Edit Bus"
                  : "Add New Bus"}
              </h2>

              <p>
                Enter the bus details below.
              </p>
            </div>

          </div>


          <form
            className="bus-form"
            onSubmit={handleSubmit}
          >

            <div className="form-field">

              <label>
                Bus Number
              </label>

              <input
                name="bus_number"
                value={formData.bus_number}
                onChange={handleChange}
                placeholder="BUS-001"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Registration Number
              </label>

              <input
                name="registration_number"
                value={
                  formData.registration_number
                }
                onChange={handleChange}
                placeholder="UP32AB1234"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Capacity
              </label>

              <input
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="40"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Model
              </label>

              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ashok Leyland"
              />

            </div>


            <div className="form-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="maintenance">
                  Maintenance
                </option>
              </select>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
              >
                {editingBus
                  ? "Update Bus"
                  : "Create Bus"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* Bus List */}

      <section className="bus-list-card">

        <div className="list-heading">

          <div>
            <h2>
              All Buses
            </h2>

            <p>
              {buses.length} bus
              {buses.length !== 1
                ? "es"
                : ""} registered
            </p>
          </div>

        </div>


        {loading ? (
          <div className="bus-empty">
            Loading buses...
          </div>
        ) : buses.length === 0 ? (
          <div className="bus-empty">

            <BusIcon size={40} />

            <h3>
              No buses found
            </h3>

            <p>
              Add your first school bus
              to get started.
            </p>

          </div>
        ) : (

          <div className="bus-table-wrapper">

            <table className="bus-table">

              <thead>

                <tr>
                  <th>Bus Number</th>
                  <th>Registration</th>
                  <th>Capacity</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {buses.map((bus) => (

                  <tr key={bus.id}>

                    <td>
                      <strong>
                        {bus.bus_number}
                      </strong>
                    </td>

                    <td>
                      {bus.registration_number}
                    </td>

                    <td>
                      {bus.capacity}
                    </td>

                    <td>
                      {bus.model || "—"}
                    </td>

                    <td>
                      <span
                        className={`bus-status ${bus.status}`}
                      >
                        {bus.status}
                      </span>
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(bus)
                          }
                          title="Edit bus"
                        >
                          <Pencil size={16} />
                        </button>


                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(bus)
                          }
                          title="Delete bus"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


export default Buses;