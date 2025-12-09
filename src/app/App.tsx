import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { ChatbotProvider } from "../contexts/ChatbotContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { GuestRoute } from "../components/GuestRoute";
import { AdminProtectedRoute } from "../components/AdminProtectedRoute";
import { Layout } from "./layout/Layout";
import { FeedPage } from "../pages/FeedPage";
import { AthletesPage } from "../pages/AthletesPage";
import { AthleteProfilePage } from "../pages/AthleteProfilePage";
import { MembersPage } from "../pages/MembersPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { LandingPage } from "../pages/LandingPage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { LoginPage } from "../pages/LoginPage";
import { VerifyMagicLinkPage } from "../pages/VerifyMagicLinkPage";
import { CampaignsPage } from "../features/campaigns";
import { Chatbot } from "../features/chatbot";

export function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/auth/verify/:token"
              element={<VerifyMagicLinkPage />}
            />
            <Route path="/athletes/:id" element={<AthleteProfilePage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route path="/onboarding" element={<OnboardingPage />} />
            {/* Guest-accessible routes */}
            <Route element={<GuestRoute />}>
              <Route element={<Layout />}>
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/athletes" element={<AthletesPage />} />
                <Route path="/members" element={<MembersPage />} />
              </Route>
            </Route>
            {/* Protected routes (require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/campaigns" element={<CampaignsPage />} />
              </Route>
            </Route>
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </ChatbotProvider>
    </AuthProvider>
  );
}
