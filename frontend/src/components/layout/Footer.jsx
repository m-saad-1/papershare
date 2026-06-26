import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail, X } from 'lucide-react';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white relative safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-2.5 sm:mb-3 min-h-touch py-1">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">PaperShare</span>
            </Link>
            <p className="text-gray-400 max-w-md text-[13px] sm:text-sm leading-6">
              A comprehensive platform for students to share and access past papers,
              assignments, and quizzes from universities worldwide. Join our community
              to enhance your learning experience.
            </p>
            <div className="flex space-x-4 mt-3 sm:mt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-400 hover:text-white transition-colors duration-200 min-h-touch min-w-touch flex items-center justify-center"
              >
                <Github className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-400 hover:text-white transition-colors duration-200 min-h-touch min-w-touch flex items-center justify-center"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <a
                href="mailto:info@papershare.com"
                className="text-gray-400 hover:text-white transition-colors duration-200 min-h-touch min-w-touch flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] text-gray-200 mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-0.5">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/papers" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Browse Papers
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Browse Notes
                </Link>
              </li>
              <li>
                <Link to="/universities" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Universities
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Upload Paper
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support - UPDATED WITH CORRECT LINKS */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] text-gray-200 mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-0.5">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/academic-integrity" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Academic Integrity
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-[13px] sm:text-sm transition-colors duration-200 py-1 inline-flex items-center leading-5">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-7 pt-5 sm:pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3">
          <p className="text-gray-400 text-[13px] sm:text-sm leading-5 text-center md:text-left">
            © 2024 PaperShare. All rights reserved.
          </p>
          <p className="text-gray-400 text-[13px] sm:text-sm leading-5 text-center md:text-right">
            Built for students, by students.
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-2xl w-full max-w-md m-4 text-gray-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Coming Soon!</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors min-h-touch min-w-touch flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 text-fluid-base mb-6">
              We're working hard to connect our social media channels. Please check back later!
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors min-h-touch"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
