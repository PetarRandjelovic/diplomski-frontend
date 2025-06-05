import Image from "next/image";
import { useState } from "react";

export default function Home() {
  // Demo sign-up form state and validation
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Invalid email address.";
    if (!form.password.trim()) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);
    if (Object.keys(validationErrors).length === 0) {
      // Submit logic here
      alert("Form submitted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-8 card max-w-xl w-full">
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={26}
            priority
            className="mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Welcome to <span className="text-primary-600">Your Modern App</span>
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">Username</label>
              <input
                name="username"
                className={`input ${errors.username ? 'border-red-500' : ''}`}
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
              {errors.username && <div className="text-red-600 text-sm mt-1">{errors.username}</div>}
            </div>
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">Email</label>
              <input
                name="email"
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
            </div>
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">Password</label>
              <input
                name="password"
                type="password"
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
            </div>
            <button type="submit" className="btn btn-primary w-full font-semibold">Create Account</button>
            {submitted && Object.keys(errors).length === 0 && (
              <div className="text-green-600 text-center mt-2">Form submitted successfully!</div>
            )}
          </form>
        </div>
      </main>
      <footer className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-gray-800 bg-gray-950 text-gray-400 text-sm">
        <a
          href="https://nextjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-primary-400 transition"
        >
          <Image src="/next.svg" alt="Next.js" width={20} height={20} />
          Next.js
        </a>
        <a
          href="https://tailwindcss.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-primary-400 transition"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.5 3 4.5 6 3 12c1.5 6 4.5 9 9 9s7.5-3 9-9c-1.5-6-4.5-9-9-9Zm0 16c-3.9 0-6.6-2.7-8-8 1.4-5.3 4.1-8 8-8s6.6 2.7 8 8c-1.4 5.3-4.1 8-8 8Z"/></svg>
          Tailwind CSS
        </a>
        <a
          href="https://vercel.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-primary-400 transition"
        >
          <Image src="/vercel.svg" alt="Vercel" width={20} height={20} />
          Vercel
        </a>
      </footer>
    </div>
  );
}
