import React, { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterMutation } from "../../store/services/authApi";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const [registerUser, { error: rtkError }] = useRegisterMutation();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await registerUser({ username: form.username, password: form.password }).unwrap();
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.user.username);
      alert("Registration successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.data?.error || "Registration failed");
    }
  };

return (
  <div className="min-h-screen flex bg-white">
    {/* LEFT SIDE */}
    <div className="hidden lg:flex lg:w-1/2 relative">
      <img
        src="/login-bg.png" // Put your image inside public folder
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-slate-700/35"></div>

      <div className="relative z-10 flex flex-col justify-between h-full w-full p-10 text-white">
        <div>
          
        </div>

      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex-1 flex items-center justify-center relative bg-white">

      {/* Login Button */}
      

      <div className="w-full max-w-md">

       
        

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Sign Up
        </h2>

        <p className="text-center text-gray-400 mt-2 mb-8">
          Register a new membership
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div className="relative">
            <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter User Name"
              required
              className="w-full border rounded-full py-3 pl-12 pr-5 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full border rounded-full py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-cyan-400 hide-password-icon"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full border rounded-full py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-cyan-400 hide-password-icon"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-3"
            >
              {showConfirm ? (
                <EyeSlashIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          <style>{`
              input.hide-password-icon::-ms-reveal,
              input.hide-password-icon::-ms-clear{
              display:none;
              }

              input[type="password"]::-ms-reveal,
              input[type="password"]::-ms-clear{
              display:none;
              }

              input::-ms-reveal,
              input::-ms-clear{
              display:none;
              }
          `}</style>

          {(error || rtkError) && (
            <p className="text-red-500 text-sm text-center">
              {error ||
                rtkError?.data?.error ||
                "Registration failed"}
            </p>
          )}

         

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-white rounded-full py-3 font-semibold transition"
          >
            Sign Up
          </button>

          <p className="text-center text-gray-500">
            Already Registered?

            <Link
              to="/login"
              className="text-cyan-500 ml-1 font-semibold"
            >
              Log in
            </Link>
          </p>
        </form>

       
      

      </div>
    </div>
  </div>
);
};

export default Register;