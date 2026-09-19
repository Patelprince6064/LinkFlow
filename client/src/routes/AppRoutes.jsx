import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Links from "../pages/Links";
import Analytics from "../pages/Analytics";
import LinkAnalytics from "../pages/LinkAnalytics";
import BioEditor from "../pages/BioEditor";
import PublicBio from "../pages/PublicBio";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/bio/:username" element={<PublicBio />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/links" element={<Links />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/analytics/:linkId" element={<LinkAnalytics />} />
        <Route path="/dashboard/bio" element={<BioEditor />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
