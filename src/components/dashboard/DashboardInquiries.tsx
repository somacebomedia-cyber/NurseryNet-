// src/components/dashboard/DashboardInquiries.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from 'date-fns';

interface Inquiry {
  id: string;
  parentName: string;
  message: string;
  createdAt: Timestamp;
  isRead: boolean;
}

export default function DashboardInquiries() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoadingInquiries(true);
    const inquiriesRef = collection(db, "inquiries");
    const q = query(
      inquiriesRef,
      where("preschoolId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedInquiries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Inquiry));
      setInquiries(fetchedInquiries);
      setLoadingInquiries(false);
    }, (error) => {
      console.error("Error fetching inquiries:", error);
      setLoadingInquiries(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Card className="shadow-lg glassmorphism lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
          <Inbox className="mr-2 h-5 w-5"/> Recent Inquiries
        </CardTitle>
        <CardDescription>Latest messages from interested parents.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingInquiries ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          </div>
        ) : inquiries.length > 0 ? (
          <ul className="space-y-4">
            {inquiries.map(inquiry => (
              <li key={inquiry.id} className="border-b border-border/50 pb-3 last:border-b-0">
                <p className="font-semibold text-foreground">{inquiry.parentName}</p>
                <p className="text-sm text-muted-foreground truncate">{inquiry.message}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {formatDistanceToNow(inquiry.createdAt.toDate(), { addSuffix: true })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">No new inquiries yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
