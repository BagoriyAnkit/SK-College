import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Loader from "../../../Components/Loader";
import { GetDashboardStats } from "../../../Service/admin/Dashboard";
import { getAuthUser } from "../../../utils/auth";
import {
  GraduationCap,
  UserCheck,
  BookOpen,
  Layers,
  Building2,
  Wallet,
  RotateCw,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  ClipboardList
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const authUser = getAuthUser();

  const loadStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await GetDashboardStats();
      if (res && res.status && res.data) {
        setStats(res.data);
        setLastUpdated(new Date());
      } else {
        setError(res?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader />
        <p className="text-xs text-slate-500 font-medium mt-4">Loading real-time dashboard data...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center bg-white rounded-xl border border-rose-200 shadow-xs my-12">
        <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Unable to load dashboard</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => loadStats()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
        >
          <RotateCw size={14} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const role = String(stats?.role || authUser?.role || "admin").toLowerCase().trim();

  // Consistent Clean ERP Header for all roles
  const renderHeader = (title, subtitle) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {stats?.roleTitle || role}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
        {lastUpdated && (
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Updated {moment(lastUpdated).format("hh:mm:ss A")}
          </span>
        )}
        <button
          type="button"
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50"
          title="Refresh Dashboard Data"
        >
          <RotateCw
            size={14}
            className={`transition-transform duration-500 ${
              refreshing ? "animate-spin text-blue-600" : "text-slate-500"
            }`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>
    </div>
  );

  // =========================================================================
  // 1. HOD DASHBOARD VIEW (Scoped to assigned department)
  // =========================================================================
  if (role === "hod") {
    const department = stats?.department || { name: "Department", code: "", hodName: "HOD" };
    const deptStudents = stats?.students || { total: 0, active: 0, inactive: 0 };
    const deptFaculty = stats?.faculty || { total: 0, active: 0 };
    const deptCourses = stats?.courses || { total: 0, active: 0 };
    const deptBatches = stats?.batches || { total: 0, active: 0 };
    const deptExams = stats?.exams || { total: 0, gradedMarks: 0, passedCount: 0, passRate: 0 };
    const courseDistribution = stats?.courseDistribution || [];
    const recentStudents = stats?.recentStudents || [];
    const recentExams = stats?.recentExams || [];

    return (
      <div className="space-y-6">
        {renderHeader(
          `${department.name} Overview`,
          `Welcome, ${department.hodName || authUser?.name || "HOD"}. Here is the live academic summary for ${department.name}.`
        )}

        {/* Clean Department Identity Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{department.name}</h2>
                <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {department.code || "N/A"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Head of Department: <span className="font-semibold text-slate-700">{department.hodName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/exam"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Department Exams
            </Link>
            <Link
              to="/admin/result"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              Batch Results
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/student"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Department Students</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{deptStudents.total}</h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{deptStudents.active} Active Students</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/teacher"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Department Faculty</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{deptFaculty.total}</h3>
                <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{deptFaculty.active} Active Staff</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <UserCheck size={20} />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/course"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Department Courses</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{deptCourses.total}</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {deptCourses.active} Active Programs
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/batch"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Department Batches</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{deptBatches.total}</h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {deptBatches.active} Active Batches
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
            </div>
          </Link>
        </div>

        {/* Academic Exam & Results Performance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Award size={16} className="text-blue-600" />
                <span>Department Examination Performance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation results across exams conducted in {department.name}
              </p>
            </div>
            <Link to="/admin/result" className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto">
              View All Results &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Total Exams</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{deptExams.total}</span>
              <span className="text-[10px] text-slate-400 block">Conducted</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Graded Marks</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{deptExams.gradedMarks}</span>
              <span className="text-[10px] text-blue-600 font-medium block">Evaluations</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Passing Students</span>
              <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{deptExams.passedCount}</span>
              <span className="text-[10px] text-emerald-600 font-medium block">Passed</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Department Pass Rate</span>
              <span className="text-lg font-bold text-blue-700 mt-0.5 block">{deptExams.passRate}%</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, deptExams.passRate))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Columns: Course Distribution & Recent Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Students by Course Program</h3>
            <p className="text-xs text-slate-500 mb-3.5">Enrollment distribution in {department.name}</p>

            {courseDistribution.length > 0 ? (
              <div className="space-y-3">
                {courseDistribution.map((item, idx) => (
                  <div key={item.courseName || idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{item.courseName}</span>
                      <span className="text-slate-500 font-medium">
                        <strong>{item.count}</strong> students ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No students enrolled in this department yet.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Recent Department Exams</h3>
                <p className="text-xs text-slate-500">Latest scheduled exams</p>
              </div>
              <Link to="/admin/exam" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                View All &rarr;
              </Link>
            </div>

            {recentExams.length > 0 ? (
              <div className="space-y-2">
                {recentExams.map((ex) => (
                  <div
                    key={ex._id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{ex.examName || ex.ExamName}</p>
                      <p className="text-[11px] text-slate-500">
                        Subject: <span className="text-slate-700 font-medium">{ex.subject}</span> &bull; {ex.batchName || "Batch"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-800 text-[10px]">
                        Max: {ex.maxMarks || 100}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ex.examDate ? moment(ex.examDate).format("DD-MM-YYYY") : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No exams scheduled in this department yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Students Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Enrolled Students</h3>
              <p className="text-xs text-slate-500 mt-0.5">Students enrolled in {department.name}</p>
            </div>
            <Link to="/admin/student" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View All Students &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.length > 0 ? (
                  recentStudents.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{st.StudentName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{st.rollNumber || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-700">{st.Course || "General"}</td>
                      <td className="px-4 py-3 text-slate-600">{st.batch?.batchName || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {st.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                      No student records available for this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TEACHER DASHBOARD VIEW (Scoped to assigned classes)
  // =========================================================================
  if (role === "teacher") {
    const teacherInfo = stats?.teacherInfo || { name: authUser?.name || "Teacher", department: "General" };
    const teacherBatches = stats?.batches || { total: 0, active: 0 };
    const teacherStudents = stats?.students || { total: 0, active: 0, inactive: 0 };
    const teacherExams = stats?.exams || { total: 0, gradedMarks: 0, passedCount: 0, passRate: 0 };
    const assignedBatches = stats?.assignedBatches || [];
    const recentStudents = stats?.recentStudents || [];
    const recentExams = stats?.recentExams || [];

    return (
      <div className="space-y-6">
        {renderHeader(
          "Teacher Workspace",
          `Welcome, ${teacherInfo.name}. Here are your assigned classes, students, and grading activities.`
        )}

        {/* Clean Teacher Profile Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{teacherInfo.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Department: <span className="font-semibold text-slate-700">{teacherInfo.department || "General"}</span> &bull; Assigned Batches: <span className="font-semibold text-slate-700">{teacherBatches.total}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/exam"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Enter Marks
            </Link>
            <Link
              to="/admin/result"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              View Results
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/batch"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Assigned Batches</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{teacherBatches.total}</h3>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">
                  {teacherBatches.active} Active Classes
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/student"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">My Students</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{teacherStudents.total}</h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{teacherStudents.active} Active Students</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/exam"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Class Exams</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{teacherExams.total}</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {teacherExams.gradedMarks} Marks Graded
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ClipboardList size={20} />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/result"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Class Pass Rate</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{teacherExams.passRate}%</h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {teacherExams.passedCount} Students Passed
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
            </div>
          </Link>
        </div>

        {/* Assigned Batches Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Assigned Batches &amp; Classes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Classes where you are assigned as Class Teacher</p>
            </div>
            <Link to="/admin/batch" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View All Batches &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Batch Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Enrolled / Strength</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedBatches.length > 0 ? (
                  assignedBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.batchName}</td>
                      <td className="px-4 py-3 text-slate-600">{b.courseName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{b.session}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{b.enrolledCount}</span> / {b.strength}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {b.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <Link
                          to="/admin/exam"
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px]"
                        >
                          Exams
                        </Link>
                        <Link
                          to="/admin/result"
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px]"
                        >
                          Results
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400 italic">
                      You are not currently assigned as class teacher to any batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2 Columns: Recent Students & Scheduled Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm">Students in My Batches</h3>
              <Link to="/admin/student" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                View All &rarr;
              </Link>
            </div>
            {recentStudents.length > 0 ? (
              <div className="space-y-2">
                {recentStudents.map((st) => (
                  <div
                    key={st._id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{st.StudentName}</p>
                      <p className="text-[11px] text-slate-500">
                        Roll: <span className="font-mono">{st.rollNumber || "N/A"}</span> &bull; {st.batch?.batchName || "Batch"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {st.status || "Active"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">No students found in assigned batches.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm">Exams for My Batches</h3>
              <Link to="/admin/exam" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                Manage &rarr;
              </Link>
            </div>
            {recentExams.length > 0 ? (
              <div className="space-y-2">
                {recentExams.map((ex) => (
                  <div
                    key={ex._id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{ex.examName || ex.ExamName}</p>
                      <p className="text-[11px] text-slate-500">
                        Subject: <span className="font-medium text-slate-700">{ex.subject}</span> &bull; {ex.batchName || "Batch"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded block">
                        Max: {ex.maxMarks || 100}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {ex.examDate ? moment(ex.examDate).format("DD-MM-YYYY") : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">No exams scheduled for your batches.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ACCOUNTANT DASHBOARD VIEW (Fees, collections & receipts)
  // =========================================================================
  if (role === "accountant") {
    const fees = stats?.fees || {
      totalFees: 0,
      paidAmount: 0,
      dueAmount: 0,
      discount: 0,
      totalRecords: 0,
      paidRecords: 0,
      partialRecords: 0,
      pendingRecords: 0,
      collectionRate: 0,
      totalTransactions: 0
    };
    const recentTransactions = stats?.recentTransactions || [];
    const admissions = stats?.admissions || { total: 0, pending: 0, approved: 0 };

    return (
      <div className="space-y-6">
        {renderHeader(
          "Financial & Accounts Overview",
          "Live college fees collection, pending dues, installment ledgers, and payment receipts."
        )}

        {/* Clean Header Action Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Fee Collection &amp; Ledgers</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Transactions: <span className="font-semibold text-slate-700">{fees.totalTransactions}</span> &bull; Active Student Ledgers: <span className="font-semibold text-slate-700">{fees.totalRecords}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/fees"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Collect / Add Payment
            </Link>
            <Link
              to="/admin/fees/add"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              Assign Fee Structure
            </Link>
          </div>
        </div>

        {/* 4 Financial Key Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Total Fees Assigned</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(fees.totalFees)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{fees.totalRecords} Student fee ledgers</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-emerald-600 font-medium block">Collected / Paid</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(fees.paidAmount)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">{fees.paidRecords} Students fully paid</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-amber-600 font-medium block">Pending Balance Dues</span>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(fees.dueAmount)}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              {fees.pendingRecords} Pending &bull; {fees.partialRecords} Partial
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-blue-600 font-medium block">Collection Rate</span>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{fees.collectionRate}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, fees.collectionRate))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Ledger Breakdown Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-emerald-800 font-medium block">Fully Paid</span>
            <span className="text-lg font-bold text-emerald-900 mt-0.5 block">{fees.paidRecords}</span>
            <span className="text-[10px] text-emerald-700 block">Zero balance</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-[11px] text-blue-800 font-medium block">Partial Payments</span>
            <span className="text-lg font-bold text-blue-900 mt-0.5 block">{fees.partialRecords}</span>
            <span className="text-[10px] text-blue-700 block">Installments active</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <span className="text-[11px] text-amber-800 font-medium block">Unpaid / Pending</span>
            <span className="text-lg font-bold text-amber-900 mt-0.5 block">{fees.pendingRecords}</span>
            <span className="text-[10px] text-amber-700 block">No payment received</span>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <span className="text-[11px] text-purple-800 font-medium block">Total Receipts</span>
            <span className="text-lg font-bold text-purple-900 mt-0.5 block">{fees.totalTransactions}</span>
            <span className="text-[10px] text-purple-700 block">Payment receipts issued</span>
          </div>
        </div>

        {/* Recent Payment Receipts Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Payment Receipts &amp; Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest installments recorded across student ledgers</p>
            </div>
            <Link to="/admin/fees" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View All Ledgers &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {tx.receiptNo || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{tx.studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{tx.course}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        ₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          {tx.paymentMode || "Cash"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {tx.paymentDate ? moment(tx.paymentDate).format("DD-MM-YYYY") : "N/A"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-700">
                        ₹{Number(tx.balance || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/fees/receipt/${tx.feeId}`}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        >
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-400 italic">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admissions Overview for Fee Verification */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Admission Applications Overview</h3>
              <p className="text-xs text-slate-500">Applications pending fee verification and enrollment</p>
            </div>
            <Link to="/admin/addmissions" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Manage Admissions &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3.5 text-center">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Applications</span>
              <span className="text-xl font-bold text-slate-800 mt-0.5 block">{admissions.total}</span>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-xs text-amber-700 block">Pending Verification</span>
              <span className="text-xl font-bold text-amber-800 mt-0.5 block">{admissions.pending}</span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-xs text-emerald-700 block">Approved Admissions</span>
              <span className="text-xl font-bold text-emerald-800 mt-0.5 block">{admissions.approved}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. ADMIN DASHBOARD VIEW (Default / Administrator)
  // Clean, professional ERP dashboard with real statistics.
  // =========================================================================
  const students = stats?.students || { total: 0, active: 0, inactive: 0 };
  const faculty = stats?.faculty || { total: 0, active: 0 };
  const courses = stats?.courses || { total: 0, active: 0 };
  const batches = stats?.batches || { total: 0, active: 0 };
  const departments = stats?.departments || { total: 0 };
  const fees = stats?.fees || { totalFees: 0, paidAmount: 0, dueAmount: 0, collectionRate: 0 };
  const admissions = stats?.admissions || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const courseDistribution = stats?.courseDistribution || [];
  const recentAdmissions = stats?.recentAdmissions || [];

  return (
    <div className="space-y-6">
      {renderHeader(
        "Admin Dashboard",
        "Real-time operational metrics and academic statistics from your college database."
      )}

      {/* Top 5 Simple Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Students */}
        <Link
          to="/admin/student"
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {students.total.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{students.active} Active Students</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
          </div>
        </Link>

        {/* Total Faculty */}
        <Link
          to="/admin/teacher"
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Faculty</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {faculty.total.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>{faculty.active} Active Staff</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
          </div>
        </Link>

        {/* Total Courses */}
        <Link
          to="/admin/course"
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Courses</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {courses.total.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {courses.active} Active Programs
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
          </div>
        </Link>

        {/* Total Batches */}
        <Link
          to="/admin/batch"
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Batches</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {batches.total.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {batches.active} Active Batches
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
          </div>
        </Link>

        {/* Total Departments */}
        <Link
          to="/admin/department"
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Departments</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {departments.total.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Academic Divisions
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
          </div>
        </Link>
      </div>

      {/* Simple Fees Collection Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wallet size={16} className="text-emerald-600" />
              <span>Fees Collection &amp; Financial Summary</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live statistics calculated from student fee payment ledgers
            </p>
          </div>
          <Link
            to="/admin/fees"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
          >
            Manage Fees &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Total Fees Assigned</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(fees.totalFees)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {fees.totalRecords || 0} student ledgers
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-emerald-800 font-medium block">Collected Amount</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-900 mt-0.5 block">
              {formatCurrency(fees.paidAmount)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              {fees.paidRecords || 0} Fully Paid
            </span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-100">
            <span className="text-[11px] text-amber-800 font-medium block">Pending Due Amount</span>
            <span className="text-lg sm:text-xl font-bold text-amber-900 mt-0.5 block">
              {formatCurrency(fees.dueAmount)}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
              {fees.pendingRecords || 0} Pending &bull; {fees.partialRecords || 0} Partial
            </span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-[11px] text-blue-800 font-medium block">Collection Rate</span>
            <span className="text-lg sm:text-xl font-bold text-blue-900 mt-0.5 block">
              {fees.collectionRate}%
            </span>
            <div className="w-full bg-blue-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, fees.collectionRate))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Course Distribution & Operational Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Student Enrollment Distribution by Course */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Student Enrollment by Course</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live student distribution across active academic programs</p>
            </div>
          </div>

          {courseDistribution.length > 0 ? (
            <div className="space-y-3.5">
              {courseDistribution.map((item, idx) => (
                <div key={item.courseName || idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{item.courseName}</span>
                    <span className="text-slate-500 font-medium">
                      <strong className="text-slate-800">{item.count}</strong> student{item.count !== 1 ? "s" : ""} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs italic">
              No students enrolled in courses yet.
            </div>
          )}
        </div>

        {/* Operational Health Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Academic Overview</h3>
          <p className="text-xs text-slate-500 mb-4">Key college health indicators</p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500" /> Active Students
              </span>
              <span className="font-bold text-emerald-700">{students.active}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600 flex items-center gap-2">
                <XCircle size={15} className="text-slate-400" /> Inactive Students
              </span>
              <span className="font-bold text-slate-600">{students.inactive}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600 flex items-center gap-2">
                <Building2 size={15} className="text-blue-500" /> Departments
              </span>
              <span className="font-bold text-blue-700">{departments.total}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600 flex items-center gap-2">
                <Layers size={15} className="text-indigo-500" /> Total Batches
              </span>
              <span className="font-bold text-indigo-700">
                {batches.total} ({batches.active} Active)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600 flex items-center gap-2">
                <Clock size={15} className="text-amber-500" /> Pending Admissions
              </span>
              <span className="font-bold text-amber-700">{admissions.pending}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500" /> Approved Admissions
              </span>
              <span className="font-bold text-emerald-700">{admissions.approved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Recent Admissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Admission Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest student admission inquiries submitted via the portal
            </p>
          </div>
          <Link to="/admin/addmissions" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View All Admissions &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Applicant Name</th>
                <th className="px-4 py-3">Course Applied</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAdmissions.length > 0 ? (
                recentAdmissions.map((item) => {
                  const status = String(item.status || "Pending").toLowerCase();
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {(item.studentName || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{item.studentName}</p>
                            <p className="text-[11px] text-slate-400">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.courseName || "General"}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{item.mobile || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.admissionDate || item.createdAt
                          ? moment(item.admissionDate || item.createdAt).format("DD-MM-YYYY")
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {status === "approved" || status === "active" ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved
                          </span>
                        ) : status === "rejected" ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                    No admission applications recorded in the database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
