import { useEffect, useMemo, useState } from "react";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { getStudents } from "../../service/userService.js";
import { api } from "../../service/axiosInstance.js"; // IMPORT: Needed to trigger the PATCH request
import DataTable from "../../components/admin/DataTable";
import "./AdminShared.css";

const columnHelper = legacyCreateColumnHelper();

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // TRACKING: Prevents multiple concurrent API hits

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const res = await getStudents();
        const rows = res.data?.data ?? res.data ?? [];
        setStudents(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // NEW METHOD: Sends the lowercase status payload to your backend route
  const handleStatusChange = async (studentId, newStatus) => {
    setUpdatingId(studentId);
    setError("");
    try {
      // Matches: userRoute.patch("/status/:id", ...)
      await api.patch(`/users/status/${studentId}`, { status: newStatus });
      
      // Update local state state seamlessly
      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId ? { ...student, status: newStatus } : student
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student status");
    } finally {
      setUpdatingId(null);
    }
  };

  // NEW HELPER: Maps your lowercase enum entries to their visual CSS badge colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active": return "admin-statusBadge--approved"; // Green style
      case "blocked": return "admin-statusBadge--rejected"; // Red style
      case "finished": return "admin-statusBadge--pending";  // Orange/Yellow style
      default: return "admin-statusBadge--approved";
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        header: "Name",
        cell: (info) => <strong>{info.getValue() || "—"}</strong>,
      }),
      columnHelper.accessor("emailAddress", {
        header: "Email",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => info.getValue() || "—",
      }),
      // ALIGNED COLUMN: Reads live "status" field from DB instead of hardcoded strings
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const currentStatus = info.getValue() || "active";
          return (
            <span className={`admin-statusBadge ${getStatusBadgeClass(currentStatus)}`} style={{ textTransform: "capitalize" }}>
              {currentStatus}
            </span>
          );
        },
      }),
      // NEW COLUMN: Renders dropdown select options using exact database values
      columnHelper.display({
        id: "actions",
        header: "Change Status",
        cell: ({ row }) => {
          const student = row.original;
          return (
            <select
              value={student.status || "active"}
              disabled={updatingId === student._id}
              onChange={(e) => handleStatusChange(student._id, e.target.value)}
              className="admin-statusSelect"
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--bt-border)",
                cursor: "pointer",
                backgroundColor: updatingId === student._id ? "#f0f0f0" : "#fff"
              }}
            >
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="finished">Finished Course</option>
            </select>
          );
        },
      }),
    ],
    [updatingId] // Recompute columns when dropdown locks/unlocks
  );

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Loading students…</p>
      </div>
    );
  }

  return (
    <div className="admin-page students-page">
      <div>
        <h2 className="admin-pageTitle">Registered Students</h2>
        <p className="admin-pageLead">
          Search, sort, and browse every learner in the portal.
        </p>
      </div>

      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        <DataTable
          data={students}
          columns={columns}
          searchPlaceholder="Search students…"
          emptyMessage="No students found."
        />
      </div>
    </div>
  );
}

export default StudentsList;
