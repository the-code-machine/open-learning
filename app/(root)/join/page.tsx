"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";

export default function JoinPage() {
  // --- STATE ---
  const [status, setStatus] = useState<"idle" | "verifying" | "success">(
    "idle"
  );

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("verifying");

    // Simulate Verification / API Call (3 Seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- SHARED BACKGROUND COMPONENT ---
  const BackgroundImage = () => (
    <div className="fixed inset-0 -z-10">
      <Image
        src={"/join-bg.png"} // Ensure this image exists in /public
        fill
        alt="Background Illustration"
        className="object-cover"
        priority // Load immediately as it's above the fold
      />
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gray-50/30 "></div>
    </div>
  );

  // --- SUCCESS VIEW ---
  if (status === "success") {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Background Image added here */}
        <BackgroundImage />

        {/* Content Card */}
        <div className="relative z-10 max-w-xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center animate-fadeIn border border-gray-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-brand-green" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Application Received!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for applying to join <strong>Wiki Open Learning</strong>.
            We have verified your details and sent a confirmation email to your
            inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="px-8 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/"
              className="px-8 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors hover:bg-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      {/* Background Image added here (Fixed Z-index issue) */}
      <BackgroundImage />

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join the Community
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Become a part of the open education movement. Fill out the details
            below to get verified and access our resources.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-t-8 border-brand-blue overflow-hidden">
          {/* Form Header / Info */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Membership Application
            </h2>
            <p className="text-sm text-red-500 mt-2">
              * Indicates required question
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* SECTION 1: PERSONAL INFO */}
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-base font-medium text-gray-900"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  className="w-full border-b-2 border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-brand-blue focus:bg-blue-50 focus:outline-none transition-colors rounded-t-md"
                  placeholder="Your Answer"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-gray-900"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full border-b-2 border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-brand-blue focus:bg-blue-50 focus:outline-none transition-colors rounded-t-md"
                  placeholder="Your email"
                />
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-base font-medium text-gray-900"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full border-b-2 border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-brand-blue focus:bg-blue-50 focus:outline-none transition-colors rounded-t-md"
                  placeholder="Your Answer"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 2: PROFESSIONAL INFO */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                Professional Details
              </h3>

              {/* Current Role */}
              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-900">
                  Current Role <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 mt-2">
                  {[
                    "Student",
                    "Professional Developer",
                    "Designer",
                    "Teacher / Academic",
                    "Other",
                  ].map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50/80 transition-colors"
                    >
                      <input
                        type="radio"
                        name="role"
                        required
                        className="w-5 h-5 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="github"
                    className="block text-base font-medium text-gray-900"
                  >
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    id="github"
                    className="w-full border-b-2 border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-brand-blue focus:bg-blue-50 focus:outline-none transition-colors rounded-t-md"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="linkedin"
                    className="block text-base font-medium text-gray-900"
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    className="w-full border-b-2 border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-brand-blue focus:bg-blue-50 focus:outline-none transition-colors rounded-t-md"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 3: MOTIVATION */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="motivation"
                  className="block text-base font-medium text-gray-900"
                >
                  Why do you want to join Wiki Open Learning?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500">
                  Tell us briefly about your interests and what you hope to
                  learn or contribute.
                </p>
                <textarea
                  id="motivation"
                  required
                  rows={4}
                  className="w-full border-2 border-gray-200 bg-gray-50/50 p-4 rounded-lg focus:border-brand-blue focus:bg-white focus:outline-none transition-colors resize-none"
                  placeholder="Your answer..."
                ></textarea>
              </div>
            </div>

            {/* SECTION 4: SUBMIT */}
            <div className="pt-6">
              <div className="flex items-start gap-3 mb-8">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the Community Code of Conduct and understand that
                  my application will be reviewed by the core team.
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "verifying"}
                className={clsx(
                  "w-full py-4 px-6 rounded-lg font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3",
                  status === "verifying"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-brand-blue hover:bg-blue-700 hover:-translate-y-1"
                )}
              >
                {status === "verifying" ? (
                  <>
                    <Loader2 className="animate-spin" /> Verifying Details...
                  </>
                ) : (
                  <>
                    Submit Application <ArrowRight />
                  </>
                )}
              </button>

              {status === "verifying" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-green animate-pulse font-semibold bg-white/80 p-2 rounded-md">
                  <ShieldCheck size={16} /> Securely verifying your profile
                  info...
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="max-w-2xl mx-auto text-center mt-8 text-sm text-gray-600 font-medium bg-white/50 p-2 rounded-md backdrop-blur-sm">
          <p>Never submit passwords through this form.</p>
          <p className="mt-1">
            This content is created by the owner of the form. The data you
            submit will be sent to the form owner.
          </p>
        </div>
      </div>
    </div>
  );
}
