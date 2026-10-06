import React from 'react';
import * as Icons from 'lucide-react';

export const CategoryIcon = ({ name, size = 20, className = '', color }) => {
  // Tìm icon tương ứng trong thư viện lucide-react, fallback về CircleDashed nếu không có
  const IconComponent = Icons[name] || Icons.CircleDot;
  return <IconComponent size={size} className={className} color={color} />;
};

export default CategoryIcon;
