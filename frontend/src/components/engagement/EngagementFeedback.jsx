import React, { useEffect } from 'react';
import { AlertCircle, Award, TrendingUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Engagement feedback component to show after paper upload
export const showEngagementFeedback = (feedback) => {
  if (!feedback) return;

  // Show main success toast
  const { totalReputation, newBadges, contributorStatus, uploadCount } = feedback;

  const messages = [];
  
  if (totalReputation) {
    messages.push(`+${totalReputation} Total Reputation`);
  }
  
  if (uploadCount) {
    messages.push(`${uploadCount} papers uploaded`);
  }

  // Show comprehensive engagement toast
  toast.custom((t) => (
    <div
      className={`transform transition-all duration-300 ${
        t.visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } max-w-md w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg shadow-xl p-4 pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Awesome! Paper Uploaded! 🎉</h3>
          <div className="space-y-1 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>✓</span>
                <span>{msg}</span>
              </div>
            ))}
            {contributorStatus && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/30">
                <Award className="w-4 h-4" />
                <span className="font-semibold">{contributorStatus} 🎖️</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-center',
  });

  // Show individual badge notifications if any
  if (newBadges && newBadges.length > 0) {
    setTimeout(() => {
      toast.custom((t) => (
        <div
          className={`transform transition-all duration-300 ${
            t.visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          } max-w-md w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg shadow-xl p-4 pointer-events-auto`}
        >
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Badge Unlocked! ⭐</h3>
              <p className="text-xs">
                You earned {newBadges.length} {newBadges.length === 1 ? 'badge' : 'badges'}
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });
    }, 1500);
  }
};

// Component to show contributor status animation
export const EngagementStatusAnimation = ({ status }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const statusColors = {
    Student: 'from-gray-400 to-gray-600',
    Contributor: 'from-blue-400 to-blue-600',
    'Verified Contributor': 'from-green-400 to-green-600',
    'Top Scholar': 'from-purple-400 to-purple-600',
    'Campus Ambassador': 'from-amber-400 to-amber-600',
  };

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60]">
      <div className={`animate-bounce bg-gradient-to-r ${statusColors[status] || 'from-gray-400 to-gray-600'} text-white rounded-full px-6 py-3 shadow-lg font-semibold flex items-center gap-2`}>
        <TrendingUp className="w-5 h-5" />
        Status: {status} 📈
      </div>
    </div>
  );
};

// Reputation point animation on download or vote
export const ReputationPointsAnimation = ({ points, x, y }) => {
  return (
    <div
      className="fixed pointer-events-none font-bold text-lg animate-pulse"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        animation: 'float-up 2s ease-out forwards',
        color: '#10b981',
        textShadow: '0 0 5px rgba(16, 185, 129, 0.5)',
      }}
    >
      +{points} pts
    </div>
  );
};
