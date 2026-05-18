import { Link } from "react-router";

export const RegisterPage = () => (
  <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
    <h1 className="mb-4 text-2xl font-semibold">Register</h1>
    <p className="text-sm">Registration flow placeholder.</p>
    <Link to="/login" className="mt-4 underline">
      Back to sign in
    </Link>
  </div>
);
