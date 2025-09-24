
import React from 'react';

interface TagProps {
  text: string;
}

const colorClasses: { [key: string]: string } = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  python: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  react: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  ai: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  'machine learning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  cybersecurity: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  networking: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'web development': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'ui/ux': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
};

const Tag: React.FC<TagProps> = ({ text }) => {
  const color = colorClasses[text.toLowerCase()] || colorClasses.default;
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default Tag;
