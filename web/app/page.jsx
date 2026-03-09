import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Layout,
  Smartphone,
  Users,
} from "lucide-react";
import { logo } from "@/components/constant";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-full h-10 rounded-lg   flex items-center justify-center font-bold text-white text-lg">
            <Link href="/">
              <Image src={logo} alt="Logo" width={150} height={50} />
            </Link>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link
            href="#features"
            className="hover:text-gray-900 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="hover:text-gray-900 transition-colors"
          >
            Testimonials
          </Link>
         
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-16 px-6 lg:px-10 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gray-50">
        {/* Background Gradients - subtler for light mode */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-100/50 rounded-full blur-[100px] -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-blue-600 mb-8 animate-fade-in-up shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v1.0 Now Available
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 text-gray-900 animate-fade-in-up delay-100">
          Supercharge your workflow with{" "}
          <span className="text-blue-600">Flymedia</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 animate-fade-in-up delay-200">
          The ultimate platform for managing projects, tracking employees, and
          streamlining your business operations. All in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/10"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/demo"
            className="px-8 py-3 rounded-full font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            View Demo
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative w-full max-w-6xl mx-auto rounded-xl border border-gray-200 bg-white p-2 shadow-2xl animate-fade-in-up delay-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10 opacity-20" />
          <div className="rounded-lg overflow-hidden bg-gray-50 border border-gray-100 aspect-[16/9] flex items-center justify-center text-gray-400">
            {/* Placeholder for dashboard screenshot */}
            <span className="text-2xl font-medium">Dashboard Preview</span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-6 lg:px-10 border-t border-gray-200 relative bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Everything you need
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your entire agency workflow from a single powerful
              dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layout className="w-6 h-6 text-blue-600" />}
              title="Project Management"
              description="Organize projects, assign tasks, and track progress with Kanban boards and Gantt charts."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-purple-600" />}
              title="Employee Tracking"
              description="Monitor employee performance, hours, and task completion in real-time."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-pink-600" />}
              title="Mobile App"
              description="Stay connected on the go with our dedicated Android application for employees."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-10 border-t border-gray-200 text-center text-gray-500 text-sm bg-gray-50">
        <p>© 2026 Flymedia. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
