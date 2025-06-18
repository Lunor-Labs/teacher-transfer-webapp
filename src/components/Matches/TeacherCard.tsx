import React from 'react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  Building, 
  MessageCircle, 
  Phone,
  ArrowRightLeft,
  Eye,
  EyeOff,
  Globe,
  MapIcon
} from 'lucide-react';

interface TeacherCardProps {
  teacher: User;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  const { t } = useLanguage();

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Hello, I found your transfer profile on Guru Mithuru. I would like to discuss a mutual transfer opportunity.`);
    const phoneNumber = teacher.whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const getDesiredZones = () => {
    return teacher.desiredZones || [teacher.desiredZone].filter(Boolean);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {teacher.fullName}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
            <BookOpen className="h-4 w-4" />
            <span>{teacher.subject}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="h-4 w-4" />
            <span>{teacher.mediumOfInstruction} Medium</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          <ArrowRightLeft className="h-3 w-3" />
          <span>Perfect Match</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <GraduationCap className="h-4 w-4" />
          <span>Grade: {teacher.gradeTaught}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="h-4 w-4" />
          <span>{teacher.schoolType} School</span>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">
            <strong>Current Location:</strong>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>{teacher.currentDistrict}, {teacher.currentProvince}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
              <MapIcon className="h-3 w-3" />
              <span>{teacher.currentZone} Zone</span>
            </div>
            <div className="text-xs text-gray-500 ml-6">
              {teacher.currentSchool}
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">
            <strong>Preferred Locations:</strong>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>{teacher.desiredDistrict}, {teacher.desiredProvince}</span>
            </div>
            <div className="ml-6">
              {getDesiredZones().length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">
                    Preferred Zones ({getDesiredZones().length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getDesiredZones().slice(0, 3).map((zone, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        {zone}
                      </span>
                    ))}
                    {getDesiredZones().length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{getDesiredZones().length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapIcon className="h-3 w-3" />
                  <span>Zone not specified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        {teacher.hideContact ? (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 py-2">
            <EyeOff className="h-4 w-4" />
            <span>Contact info hidden</span>
          </div>
        ) : (
          <button
            onClick={handleWhatsAppContact}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Contact via WhatsApp</span>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Phone className="h-3 w-3" />
          <span>
            {teacher.hideContact ? 'Hidden' : teacher.whatsappNumber}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>Profile Complete</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;