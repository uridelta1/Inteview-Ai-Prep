import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-5xl font-semibold text-ink/20">404</h1>
      <p className="mt-2 text-ink/60">This page doesn't exist.</p>
      <Link to="/dashboard" className="mt-6 font-semibold text-signal">
        Back to dashboard
      </Link>
    </div>
  );
}
