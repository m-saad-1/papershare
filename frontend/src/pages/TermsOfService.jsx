import React, { useState } from 'react';
import { 
  FileText, 
  Scale, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Calendar,
  Shield,
  Lock,
  Users,
  BookOpen,
  Download,
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
      content: `By accessing and using PaperShare, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.`
    },
    {
      id: 'description',
      title: 'Description of Service',
      icon: BookOpen,
      content: `PaperShare is an online platform that allows students and educational institutions to share, access, and download past academic papers, assignments, and study materials. The service includes user registration, paper upload/download functionality, community features, and administrative tools.`
    },
    {
      id: 'user-accounts',
      title: 'User Accounts',
      icon: Users,
      content: `To access certain features of the Service, you must register for an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Maintain the security of your password and accept all risks of unauthorized access
• Notify us immediately of any unauthorized use of your account
• Be responsible for all activities that occur under your account

We reserve the right to disable any user account at our sole discretion.`
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
• Violates academic integrity policies

We reserve the right to remove any content that violates these terms.`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      icon: Shield,
      content: `The Service and its original content, features, and functionality are owned by PaperShare and are protected by international copyright, trademark, and other intellectual property laws.

By uploading content to PaperShare, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with the Service.

You retain all ownership rights to your uploaded content.`
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
      content: `We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on the Service infringes the copyright or other intellectual property rights of any person.

If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement, please submit your claim via email to copyright@papershare.com, with the subject line: "Copyright Infringement" and include a detailed description of the alleged infringement.

We will promptly investigate claims of copyright infringement.`
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: Lock,
      content: `We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.

If you wish to terminate your account, you may simply discontinue using the Service or contact us to delete your account.

All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: AlertCircle,
      content: `In no event shall PaperShare, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:

• Your access to or use of or inability to access or use the Service
• Any conduct or content of any third party on the Service
• Any content obtained from the Service
• Unauthorized access, use or alteration of your transmissions or content

This limitation applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis.`
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      icon: Scale,
      content: `Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.

PaperShare does not warrant that:
• The Service will function uninterrupted, secure or available at any particular time or location
• Any errors or defects will be corrected
• The Service is free of viruses or other harmful components
• The results of using the Service will meet your requirements`
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      icon: Scale,
      content: `These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions will remain in effect.`
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: Calendar,
      content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.

By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.`
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

  const lastUpdated = 'January 15, 2024';

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
                  These Terms of Service govern your use of PaperShare. By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/privacy-policy"
                    className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-white text-primary-600 font-semibold rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors duration-200 text-sm md:text-base"
                  >
                    View Privacy Policy
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                  <button className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm md:text-base">
                    Download Terms
                    <Download className="ml-2 h-4 w-4" />
                  </button>
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
                      <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-2" />
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
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm md:text-base"
                  >
                    I Accept & Continue
                  </Link>
                  <button className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-white text-primary-600 font-semibold rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors duration-200 text-sm md:text-base">
                    I Decline
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Declining will restrict access to certain features of PaperShare
                </p>
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
                  href="mailto:legal@papershare.com"
                  className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
                >
                  Contact Legal Team
                  <ExternalLink className="ml-2 h-4 w-4" />
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