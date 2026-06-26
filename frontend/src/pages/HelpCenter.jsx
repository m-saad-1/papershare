import React, { useRef, useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  Upload, 
  Download, 
  User, 
  Shield, 
  MessageSquare,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [openFaqs, setOpenFaqs] = useState({});
  const [openArticles, setOpenArticles] = useState({});
  const categoriesSectionRef = useRef(null);

  const generateArticleContent = (articleId) => {
    let content;
    switch (articleId) {
      // Getting Started
      case 'gs1':
        content = (
          <>
            <p>Creating an account on PaperShare is simple and unlocks full access to all features.</p>
            <ol>
              <li>Navigate to the "Sign Up" page from the homepage.</li>
              <li>Fill in your details, including your name, email, password, university, and department.</li>
              <li>Verify your email address by clicking the link sent to your inbox.</li>
              <li>Once verified, you can log in and start sharing and downloading papers!</li>
            </ol>
          </>
        );
        break;
      case 'gs3':
        content = (
          <>
            <p>Your profile helps others in the community know a bit about you. Your university and department are pre-filled from your registration.</p>
            <ol>
              <li>Go to your "Dashboard" after logging in.</li>
              <li>Find the "Profile" section.</li>
              <li>Here you can update your personal information. A complete profile helps in getting relevant paper recommendations.</li>
            </ol>
          </>
        );
        break;
      // Uploading Papers
      case 'up1':
        content = (
          <>
            <p>Sharing your past papers helps the entire student community. Follow these steps to upload a paper:</p>
            <ol>
              <li>Click on the "Upload" button in the navigation bar or visit the Upload page.</li>
              <li>Fill in the paper's information, including the title, course name, university, and year. The more details you provide, the easier it is for others to find.</li>
              <li>Drag and drop your paper into the upload area, or click to select the file from your computer.</li>
              <li>Ensure your file is a <strong>PDF</strong> and under <strong>10MB</strong>.</li>
              <li>Click the "Upload Paper" button to submit it for review.</li>
            </ol>
          </>
        );
        break;
      case 'up2':
        content = (
          <>
            <p>To ensure a smooth upload process, please adhere to the following file requirements:</p>
            <ul>
              <li><strong>File Type:</strong> We only accept <strong>PDF</strong> (<code>.pdf</code>) files. Word documents, images, or other formats are not supported.</li>
              <li><strong>File Size:</strong> The maximum allowed file size is <strong>10MB</strong>. If your file is larger, consider compressing it before uploading.</li>
            </ul>
          </>
        );
        break;
      case 'up3':
        content = (
          <>
            <p>To maintain the quality and relevance of our content, every paper submitted goes through a brief review process.</p>
            <ul>
              <li>After you upload a paper, it enters our moderation queue.</li>
              <li>Our team typically reviews submissions within <strong>24-48 hours</strong>.</li>
              <li>We check if the content matches the description and adheres to our community guidelines.</li>
              <li>You will receive a notification once your paper is approved and published.</li>
            </ul>
          </>
        );
        break;
      case 'dp2':
        content = (
          <>
            <p>We believe in open access to educational materials. Here are our guidelines on downloading:</p>
            <ul>
              <li><strong>For All Users:</strong> Both registered users and guests can download papers freely.</li>
              <li><strong>No Hard Limits:</strong> Currently, there are no strict daily or monthly download limits.</li>
              <li><strong>Fair Use:</strong> We monitor for unusual activity, such as automated scraping or excessive downloading, to protect the platform. Accounts engaging in such activities may be temporarily restricted. Our goal is to ensure fair access for everyone in the community.</li>
            </ul>
          </>
        );
        break;
      // Account Management
      case 'am1':
        content = (
          <>
            <p>Keeping your profile up-to-date is easy. Here’s how:</p>
            <ol>
              <li>Log in to your account and navigate to your <strong>Dashboard</strong>.</li>
              <li>Find the "Profile" or "Account Settings" section.</li>
              <li>Here, you can update your name, university, and department.</li>
              <li>Click "Save Changes" to apply your updates.</li>
            </ol>
          </>
        );
        break;
      case 'am2':
        content = (
          <>
            <p>To change your password for security reasons:</p>
            <ol>
              <li>Go to your "Account Settings" page.</li>
              <li>Select the "Security" or "Change Password" tab.</li>
              <li>Enter your current password for verification.</li>
              <li>Enter your new, desired password and confirm it.</li>
              <li>Click "Update Password". You will be logged out from other devices for security.</li>
            </ol>
          </>
        );
        break;
      case 'am3':
        content = (
          <>
            <p>Protecting your account is crucial. Follow these tips:</p>
            <ul>
              <li>Use a <strong>strong, unique password</strong> that combines letters, numbers, and symbols.</li>
              <li><strong>Do not share</strong> your login credentials with anyone.</li>
              <li>Be cautious of <strong>phishing emails</strong>. We will never ask for your password via email.</li>
              <li>Always <strong>log out</strong> of your account if you are using a shared or public computer.</li>
            </ul>
          </>
        );
        break;
      case 'am4':
        content = (
          <>
            <p>We're sorry to see you go. If you wish to delete your account, please follow these steps:</p>
            <ol>
              <li>Navigate to your "Account Settings" page.</li>
              <li>Find the "Delete Account" section.</li>
              <li>Please read the information carefully, as account deletion is <strong>permanent</strong> and will erase all your data, including uploaded papers.</li>
              <li>To proceed, you may need to contact our support team via the <Link to="/contact" className="text-primary-600 hover:underline">Contact Us</Link> page to finalize the request. This is a security measure to prevent accidental deletion.</li>
            </ol>
          </>
        );
        break;
      // Policies & Guidelines
      case 'pg1':
      case 'pg3': // Content and Community guidelines are similar
        content = (
          <>
            <p>Our community thrives on respect and academic integrity. When uploading content, you agree not to post materials that are illegal, defamatory, harassing, or infringe on any third party's intellectual property rights. All users are expected to interact respectfully. For more details, please read our full <Link to="/terms-of-service" className="text-primary-600 hover:underline">Terms of Service</Link>.</p>
          </>
        );
        break;
      case 'pg2':
        content = (
          <>
            <p>We take copyright infringement seriously. You may only upload content that you have the right to share. If you believe your copyrighted work has been posted on PaperShare without authorization, please follow the instructions in our <Link to="/terms-of-service#copyright" className="text-primary-600 hover:underline">Copyright Policy</Link> to submit a takedown notice.</p>
          </>
        );
        break;
      case 'pg4':
        content = (
          <>
            <p>Your privacy is important to us. We collect data such as your name, email, and university to provide and improve our service. We do not sell your personal data. You have rights over your data, including the right to access or delete it. For a complete overview, please review our full <Link to="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</Link>.</p>
          </>
        );
        break;
      // Downloading Papers
      case 'dp1':
        content = (
          <>
            <p>Finding and downloading papers is easy. You can browse and download papers even without an account.</p>
            <ol>
              <li>Go to the "Browse Papers" or "Search" page.</li>
              <li>Use the search bar and filters to find the paper you need. You can filter by university, department, course, and more.</li>
              <li>Click on a paper card to view its details.</li>
              <li>On the paper details page, you will find a "Download" button. Click it to save the PDF to your device.</li>
            </ol>
          </>
        );
        break;
      // Default
      default:
        content = (
          <p>This is a detailed article. Here you will find comprehensive information and steps. For more personalized assistance, please refer to our contact support section.</p>
        );
    }
    return (
      <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
        {content}
      </div>
    );
  };

  const toggleArticle = (articleId) => {
    setOpenArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const articleData = [
    // Getting Started
    { id: 'gs1', categoryId: 'getting-started', title: 'How to create an account', readTime: '2 min' },
    { id: 'gs3', categoryId: 'getting-started', title: 'Setting up your profile', readTime: '4 min' },
    // Uploading Papers
    { id: 'up1', categoryId: 'uploading', title: 'How to upload a paper', readTime: '5 min' },
    { id: 'up2', categoryId: 'uploading', title: 'File format requirements', readTime: '2 min' },
    { id: 'up3', categoryId: 'uploading', title: 'Paper approval process', readTime: '3 min' },
    // Downloading Papers
    { id: 'dp1', categoryId: 'downloading', title: 'How to download papers', readTime: '2 min' },
    { id: 'dp2', categoryId: 'downloading', title: 'Download limits and restrictions', readTime: '3 min' },
    // Account Management
    { id: 'am1', categoryId: 'account', title: 'Updating account information', readTime: '3 min' },
    { id: 'am2', categoryId: 'account', title: 'Changing password', readTime: '2 min' },
    { id: 'am3', categoryId: 'account', title: 'Account security tips', readTime: '4 min' },
    { id: 'am4', categoryId: 'account', title: 'Deleting your account', readTime: '5 min' },
    // Policies & Guidelines
    { id: 'pg1', categoryId: 'policies', title: 'Content guidelines', readTime: '5 min' },
    { id: 'pg2', categoryId: 'policies', title: 'Copyright policy', readTime: '6 min' },
    { id: 'pg3', categoryId: 'policies', title: 'Community guidelines', readTime: '4 min' },
    { id: 'pg4', categoryId: 'policies', title: 'Privacy policy overview', readTime: '3 min' },
  ].map(article => ({ ...article, content: generateArticleContent(article.id) }));

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'uploading',
      name: 'Uploading Papers',
      icon: Upload,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'downloading',
      name: 'Downloading Papers',
      icon: Download,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'account',
      name: 'Account Management',
      icon: User,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'policies',
      name: 'Policies & Guidelines',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
    },
  ].map(category => ({
    ...category,
    articles: articleData.filter(article => article.categoryId === category.id)
  }));

  const faqs = [
    {
      question: 'Is PaperShare free to use?',
      answer: 'Yes, PaperShare is completely free for students. You can upload, download, and share papers without any charges.',
      category: 'general'
    },
    {
      question: 'What file formats are supported for uploads?',
      answer: 'We currently support PDF files only. The maximum file size is 10MB per upload.',
      category: 'uploading'
    },
    {
      question: 'How long does paper approval take?',
      answer: 'Our moderation team typically reviews papers within 24-48 hours. You\'ll receive a notification once your paper is approved.',
      category: 'uploading'
    },
    {
      question: 'Can I download papers anonymously?',
      answer: 'Yes, you can browse and download papers without creating an account. However, creating an account provides additional features like saving favorites and tracking downloads.',
      category: 'downloading'
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'You can report any paper by clicking the "Report" button on the paper details page. Our moderation team will review all reports within 24 hours.',
      category: 'policies'
    },
    {
      question: 'Can I upload papers from any university?',
      answer: 'Yes! PaperShare supports papers from universities worldwide. We encourage contributions from all educational institutions.',
      category: 'uploading'
    },
  ];

  const openUploadGuide = () => {
    setExpandedCategory('uploading');
    setOpenArticles((prev) => ({
      ...prev,
      up1: true,
    }));
    categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFaq = (index) => {
    setOpenFaqs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <HelpCircle className="h-8 w-8 md:h-10 md:w-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Help Center</h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-6 md:mb-8">
              Find answers to common questions and learn how to make the most of PaperShare
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 text-gray-900 rounded-xl shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <Link
            to="/contact"
            className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
          >
            <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get direct help from our support team</p>
          </Link>
          
          <button
            type="button"
            onClick={openUploadGuide}
            className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
          >
            <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Upload Guide</h3>
            <p className="text-sm text-gray-600">Learn how to upload papers successfully</p>
          </button>
          
          <Link
            to="/terms-of-service"
            className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
          >
            <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Policies</h3>
            <p className="text-sm text-gray-600">Read our policies and guidelines</p>
          </Link>
        </div>

        {/* Categories */}
        <div ref={categoriesSectionRef} className="mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`p-2 md:p-3 rounded-lg ${category.color}`}>
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{category.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600">{category.articles.length} articles</p>
                      </div>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedCategory === category.id && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                      <div className="space-y-2">
                        {category.articles.map((article) => (
                          <div key={article.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                            <button
                              onClick={() => toggleArticle(article.id)}
                              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                            >
                              <span className="text-sm text-gray-700 font-medium">{article.title}</span>
                              {openArticles[article.id] ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            {openArticles[article.id] && (
                              <div className="px-3 pb-3 text-gray-600 text-sm">
                                {article.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="text-sm md:text-base text-gray-600">
              {filteredFaqs.length} questions
            </div>
          </div>
          
          {searchTerm && (
            <div className="mb-6">
              <p className="text-gray-600">
                Showing results for: <span className="font-semibold">"{searchTerm}"</span>
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 md:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className={`p-2 rounded-lg mt-1 ${
                      faq.category === 'general' ? 'bg-blue-100 text-blue-600' :
                      faq.category === 'uploading' ? 'bg-green-100 text-green-600' :
                      faq.category === 'downloading' ? 'bg-purple-100 text-purple-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{faq.question}</h3>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  {openFaqs[index] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openFaqs[index] && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6 ml-12 md:ml-16">
                    <div className="border-l-4 border-primary-300 pl-4">
                      <p className="text-gray-700 text-sm md:text-base">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredFaqs.length === 0 && searchTerm && (
            <div className="text-center py-8 md:py-12 bg-white rounded-xl border border-gray-200">
              <FileQuestion className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try different keywords or browse our categories above
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 md:p-8">
          <div className="text-center">
            <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Still Need Help?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm md:text-base"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@papershare.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors duration-200 text-sm md:text-base"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;