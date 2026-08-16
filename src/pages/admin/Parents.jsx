import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getParents,
  createParent,
  updateParent,
  deleteParent,
} from "../../services/api";

import "./Parents.css";


function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    student_ids: "",
    status: "active",
  });


  const loadParents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getParents();

      setParents(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Failed to load parents."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadParents();
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
      name: "",
      email: "",
      phone: "",
      student_ids: "",
      status: "active",
    });

    setEditingParent(null);
    setShowForm(false);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const studentIds = formData.student_ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        student_ids: studentIds,
        status: formData.status,
      };


      if (editingParent) {
        await updateParent(
          editingParent.id,
          payload
        );
      } else {
        await createParent(payload);
      }


      await loadParents();
      resetForm();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to save parent."
      );
    }
  };


  const handleEdit = (parent) => {
    setEditingParent(parent);

    setFormData({
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      student_ids:
        parent.student_ids?.join(", ") || "",
      status: parent.status || "active",
    });

    setShowForm(true);
  };


  const handleDelete = async (parent) => {
    const confirmed = window.confirm(
      `Delete parent ${parent.name}?`
    );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      await deleteParent(parent.id);

      await loadParents();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to delete parent."
      );
    }
  };


  return (
    <div className="parents-page">

      {/* Header */}

      <header className="parents-header">

        <div className="parents-title">

          <button
            className="parent-back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={18} />
          </button>


          <div className="parents-title-icon">
            <Users size={24} />
          </div>


          <div>

            <span className="parent-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>
              Parent Management
            </h1>

            <p>
              Manage parents and their
              linked students.
            </p>

          </div>

        </div>


        <button
          className="add-parent-button"
          onClick={() => {
            setEditingParent(null);

            setFormData({
              name: "",
              email: "",
              phone: "",
              student_ids: "",
              status: "active",
            });

            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add New Parent
        </button>

      </header>


      {/* Error */}

      {error && (
        <div className="parents-error">
          {error}
        </div>
      )}


      {/* Form */}

      {showForm && (
        <section className="parent-form-card">

          <h2>
            {editingParent
              ? "Edit Parent"
              : "Add New Parent"}
          </h2>


          <form
            className="parent-form"
            onSubmit={handleSubmit}
          >

            <div className="parent-field">

              <label>
                Full Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Parent name"
                required
              />

            </div>


            <div className="parent-field">

              <label>
                Email
              </label>

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="parent@example.com"
                required
              />

            </div>


            <div className="parent-field">

              <label>
                Phone
              </label>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />

            </div>


            <div className="parent-field">

              <label>
                Student IDs
              </label>

              <input
                name="student_ids"
                value={formData.student_ids}
                onChange={handleChange}
                placeholder="ID1, ID2"
              />

            </div>


            <div className="parent-field">

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
              </select>

            </div>


            <div className="parent-form-actions">

              <button
                type="button"
                className="parent-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="parent-save-button"
              >
                {editingParent
                  ? "Update Parent"
                  : "Create Parent"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* List */}

      <section className="parent-list-card">

        <div className="parent-list-heading">

          <div>

            <h2>
              All Parents
            </h2>

            <p>
              {parents.length} parent
              {parents.length !== 1
                ? "s"
                : ""} registered
            </p>

          </div>

        </div>


        {loading ? (
          <div className="parent-empty">
            Loading parents...
          </div>

        ) : parents.length === 0 ? (

          <div className="parent-empty">

            <Users size={40} />

            <h3>
              No parents found
            </h3>

            <p>
              Add your first parent.
            </p>

          </div>

        ) : (

          <div className="parent-table-wrapper">

            <table className="parent-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {parents.map((parent) => (

                  <tr key={parent.id}>

                    <td>
                      <strong>
                        {parent.name}
                      </strong>
                    </td>

                    <td>
                      {parent.email}
                    </td>

                    <td>
                      {parent.phone}
                    </td>

                    <td>
                      {parent.student_ids?.length || 0}
                    </td>

                    <td>

                      <span
                        className={`parent-status ${parent.status}`}
                      >
                        {parent.status}
                      </span>

                    </td>

                    <td>

                      <div className="parent-actions">

                        <button
                          className="parent-edit-button"
                          onClick={() =>
                            handleEdit(parent)
                          }
                        >
                          <Pencil size={16} />
                        </button>


                        <button
                          className="parent-delete-button"
                          onClick={() =>
                            handleDelete(parent)
                          }
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


export default Parents;