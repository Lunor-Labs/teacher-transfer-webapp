import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  MapPin, 
  BookOpen,
  BarChart3,
  ArrowRightLeft,
  AlertCircle,
  MapIcon
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    mutualMatches: 0,
    sameSubject: 0,
    sameZone: 0,
    loading: true
  });

  useEffect(() => {
    if (userProfile?.profileCompleted) {
      fetchDashboardStats();
    }
  }, [userProfile]);

  const fetchDashboardStats = async () => {
    if (!userProfile) return;

    try {
      // Get all completed profiles
      const usersRef = collection(db, 'users');
      const completedProfilesQuery = query(
        usersRef,
        where('profileCompleted', '==', true)
      );
      
      const querySnapshot = await getDocs(completedProfilesQuery);
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

      // Calculate perfect mutual matches (including zone)
      const mutualMatches = allUsers.filter(user => 
        user.currentProvince === userProfile.desiredProvince &&
        user.currentDistrict === userProfile.desiredDistrict &&
        user.currentZone === userProfile.desiredZone &&
        user.desiredProvince === userProfile.currentProvince &&
        user.desiredDistrict === userProfile.currentDistrict &&
        user.desiredZone === userProfile.currentZone
      );

      // Calculate same subject teachers
      const sameSubject = allUsers.filter(user => 
        user.subject === userProfile.subject
      );

      // Calculate teachers in same zone (current or desired)
      const sameZone = allUsers.filter(user => 
        user.currentZone === userProfile.currentZone ||
        user.currentZone === userProfile.desiredZone ||
        user.desiredZone === userProfile.currentZone ||
        user.desiredZone === userProfile.desiredZone
      );

      setStats({
        totalTeachers: allUsers.length + 1, // +1 for current user
        mutualMatches: mutualMatches.length,
        sameSubject: sameSubject.length,
        sameZone: sameZone.length,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (!userProfile?.profileCompleted) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Your Profile First
            </h2>
            <p className="text-gray-600">
              Please complete your teacher profile to view dashboard analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Welcome back, {userProfile.fullName}! Here's your transfer matching overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.totalTeachers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Registered on platform</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Perfect Matches</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.loading ? '...' : stats.mutualMatches}
              </p>
              <p className="text-xs text-gray-500 mt-1">Exact zone matches</p>
            </div>
            <ArrowRightLeft className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Same Subject</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.loading ? '...' : stats.sameSubject}
              </p>
              <p className="text-xs text-gray-500 mt-1">{userProfile.subject} teachers</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Same Zone</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.loading ? '...' : stats.sameZone}
              </p>
              <p className="text-xs text-gray-500 mt-1">In your zones</p>
            </div>
            <MapIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <span>Your Profile</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subject:</span>
              <span className="text-sm font-medium text-gray-900">{userProfile.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Medium:</span>
              <span className="text-sm font-medium text-gray-900">{userProfile.mediumOfInstruction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Grade:</span>
              <span className="text-sm font-medium text-gray-900">{userProfile.gradeTaught}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">School Type:</span>
              <span className="text-sm font-medium text-gray-900">{userProfile.schoolType}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Transfer Preferences</span>
          </h3>
          <div className="space-y-4">
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-1">Desired Location:</p>
              <p className="text-sm font-medium text-gray-900">
                {userProfile.desiredDistrict}, {userProfile.desiredProvince}
              </p>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <MapIcon className="h-3 w-3" />
                <span>{userProfile.desiredZone} Zone</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Quick Actions</span>
        </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/matches"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowRightLeft className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Find Matches</p>
              <p className="text-sm text-gray-600">
                {stats.mutualMatches} mutual matches available
              </p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserCheck className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Update Profile</p>
              <p className="text-sm text-gray-600">Keep your information current</p>
            </div>
          </Link>

          <Link
            to="/testimonials"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">View Testimonials</p>
              <p className="text-sm text-gray-600">See success stories</p>
            </div>
          </Link>
        </div>
      </div>


      {/* Tips Section */}
      {stats.mutualMatches === 0 && !stats.loading && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">No Perfect Matches Found</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Currently, there are no teachers whose current location (including zonal division) exactly matches your desired location and vice versa.
              </p>
              <div className="bg-yellow-100 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Your Profile:</strong><br />
                  Desired: {userProfile.desiredZone}, {userProfile.desiredDistrict}, {userProfile.desiredProvince}
                </p>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Check back regularly as new teachers join the platform</li>
                <li>Consider expanding your desired location preferences</li>
                <li>Network with teachers in your subject area</li>
                <li>Share the platform with colleagues who might be interested in transfers</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;