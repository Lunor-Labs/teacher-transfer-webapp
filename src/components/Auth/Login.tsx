import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProvinces, getDistrictsByProvince, getZonesByDistrict } from '../../data/zones';
import { 
  Mail, 
  Lock, 
  Users, 
  Eye, 
  EyeOff, 
  KeyRound, 
  UserPlus,
  LogIn,
  MapPin,
  BookOpen,
  School,
  Globe,
  CheckCircle,
  MessageCircle,
  Gift
} from 'lucide-react';

const subjects = [
  'Primary', 'Sinhala', 'Tamil', 'English', 'Mathematics', 'Science', 'Social Studies',
  'Buddhism', 'Christianity', 'Islam', 'Hinduism', 'History', 'Geography',
  'Civic Education', 'Health & Physical Education', 'Art', 'Music', 'Dance',
  'Technology', 'Commerce', 'Accounting', 'Economics', 'Biology', 'Physics',
  'Chemistry', 'Combined Mathematics', 'ICT', 'Media Studies'
];

const mediumOptions = [
  { value: 'Sinhala', label: 'සිංහල' },
  { value: 'Tamil', label: 'தமிழ்' },
  { value: 'English', label: 'English' }
];

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const { t, currentLanguage, setLanguage, languages } = useLanguage();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    nicNumber: '',
    subject: '',
    mediumOfInstruction: 'Sinhala' as 'Sinhala' | 'Tamil' | 'English',
    currentProvince: '',
    currentDistrict: '',
    currentZone: '',
    currentSchool: '',
    desiredProvince: '',
    desiredDistrict: '',
    desiredZones: [] as string[]
  });

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');

  const checkNicExists = async (nic: string): Promise<boolean> => {
    const q = query(collection(db, 'users'), where('nicNumber', '==', nic));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (registerData.desiredZones.length === 0) {
        setError('Please select at least one preferred zone.');
        return;
      }

      // Check if NIC already exists
      const nicExists = await checkNicExists(registerData.nicNumber);
      if (nicExists) {
        setError('A user with this NIC number already exists.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      // Create comprehensive user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: registerData.email,
        fullName: registerData.fullName,
        nicNumber: registerData.nicNumber,
        subject: registerData.subject,
        mediumOfInstruction: registerData.mediumOfInstruction,
        currentProvince: registerData.currentProvince,
        currentDistrict: registerData.currentDistrict,
        currentZone: registerData.currentZone,
        currentSchool: registerData.currentSchool,
        desiredProvince: registerData.desiredProvince,
        desiredDistrict: registerData.desiredDistrict,
        desiredZones: registerData.desiredZones,
        // Set some defaults for required fields
        gradeTaught: 'Primary (1-5)', // Default value
        schoolType: 'National', // Default value
        whatsappNumber: '', // Will be updated in profile
        hideContact: false,
        createdAt: new Date(),
        profileCompleted: true // Mark as completed since we're collecting comprehensive data
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage('');

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setResetMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset dependent fields when parent changes
    if (name === 'currentProvince') {
      setRegisterData(prev => ({
        ...prev,
        currentDistrict: '',
        currentZone: ''
      }));
    } else if (name === 'currentDistrict') {
      setRegisterData(prev => ({
        ...prev,
        currentZone: ''
      }));
    } else if (name === 'desiredProvince') {
      setRegisterData(prev => ({
        ...prev,
        desiredDistrict: '',
        desiredZones: []
      }));
    } else if (name === 'desiredDistrict') {
      setRegisterData(prev => ({
        ...prev,
        desiredZones: []
      }));
    }
  };

  const addDesiredZone = (zone: string) => {
    if (zone && !registerData.desiredZones.includes(zone)) {
      setRegisterData(prev => ({
        ...prev,
        desiredZones: [...prev.desiredZones, zone]
      }));
    }
  };

  const removeDesiredZone = (zoneToRemove: string) => {
    setRegisterData(prev => ({
      ...prev,
      desiredZones: prev.desiredZones.filter(zone => zone !== zoneToRemove)
    }));
  };

  const getCurrentDistricts = () => {
    return getDistrictsByProvince(registerData.currentProvince);
  };

  const getCurrentZones = () => {
    return getZonesByDistrict(registerData.currentProvince, registerData.currentDistrict);
  };

  const getDesiredDistricts = () => {
    return getDistrictsByProvince(registerData.desiredProvince);
  };

  const getDesiredZones = () => {
    return getZonesByDistrict(registerData.desiredProvince, registerData.desiredDistrict);
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <KeyRound className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              {resetMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm ${
                  resetMessage.includes('Error') 
                    ? 'bg-red-50 border border-red-200 text-red-600'
                    : 'bg-green-50 border border-green-200 text-green-600'
                }`}>
                  {resetMessage}
                </div>
              )}

              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={() => setShowPasswordReset(false)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <select
              value={currentLanguage.code}
              onChange={(e) => {
                const lang = languages.find(l => l.code === e.target.value);
                if (lang) setLanguage(lang);
              }}
              className="appearance-none bg-transparent border-none text-sm focus:outline-none focus:ring-0 cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {currentLanguage.code === 'si' ? (
                <>ඔබේ ගුරු මාරු අරමුණ සාර්ථක කරගන්න<br />
                <span className="text-blue-600">Guru Mithuru</span> සමඟ එක්වන්න</>
              ) : currentLanguage.code === 'ta' ? (
                <>உங்கள் சரியான இடமாற்ற பங்குதாரரைக் கண்டறியுங்கள்<br />
                <span className="text-blue-600">Guru Mithuru</span> உடன்</>
              ) : (
                <>Find Your Perfect Transfer Partner<br />
                with <span className="text-blue-600">Guru Mithuru</span></>
              )}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {currentLanguage.code === 'si' ? (
                <>Guru Mithuru යනු ශ්‍රී ලංකාවේ ගුරු මාරු සඳහා නිදහස් සහ පහසු විසඳුමක් වන වේදිකාවකි. 
                ඔබගේ පාසල සහ අවශ්‍ය දිස්ත්‍රික්කය ඇතුළත් කර ගැලපෙන ගුරුවරුන් සෙවිය හැකිය.</>
              ) : currentLanguage.code === 'ta' ? (
                <>பரஸ்பர இடமாற்ற வாய்ப்புகளுக்காக இலங்கை பள்ளி ஆசிரியர்களுடன் இணைக்கவும். 
                இடம், பாடம் மற்றும் விருப்பத்தேர்வுகளின் அடிப்படையில் உங்கள் சரியான இடமாற்ற பங்குதாரரைக் கண்டறியுங்கள்.</>
              ) : (
                <>Connect with Sri Lankan school teachers for mutual transfer opportunities. 
                Find your perfect transfer partner based on location, subject, and preferences.</>
              )}
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {currentLanguage.code === 'si' ? 'අනුමත ගුරු මාරු සෙවීම පහසුයි' : 
                   currentLanguage.code === 'ta' ? 'எளிதான இடமாற்ற பொருத்தம்' : 
                   'Easy Transfer Matching'}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentLanguage.code === 'si' ? 'ඔබගේ අවශ්‍යතාවන්ට ගැලපෙන ගුරුවරුන් සොයා ගන්න' : 
                   currentLanguage.code === 'ta' ? 'நிரப்பு இடம் விருப்பத்தேர்வுகளுடன் ஆசிரியர்களைக் கண்டறியுங்கள்' :
                   'Find teachers with complementary location preferences'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {currentLanguage.code === 'si' ? 'WhatsApp හරහා සම්බන්ධ විය හැක' : 
                   currentLanguage.code === 'ta' ? 'WhatsApp ஒருங்கிணைப்பு' :
                   'WhatsApp Integration'}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentLanguage.code === 'si' ? 'සෘජුවම WhatsApp හරහා සම්බන්ධ වන්න' : 
                   currentLanguage.code === 'ta' ? 'WhatsApp செய்தி மூலம் நேரடியாக இணைக்கவும்' :
                   'Connect directly via WhatsApp messaging'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {currentLanguage.code === 'si' ? 'සම්පූර්ණයෙන්ම නොමිලේ සේවාවකි' : 
                   currentLanguage.code === 'ta' ? 'முற்றிலும் இலவச சேவை' :
                   'Completely Free Service'}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentLanguage.code === 'si' ? 'කිසිදු ගාස්තුවක් නොමැතිව භාවිතා කරන්න' : 
                   currentLanguage.code === 'ta' ? 'கட்டணம் இல்லை, மறைக்கப்பட்ட செலவுகள் இல்லை, முற்றிலும் இலவசம்' :
                   'No fees, no hidden costs, completely free'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span className="text-lg">
                  {currentLanguage.code === 'si' ? '🚀 ආරම්භ කරන්න' : 
                   currentLanguage.code === 'ta' ? '🚀 தொடங்குங்கள்' :
                   '🚀 Get Started'}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span className="text-lg">
                  {currentLanguage.code === 'si' ? '🔐 පුරන්න' : 
                   currentLanguage.code === 'ta' ? '🔐 உள்நுழைய' :
                   '🔐 Sign In'}
                </span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {activeTab === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLanguage.code === 'si' ? 'ගුරු ගිණුමක් සාදන්න' : 
                     currentLanguage.code === 'ta' ? 'ஆசிரியர் கணக்கை உருவாக்கவும்' :
                     'Create Teacher Account'}
                  </h2>
                  <p className="text-gray-600">
                    {currentLanguage.code === 'si' ? 'ඔබගේ විස්තර පුරවා ගිණුමක් සාදන්න' : 
                     currentLanguage.code === 'ta' ? 'கணக்கை உருவாக்க உங்கள் விவரங்களை நிரப்பவும்' :
                     'Fill in your details to create an account'}
                  </p>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage.code === 'si' ? 'සම්පූර්ණ නම' : 
                       currentLanguage.code === 'ta' ? 'முழு பெயர்' :
                       'Full Name'}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage.code === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය' : 
                       currentLanguage.code === 'ta' ? 'தேசிய அடையாள அட்டை எண்' :
                       'NIC Number'}
                    </label>
                    <input
                      type="text"
                      name="nicNumber"
                      required
                      value={registerData.nicNumber}
                      onChange={handleRegisterChange}
                      placeholder="123456789V or 199912345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {currentLanguage.code === 'si' ? 'අනුපිටපත් වැළැක්වීම සඳහා. අනෙක් පරිශීලකයින්ට නොපෙනේ.' : 
                       currentLanguage.code === 'ta' ? 'நகல் தடுப்புக்காக பயன்படுத்தப்படுகிறது. மற்ற பயனர்களுக்கு தெரியாது.' :
                       'Used for duplicate prevention. Not visible to other users.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage.code === 'si' ? 'විද්‍යුත් තැපැල්' : 
                       currentLanguage.code === 'ta' ? 'மின்னஞ்சல்' :
                       'Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentLanguage.code === 'si' ? 'මුරපදය' : 
                       currentLanguage.code === 'ta' ? 'கடவுச்சொல்' :
                       'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teaching Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>
                      {currentLanguage.code === 'si' ? 'ගුරු තොරතුරු' : 
                       currentLanguage.code === 'ta' ? 'ஆசிரியர் தகவல்' :
                       'Teaching Information'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'විෂය' : 
                         currentLanguage.code === 'ta' ? 'பாடம்' :
                         'Subject'}
                      </label>
                      <select
                        name="subject"
                        required
                        value={registerData.subject}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">
                          {currentLanguage.code === 'si' ? 'විෂයක් තෝරන්න' : 
                           currentLanguage.code === 'ta' ? 'பாடத்தைத் தேர்ந்தெடுக்கவும்' :
                           'Select Subject'}
                        </option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'ඉගැන්වීමේ මාධ්‍යය' : 
                         currentLanguage.code === 'ta' ? 'கற்பித்தல் ஊடகம்' :
                         'Medium of Instruction'}
                      </label>
                      <select
                        name="mediumOfInstruction"
                        required
                        value={registerData.mediumOfInstruction}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {mediumOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Current Location */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>
                      {currentLanguage.code === 'si' ? 'වත්මන් ස්ථානය' : 
                       currentLanguage.code === 'ta' ? 'தற்போதைய இடம்' :
                       'Current Location'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'වත්මන් පළාත' : 
                         currentLanguage.code === 'ta' ? 'தற்போதைய மாகாணம்' :
                         'Current Province'}
                      </label>
                      <select
                        name="currentProvince"
                        required
                        value={registerData.currentProvince}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">
                          {currentLanguage.code === 'si' ? 'පළාතක් තෝරන්න' : 
                           currentLanguage.code === 'ta' ? 'மாகாணத்தைத் தேர்ந்தெடுக்கவும்' :
                           'Select Province'}
                        </option>
                        {getProvinces().map(province => (
                          <option key={province} value={province}>{province} Province</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'වත්මන් දිස්ත්‍රික්කය' : 
                         currentLanguage.code === 'ta' ? 'தற்போதைய மாவட்டம்' :
                         'Current District'}
                      </label>
                      <select
                        name="currentDistrict"
                        required
                        value={registerData.currentDistrict}
                        onChange={handleRegisterChange}
                        disabled={!registerData.currentProvince}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      >
                        <option value="">
                          {currentLanguage.code === 'si' ? 'දිස්ත්‍රික්කයක් තෝරන්න' : 
                           currentLanguage.code === 'ta' ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' :
                           'Select District'}
                        </option>
                        {getCurrentDistricts().map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'වත්මන් කලාපීය අධ්‍යාපන කොට්ඨාසය' : 
                         currentLanguage.code === 'ta' ? 'தற்போதைய மண்டல கல்வி பிரிவு' :
                         'Current Zonal Education Division'}
                      </label>
                      <select
                        name="currentZone"
                        required
                        value={registerData.currentZone}
                        onChange={handleRegisterChange}
                        disabled={!registerData.currentDistrict}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      >
                        <option value="">
                          {currentLanguage.code === 'si' ? 'කලාපයක් තෝරන්න' : 
                           currentLanguage.code === 'ta' ? 'மண்டலத்தைத் தேர்ந்தெடுக்கவும்' :
                           'Select Zone'}
                        </option>
                        {getCurrentZones().map(zone => (
                          <option key={zone} value={zone}>{zone}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'වත්මන් පාසල' : 
                         currentLanguage.code === 'ta' ? 'தற்போதைய பள்ளி' :
                         'Current School'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="currentSchool"
                          required
                          value={registerData.currentSchool}
                          onChange={handleRegisterChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <School className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desired Location */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>
                      {currentLanguage.code === 'si' ? 'අපේක්ෂිත ස්ථානය' : 
                       currentLanguage.code === 'ta' ? 'விரும்பிய இடம்' :
                       'Desired Location'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'අපේක්ෂිත පළාත' : 
                         currentLanguage.code === 'ta' ? 'விரும்பிய மாகாணம்' :
                         'Desired Province'}
                      </label>
                      <select
                        name="desiredProvince"
                        required
                        value={registerData.desiredProvince}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">
                          {currentLanguage.code === 'si' ? 'පළාතක් තෝරන්න' : 
                           currentLanguage.code === 'ta' ? 'மாகாணத்தைத் தேர்ந்தெடுக்கவும்' :
                           'Select Province'}
                        </option>
                        {getProvinces().map(province => (
                          <option key={province} value={province}>{province} Province</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentLanguage.code === 'si' ? 'අපේක්ෂිත දිස්ත්‍රික්කය' : 
                         currentLanguage.code === 'ta' ? 'விரும்பிய மாவட்டம்' :
                         'Desired District'}
                      </label>
                      <select
                        name="desiredDistrict"
                        required
                        value={registerData.desiredDistrict}
                        onChange={handleRegisterChange}
                        disabled={!registerData.desiredProvince}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      >
                        <option value="">
                          {currentLanguage.code === 'si' ? 'දිස්ත්‍රික්කයක් තෝරන්න' : 
                           currentLanguage.code === 'ta' ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' :
                           'Select District'}
                        </option>
                        {getDesiredDistricts().map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multiple Preferred Zones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentLanguage.code === 'si' ? 'අපේක්ෂිත කලාපීය අධ්‍යාපන කොට්ඨාස' : 
                       currentLanguage.code === 'ta' ? 'விரும்பிய மண்டல கல்வி பிரிவுகள்' :
                       'Preferred Zonal Education Divisions'}
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      {currentLanguage.code === 'si' ? 
                        'ඔබ මාරු වීමට කැමති කලාප කිහිපයක් තෝරන්න. මෙය ගැලපීම් සොයා ගැනීමේ අවස්ථා වැඩි කරයි.' :
                        currentLanguage.code === 'ta' ? 
                        'நீங்கள் மாற்றப்பட விரும்பும் பல மண்டலங்களைத் தேர்ந்தெடுக்கவும். இது பொருத்தங்களைக் கண்டறியும் வாய்ப்புகளை அதிகரிக்கிறது.' :
                        'Select multiple zones where you would like to be transferred. This increases your chances of finding matches.'
                      }
                    </p>
                    
                    <div className="space-y-3">
                      {getDesiredZones().map(zone => (
                        <label key={zone} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={registerData.desiredZones.includes(zone)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                addDesiredZone(zone);
                              } else {
                                removeDesiredZone(zone);
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{zone}</span>
                        </label>
                      ))}
                    </div>

                    {registerData.desiredZones.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          {currentLanguage.code === 'si' ? 'තෝරාගත් කලාප:' : 
                           currentLanguage.code === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட மண்டலங்கள்:' :
                           'Selected Zones:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {registerData.desiredZones.map((zone, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {zone}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {registerData.desiredDistrict && registerData.desiredZones.length === 0 && (
                      <div className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <strong>
                          {currentLanguage.code === 'si' ? 'සටහන:' : 
                           currentLanguage.code === 'ta' ? 'குறிப்பு:' :
                           'Note:'}
                        </strong> {
                          currentLanguage.code === 'si' ? 
                            'කරුණාකර අවම වශයෙන් එක් කලාපයක් තෝරන්න.' :
                            currentLanguage.code === 'ta' ? 
                            'தயவுசெய்து குறைந்தது ஒரு மண்டலத்தையாவது தேர்ந்தெடுக்கவும்.' :
                            'Please select at least one preferred zone.'
                        }
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || registerData.desiredZones.length === 0}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>
                    {loading ? 
                      (currentLanguage.code === 'si' ? 'ගිණුම සාදමින්...' : 
                       currentLanguage.code === 'ta' ? 'கணக்கை உருவாக்குகிறது...' :
                       'Creating Account...') : 
                      (currentLanguage.code === 'si' ? 'ගිණුම සාදන්න' : 
                       currentLanguage.code === 'ta' ? 'கணக்கை உருவாக்கவும்' :
                       'Create Account')
                    }
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLanguage.code === 'si' ? 'ගිණුමට පුරන්න' : 
                     currentLanguage.code === 'ta' ? 'உங்கள் கணக்கில் உள்நுழையவும்' :
                     'Sign In to Your Account'}
                  </h2>
                  <p className="text-gray-600">
                    {currentLanguage.code === 'si' ? 'ඔබගේ ගිණුමට ප්‍රවේශ වන්න' : 
                     currentLanguage.code === 'ta' ? 'உங்கள் ஆசிரியர் கணக்கை அணுகவும்' :
                     'Access your teacher account'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguage.code === 'si' ? 'විද්‍යුත් තැපැල්' : 
                     currentLanguage.code === 'ta' ? 'மின்னஞ்சல்' :
                     'Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguage.code === 'si' ? 'මුරපදය' : 
                     currentLanguage.code === 'ta' ? 'கடவுச்சொல்' :
                     'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>
                    {loading ? 
                      (currentLanguage.code === 'si' ? 'පුරමින්...' : 
                       currentLanguage.code === 'ta' ? 'உள்நுழைகிறது...' :
                       'Signing In...') : 
                      (currentLanguage.code === 'si' ? 'පුරන්න' : 
                       currentLanguage.code === 'ta' ? 'உள்நுழைய' :
                       'Sign In')
                    }
                  </span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {currentLanguage.code === 'si' ? 'මුරපදය අමතකද?' : 
                     currentLanguage.code === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' :
                     'Forgot Password?'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;