import React, { useState } from 'react';
import { 
  Shield, 
  Lock,
  Database,
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Calendar
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({
    'who-we-are': true,
    'what-we-collect': false,
    'how-we-use': false,
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'who-we-are',
      title: 'Who We Are',
      icon: Shield,
      content: `PaperShare is a student platform for uploading, discovering, and downloading academic papers and notes. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using our website.`
    },
    {
      id: 'what-we-collect',
      title: 'What Data We Collect',
      icon: Database,
      content: `We collect only the information needed to run PaperShare:

• Account information: username, email, password hash
• Profile information: university, department, semester, batch, profile photo, bio
• Academic content: papers, notes, requests, reports, and related metadata
• Activity information: downloads, votes, views, points, badges, and moderation status
• Technical information: IP address, browser/device details, and basic logs for security

We collect this information when you create an account, use the platform, contact support, or interact with content.`
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Data',
      icon: CheckCircle,
      content: `We use your data to:

• Create and secure your account
• Show your uploads, downloads, and dashboard activity
• Run moderation and prevent abuse/fraud
• Provide support and respond to reports or takedown requests
• Improve search, recommendations, and overall platform performance
• Meet legal obligations and enforce our Terms of Service`
    },
    {
      id: 'sharing',
      title: 'How Data Is Shared',
      icon: Lock,
      content: `We do not sell your personal data.

We may share limited information only in these cases:

• With trusted service providers that host or operate platform infrastructure
• When required by law, court order, or lawful authority request
• To investigate abuse, copyright violations, or security incidents
• During a business transfer (for example, merger or acquisition), with notice when required`
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: Database,
      content: `We keep personal data only as long as necessary for service operation, legal compliance, and dispute prevention. Some content and logs may be retained for moderation and security purposes even after account deletion where legally permitted.`
    },
    {
      id: 'rights',
      title: 'Your Choices and Rights',
      icon: Shield,
      content: `Depending on your location and applicable law, you may request access, correction, export, or deletion of your personal data. You can also update many profile details directly from your account settings.

For privacy-related requests, email papersharehelp@gmail.com.`
    },
    {
      id: 'security',
      title: 'Security',
      icon: Lock,
      content: `We use reasonable technical and organizational safeguards to protect your information. No online service is fully risk-free, but we continuously work to improve platform security and access controls.`
    },
    {
      id: 'children',
      title: 'Children',
      icon: Shield,
      content: `PaperShare is intended for students and academic users. If we discover that personal data was provided in violation of applicable age requirements, we may remove that data and restrict the related account.`
    },
    {
      id: 'changes',
      title: 'Policy Updates',
      icon: Calendar,
      content: `We may update this policy as PaperShare evolves. The latest version will always be posted on this page with the updated effective date.`
    }
  ];

  const keyPoints = [
    {
      title: 'No Data Selling',
      description: 'We do not sell your personal data to third parties',
      icon: CheckCircle
    },
    {
      title: 'Account Control',
      description: 'You can review and update your profile information',
      icon: Lock
    },
    {
      title: 'Platform Security',
      description: 'Reasonable safeguards protect your account and content',
      icon: Shield
    },
    {
      title: 'Clear Purpose',
      description: 'Data is used to operate and improve PaperShare',
      icon: Database
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
              <Shield className="h-8 w-8 md:h-10 md:w-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-4">
              How PaperShare collects, uses, and protects your data
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm md:text-base text-primary-200">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Quick Summary */}
        <div className="mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our Privacy Promise</h2>
                <p className="text-gray-700">
                  We are committed to protecting your personal information and being transparent about how we use it.
                </p>
              </div>
              <div className="mt-4 md:mt-0"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">On this page</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const element = document.getElementById(section.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                        toggleSection(section.id);
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
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Points</h4>
                  <ul className="space-y-2">
                    {keyPoints.map((point, index) => {
                      const Icon = point.icon;
                      return (
                        <li key={index} className="flex items-start text-sm">
                          <Icon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{point.description}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Contact Card */}
              <div className="mt-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Questions?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  For any privacy concern or account-data request
                </p>
                <a
                  href="mailto:papersharehelp@gmail.com"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  papersharehelp@gmail.com
                </a>
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
                        <div className="p-2 md:p-3 bg-primary-100 rounded-lg">
                          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
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

            <div className="mt-8 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-1">Need help with privacy settings or data requests?</h4>
              <p className="text-blue-700 text-sm">
                Email us at papersharehelp@gmail.com and include your account email so we can verify your request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;