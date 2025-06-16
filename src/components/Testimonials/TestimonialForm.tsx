import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MessageSquare, Send } from 'lucide-react';

const TestimonialForm: React.FC = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const userInitials = userProfile.fullName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('');

      await addDoc(collection(db, 'testimonials'), {
        userId: userProfile.uid,
        userName: userProfile.fullName,
        userInitials,
        userSchool: userProfile.currentSchool,
        userDistrict: userProfile.currentDistrict,
        message: message.trim(),
        isApproved: false,
        createdAt: new Date()
      });

      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setError('Failed to submit testimonial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile?.profileCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <MessageSquare className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Complete Your Profile First
          </h2>
          <p className="text-gray-600">
            Please complete your teacher profile before submitting a testimonial.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Share Your Experience</h1>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your testimonial will be reviewed by our admin team before being published. 
            Only approved testimonials will be visible to other users.
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            Thank you for your feedback! Your testimonial has been submitted and is pending approval.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your Testimonial
            </label>
            <textarea
              id="message"
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your experience with Teacher Transfer Match. How has the platform helped you in finding transfer opportunities?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {message.length}/500 characters
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {userProfile.fullName}</p>
              <p><strong>School:</strong> {userProfile.currentSchool}</p>
              <p><strong>District:</strong> {userProfile.currentDistrict}</p>
              <p className="text-xs text-gray-500 mt-2">
                Your testimonial will be displayed with your initials and school/district information.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || message.trim().length < 10}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Submitting...' : 'Submit Testimonial'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestimonialForm;