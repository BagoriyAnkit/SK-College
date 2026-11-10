import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import AdminLayout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized";
import Dashboard from "./pages/admin/Deshboard.js";

import UserList from "./pages/admin/users/Index.js";
import UserAdd from "./pages/admin/users/Add.js";
import UserEdit from "./pages/admin/users/Edit.js";

import TeacherList from "./pages/admin/Teacher";
import TeacherAdd from "./pages/admin/Teacher/Add";
import TeacherEdit from "./pages/admin/Teacher/edit";

import StudentList from "./pages/admin/Student/index";
import Studentadd from "./pages/admin/Student/add";
import StudentEdit from "./pages/admin/Student/edit";

import Courseadd from './pages/admin/Course/add';
import CourseEdit from './pages/admin/Course/Edit';
import CourseList from './pages/admin/Course/index';

import Feesadd from './pages/admin/fees/add';
import FeesEdit from './pages/admin/fees/edit';
import FeesList from './pages/admin/fees/index';
import FeesReceipt from './pages/admin/fees/Receipt';

import BatchList from "./pages/admin/Batch/index";
import BatchAdd from './pages/admin/Batch/Add';
import BatchEdit from "./pages/admin/Batch/edit.js";

import AddmissionList from "./pages/admin/Addmission/index.js";
import AddmissionAdd from "./pages/admin/Addmission/add.js";
import AddmissionEdit from "./pages/admin/Addmission/edit.js";

import EventList from "./pages/admin/Event/Index.js";
import EventAdd from "./pages/admin/Event/Add.js";
import EventEdit from "./pages/admin/Event/Edit.js";

import NoticeList from "./pages/admin/Notice/index.js";
import NoticeAdd from "./pages/admin/Notice/add";
import NoticeEdit from "./pages/admin/Notice/edit";

import ExamList from "./pages/admin/Exam/index.js";
import ExamAdd from "./pages/admin/Exam/add.js";
import ExamEdit from "./pages/admin/Exam/edit.js";
import Results from "./pages/admin/Exam/Results.js";
import Marksheet from "./pages/admin/Exam/Marksheet.js";

import PlacementList from "./pages/admin/placement/index";
import PlacementAdd from "./pages/admin/placement/add";
import PlacementEdit from "./pages/admin/placement/edit.js";

import ContactList from "./pages/admin/Contact/Index.js";

import StaticPageList from "./pages/admin/StaticPage/index.js";
import StaticPageAdd from "./pages/admin/StaticPage/add.js";
import StaticPageEdit from "./pages/admin/StaticPage/edit.js";

import FaqList from "./pages/admin/FAQ/index.js";
import FaqAdd from "./pages/admin/FAQ/Add.js";
import FaqEdit from "./pages/admin/FAQ/Edit.js";

import AboutList from "./pages/admin/About/index.js";
import AboutAdd from "./pages/admin/About/add.js";
import AboutEdit from "./pages/admin/About/edit.js";

import MemoriesList from "./pages/admin/Memories/index.js";
import MemoriesAdd from "./pages/admin/Memories/add.js";
import MemoriesEdit from "./pages/admin/Memories/edit.js";

import DepartmentList from "./pages/admin/Department/Index.js";
import DepartmentAdd from "./pages/admin/Department/Add.js";
import DepartmentEdit from "./pages/admin/Department/Edit.js";

import AdminLogin from './Components/Login';

