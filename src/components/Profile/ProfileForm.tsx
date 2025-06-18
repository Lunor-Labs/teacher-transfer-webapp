import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';
import { zonalEducationData, getProvinces, getDistrictsByProvince, getZonesByDistrict } from '../../data/zones';
import { Save, User as UserIcon, Plus, X } from 'lucide-react';

const subjects = [
  'Primary', 'Sinhala', 'Tamil', 'English', 'Mathematics', 'Science', 'Social Studies',
  'Buddhism', 'Christianity', 'Islam', 'Hinduism', 'History', 'Geography',
  'Civic Education', 'Health & Physical Education', 'Art', 'Music', 'Dance',
  'Technology', 'Commerce', 'Accounting', 'Economics', 'Biology', 'Physics',
  'Chemistry', 'Combined Mathematics', 'ICT', 'Media Studies'
];

const grades = [
  'Primary (1-5)', 'Secondary (6-11)', 'Advanced Level (12-13)'
];

const mediumOptions = [
  { value: 'Sinhala', label: 'Sinhala' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'English', label: 'English' }
];

const ProfileForm: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    subject: '',
    mediumOfInstruction: 'Sinhala' as 'Sinhala' | 'Tamil' | 'English',
    currentProvince: '',
    currentDistrict: '',
    currentZone: '',
    currentSchool: '',
    desiredProvince: '',
    desiredDistrict: '',
    desiredZone: '',
    desiredZones: [] as string[],
    gradeTaught: '',
    schoolType: 'National' as 'National' | 'Provincial',
    whatsappNumber: '',
    hideContact: false
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        subject: userProfile.subject || '',
        mediumOfInstruction: userProfile.mediumOfInstruction || 'Sinhala',
        currentProvince: userProfile.currentProvince || '',
        currentDistrict: userProfile.currentDistrict || '',
        currentZone: userProfile.currentZone || '',
        currentSchool: userProfile.currentSchool || '',
        desiredProvince: userProfile.desiredProvince || '',
        desiredDistrict: userProfile.desiredDistrict || '',
        desiredZone: userProfile.desiredZone || '',
        desiredZones: userProfile.desiredZones || [userProfile.desiredZone].filter(Boolean),
        gradeTaught: userProfile.gradeTaught || '',
        schoolType: userProfile.schoolType || 'National',
        whatsappNumber: userProfile.whatsappNumber || '',
        hideContact: userProfile.hideContact || false
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setSuccess(false);

    try {
      const profileData = {
        ...formData,
        // Ensure desiredZone is included in desiredZones array
        desiredZones: formData.desiredZones.includes(formData.desiredZone) 
          ? formData.desiredZones 
          : [...formData.desiredZones, formData.desiredZone].filter(Boolean),
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        uid: currentUser.uid,
        updatedAt: new Date(),
        profileCompleted: true
      };

      await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Reset dependent fields when parent changes
    if (name === 'currentProvince') {
      setFormData(prev => ({
        ...prev,
        currentDistrict: '',
        currentZone: ''
      }));
    } else if (name === 'currentDistrict') {
      setFormData(prev => ({
        ...prev,
        currentZone: ''
      }));
    } else if (name === 'desiredProvince') {
      setFormData(prev => ({
        ...prev,
        desiredDistrict: '',
        desiredZone: '',
        desiredZones: []
      }));
    } else if (name === 'desiredDistrict') {
      setFormData(prev => ({
        ...prev,
        desiredZone: '',
        desiredZones: []
      }));
    }
  };

  const addDesiredZone = () => {
    if (formData.desiredZone && !formData.desiredZones.includes(formData.desiredZone)) {
      setFormData(prev => ({
        ...prev,
        desiredZones: [...prev.desiredZones, prev.desiredZone]
      }));
    }
  };

  const removeDesiredZone = (zoneToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      desiredZones: prev.desiredZones.filter(zone => zone !== zoneToRemove)
    }));
  };

  const getCurrentDistricts = () => {
    return getDistrictsByProvince(formData.currentProvince);
  };

  const getCurrentZones = () => {
    return getZonesByDistrict(formData.currentProvince, formData.currentDistrict);
  };

  const getDesiredDistricts = () => {
    return getDistrictsByProvince(formData.desiredProvince);
  };

  const getDesiredZones = () => {
    return getZonesByDistrict(formData.desiredProvince, formData.desiredDistrict);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <UserIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {userProfile?.profileCompleted ? 'Update Teaching Information' : 'Setup Your Teaching Information'}
          </h1>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('subject')}
              </label>
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium of Instruction
              </label>
              <select
                name="mediumOfInstruction"
                required
                value={formData.mediumOfInstruction}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {mediumOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gradeTaught')}
              </label>
              <select
                name="gradeTaught"
                required
                value={formData.gradeTaught}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Type
              </label>
              <select
                name="schoolType"
                required
                value={formData.schoolType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="National">National School</option>
                <option value="Provincial">Provincial School</option>
              </select>
            </div>

            {/* Current Location Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Current Location
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Province
              </label>
              <select
                name="currentProvince"
                required
                value={formData.currentProvince}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Province</option>
                {getProvinces().map(province => (
                  <option key={province} value={province}>{province} Province</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current District
              </label>
              <select
                name="currentDistrict"
                required
                value={formData.currentDistrict}
                onChange={handleChange}
                disabled={!formData.currentProvince}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select District</option>
                {getCurrentDistricts().map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Zonal Education Division
              </label>
              <select
                name="currentZone"
                required
                value={formData.currentZone}
                onChange={handleChange}
                disabled={!formData.currentDistrict}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Zone</option>
                {getCurrentZones().map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current School
              </label>
              <input
                type="text"
                name="currentSchool"
                required
                value={formData.currentSchool}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Desired Location Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-6">
                Desired Location
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired Province
              </label>
              <select
                name="desiredProvince"
                required
                value={formData.desiredProvince}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Province</option>
                {getProvinces().map(province => (
                  <option key={province} value={province}>{province} Province</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired District
              </label>
              <select
                name="desiredDistrict"
                required
                value={formData.desiredDistrict}
                onChange={handleChange}
                disabled={!formData.desiredProvince}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select District</option>
                {getDesiredDistricts().map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Multiple Preferred Zones Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Zonal Education Divisions
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select multiple zones where you would like to be transferred. This increases your chances of finding matches.
              </p>
              
              <div className="flex space-x-2 mb-3">
                <select
                  name="desiredZone"
                  value={formData.desiredZone}
                  onChange={handleChange}
                  disabled={!formData.desiredDistrict}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Zone to Add</option>
                  {getDesiredZones()
                    .filter(zone => !formData.desiredZones.includes(zone))
                    .map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={addDesiredZone}
                  disabled={!formData.desiredZone || formData.desiredZones.includes(formData.desiredZone)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Selected Zones */}
              {formData.desiredZones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Zones:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.desiredZones.map((zone, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{zone}</span>
                        <button
                          type="button"
                          onClick={() => removeDesiredZone(zone)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.desiredZones.length === 0 && (
                <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <strong>Note:</strong> Please add at least one preferred zone to increase your matching opportunities.
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-6">
                Contact Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                required
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="+94771234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hideContact"
                  checked={formData.hideContact}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Hide Contact Information (Other users won't see your WhatsApp number)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || formData.desiredZones.length === 0}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : (userProfile?.profileCompleted ? 'Update Profile' : 'Create Profile')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;