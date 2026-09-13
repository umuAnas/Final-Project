import { useEffect, useState } from "react";
import { api } from "../../service/axiosInstance.js"; // Make sure path matches your project
import {
  formatPaymentStatus,
  getCourseIdDisplay,
  getMyPayments,
  paymentStatusClass,
  submitPayment,
} from "../../service/paymentService.js";

const emptyForm = {
  courseId: "",
  coursePrice: "",
  amount: "",
  paymentMethod: "Transfer",
  paymentType: "full",
  transactionId: "",
};

function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]); // Holds courses from backend
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const loadPayments = async () => {
    const res = await getMyPayments();
    const rows = res.data?.data ?? [];
    setPayments(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    let cancelled = false;

    // 1. Fetch user payments
    getMyPayments()
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data ?? [];
        setPayments(Array.isArray(rows) ? rows : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || "Unable to load payment history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // 2. Fetch courses list to populate dropdown
    api.get("/course/view")
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data ?? res.data ?? [];
        setAvailableCourses(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        console.error("Failed to load courses for selection", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If student changes Course selection, find the course and autofill data
    if (name === "courseSelect") {
      const selectedCourse = availableCourses.find((c) => c._id === value);
      if (selectedCourse) {
        setFormData((prev) => ({
          ...prev,
          courseId: selectedCourse._id,
          coursePrice: selectedCourse.price || selectedCourse.coursePrice || selectedCourse.courseDuration || "", 
          amount: prev.paymentType === "full" ? (selectedCourse.price || selectedCourse.coursePrice || "") : prev.amount
        }));
      } else {
        // Reset fields if they select the empty option
        setFormData((prev) => ({ ...prev, courseId: "", coursePrice: "", amount: "" }));
      }
      return;
    }

    setFormData((prev) => {
      if (name === "paymentMethod" && value === "Cash") {
        return { ...prev, paymentMethod: value, transactionId: "" };
      }
      if (name === "paymentType" && value === "full") {
        return { ...prev, paymentType: value, amount: prev.coursePrice };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const paymentData = {
        courseId: formData.courseId.trim(),
        coursePrice: formData.coursePrice,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType,
      };

      if (formData.paymentMethod === "Transfer") {
        paymentData.transactionId = formData.transactionId.trim();
      }

      const res = await submitPayment(paymentData);
      setMessage(res.data?.message || "Payment submitted successfully. Waiting for admin approval.");
      setFormData(emptyForm);
      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Payment History Table Section */}
      <div className="student-paymentCard">
        <h2 className="student-sectionTitle">Payment History</h2>
        {loading && <p className="student-status">Loading your payments…</p>}
        {!loading && payments.length === 0 && <p className="student-status">No payments submitted yet.</p>}
        {!loading && payments.length > 0 && (
          <div className="student-tableWrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Price</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{getCourseIdDisplay(payment.courseId)}</td>
                    <td>{payment.coursePrice}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.transactionId}</td>
                    <td>
                      <span className={`student-statusBadge student-statusBadge--${paymentStatusClass(payment.status)}`}>
                        {formatPaymentStatus(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Payment Form Section */}
      <div className="student-paymentCard">
        <h2 className="student-sectionTitle">Submit Payment</h2>
        {message && <p className="student-success">{message}</p>}
        {error && <p className="student-error">{error}</p>}
        <form className="student-paymentForm" onSubmit={handleSubmit}>
          
          {/* Course Dropdown */}
          <div className="student-paymentField">
            <label htmlFor="courseSelect">Select Course</label>
            <select
              id="courseSelect"
              name="courseSelect"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select a Course --</option>
              {availableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName || course.name ||"Unnamed Course"} ({course.courseCode || "No Code"})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-populated Course ID Field */}
          <div className="student-paymentField">
            <label htmlFor="courseId">Course ID</label>
            <input
              id="courseId"
              type="text"
              name="courseId"
              value={formData.courseId}
              readOnly
              placeholder="Select a course above"
              required
            />
          </div>

          {/* Auto-populated Course Price Field */}
          <div className="student-paymentField">
            <label htmlFor="coursePrice">Course Price</label>
            <input
              id="coursePrice"
              type="number"
              name="coursePrice"
              value={formData.coursePrice}
              readOnly
              placeholder="0.00"
              required
            />
          </div>

          {/* Fixed Amount to Pay Field (Resolved cutoff error) */}
          <div className="student-paymentField">
            <label htmlFor="amount">Amount to Pay</label>
            <input
              id="amount"
              type="number"
              name="amount"
              min="1"
              step="any"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Payment Method Field */}
          <div className="student-paymentField">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Transfer">Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          
          {/* Payment Type Field */}
          <div className="student-paymentField">
            <label htmlFor="paymentType">Payment Type</label>
            <select
              id="paymentType"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              required
            >
              <option value="full">Full Payment</option>
              <option value="partial">Partial Payment</option>
            </select>
          </div>

          {/* Conditional Transaction ID Field */}
          {formData.paymentMethod === "Transfer" && (
            <div className="student-paymentField student-paymentField--full">
              <label htmlFor="transactionId">Transaction ID</label>
              <input
                id="transactionId"
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
                minLength={5}
              />
            </div>
          )}
          
          {/* Submit Button */}
          <button className="student-submitBtn" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Payment"}
          </button>
        </form>
      </div>
    </>
  );
}

export default StudentPayments;
