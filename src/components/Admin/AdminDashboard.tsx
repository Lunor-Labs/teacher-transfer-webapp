import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Testimonial } from '../../types';
import { 
  Settings, 
  Users, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen,
  AlertTriangle,
  Check,
  MessageSquare,
  CheckCircle,
  XCircle,
  MapIcon
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'testimonials'>('users');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchUsers(), fetchTestimonials()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersData: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Exclude admin users from the list
        if (!data.isAdmin) {
          usersData.push({
            ...data,
            uid: doc.id,
            createdAt: data.createdAt?.toDate() || new Date()
          } as User);
        }
      });

      setUsers(usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const q = query(
        collection(db, 'testimonials'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const testimonialsData: Testimonial[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        testimonialsData.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          approvedAt: data.approvedAt?.toDate()
        } as Testimonial);
      });

      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleteLoading(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(user => user.uid !== userId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleApproveTestimonial = async (testimonialId: string) => {
    try {
      await updateDoc(doc(db, 'testimonials', testimonialId), {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: userProfile?.uid
      });
      
      setTestimonials(prev => 
        prev.map(t => 
          t.id === testimonialId 
            ? { ...t, isApproved: true, approvedAt: new Date() }
            : t
        )
      );
    } catch (error) {
      console.error('Error approving testimonial:', error);
    }
  };

  const handleRejectTestimonial = async (testimonialId: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId));
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
    }
  };

  const stats = {
    totalUsers: users.length,
    completedProfiles: users.filter(u => u.profileCompleted).length,
    incompleteProfiles: users.filter(u => !u.profileCompleted).length,
    pendingTestimonials: testimonials.filter(t => !t.isApproved).length,
    approvedTestimonials: testimonials.filter(t => t.isApproved).length,
    subjectBreakdown: users.reduce((acc, user) => {
      if (user.subject) {
        acc[user.subject] = (acc[user.subject] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  // Simple admin check - in production, this should be more secure
  if (!userProfile?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complete Profiles</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedProfiles}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incomplete Profiles</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.incompleteProfiles}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingTestimonials}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.subjectBreakdown).length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Teachers ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testimonials'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Testimonials ({testimonials.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferred Zones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            {user.email ? (
                              <>
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </>
                            ) : (
                              <>
                                <Phone className="h-3 w-3" />
                                <span>{user.phoneNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.subject || 'Not specified'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.mediumOfInstruction}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.currentDistrict && user.currentProvince ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{user.currentDistrict}, {user.currentProvince}</span>
                            </div>
                            {user.currentZone && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <MapIcon className="h-3 w-3" />
                                <span>{user.currentZone} Zone</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.desiredZones && user.desiredZones.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600 font-medium">
                              {user.desiredZones.length} zone{user.desiredZones.length > 1 ? 's' : ''}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {user.desiredZones.slice(0, 2).map((zone, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {zone}
                                </span>
                              ))}
                              {user.desiredZones.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{user.desiredZones.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : user.desiredZone ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {user.desiredZone}
                          </span>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.profileCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.profileCompleted ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user.uid)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`border rounded-lg p-4 ${
                    testimonial.isApproved 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {testimonial.userName}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          testimonial.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {testimonial.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">"{testimonial.message}"</p>
                      
                      <div className="text-sm text-gray-600">
                        <p>{testimonial.userSchool}, {testimonial.userDistrict}</p>
                        {testimonial.userZone && (
                          <p className="flex items-center space-x-1 text-xs">
                            <MapIcon className="h-3 w-3" />
                            <span>{testimonial.userZone} Zone</span>
                          </p>
                        )}
                        <p>Submitted: {testimonial.createdAt.toLocaleDateString()}</p>
                        {testimonial.approvedAt && (
                          <p>Approved: {testimonial.approvedAt.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    {!testimonial.isApproved && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveTestimonial(testimonial.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectTestimonial(testimonial.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {testimonials.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No testimonials submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Teacher Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.email || selectedUser.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.subject || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medium</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.mediumOfInstruction || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grade Taught</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.gradeTaught || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.schoolType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Location</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.currentDistrict && selectedUser.currentProvince ? (
                        <div>
                          <p>{selectedUser.currentDistrict}, {selectedUser.currentProvince}</p>
                          {selectedUser.currentZone && (
                            <p className="text-xs text-gray-500 flex items-center space-x-1">
                              <MapIcon className="h-3 w-3" />
                              <span>{selectedUser.currentZone} Zone</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Zones</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.desiredZones && selectedUser.desiredZones.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">
                            {selectedUser.desiredProvince} Province, {selectedUser.desiredDistrict} District
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.desiredZones.map((zone, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {zone}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : selectedUser.desiredZone ? (
                        <div>
                          <p>{selectedUser.desiredDistrict}, {selectedUser.desiredProvince}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedUser.desiredZone}
                          </span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current School</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.currentSchool || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.hideContact ? 'Hidden' : (selectedUser.whatsappNumber || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this teacher? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                disabled={deleteLoading === showDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;