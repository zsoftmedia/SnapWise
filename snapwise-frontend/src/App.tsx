import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import EmailCallback from "./components/auth/ EmailCallback";
import AppShell from "./components/layout/appShell";
import ProtectedRoute from "./routes/ProtectedRoute";
import Master from "./components/master/master";
import ResetPassword from "./components/auth/ResetPassword";
import JoinWorkplacePage from "./components/pages/invatation/joinWorkplacePage";
import JoinEmployee from "./components/auth/joinEmployee/joinEmployee";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/auth/callback" element={<EmailCallback />} />
      <Route path="/join" element={<JoinEmployee />} />
      <Route element={<AppShell />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/master" replace />} />
          <Route path="/master" element={<Master />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/master" replace />} />
    </Routes>
  );
}
