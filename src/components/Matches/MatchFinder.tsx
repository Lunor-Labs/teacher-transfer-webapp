import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';
import { getProvinces, getDistrictsByProvince, getZonesByDistrict } from '../../data/zones';
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
    district: '',
    zone: ''
  });

  const subjects = [
    'Sinhala', 'Tamil', 'English', 'Mathematics', 'Science', 'Social Studies',
    'Buddhism', 'Christianity', 'Islam', 'Hinduism', 'History', 'Geography',
    'Civic Education', 'Health & Physical Education', 'Art', 'Music', 'Dance',
    'Technology', 'Commerce', 'Accounting', 'Economics', 'Biology', 'Physics',
    'Chemistry', 'Combined Mathematics', 'ICT', 'Media Studies'
  ];

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

      // Apply mutual matching logic with zone consideration
      const mutualMatches = allUsers.filter(user => {
        // Check if there's a mutual match possibility
        const isMutualMatch = 
          user.currentProvince === userProfile.desiredProvince &&
          user.currentDistrict === userProfile.desiredDistrict &&
          user.currentZone === userProfile.desiredZone &&
          user.desiredProvince === userProfile.currentProvince &&
          user.desiredDistrict === userProfile.currentDistrict &&
          user.desiredZone === userProfile.currentZone;

        // Apply additional filters
        const subjectMatch = !filters.subject || user.subject === filters.subject;
        const provinceMatch = !filters.province || 
          user.currentProvince === filters.province || 
          user.desiredProvince === filters.province;
        const districtMatch = !filters.district || 
          user.currentDistrict === filters.district || 
          user.desiredDistrict === filters.district;
        const zoneMatch = !filters.zone || 
          user.currentZone === filters.zone || 
          user.desiredZone === filters.zone;

        return isMutualMatch && subjectMatch && provinceMatch && districtMatch && zoneMatch;
      });

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

    // Reset dependent fields when parent changes
    if (name === 'province') {
      setFilters(prev => ({
        ...prev,
        district: '',
        zone: ''
      }));
    } else if (name === 'district') {
      setFilters(prev => ({
        ...prev,
        zone: ''
      }));
    }
  };

  const getFilterDistricts = () => {
    return getDistrictsByProvince(filters.province);
  };

  const getFilterZones = () => {
    return getZonesByDistrict(filters.province, filters.district);
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
                <strong>Perfect Mutual Matches:</strong> Teachers whose current location (including zone) matches your desired location and vice versa
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
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
              {getProvinces().map(province => (
                <option key={province} value={province}>{province} Province</option>
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
              {getFilterDistricts().map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zonal Division
            </label>
            <select
              name="zone"
              value={filters.zone}
              onChange={handleFilterChange}
              disabled={!filters.district}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">All Zones</option>
              {getFilterZones().map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Perfect Mutual Matches ({matches.length})
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
              No Perfect Mutual Matches Found
            </h3>
            <p className="text-gray-600 mb-4">
              No teachers found whose current location (province, district, and zone) exactly matches your desired location and vice versa.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Your Profile:</strong><br />
                Current: {userProfile.currentZone}, {userProfile.currentDistrict}, {userProfile.currentProvince}<br />
                Desired: {userProfile.desiredZone}, {userProfile.desiredDistrict}, {userProfile.desiredProvince}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
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