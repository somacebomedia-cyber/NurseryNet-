
// src/components/dashboard/DashboardAnalytics.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Eye, Users, MessageSquare, Activity, UserPlus, Loader2, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const mockProfileViewsData = [
  { name: 'Jan', views: 120 }, { name: 'Feb', views: 210 }, { name: 'Mar', views: 180 },
  { name: 'Apr', views: 250 }, { name: 'May', views: 220 }, { name: 'Jun', views: 300 },
];

const mockLeadData = [
  { name: 'Jan', leads: 5 }, { name: 'Feb', leads: 8 }, { name: 'Mar', leads: 6 },
  { name: 'Apr', leads: 10 }, { name: 'May', leads: 7 }, { name: 'Jun', leads: 12 },
];

export default function DashboardAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '0794486843');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Only update from user object if it exists and is different from the default
    if (user?.whatsappNumber && user.whatsappNumber !== '0794486843') {
        setWhatsappNumber(user.whatsappNumber);
    }
  }, [user]);

  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Not Logged In", description: "You must be logged in to save your number.", variant: "destructive" });
      return;
    }
    if (!whatsappNumber || whatsappNumber.length < 10) {
      toast({ title: "Invalid Number", description: "Please enter a valid WhatsApp number.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        whatsappNumber: whatsappNumber
      });
      toast({
        title: "Success!",
        description: "Your WhatsApp number has been saved.",
      });
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="lg:col-span-2 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { title: "Profile Views (Last 30d)", value: "1,280", icon: Eye, change: "+15%", changeType: "positive" },
          { title: "Leads Generated (Last 30d)", value: "45", icon: Users, change: "+5%", changeType: "positive"  },
          { title: "Messages Received (Last 30d)", value: "12", icon: MessageSquare, change: "-2%", changeType: "negative" },
          { title: "Engagement Rate", value: "65%", icon: Activity, change: "+3%", changeType: "positive"  },
        ].map(metric => (
          <Card key={metric.title} className="shadow-lg glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">{metric.title}</CardTitle>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg glassmorphism">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Profile Views Over Time</CardTitle>
              <CardDescription>Monthly views for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockProfileViewsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }}/>
                  <YAxis tickFormatter={(value) => `${value}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--popover-foreground))' }} itemStyle={{ color: 'hsl(var(--primary))' }} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-lg glassmorphism">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Leads Generated Over Time</CardTitle>
              <CardDescription>Monthly leads for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockLeadData}>
                   <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }}/>
                  <YAxis tickFormatter={(value) => `${value}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--popover-foreground))' }} itemStyle={{ color: 'hsl(var(--accent))' }} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Area type="monotone" dataKey="leads" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg glassmorphism">
            <CardHeader>
                <CardTitle className="text-xl text-primary">Quick Actions & Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">Your weekly performance summary is sent to your WhatsApp number every Monday.</p>
                <div className="flex flex-wrap gap-4">
                <Button variant="outline">View Messages</Button>
                <Button variant="outline">Download Monthly Report (PDF)</Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
                </div>
            </CardContent>
            </Card>

            <Card className="shadow-lg glassmorphism bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><UserPlus className="mr-2 h-5 w-5"/>Complete Your Profile</CardTitle>
                <CardDescription>Add your WhatsApp number to receive weekly reports and important updates.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSaveWhatsapp}>
                   <div className="space-y-2">
                     <Label htmlFor="whatsapp">WhatsApp Number</Label>
                     <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+27 12 345 6789" />
                   </div>
                   <Button type="submit" className="w-full" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        {isSaving ? 'Saving...' : 'Save Information'}
                   </Button>
                </form>
            </CardContent>
            </Card>
        </div>

    </div>
  );
}
