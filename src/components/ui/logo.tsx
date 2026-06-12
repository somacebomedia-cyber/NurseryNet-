// src/components/ui/logo.tsx
import { cn } from "@/lib/utils"
import { Baby, School, BookOpenCheck, GraduationCap } from 'lucide-react';
import { Brand } from '@/context/BrandContext';

interface LogoProps {
    className?: string;
    brand: Brand;
}

export const NurseryNetLogo = ({ className, brand }: LogoProps) => {
    const baseClassName = "h-8 w-8 text-primary";

    const getLogo = () => {
        switch (brand) {
            case 'NurseryNet':
                return <Baby className={cn(baseClassName, className)} />;
            case 'PrimaryNet':
                return <School className={cn(baseClassName, className)} />;
            case 'HighschoolNet':
                return <BookOpenCheck className={cn(baseClassName, className)} />;
            case 'TertiaryNet':
                return <GraduationCap className={cn(baseClassName, className)} />;
            default:
                return <Baby className={cn(baseClassName, className)} />;
        }
    };

    return getLogo();
};