// FRONTEND
import Home from "./pages/frontend/Home";
import ApplyNow from "./pages/frontend/ApplyNow.js";
import Login from "./pages/frontend/Login.js";
import ForgotPassword from "./pages/frontend/ForgotPassword.js";
import ResetPassword from "./pages/frontend/ResetPassword.js";
import Contact from "./pages/frontend/Contact.js";
import Placement from "./pages/frontend/Placement.js";
import Event from "./pages/frontend/Event.js";
import About from "./pages/frontend/About.js";
import Exam from "./pages/frontend/Exam.js";
import Programs from "./pages/frontend/Program.js";
import ProgramDetails from "./pages/frontend/programDetails.js";
import Teacher from "./pages/frontend/Teacher.js";
import TeacherDetail from "./pages/frontend/TeacherDetail.js";
import Faq from "./pages/frontend/Faq.js";
import Notice from "./pages/frontend/Notice.js";
import StaticPage from "./pages/frontend/StaticPage.js";
import Department from "./pages/frontend/Department.js";
import Batch from "./pages/frontend/Batch.js";
import Search from "./pages/frontend/Search.js";
import PortalFallback from "./pages/frontend/PortalFallback.js";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Frontend College Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/applyNow" element={<ApplyNow />} />
        <Route path="/apply-now" element={<ApplyNow />} />
        <Route path="/apply" element={<ApplyNow />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/placements" element={<Placement />} />
        <Route path="/events" element={<Event />} />
        <Route path="/about" element={<About />} />
        <Route path="/batch" element={<Batch />} />
        <Route path="/program" element={<Programs />} />
        <Route path="/program/:id" element={<ProgramDetails />} />
        <Route path="/faculty" element={<Teacher />} />
        <Route path="/faculty/:id" element={<TeacherDetail />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/search" element={<Search />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/static/:slug" element={<StaticPage />} />
        <Route path="/department" element={<Department />} />

        {/* Dedicated Unauthorized Error Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Authenticated User Portal / Role Fallback (e.g. Student Dashboard) */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={["student", "admin", "hod", "teacher", "accountant"]}>
              <PortalFallback />
            </ProtectedRoute>
          }
        />
        <Route path="/student-dashboard" element={<Navigate to="/portal" replace />} />

        {/* Admin Standalone Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Back-Office Panel - Protected for Staff Roles */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          {/* Dashboard: All Staff Roles (Admin, HOD, Teacher, Accountant) */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* User Account Management: Admin only */}
          <Route
            path="user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="user/add"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="user/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserEdit />
              </ProtectedRoute>
            }
          />

          {/* Faculty / Teachers: View (Admin, HOD, Teacher), Add/Edit (Admin, HOD) */}
          <Route
            path="teacher"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <TeacherList />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <TeacherAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <TeacherEdit />
              </ProtectedRoute>
            }
          />

          {/* Students: View (Admin, HOD, Teacher, Accountant), Add/Edit (Admin, HOD) */}
          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <Studentadd />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <StudentEdit />
              </ProtectedRoute>
            }
          />

          {/* Course: View (Admin, HOD, Teacher, Accountant), Add/Edit (Admin, HOD) */}
          <Route
            path="course"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="course/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <Courseadd />
              </ProtectedRoute>
            }
          />
          <Route
            path="course/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <CourseEdit />
              </ProtectedRoute>
            }
          />

          {/* Fees: Admin & Accountant */}
          <Route
            path="fees"
            element={
              <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                <FeesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                <Feesadd />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                <FeesEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/receipt/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                <FeesReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/receipt/:id/:paymentIndex"
            element={
              <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                <FeesReceipt />
              </ProtectedRoute>
            }
          />

          {/* Batches: View (Admin, HOD, Teacher, Accountant), Add/Edit (Admin, HOD) */}
          <Route
            path="batch"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <BatchList />
              </ProtectedRoute>
            }
          />
          <Route
            path="batch/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <BatchAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="batch/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <BatchEdit />
              </ProtectedRoute>
            }
          />

          {/* Admissions: Admin, HOD, Accountant */}
          <Route
            path="addmissions"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "accountant"]}>
                <AddmissionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="addmissions/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "accountant"]}>
                <AddmissionAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="addmissions/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "accountant"]}>
                <AddmissionEdit />
              </ProtectedRoute>
            }
          />

          {/* Events: Admin & HOD */}
          <Route
            path="event"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <EventList />
              </ProtectedRoute>
            }
          />
          <Route
            path="event/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <EventAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="event/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <EventEdit />
              </ProtectedRoute>
            }
          />

          {/* Notices: Admin, HOD, Teacher, Accountant */}
          <Route
            path="notice"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <NoticeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="notice/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <NoticeAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="notice/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <NoticeEdit />
              </ProtectedRoute>
            }
          />

          {/* Exams: Admin, HOD, Teacher */}
          <Route
            path="exam"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <ExamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <ExamAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <ExamEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="result"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/results"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/marksheet/:studentId"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <Marksheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="result/marksheet/:studentId"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher"]}>
                <Marksheet />
              </ProtectedRoute>
            }
          />

          {/* Placement: Admin & HOD */}
          <Route
            path="placement"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <PlacementList />
              </ProtectedRoute>
            }
          />
          <Route
            path="placement/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <PlacementAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="placement/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <PlacementEdit />
              </ProtectedRoute>
            }
          />

          {/* Department: View (Admin, HOD, Teacher, Accountant), Add/Edit (Admin, HOD) */}
          <Route
            path="department"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod", "teacher", "accountant"]}>
                <DepartmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="department/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <DepartmentAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="department/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "hod"]}>
                <DepartmentEdit />
              </ProtectedRoute>
            }
          />

          {/* CMS & Settings: Admin only */}
          <Route
            path="contact"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ContactList />
              </ProtectedRoute>
            }
          />

          <Route
            path="staticpage"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaticPageList />
              </ProtectedRoute>
            }
          />
          <Route
            path="staticpage/add"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaticPageAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="staticpage/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaticPageEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="StaticPage"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaticPageList />
              </ProtectedRoute>
            }
          />
          <Route
            path="StaticPage/add"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaticPageAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="StaticPage/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaticPageEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="faq"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FaqList />
              </ProtectedRoute>
            }
          />
          <Route
            path="faq/add"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FaqAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="faq/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FaqEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="about"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AboutList />
              </ProtectedRoute>
            }
          />
          <Route
            path="about/add"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AboutAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="about/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AboutEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="memories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MemoriesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="memories/add"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MemoriesAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="memories/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MemoriesEdit />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;