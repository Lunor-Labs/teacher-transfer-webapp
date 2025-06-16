# Teacher Transfer Match

A responsive web application designed to help Sri Lankan school teachers find mutual transfer partners. The platform enables teachers to connect with colleagues who have complementary location preferences for seamless mutual transfers.

## Features

### 🔐 Authentication
- Firebase Authentication with email/password
- Secure user registration and login
- Password visibility toggle

### 👤 Profile Management
- Comprehensive teacher profile creation
- Fields include: name, subject, current/desired locations, grade, school type, contact info
- Profile completion tracking
- Privacy controls for contact information

### 🔍 Mutual Transfer Matching
- Advanced matching algorithm for mutual transfer opportunities
- Filters by subject, province, district
- Only shows teachers with complementary location preferences
- Visual indicators for mutual matches

### 📱 WhatsApp Integration
- Direct WhatsApp contact buttons
- Pre-filled messages for transfer discussions
- Respects privacy settings

### 🛡️ Admin Dashboard
- User management and overview
- Statistics and analytics
- User deletion capabilities
- Profile completion tracking

### 🌐 Multi-language Support
- English, Sinhala, and Tamil language options
- Responsive language switching
- Localized content

### 📱 Responsive Design
- Mobile-first approach
- Optimized for all device sizes
- Clean, professional UI with smooth animations

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd teacher-transfer-match
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password method)
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings
5. Update `src/config/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules
Set up the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

### 5. Admin Setup
To make a user an admin:
1. Register the user normally
2. Go to Firestore console
3. Edit the user document
4. Add field: `isAdmin: true`

### 6. Run the Application
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Admin/
│   │   └── AdminDashboard.tsx
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Layout/
│   │   └── Header.tsx
│   ├── Matches/
│   │   ├── MatchFinder.tsx
│   │   └── TeacherCard.tsx
│   └── Profile/
│       └── ProfileForm.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── config/
│   └── firebase.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Key Features Explained

### Mutual Matching Algorithm
The app implements a sophisticated matching system that only shows teachers whose:
- Current location matches your desired location
- Desired location matches your current location
- This creates perfect mutual transfer opportunities

### Privacy Controls
Teachers can choose to hide their contact information while still being discoverable for matches. This provides privacy while maintaining the platform's functionality.

### Multi-language Support
The application supports three languages commonly used in Sri Lankan education:
- English (default)
- Sinhala (සිංහල)
- Tamil (தமிழ்)

### Responsive Design
The interface adapts seamlessly across devices:
- Mobile: Optimized touch interface with collapsible navigation
- Tablet: Balanced layout with accessible controls
- Desktop: Full-featured interface with enhanced productivity

## Deployment Options

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set up environment variables if needed

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json: `"homepage": "https://username.github.io/repo-name"`
3. Add deploy script: `"deploy": "gh-pages -d dist"`
4. Build and deploy: `npm run build && npm run deploy`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- Firebase security rules prevent unauthorized access
- User data is protected by authentication
- Admin privileges are strictly controlled
- Contact information respects privacy settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.