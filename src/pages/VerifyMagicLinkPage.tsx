import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../contexts/AuthContext";
import "./VerifyMagicLinkPage.css";

export function VerifyMagicLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshUser, exitGuestMode } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus("error");
        setError("Invalid token");
        return;
      }

      try {
        const response = await apiClient.get<{
          success: boolean;
          userId: string;
          profileComplete: boolean;
          alreadyUsed?: boolean;
        }>(`/api/auth/verify/${token}`);

        if (response.success) {
          // Store userId in localStorage (in production, use proper JWT tokens)
          localStorage.setItem("userId", response.userId);

          // Clear guest mode when user logs in
          exitGuestMode();

          // Refresh user data
          await refreshUser();

          setStatus("success");

          // Get user data to check role
          try {
            const userResponse = await fetch(
              `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`,
              {
                headers: {
                  "x-user-id": response.userId,
                },
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();

              // Redirect based on role and profile completion
              setTimeout(() => {
                if (userData.role === "ADMIN") {
                  navigate("/admin");
                } else if (response.profileComplete) {
                  navigate("/feed");
                } else {
                  navigate("/onboarding");
                }
              }, 1500);
            } else {
              // Fallback to profile completion check
              setTimeout(() => {
                if (response.profileComplete) {
                  navigate("/feed");
                } else {
                  navigate("/onboarding");
                }
              }, 1500);
            }
          } catch (err) {
            // Fallback to profile completion check
            setTimeout(() => {
              if (response.profileComplete) {
                navigate("/feed");
              } else {
                navigate("/onboarding");
              }
            }, 1500);
          }
        }
      } catch (err: any) {
        console.error("Verification error:", err);

        // Check if error is about already used token
        const errorMessage =
          err?.response?.data?.error ||
          err?.message ||
          "Failed to verify magic link";

        if (errorMessage.includes("already been used")) {
          // If user is already authenticated, just redirect them
          const currentUserId = localStorage.getItem("userId");
          if (currentUserId) {
            // User is already signed in, just redirect
            await refreshUser();
            setStatus("success");

            // Get user data to redirect appropriately
            try {
              const userResponse = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`,
                {
                  headers: {
                    "x-user-id": currentUserId,
                  },
                }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                setTimeout(() => {
                  if (userData.role === "ADMIN") {
                    navigate("/admin");
                  } else if (userData.athlete?.profileComplete) {
                    navigate("/feed");
                  } else {
                    navigate("/onboarding");
                  }
                }, 500);
                return;
              }
            } catch (fetchErr) {
              // Continue to error state
            }
          }
        }

        setStatus("error");
        setError(errorMessage);
      }
    }

    verifyToken();
  }, [token, navigate, refreshUser]);

  return (
    <div className="verify-page">
      <div className="verify-container">
        {status === "verifying" && (
          <>
            <div className="verify-spinner"></div>
            <h2>Verifying your magic link...</h2>
            <p>Please wait while we sign you in.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="verify-success-icon">✓</div>
            <h2>Success!</h2>
            <p>You've been signed in. Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="verify-error-icon">✕</div>
            <h2>Verification Failed</h2>
            <p className="error-text">
              {error || "This magic link is invalid or has expired."}
            </p>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
