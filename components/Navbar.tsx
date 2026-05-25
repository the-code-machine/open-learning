"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx"; // Utility for conditional classes
import Image from "next/image";
const navLinks = [
  { name: "About", href: "/about" },
  { name: "Mission", href: "/mission" },
  { name: "Our Events", href: "/events" },
  { name: "Games", href: "/games" },
  { name: "Projects", href: "/projects" },
  // { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link
            href={"/"}
            className="flex-shrink-0 flex items-center md:gap-5 gap-3"
          >
            {/* You can replace this text with <Image /> if you have the file */}
            <Image
              width={40}
              height={20}
              src="/logo.svg"
              alt=""
              className="h-11"
            />
            <div className="flex flex-col items-start cursor-pointer group">
              <span className="text-2xl font-bold tracking-tight text-brand-blue leading-none">
                WIKI OPEN
              </span>
              <span className="text-sm font-semibold tracking-widest text-gray-500 group-hover:text-brand-green transition-colors">
                LEARNING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    "relative py-2  font-semibold transition-colors duration-300",
                    isActive
                      ? "text-brand-blue"
                      : "text-gray-600 hover:text-brand-blue",
                  )}
                >
                  {link.name}
                  {/* Animated Underline */}
                  <span
                    className={clsx(
                      "absolute bottom-0 left-0 h-[3px] bg-brand-red rounded-full transition-all duration-300 ease-out",
                      isActive ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  ></span>
                  {/* Hover trigger wrapper to ensure w-0 becomes w-full on hover */}
                  <span className="absolute inset-0 group"></span>
                </Link>
              );
            })}

            {/* Call to Action Button (Optional, but looks good) */}
            <Link
              href="https://t.me/wikiopenlearning"
              className="bg-brand-blue text-white px-5 py-2 rounded-full font-semibold hover:bg-brand-green transition-colors duration-300 shadow-sm"
            >
              Join Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-blue hover:text-brand-red transition-colors focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={clsx(
          "md:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)} // Close menu on click
                className={clsx(
                  "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  isActive
                    ? "bg-brand-blue/10 text-brand-blue border-l-4 border-brand-red"
                    : "text-gray-600 hover:bg-gray-50 hover:text-brand-blue",
                )}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="https://t.me/wikiopenlearning"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center mt-4 bg-brand-blue text-white px-5 py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
          >
            Join Community
          </Link>
        </div>
      </div>
    </nav>
  );
}
