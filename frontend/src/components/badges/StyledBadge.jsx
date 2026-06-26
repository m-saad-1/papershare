import React from 'react';
import { Trophy, Star, Zap, Medal, Crown } from 'lucide-react';

// Badge configuration with icons, colors, and styling
const BADGE_STYLES = {
  first_upload: {
    name: 'First Upload',
    icon: Star,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    color: 'text-blue-600',
    emoji: '🚀'
  },
  contributor: {
    name: 'Contributor',
    icon: Zap,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    color: 'text-purple-600',
    emoji: '⚡'
  },
  department_hero: {
    name: 'Department Hero',
    icon: Medal,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    color: 'text-orange-600',
    emoji: '🏆'
  },
  exam_saver: {
    name: 'Exam Saver',
    icon: Trophy,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    color: 'text-green-600',
    emoji: '💾'
  },
  knowledge_king: {
    name: 'Knowledge King',
    icon: Crown,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    color: 'text-yellow-600',
    emoji: '👑'
  },
  study_guide: {
    name: 'Study Guide',
    icon: Trophy,
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    color: 'text-cyan-600',
    emoji: '📘'
  },
};

export const StyledBadge = ({ badgeKey, className = '', size = 'md', showName = true }) => {
  const badge = BADGE_STYLES[badgeKey];
  if (!badge) return null;

  const Icon = badge.icon;
  
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'h-5 w-5'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border-2 whitespace-nowrap ${badge.bg} ${badge.border} ${badge.text} font-semibold ${sizes.container} ${className}`}
      title={badge.name}
    >
      <Icon className={sizes.icon} />
      <span>{badge.emoji}</span>
      {showName && <span className="whitespace-nowrap">{badge.name}</span>}
    </div>
  );
};

export const StyledBadgesGroup = ({ badgeKeys = [], className = '', size = 'md' }) => {
  if (!badgeKeys || badgeKeys.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badgeKeys.map((key) => (
        <StyledBadge key={key} badgeKey={key} size={size} />
      ))}
    </div>
  );
};

export default StyledBadge;
