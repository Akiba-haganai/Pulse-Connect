import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 chars").optional(), // Added username field
});

type AuthForm = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<AuthForm>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data: AuthForm) => {
  try {
    if (isLogin) {
      await signIn(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/");
    } else {
      // Calculate defaults if fields are empty
      const name = data.fullName || data.email.split('@')[0];
      const user = data.username || data.email.split('@')[0];
      
      await signUp(data.email, data.password, name, user); // Now passing 4 arguments!
      toast.success("Account created!");
      setIsLogin(true);
    }
  } catch (err: any) {
    toast.error(err.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                {...register("fullName")}
                placeholder="Full Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "No account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-medium">
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}