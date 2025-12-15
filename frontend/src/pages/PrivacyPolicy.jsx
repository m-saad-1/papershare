import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Cookie, 
  Users, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Calendar
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({
    'data-collection': true,
    'cookies': false,
    'rights': false,
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Shield,
      content: `Welcome to PaperShare's Privacy Policy. We respect your privacy and are committed to protecting your personal data. This policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.`
    },
    {
      id: 'data-collection',
      title: 'What Data We Collect',
      icon: Database,
      content: `We collect different types of personal data about you, including:

• Identity Data: Name, username, email address
• Contact Data: Email address, university affiliation
• Profile Data: Your university, department, uploaded papers, download history
• Technical Data: IP address, browser type, device information
• Usage Data: Information about how you use our website and services

We collect this data through direct interactions when you register, upload papers, or contact us. We also collect technical data automatically as you interact with our site.`
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: Cookie,
      content: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.

Types of cookies we use:
• Essential Cookies: Required for basic site functionality
• Performance Cookies: Help us understand how visitors interact with our site
• Functionality Cookies: Remember your preferences
• Advertising Cookies: Used to deliver relevant advertisements

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.`
    },
    {
      id: 'data-use',
      title: 'How We Use Your Data',
      icon: Eye,
      content: `We use your personal data for the following purposes:

• To provide and maintain our service
• To notify you about changes to our service
• To allow you to participate in interactive features
• To provide customer support
• To gather analysis or valuable information to improve our service
• To monitor the usage of our service
• To detect, prevent, and address technical issues
• To comply with legal obligations`
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing and Disclosure',
      icon: Users,
      content: `We may share your personal data in the following situations:

• With Service Providers: To monitor and analyze the use of our service
• For Business Transfers: In connection with any merger or sale of company assets
• With Affiliates: With our parent company and subsidiaries
• With Business Partners: To offer you certain products, services or promotions
• With Other Users: When you interact with other users through our service
• With Your Consent: For any other purpose with your explicit consent

We do not sell your personal data to third parties.`
    },
    {
      id: 'rights',
      title: 'Your Data Protection Rights',
      icon: Lock,
      content: `Depending on your location, you may have the following rights regarding your personal data:

• The right to access – You have the right to request copies of your personal data
• The right to rectification – You have the right to request correction of inaccurate data
• The right to erasure – You have the right to request deletion of your personal data
• The right to restrict processing – You have the right to restrict processing of your data
• The right to object to processing – You have the right to object to our processing
• The right to data portability – You have the right to request transfer of your data

To exercise any of these rights, please contact us at privacy@papershare.com`
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: Shield,
      content: `The security of your data is important to us. We implement appropriate technical and organizational security measures designed to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.

However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.`
    },
    {
      id: 'children',
      title: "Children's Privacy",
      icon: AlertTriangle,
      content: `Our service is not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.

If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.`
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      icon: Calendar,
      content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

We will let you know via email and/or a prominent notice on our service prior to the change becoming effective. You are advised to review this Privacy Policy periodically for any changes.`
    }
  ];

  const keyPoints = [
    {
      title: 'Transparent Data Usage',
      description: 'We clearly explain how your data is used and shared',
      icon: CheckCircle
    },
    {
      title: 'Your Control',
      description: 'You have full control over your personal information',
      icon: Lock
    },
    {
      title: 'Industry Standard Security',
      description: 'We use enterprise-grade security measures',
      icon: Shield
    },
    {
      title: 'No Data Selling',
      description: 'We never sell your personal data to third parties',
      icon: Database
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
              <Shield className="h-8 w-8 md:h-10 md:w-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-4">
              Protecting your privacy is our top priority
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
              <div className="mt-4 md:mt-0">
                <a
                  href="/privacy_policy.pdf"
                  download="privacy-policy.pdf"
                  className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm md:text-base"
                >
                  Download PDF Version
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
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
                  Contact our privacy team for any concerns
                </p>
                <a
                  href="mailto:privacy@papershare.com"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  privacy@papershare.com
                  <ExternalLink className="ml-1 h-3 w-3" />
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

            {/* Additional Information */}
            <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Data Protection Officer</h3>
                <p className="text-gray-700 mb-4">
                  We have appointed a Data Protection Officer (DPO) who is responsible for overseeing questions in relation to this privacy policy.
                </p>
                <a
                  href="mailto:dpo@papershare.com"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact DPO
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Cookie Preferences</h3>
                <p className="text-gray-700 mb-4">
                  You can manage your cookie preferences at any time through your browser settings or our cookie consent manager.
                </p>
                <button className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
                  Manage Cookies
                  <ExternalLink className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Update Notice */}
            <div className="mt-8 p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Policy Updates</h4>
                  <p className="text-yellow-700 text-sm">
                    This policy was last updated on {lastUpdated}. We recommend reviewing this page periodically for any changes. Significant changes will be notified via email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;