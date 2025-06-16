import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';
import TeacherCard from './TeacherCard';
import { Search, Filter, Users, AlertCircle } from 'lucide-react';

const MatchFinder: React.FC = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    province: '',
    district: ''
  });

  const subjects = [
    'Sinhala', 'Tamil', 'English', 'Mathematics', 'Science', 'Social Studies',
    'Buddhism', 'Christianity', 'Islam', 'Hinduism', 'History', 'Geography',
    'Civic Education', 'Health & Physical Education', 'Art', 'Music', 'Dance',
    'Technology', 'Commerce', 'Accounting', 'Economics', 'Biology', 'Physics',
    'Chemistry', 'Combined Mathematics', 'ICT', 'Media Studies'
  ];

  const provinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western',
    'North Central', 'Uva', 'Sabaragamuwa'
  ];

  const districtsByProvince: { [key: string]: string[] } = {
    'Western': ['Colombo', 'Gampaha', 'Kalutara'],
    'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
    'Southern': ['Galle', 'Matara', 'Hambantota'],
    'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    'Eastern': ['Ampara', 'Batticaloa', 'Trincomalee'],
    'North Western': ['Kurunegala', 'Puttalam'],
    'North Central': ['Anuradhapura', 'Polonnaruwa'],
    'Uva': ['Badulla', 'Monaragala'],
    'Sabaragamuwa': ['Ratnapura', 'Kegalle']
  };

  const findMatches = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      let q = query(
        usersRef,
        where('profileCompleted', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const allUsers: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== userProfile.uid) {
          allUsers.push({
            ...data,
            uid: doc.id,
            createdAt: data.createdAt?.toDate() || new Date()
          } as User);
        }
      });

      // Apply mutual matching logic
      const mutualMatches = allUsers.filter(user => {
        // Check if there's a mutual match possibility
        const isMutualMatch = 
          user.currentProvince === userProfile.desiredProvince &&
          user.currentDistrict === userProfile.desiredDistrict &&
          user.desiredProvince === userProfile.currentProvince &&
          user.desiredDistrict === userProfile.currentDistrict;

        // Apply additional filters
        const subjectMatch = !filters.subject || user.subject === filters.subject;
        const provinceMatch = !filters.province || 
          user.currentProvince === filters.province || 
          user.desiredProvince === filters.province;
        const districtMatch = !filters.district || 
          user.currentDistrict === filters.district || 
          user.desiredDistrict === filters.district;

        return isMutualMatch || (subjectMatch && provinceMatch && districtMatch);
      });
      console.log(mutualMatches)

      setMatches(mutualMatches);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.profileCompleted) {
      findMatches();
    }
  }, [userProfile, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset district when province changes
    if (name === 'province') {
      setFilters(prev => ({
        ...prev,
        district: ''
      }));
    }
  };

  const getDistrictsForProvince = () => {
    return districtsByProvince[filters.province] || [];
  };

  if (!userProfile?.profileCompleted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Complete Your Profile First
          </h2>
          <p className="text-gray-600">
            Please complete your teacher profile to find matching transfer partners.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('findMatches')}</h1>
        </div>
        
        {/* Only show mutual match info when there are matches */}
        {matches.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                <strong>{t('mutualMatch')}:</strong> Teachers whose current location matches your desired location and vice versa
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Matches</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('subject')}
            </label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province
            </label>
            <select
              name="province"
              value={filters.province}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Provinces</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              disabled={!filters.province}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">All Districts</option>
              {getDistrictsForProvince().map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('matchingTeachers')} ({matches.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Finding matches...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noMatches')}
            </h3>
            <p className="text-gray-600 mb-4">
              No mutual transfer matches found. This means there are currently no teachers whose current location matches your desired location and whose desired location matches your current location.
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or check back later for new matches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(teacher => (
              <TeacherCard key={teacher.uid} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchFinder;