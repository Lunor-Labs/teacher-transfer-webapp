import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Testimonial } from '../../types';
import { MessageSquare, Star, Quote } from 'lucide-react';

const TestimonialsList: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const q = query(
        collection(db, 'testimonials'),
        where('isApproved', '==', true),
        orderBy('approvedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const testimonialsData: Testimonial[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        testimonialsData.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          approvedAt: data.approvedAt?.toDate() || new Date()
        } as Testimonial);
      });

      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading testimonials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <MessageSquare className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">What Teachers Say</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hear from teachers who have successfully used Teacher Transfer Match to find their perfect transfer partners.
        </p>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-12">
          <Quote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Testimonials Yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your experience with Teacher Transfer Match!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.userInitials}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.message}"
                  </blockquote>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{testimonial.userName}</p>
                    <p>{testimonial.userSchool}</p>
                    <p>{testimonial.userDistrict} District</p>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-400">
                    {testimonial.approvedAt?.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4">
                <Quote className="h-6 w-6 text-blue-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Share Your Success Story
          </h3>
          <p className="text-gray-600 mb-4">
            Have you found your perfect transfer partner through our platform? We'd love to hear about your experience!
          </p>
          <a
            href="/testimonials/submit"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Submit Your Testimonial</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsList;