import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin,
  Mail as MailIcon,
  X
} from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'content', label: 'Content Issues' },
    { value: 'account', label: 'Account Help' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'partnership', label: 'Partnership' },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: ['support@papershare.com', 'info@papershare.com'],
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      details: ['Currently unavailable', 'Coming Soon!'],
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['Our team is fully remote', 'No physical office for visits'],
      color: 'text-orange-600 bg-orange-50'
    },
  ];

  const socialLinks = [
    { platform: 'Twitter', icon: Twitter, url: '#', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { platform: 'Facebook', icon: Facebook, url: '#', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { platform: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { platform: 'Email', icon: MailIcon, url: 'mailto:info@papershare.com', color: 'hover:bg-red-50 hover:text-red-600' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Replace with your actual EmailJS Service ID, Template ID, and Public Key
    const serviceID = 'service_is9nloj';
    const templateID = 'template_uvoz12c';
    // ⬇️ IMPORTANT: Replace 'YOUR_PUBLIC_KEY' with your actual key from EmailJS
    // You can find it in your EmailJS Dashboard -> Account -> API Keys
    const publicKey = 'NT5y8I999thgokO72';

    emailjs.sendForm(serviceID, templateID, e.target, publicKey)
      .then((result) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
        });
        // Reset status after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000);
      }, (error) => {
        console.error('EmailJS error:', error.text);
        setSubmitStatus('error');
        toast.error('Failed to send message. Please try again later.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const faqItems = [
    {
      question: 'How long does it take to get a response?',
      answer: 'We typically respond within 24 hours on weekdays. For urgent matters, please use the live chat feature.'
    },
    {
      question: 'Can I request a specific paper?',
      answer: 'Yes! You can request papers through our platform. Visit the paper request section in your dashboard.'
    },
    {
      question: 'Do you provide support for universities?',
      answer: 'Absolutely! We offer special support packages for universities and educational institutions.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MessageSquare className="h-8 w-8 md:h-10 md:w-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto mb-4 md:mb-6">
              Get in touch with our team. We're here to help you succeed.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm md:text-base text-primary-200">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              <span>Response time: Typically within 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Coming Soon!</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              We're working hard to connect our social media channels. Please check back later!
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Contact Information - Order changed for mobile */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-600">
                  Have questions? We're here to help. Choose the most convenient way to reach us.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div className={`p-2 md:p-3 rounded-lg ${info.color}`}>
                          <Icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-sm text-gray-600 mb-1">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      social.platform === 'Email' ? (
                        <a
                          key={index}
                          href={social.url}
                          className={`flex items-center px-3 md:px-4 py-2 rounded-lg border border-gray-200 ${social.color} transition-colors duration-200 w-full sm:w-auto justify-center`}
                        >
                          <Icon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span className="text-sm font-medium">{social.platform}</span>
                        </a>
                      ) : (
                        <button
                          key={index}
                          onClick={() => setIsModalOpen(true)}
                          className={`flex items-center px-3 md:px-4 py-2 rounded-lg border border-gray-200 ${social.color} transition-colors duration-200 w-full sm:w-auto justify-center`}
                        >
                          <Icon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span className="text-sm font-medium">{social.platform}</span>
                        </button>
                      )
                    );
                  })}
                </div>
              </div>

              {/* FAQ Preview */}
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Common Questions</h3>
                <div className="space-y-3">
                  {faqItems.map((item, index) => (
                    <div key={index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base mb-1">{item.question}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Contact Form - Order changed for mobile */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Send us a message</h2>
                <p className="text-gray-600 mb-6 md:mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800">Message sent successfully!</h4>
                      <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Something went wrong!</h4>
                      <p className="text-red-700 text-sm">We couldn't send your message. Please try again or email us directly.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 bg-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                      placeholder="Please provide detailed information about your inquiry..."
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>You'll receive an automatic confirmation email</li>
                          <li>Our team will review your message within 24 hours</li>
                          <li>We'll contact you via email with further assistance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto min-w-[200px] inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Additional Info */}
            {/* 
              <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 md:p-6 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-700 mb-1">24h</div>
                  <div className="text-sm md:text-base text-blue-600 font-medium">Average Response Time</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 md:p-6 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">98%</div>
                  <div className="text-sm md:text-base text-green-600 font-medium">Customer Satisfaction</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 md:p-6 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-purple-700 mb-1">5,000+</div>
                  <div className="text-sm md:text-base text-purple-600 font-medium">Students Helped</div>
                </div>
              </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;