import { useEffect, useMemo, useState } from "react";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { getInstructors } from "../../service/userService.js";
import { api } from "../../service/axiosInstance.js"; //  REQUIRED: To send status updates to backend
import DataTable from "../../components/admin/DataTable";
import "./AdminShared.css";

const columnHelper = legacyCreateColumnHelper();

function InstructorsList() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); //  REQUIRED: To lock dropdown during network update

  useEffect(() => {
    async function fetchInstructors() {
      try {
        setLoading(true);
        const res = await getInstructors();
        const rows = res.data?.data ?? res.data ?? [];
        setInstructors(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load instructors");
      } finally {
        setLoading(false);
      }
    }
    fetchInstructors();
  }, []);

  //  REQUIRED NEW FUNCTION: Calls your backend PATCH route
  const handleStatusChange = async (instructorId, newStatus) => {
    setUpdatingId(instructorId);
    setError("");
    try {
      // Calls: userRoute.patch("/status/:id", ...)
      await api.patch(`/users/status/${instructorId}`, { status: newStatus });
      
      // Update state locally so UI updates instantly
      setInstructors((prev) =>
        prev.map((ins) =>
          ins._id === instructorId ? { ...ins, status: newStatus } : ins
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update instructor status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to color badge states
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active": return "admin-statusBadge--approved"; // Green
      case "blocked": return "admin-statusBadge--rejected"; // Red
      case "left": return "admin-statusBadge--rejected";    // Red
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
      //  ADDED COLUMN: Displays how many courses they teach from backend payload
      columnHelper.accessor("courseCount", {
        header: "Courses Taught",
        cell: (info) => {
          const count = info.getValue();
          return <span style={{ fontWeight: "600" }}>{count !== undefined ? count : 0}</span>;
        },
      }),
      //  CHANGED COLUMN: Reads dynamic live database availability status
      columnHelper.accessor("status", {
        header: "Availability",
        cell: (info) => {
          const currentStatus = info.getValue() || "active";
          const displayLabel = currentStatus === "active" ? "Present" : currentStatus === "left" ? "Left" : "Blocked";
          return (
            <span className={`admin-statusBadge ${getStatusBadgeClass(currentStatus)}`}>
              {displayLabel}
            </span>
          );
        },
      }),
      //  ADDED COLUMN: Action dropdown select menu for Admin
      columnHelper.display({
        id: "actions",
        header: "Change Status",
        cell: ({ row }) => {
          const instructor = row.original;
          return (
            <select
              value={instructor.status || "active"}
              disabled={updatingId === instructor._id}
              onChange={(e) => handleStatusChange(instructor._id, e.target.value)}
              className="admin-statusSelect"
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--bt-border)",
                cursor: "pointer",
                backgroundColor: updatingId === instructor._id ? "#f0f0f0" : "#fff"
              }}
            >
              <option value="active">Present (Active)</option>
              <option value="blocked">Blocked</option>
              <option value="left">Left Organization</option>
            </select>
          );
        },
      }),
    ],
    [updatingId]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Loading instructors…</p>
      </div>
    );
  }

  return (
    <div className="admin-page instructors-page">
      <div>
        <h2 className="admin-pageTitle">Registered Instructors</h2>
        <p className="admin-pageLead">
          Search, sort, and browse every instructor registered in the portal.
        </p>
      </div>

      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        <DataTable
          data={instructors}
          columns={columns}
          searchPlaceholder="Search instructors…"
          emptyMessage="No instructors found."
        />
      </div>
    </div>
  );
}

export default InstructorsList;
