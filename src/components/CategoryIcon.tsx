import React from 'react';
import {
  Banknote,
  Briefcase,
  Store,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Tv,
  HeartPulse,
  GraduationCap,
  Users,
  MoreHorizontal,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  size?: number;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  size = 18,
  className = '',
  color,
}) => {
  const iconProps = {
    size,
    className,
    style: color ? { color } : undefined,
  };

  switch (iconName) {
    case 'Banknote':
      return <Banknote {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'Store':
      return <Store {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Gift':
      return <Gift {...iconProps} />;
    case 'PlusCircle':
      return <PlusCircle {...iconProps} />;
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'Receipt':
      return <Receipt {...iconProps} />;
    case 'Tv':
      return <Tv {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Users':
      return <Users {...iconProps} />;
    case 'Wallet':
      return <Wallet {...iconProps} />;
    case 'ArrowDownLeft':
      return <ArrowDownLeft {...iconProps} />;
    case 'ArrowUpRight':
      return <ArrowUpRight {...iconProps} />;
    default:
      return <MoreHorizontal {...iconProps} />;
  }
};
