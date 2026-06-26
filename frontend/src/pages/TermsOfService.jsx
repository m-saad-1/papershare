import React, { useState } from 'react';
import { 
  FileText,
  Scale,
  AlertCircle,
  CheckCircle, 
  XCircle,
  ChevronDown, 
  ChevronUp,
  Calendar,
  Shield,
  Lock,
  Users,
  BookOpen,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const [expandedSections, setExpandedSections] = useState({
    'acceptance': true,
    'user-accounts': false,
    'content': false,
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: `By creating an account or using PaperShare, you agree to these Terms of Service. If you do not agree, please do not use the platform.`
    },
    {
      id: 'description',
      title: 'Description of Service',
      icon: BookOpen,
      content: `PaperShare is a student-focused platform where users can upload, browse, request, and download academic papers and study notes. Content may be moderated for quality, policy compliance, and community safety.`
    },
    {
      id: 'user-accounts',
      title: 'User Accounts',
      icon: Users,
      content: `To use key features, you must register an account. You agree to:

• Provide accurate, current, and complete information during registration
• Keep your account information up to date
• Keep your password secure and not share your account
• Notify us immediately of any unauthorized use of your account
• Be responsible for all activities that occur under your account

We may suspend or restrict accounts that violate these terms.`
    },
    {
      id: 'content',
      title: 'User Content and Conduct',
      icon: Upload,
      content: `You are solely responsible for all content you upload, post, or otherwise make available via the Service. You agree not to upload content that:

• Infringes any third party's copyright, patent, trademark, or proprietary rights
• Contains viruses, malware, or any other destructive code
• Is illegal, threatening, defamatory, or harassing
• Is spam or commercial solicitation
• Contains personally identifiable information without consent
• Is not your own work or is shared without permission
• Encourages academic dishonesty

We may remove content or limit accounts that violate these rules.`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      icon: Shield,
  content: `PaperShare platform code, branding, and design are owned by PaperShare.

By uploading content, you grant PaperShare a non-exclusive license to host, display, and distribute that content within the platform so users can discover and access it.

You keep ownership of your uploaded material, but you must have rights to share it.`
    },
    {
      id: 'prohibited-uses',
      title: 'Prohibited Uses',
      icon: XCircle,
      content: `You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:

• In any way that violates any applicable law or regulation
• To exploit, harm, or attempt to exploit or harm minors
• To transmit any advertising or promotional material without consent
• To impersonate or attempt to impersonate PaperShare or another user
• To engage in any conduct that restricts or inhibits anyone's use of the Service
• To use any robot, spider, or other automatic device to access the Service
• To interfere with or disrupt the integrity or performance of the Service`
    },
    {
      id: 'copyright',
      title: 'Copyright Policy',
      icon: FileText,
      content: `We respect copyright and intellectual property rights. If you believe content on PaperShare infringes your rights, contact our support team with:

    • Your identity and contact information
    • A description of the copyrighted work
    • The exact PaperShare URL or content reference
    • A statement that your claim is made in good faith

    We review reports and may remove content while investigating.`
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: Lock,
      content: `We may suspend or terminate access if you violate these terms, abuse the platform, or create legal/security risk.

    You may request account deletion by contacting support.

    Certain records may be retained where required for legal, abuse-prevention, or security reasons.`
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: AlertCircle,
      content: `PaperShare is provided as-is. To the extent allowed by law, PaperShare is not liable for indirect or consequential losses resulting from:

    • Service downtime or interruptions
    • User-generated content accuracy or legality
    • Unauthorized account access caused by compromised credentials
    • Reliance on materials shared by other users

    This does not exclude liability that cannot be excluded under applicable law.`
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      icon: Scale,
      content: `Your use of PaperShare is at your own risk. We do not guarantee uninterrupted access, complete accuracy of all user-uploaded content, or suitability for any specific academic requirement.

    Always verify papers and notes with your institution's official guidance.`
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      icon: Scale,
      content: `These terms are governed by applicable local laws where PaperShare operates.

    If any provision is found unenforceable, the remaining provisions continue to apply.`
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: Calendar,
      content: `We may update these terms when features, laws, or platform rules change. Updated terms will be posted on this page with a new effective date.

    By continuing to use PaperShare after updates, you agree to the revised terms.`
    }
  ];

  const importantPoints = [
    {
      title: 'Content Responsibility',
      description: 'You are responsible for all content you upload',
      icon: Upload
    },
    {
      title: 'Academic Integrity',
      description: 'Use papers for study purposes only',
      icon: BookOpen
    },
    {
      title: 'Copyright Respect',
      description: 'Do not upload copyrighted material without permission',
      icon: Shield
    },
    {
      title: 'Account Security',
      description: 'Keep your login credentials secure',
      icon: Lock
    }
  ];

  const lastUpdated = 'March 15, 2026';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Scale className="h-8 w-8 md:h-10 md:w-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-4">
              Please read these terms carefully before using PaperShare
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm md:text-base text-primary-200">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span>Effective Date: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Important Notice */}
        <div className="mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 md:p-8 border border-red-200">
            <div className="flex flex-col md:flex-row md:items-start">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Important Legal Notice</h2>
                <p className="text-gray-700 mb-4">
                  These terms describe how PaperShare should be used, what is allowed, and what actions can lead to moderation or account limits.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/privacy-policy"
                    className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-white text-primary-600 font-semibold rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors duration-200 text-sm md:text-base"
                  >
                    View Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Quick Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Table of Contents</h3>
                <nav className="space-y-2 mb-6">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const element = document.getElementById(section.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="block w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                    >
                      <div className="flex items-center">
                        <section.icon className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-700">{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* Key Points */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Requirements</h4>
                  <div className="space-y-3">
                    {importantPoints.map((point, index) => {
                      const Icon = point.icon;
                      return (
                        <div key={index} className="flex items-start">
                          <Icon className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{point.title}</p>
                            <p className="text-gray-600 text-xs">{point.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Related Documents</h4>
                  <div className="space-y-2">
                    <Link
                      to="/privacy-policy"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Shield className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Privacy Policy
                    </Link>

                    <Link
                      to="/contact"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                    >
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Contact Legal Team
                    </Link>
                  </div>
                </div>
              </div>

              {/* Acceptance Card */}
              <div className="mt-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 md:p-6">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Acceptance Required</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  By using PaperShare, you acknowledge that you have read, understood, and agree to these terms.
                </p>
                <div className="text-xs text-gray-500">
                  Last accepted: {lastUpdated}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6 md:space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 text-left"
                    >
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className={`p-2 md:p-3 rounded-lg ${
                          section.id === 'prohibited-uses' || section.id === 'disclaimer' 
                            ? 'bg-red-100 text-red-600'
                            : section.id === 'limitation-liability'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-primary-100 text-primary-600'
                        }`}>
                          <Icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm md:text-base font-semibold text-gray-500 mr-2">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">
                              {section.title}
                            </h2>
                          </div>
                        </div>
                      </div>
                      {expandedSections[section.id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedSections[section.id] && (
                      <div className="px-4 md:px-6 pb-4 md:pb-6">
                        <div className="prose prose-sm md:prose max-w-none">
                          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agreement Section */}
            <div className="mt-8 md:mt-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 md:p-8">
              <div className="text-center">
                <Scale className="h-12 w-12 md:h-16 md:w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Agreement Confirmation</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  By continuing to use PaperShare, you confirm that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <div className="flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm md:text-base"
                  >
                    I Accept & Continue
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Legal */}
            <div className="mt-8 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h4 className="font-semibold text-blue-800 mb-1">Questions about these terms?</h4>
                  <p className="text-blue-700 text-sm">
                    Contact our legal team for clarification or concerns
                  </p>
                </div>
                <a
                  href="mailto:papersharehelp@gmail.com"
                  className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
                >
                  Contact Legal Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;