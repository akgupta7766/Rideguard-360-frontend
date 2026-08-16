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
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../services/api";

import "./Students.css";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    student_id: "",
    grade: "",
    section: "",
    parent_id: "",
    status: "active",
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
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
      student_id: "",
      grade: "",
      section: "",
      parent_id: "",
      status: "active",
    });

    setEditingStudent(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        student_id: formData.student_id,
        grade: formData.grade,
        section: formData.section,
        parent_id: formData.parent_id || null,
        status: formData.status,
      };

      if (editingStudent) {
        await updateStudent(
          editingStudent.id,
          payload
        );
      } else {
        await createStudent(payload);
      }

      await loadStudents();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to save student."
      );
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      student_id: student.student_id,
      grade: student.grade,
      section: student.section,
      parent_id: student.parent_id || "",
      status: student.status || "active",
    });

    setShowForm(true);
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Delete student ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteStudent(student.id);
      await loadStudents();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to delete student."
      );
    }
  };

  return (
    <div className="students-page">

      <header className="students-header">

        <div className="students-title">

          <button
            className="student-back-button"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="students-title-icon">
            <Users size={24} />
          </div>

          <div>
            <span className="student-eyebrow">
              ADMIN CONSOLE
            </span>

            <h1>Student Management</h1>

            <p>
              Manage students registered in the
              school transport system.
            </p>
          </div>

        </div>

        <button
          className="add-student-button"
          onClick={() => {
            setEditingStudent(null);

            setFormData({
              name: "",
              email: "",
              phone: "",
              student_id: "",
              grade: "",
              section: "",
              parent_id: "",
              status: "active",
            });

            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add New Student
        </button>

      </header>

      {error && (
        <div className="students-error">
          {error}
        </div>
      )}

      {showForm && (
        <section className="student-form-card">

          <h2>
            {editingStudent
              ? "Edit Student"
              : "Add New Student"}
          </h2>

          <form
            className="student-form"
            onSubmit={handleSubmit}
          >

            <div className="student-field">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Student name"
                required
              />
            </div>

            <div className="student-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="student-field">
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="student-field">
              <label>Student ID</label>
              <input
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="STU001"
                required
              />
            </div>

            <div className="student-field">
              <label>Grade</label>
              <input
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="10"
                required
              />
            </div>

            <div className="student-field">
              <label>Section</label>
              <input
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="A"
                required
              />
            </div>

            <div className="student-field">
              <label>Parent ID</label>
              <input
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="student-field">
              <label>Status</label>

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

            <div className="student-form-actions">

              <button
                type="button"
                className="student-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="student-save-button"
              >
                {editingStudent
                  ? "Update Student"
                  : "Create Student"}
              </button>

            </div>

          </form>

        </section>
      )}

      <section className="student-list-card">

        <div className="student-list-heading">

          <div>
            <h2>All Students</h2>

            <p>
              {students.length} student
              {students.length !== 1 ? "s" : ""}
              {" "}registered
            </p>
          </div>

        </div>

        {loading ? (
          <div className="student-empty">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="student-empty">
            <Users size={40} />

            <h3>No students found</h3>

            <p>
              Add your first student.
            </p>
          </div>
        ) : (
          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {students.map((student) => (
                  <tr key={student.id}>

                    <td>
                      <strong>
                        {student.name}
                      </strong>
                    </td>

                    <td>
                      {student.student_id}
                    </td>

                    <td>
                      {student.grade}
                    </td>

                    <td>
                      {student.section}
                    </td>

                    <td>
                      {student.email}
                    </td>

                    <td>
                      <span
                        className={`student-status ${student.status}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td>

                      <div className="student-actions">

                        <button
                          className="student-edit-button"
                          onClick={() =>
                            handleEdit(student)
                          }
                          title="Edit student"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="student-delete-button"
                          onClick={() =>
                            handleDelete(student)
                          }
                          title="Delete student"
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

export default Students;