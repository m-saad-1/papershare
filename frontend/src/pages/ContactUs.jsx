import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { 
  MessageSquare,
  Clock, 
  Send,
  CheckCircle,
  AlertCircle,
  Mail
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

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'content', label: 'Content Issues' },
    { value: 'account', label: 'Account Help' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'partnership', label: 'Partnership' },
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600">
            Have questions about PaperShare? Send us a message and our team will get back to you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
  );
};

export default ContactUs;