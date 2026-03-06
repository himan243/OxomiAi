import React from 'react';

interface ContentCardProps {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, description, category, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-orange-100">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full mb-2 uppercase">
          {category}
        </span>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
        <button className="mt-4 text-orange-700 font-semibold text-sm hover:underline">
          Read More →
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
