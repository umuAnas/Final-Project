import { NavLink, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useUserContext } from "../../contexts/UseUserContext.jsx";
import { getStudentDashboardPath, toStudentSlug } from "./studentPath.js";
import StudentPayments from "./StudentPayments.jsx";
import "./StudentDashboard.css";

const navItems = [
  { to: ".", label: "Dashboard", end: true },
  { to: "assignments", label: "Assignments", end: false },
  { to: "courses", label: "Courses", end: false },
  { to: "settings", label: "Settings", end: false },
];

function StudentSection({ title, lead }) {
  return (
    <section className="student-panel">
      <header className="student-header">
        <div className="student-headerCopy">
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </header>
    </section>
  );
}

export function StudentOverview() {
  return (
    <section className="student-panel">
      <header className="student-header">
        <div className="student-headerCopy">
          <h1>Dashboard</h1>
          <p>Your student dashboard information.</p>
        </div>
      </header>

      <StudentPayments />
    </section>
  );
}

export function StudentAssignments() {
  return (
    <StudentSection
      title="Assignments"
      lead="Assignments will appear in this section later."
    />
  );
}

export function StudentCoursesPanel() {
  return (
    <StudentSection
      title="Courses"
      lead="Your courses will appear in this section later."
    />
  );
}

export function StudentSettings() {
  return (
    <StudentSection
      title="Settings"
      lead="Account settings will appear in this section later."
    />
  );
}

function StudentDashboard() {
  const { studentName } = useParams();
  const location = useLocation();
  const { state } = useUserContext();
  const user = state?.user;
  const expectedSlug = toStudentSlug(user?.fullName);

  if (studentName !== expectedSlug) {
    const prefix = `/student-dashboard/${studentName}`;
    const nested = location.pathname.startsWith(prefix)
      ? location.pathname.slice(prefix.length)
      : "";
    return (
      <Navigate
        to={`${getStudentDashboardPath(user)}${nested}${location.search}`}
        replace
      />
    );
  }

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="student-brand">
          <NavLink to="/" className="student-brandMark">
            Bright <span>tech</span>
          </NavLink>
          <p className="student-brandSub">Student workspace</p>
        </div>

        <nav className="student-nav" aria-label="Student">
          <p className="student-navLabel">Workspace</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `student-navLink${isActive ? " active" : ""}`
              }
            >
              <span className="student-navDot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="student-sidebarFoot">
          <strong>{user?.fullName || "Student"}</strong>
          <p>Bright tech</p>
        </div>
      </aside>

      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentDashboard;
