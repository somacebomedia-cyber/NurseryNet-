// src/components/marketing/SocialProofPopup.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrand } from '@/context/BrandContext';

const notifications = [
    { name: 'Bright Sprouts Academy', location: 'Cape Town', action: 'just subscribed to Growth Navigator!' },
    { name: 'Little Learners Hub', location: 'Johannesburg', action: 'just joined NurseryNet!' },
    { name: 'Happy Hearts Preschool', location: 'Durban', action: 'just subscribed to Creative Canvas!' },
    { name: 'Future Stars ECD', location: 'Pretoria', action: 'just received funding via our AI Finder!' },
    { name: 'Rainbow Kids', location: 'Port Elizabeth', action: 'just launched their new AI-generated logo!' },
];

export default function SocialProofPopup() {
    const { brand } = useBrand();
    const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (brand !== 'NurseryNet') {
            setIsVisible(false);
            return;
        }

        // Show the first notification after a short delay
        const initialTimeout = setTimeout(() => {
            setIsVisible(true);
        }, 1000); // 1-second delay before the first one

        const interval = setInterval(() => {
            setIsVisible(false); // Start fade-out
            setTimeout(() => {
                // Change notification content after fade-out
                setCurrentNotificationIndex(prevIndex => (prevIndex + 1) % notifications.length);
                setIsVisible(true); // Start fade-in
            }, 500); // 0.5s for fade-out transition
        }, 8000); // Cycle every 8 seconds

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [brand]);

    const currentNotification = notifications[currentNotificationIndex];

    if (!currentNotification || brand !== 'NurseryNet') return null;

    return (
        <div
            className={cn(
                "fixed bottom-5 left-5 z-50 hidden md:block transition-all duration-500 ease-in-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
        >
            <Card className="shadow-2xl glassmorphism border-primary/30">
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="p-2 bg-primary/20 rounded-full">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-foreground">
                            {currentNotification.name}
                            <span className="text-muted-foreground font-normal"> from {currentNotification.location}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{currentNotification.action}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
