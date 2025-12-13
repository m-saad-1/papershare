import React, { useState } from 'react';
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

  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [openFaqs, setOpenFaqs] = useState({});
  const [openArticles, setOpenArticles] = useState({}); // New state for articles

  const generateArticleContent = (title) => {
    return (
      <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
        <p>
          This is a detailed article about "<strong>{title}</strong>". Here you will find comprehensive information and steps.
          Our aim is to provide clear and concise guidance on this topic.
        </p>
        <h4>Key Steps:</h4>
        <ol>
          <li>Understand the basics: Start by familiarizing yourself with the core concepts.</li>
          <li>Follow the instructions: Each step is designed to be easy to follow.</li>
          <li>Troubleshoot common issues: We've included tips for common problems you might encounter.</li>
          <li>Explore advanced features: Once you're comfortable, delve into more advanced functionalities.</li>
        </ol>
        <p>
          For more personalized assistance, please refer to our contact support section.
        </p>
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
    { id: 'gs2', categoryId: 'getting-started', title: 'Complete registration guide', readTime: '3 min' },
    { id: 'gs3', categoryId: 'getting-started', title: 'Setting up your profile', readTime: '4 min' },
    { id: 'gs4', categoryId: 'getting-started', title: 'Navigating the platform', readTime: '3 min' },
    // Uploading Papers
    { id: 'up1', categoryId: 'uploading', title: 'How to upload a paper', readTime: '5 min' },
    { id: 'up2', categoryId: 'uploading', title: 'File format requirements', readTime: '2 min' },
    { id: 'up3', categoryId: 'uploading', title: 'Paper approval process', readTime: '3 min' },
    { id: 'up4', categoryId: 'uploading', title: 'Troubleshooting upload issues', readTime: '4 min' },
    // Downloading Papers
    { id: 'dp1', categoryId: 'downloading', title: 'How to download papers', readTime: '2 min' },
    { id: 'dp2', categoryId: 'downloading', title: 'Download limits and restrictions', readTime: '3 min' },
    { id: 'dp3', categoryId: 'downloading', title: 'Troubleshooting download issues', readTime: '4 min' },
    { id: 'dp4', categoryId: 'downloading', title: 'Offline access to papers', readTime: '3 min' },
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
  ].map(article => ({ ...article, content: generateArticleContent(article.title) }));

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

  const popularArticles = [
    { id: 1, title: 'How to maximize paper downloads', views: '1.2k' },
    { id: 2, title: 'Best practices for paper descriptions', views: '890' },
    { id: 3, title: 'Understanding download analytics', views: '756' },
    { id: 4, title: 'How to organize your uploaded papers', views: '623' },
  ];

  const slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
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
          
          <Link
            to="/upload"
            className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
          >
            <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Upload Guide</h3>
            <p className="text-sm text-gray-600">Learn how to upload papers successfully</p>
          </Link>
          
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
        <div className="mb-10 md:mb-16">
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

        {/* Popular Articles */}
        <div className="mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Articles</h2>

          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {popularArticles.map((article) => (
              <div
                key={article.id}
                className="block bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{article.title}</h3>
                    <div className="flex items-center text-gray-500 text-xs md:text-sm">
                      <FileQuestion className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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