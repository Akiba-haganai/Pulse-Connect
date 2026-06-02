import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import DiscoveryPage from '../pages/discovery/DiscoveryPage';
import Announcements from "../pages/Announcements";
import ProfilePage from '../pages/profile/ProfilePage';
import StudyPage from "../pages/StudyPage";
import MarketplaceRedirect from "../pages/MarketplaceRedirect";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import MessagesPage from "../pages/messages/MessagesPage";
import StudyVault from '../pages/StudyVault';
import FlashcardHub from '../pages/FlashcardHub';
import MapPage from "../pages/MapPage"; // 🌟 Imported your new navigator page context

export const router = createBrowserRouter([
  // Public auth routes — redirect to home if already logged in
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Legacy /auth route redirects to /login for backwards-compatibility
  { path: "/auth", element: <Navigate to="/login" replace /> },

  {
    path: "/",
    element: <AppLayout />, // UI shell: TopBar + Outlet + BottomNav
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "announcements",
        element: (
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        ),
      },
      {
        path: "study",
        element: (
          <ProtectedRoute>
            <StudyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "marketplace",
        element: <MarketplaceRedirect />, // Left in array for explicit redirect logic
      },
      {
        path: "map", // 🌟 Secure protected access node matching bottom nav links
        element: (
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "discovery",
        element: (
          <ProtectedRoute>
            <DiscoveryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "study-vault",
        element: (
          <ProtectedRoute>
            <StudyVault />
          </ProtectedRoute>
        ),
      },
      {
        path: "flashcard-hub",
        element: (
          <ProtectedRoute>
            <FlashcardHub />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Catch-all fallback: redirect any unknown route to home
  { path: "*", element: <Navigate to="/" replace /> },
]);