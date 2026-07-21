import React, { useState } from "react";
import { useForgotPasswordMutation } from "../../store/services/authApi";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const ForgetPassword = () => {
  const [form, setForm] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPassword, { error }] = useForgotPasswordMutation();

  // handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    try {
      const res = await forgotPassword({
        username: form.username,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      }).unwrap();
      setSuccess(res.message || "Password reset successful.");
      setForm({ username: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      // error handled by RTK Query's error object for display
    }
  };

  return (
  <>
    <style>{`
      input[type="password"]::-ms-reveal,
      input[type="password"]::-ms-clear {
        display: none;
      }
    `}</style>

    <div className="min-h-screen flex bg-white">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/login-bg.png" // Put the medical image inside public folder
          alt="Medical"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-slate-700/35"></div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full p-10 text-white">
          <div className="flex items-center gap-3">
           
            
          </div>

         
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex-1 flex items-center justify-center relative bg-white">

       

        <div className="w-full max-w-md">

          <div className="flex justify-center mb-6">
           
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800">
            Reset Password
          </h2>

          <p className="text-center text-gray-400 mt-2 mb-8">
            Enter your username and choose a new password
          </p>

          {error && (
            <p className="text-red-500 text-center mb-4">
              {error.data?.error || "Something went wrong"}
            </p>
          )}

          {success && (
            <p className="text-green-600 text-center mb-4">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter Username"
              required
              className="w-full border rounded-full py-3 px-5 focus:ring-2 focus:ring-cyan-400 outline-none"
            />

            {/* Password */}

            <div className="relative">

              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="New Password"
                autoComplete="new-password"
                required
                className="w-full border rounded-full py-3 px-5 pr-12 focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
                className="absolute right-4 top-3.5"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>

            </div>

            {/* Confirm Password */}

            <div className="relative">

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                required
                className="w-full border rounded-full py-3 px-5 pr-12 focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-3.5"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>

            </div>

            <button
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-white rounded-full py-3 font-semibold transition"
            >
              Reset Password
            </button>

          </form>

          <p className="text-center text-gray-500 mt-6">
            Remember your password?

            <a
              href="/"
              className="text-cyan-500 font-semibold ml-1"
            >
              Log In
            </a>
          </p>


        </div>

      </div>

    </div>
  </>
);
};

export default ForgetPassword;
