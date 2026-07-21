import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../store/services/authApi";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Username and password are required!");
      return;
    }

    try {
      const res = await login({ username, password }).unwrap();

      localStorage.setItem("token", res.token);

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
    }
  };

 return (
  <div className="min-h-screen bg-[#f6f8fb] flex">

    {/* LEFT IMAGE */}
    <div
      className="hidden lg:flex w-1/2 relative bg-cover bg-conic-330"
      style={{
        backgroundImage: "url('/doctor.png')",
      }}
    >
      <div className="absolute inset-0 bg-slate-700/45"></div>

      <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">

        <div>
          <div className="flex items-center gap-2">

            <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
              <HeartPulse size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Doctor ERP
              </h2>

              <p className="text-sm text-gray-200">
                Management System
              </p>

            </div>

          </div>
        </div>

        <div>

          <h1 className="text-5xl font-bold leading-tight">
            Smart Healthcare
          </h1>

          <p className="mt-4 max-w-md text-lg text-gray-100">
            Securely manage patients, appointments, billing,
            prescriptions and reports from one dashboard.
          </p>

        </div>

       

      </div>
    </div>

    {/* RIGHT */}
    <div className="flex-1 bg-white flex justify-center items-center relative">

      {/* Top Button */}

      

      <div className="w-full max-w-md px-8">

        {/* Logo */}

        <div className="flex justify-center">

          <div className="w-20 h-20 rounded-full bg-cyan-100 flex items-center justify-center">

            <HeartPulse
              className="text-cyan-400"
              size={42}
            />

          </div>

        </div>

        <h2 className="text-4xl font-bold text-center mt-8 text-gray-800">
          Welcome Back
        </h2>

        <p className="text-center text-gray-400 mt-2">
          Login to your account
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5"
        >

          {/* Username */}

          <div className="relative">

            <User
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter User Name"
              className="w-full h-14 rounded-full border border-gray-200 pl-14 pr-5 focus:ring-2 focus:ring-cyan-400 outline-none"
            />

          </div>

          {/* Password */}

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-14 rounded-full border border-gray-200 pl-14 pr-14 focus:ring-2 focus:ring-cyan-400 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

          {error && (
            <div className="text-center text-red-500 text-sm">
              {error.data?.error || "Login Failed"}
            </div>
          )}

          <button
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-cyan-400 hover:bg-cyan-500 text-white font-semibold text-lg transition"
          >
            {isLoading ? "Signing In..." : "Login"}
          </button>

        </form>

        <div className="flex justify-between mt-8 text-sm">

          <Link
            to="/register"
            className="text-cyan-500 hover:underline"
          >
            Register
          </Link>

          <Link
            to="/forgot-password"
            className="text-cyan-500 hover:underline"
          >
            Forgot Password?
          </Link>

        </div>

      </div>

    </div>

  </div>
);
};

export default Login;