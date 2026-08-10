import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {status === "loading" && <LoadingSpinner label="Verifying your email" />}
      {status === "success" && (
        <>
          <CheckCircle2 className="mb-3 text-sage" size={40} />
          <h1 className="font-display text-lg font-semibold">Email verified</h1>
          <p className="mt-1 text-sm text-ink/60">Your account is now fully activated.</p>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="mb-3 text-coral" size={40} />
          <h1 className="font-display text-lg font-semibold">Verification failed</h1>
          <p className="mt-1 text-sm text-ink/60">This link is invalid or has expired.</p>
        </>
      )}
      <Link to="/dashboard" className="mt-6 font-semibold text-signal">
        Go to dashboard
      </Link>
    </div>
  );
}
