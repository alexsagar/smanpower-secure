import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enter your email to receive a password reset link.
          </p>
        </div>
        
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
