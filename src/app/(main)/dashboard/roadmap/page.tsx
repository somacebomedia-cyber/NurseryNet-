// src/app/(main)/dashboard/roadmap/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { KeyRound, Sprout, DollarSign, Star, Rocket, User, Megaphone, CheckSquare, TrendingUp, HandCoins, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type Person = 'You';

interface Task {
  id: string;
  label: string;
  details?: string;
  assignee: Person;
}

interface Day {
  day: string;
  title: string;
  icon: React.ElementType;
  tasks: Task[];
}

const roadmapData: Day[] = [
  {
    day: 'Monday',
    title: 'Mission: Data & Content Foundation',
    icon: Sprout,
    tasks: [
      { id: 'm1', label: 'Compile the master preschool list into a single CSV file.', details: 'Top priority! Ensure columns for name, location, logoUrl, and coverPhotoUrl.', assignee: 'You' },
      { id: 'm2', label: 'Create final PDF versions of all free teacher resources.', details: 'Use an app like Canva to design beautiful, simple PDFs for the Growth Kit page.', assignee: 'You' },
      { id: 'm3', label: 'Create the first batch of premium curriculum worksheets (5-10 per category).', details: 'e.g., CAPS Grade R Literacy, Numeracy. These are for your paid plans.', assignee: 'You' },
    ]
  },
  {
    day: 'Tuesday',
    title: 'Mission: Technical Setup & Keys',
    icon: KeyRound,
    tasks: [
      { id: 't1', label: 'Get API keys from Firebase, Google AI, PayPal and Paystack.', assignee: 'You' },
      { id: 't2', label: 'Fill in all variables in the .env file with your new keys.', details: 'This is the most critical step to make the app run.', assignee: 'You' },
      { id: 't3', label: 'Create "Creative" & "Growth" subscription plans in your PayPal and Paystack Dashboards.', details: 'You must create these plans in both services to accept different currencies.', assignee: 'You' },
      { id: 't4', label: 'Copy the new Plan IDs from PayPal & Paystack into the .env file.', assignee: 'You' },
      { id: 't5', label: 'Create a Webhook in both PayPal & Paystack for subscription events.', details: 'Subscribe to events like "subscription.create" and "subscription.cancel".', assignee: 'You' },
      { id: 't6', label: 'Copy the Webhook ID/Secret from both services into the .env file.', assignee: 'You' },
      { id: 't7', label: 'Upload the final resource PDFs to a hosting service (like Firebase Storage).', assignee: 'You'},
      { id: 't8', label: 'Update the Growth Kit page with the final download links for the PDFs.', assignee: 'You' }
    ]
  },
  {
    day: 'Wednesday',
    title: 'Mission: Monetization & Polish',
    icon: DollarSign,
    tasks: [
      { id: 'w1', label: 'Double-check that the webhooks are pointing to the correct URLs.', details: 'Your URLs will be `https://your-app-url.com/api/paypal/webhook` and `.../api/paystack/webhook`', assignee: 'You' },
      { id: 'w4', label: 'Final review of all public-facing text and images for polish.', assignee: 'You' }
    ]
  },
  {
    day: 'Thursday',
    title: 'Mission: Marketing & Pre-Launch Buzz',
    icon: Megaphone,
    tasks: [
      { id: 'mkt1', label: 'Create social media accounts (Facebook, Instagram, LinkedIn).', details: 'Use your new logo and a consistent brand voice.', assignee: 'You' },
      { id: 'mkt2', label: 'Design 5-10 "coming soon" social media posts using Canva.', details: 'Highlight key features: AI tools, directory, jobs board, etc.', assignee: 'You' },
      { id: 'mkt5', label: 'Secure 2 real testimonials from preschool owners.', details: 'Reach out to friendly local schools, offer them a free Growth Navigator plan for life in exchange for a powerful testimonial to feature on the homepage.', assignee: 'You' },
      { id: 'mkt3', label: 'Define your target audience funnels.', details: 'How will you attract Parents? (e.g., local Facebook groups). How will you attract Owners? (e.g., LinkedIn outreach). How will you attract Affiliates? (e.g., "make money online" communities).', assignee: 'You' },
      { id: 'mkt4', label: 'Prepare a launch day email announcement.', details: 'Write a compelling email for your waitlist and personal contacts.', assignee: 'You' }
    ]
  },
  {
    day: 'Friday',
    title: 'Mission: Final Checks & LAUNCH!',
    icon: Rocket,
    tasks: [
      { id: 'qa1', label: 'Test the full user journey: Sign up as a new "Preschool Owner".', assignee: 'You' },
      { id: 'qa2', label: 'Using PayPal/Paystack Sandbox, subscribe to a paid plan and confirm features unlock.', assignee: 'You' },
      { id: 'qa3', label: 'Sign up as a "Parent", send an inquiry, and confirm it is received on the owner dashboard.', assignee: 'You' },
      { id: 'f1', label: 'Switch payment API keys in .env from "Sandbox" to "Live" credentials.', assignee: 'You' },
      { id: 'f2', label: 'Run the final deployment command to publish the app.', assignee: 'You' },
      { id: 'f3', label: 'Celebrate! You\'ve launched NurseryNet!', details: "You did it! Time to celebrate this huge milestone and execute your marketing plan.", assignee: 'You' }
    ]
  }
];

const projectionData = {
  users: {
    title: "User Acquisition Goals (Monthly)",
    icon: UsersIcon,
    data: [
      { category: "Parents / Students (Free Tier)", nursery: "2,000", primary: "1,500", high: "1,000", tertiary: "500", total: "5,000" },
      { category: "Paying Institutions (Owners/Admins)", nursery: "100", primary: "75", high: "50", tertiary: "25", total: "250" },
      { category: "Job Seekers (Free Tier)", nursery: "500", primary: "300", high: "200", tertiary: "100", total: "1,100" },
    ],
    total: "6,350 Total Active Users"
  },
  revenue: {
    title: "Revenue Projections (Monthly)",
    icon: HandCoins,
    data: [
      { source: "Creative Canvas Subscriptions (R199/mo)", nursery: "R9,950 (50 users)", primary: "R5,970 (30 users)", high: "R3,980 (20 users)", tertiary: "R1,990 (10 users)", total: "R21,890" },
      { source: "Growth Navigator Subscriptions (R399/mo)", nursery: "R19,950 (50 users)", primary: "R17,955 (45 users)", high: "R11,970 (30 users)", tertiary: "R5,985 (15 users)", total: "R55,860" },
      { source: "Live Feed Access for Parents (R49/mo)", nursery: "R9,800 (200 users)", primary: "R7,350 (150 users)", high: "N/A", tertiary: "N/A", total: "R17,150" },
    ],
    total: "R94,900"
  },
  costs: {
    title: "Estimated Operational Costs (Monthly)",
    icon: DollarSign,
    data: [
      { item: "Server Hosting & Database (Firebase/Next.js)", cost: "R1,500" },
      { item: "Google AI API Usage (Moderate)", cost: "R2,000" },
      { item: "Email & WhatsApp API (Transactional)", cost: "R500" },
      { item: "Payment Gateway Fees (~3%)", cost: "R2,850" },
      { item: "Marketing & Advertising Spend", cost: "R5,000" },
    ],
    total: "R11,850"
  },
};

const AssigneeBadge = ({ assignee }: { assignee: Person }) => {
    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-semibold">
                <User className="w-4 h-4 mr-1.5" /> {assignee}
            </Badge>
        </div>
    );
};


export default function LaunchRoadmapPage() {
  const [tasksStatus, setTasksStatus] = useState<Record<string, boolean>>({});

  const handleTaskToggle = (taskId: string) => {
    setTasksStatus(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const monthlyProfit = 94900 - 11850;
  const annualProfit = monthlyProfit * 12;

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <header className="text-center mb-12 animate-slide-in-up">
            <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
                The Final Sprint: Launch NurseryNet!
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
                This is your personalized, week-long roadmap to get your entire ecosystem live. Let's do this!
            </p>
        </header>

        <section id="projections" className="mb-16">
           <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-10">
            Hypothetical Financial Projections (Illustrative)
          </h2>
          <div className="space-y-8">
            <Card className="shadow-xl glassmorphism">
               <CardHeader>
                  <CardTitle className="text-2xl text-primary flex items-center gap-3"><projectionData.revenue.icon className="w-7 h-7"/>{projectionData.revenue.title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>NurseryNet</TableHead>
                        <TableHead>PrimaryNet</TableHead>
                        <TableHead>HighschoolNet</TableHead>
                        <TableHead>TertiaryNet</TableHead>
                        <TableHead className="text-right font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectionData.revenue.data.map((row) => (
                        <TableRow key={row.source}>
                          <TableCell className="font-medium">{row.source}</TableCell>
                          <TableCell>{row.nursery}</TableCell>
                          <TableCell>{row.primary}</TableCell>
                          <TableCell>{row.high}</TableCell>
                          <TableCell>{row.tertiary}</TableCell>
                          <TableCell className="text-right">{row.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </CardContent>
                <CardFooter className="bg-primary/5 justify-end">
                    <p className="text-lg font-bold text-primary">Total Monthly Revenue: {projectionData.revenue.total}</p>
                </CardFooter>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-xl glassmorphism">
                  <CardHeader>
                      <CardTitle className="text-2xl text-primary flex items-center gap-3"><projectionData.costs.icon className="w-7 h-7"/>{projectionData.costs.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Table>
                        <TableBody>
                          {projectionData.costs.data.map((row) => (
                            <TableRow key={row.item}>
                              <TableCell className="font-medium">{row.item}</TableCell>
                              <TableCell className="text-right">{row.cost}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  </CardContent>
                   <CardFooter className="bg-primary/5 justify-end">
                        <p className="text-lg font-bold text-primary">Total Monthly Costs: {projectionData.costs.total}</p>
                    </CardFooter>
                </Card>

                <Card className="shadow-xl glassmorphism bg-green-500/10 border-green-600/30">
                  <CardHeader>
                      <CardTitle className="text-2xl text-green-700 flex items-center gap-3"><TrendingUp className="w-7 h-7"/>Net Profit Summary</CardTitle>
                      <CardDescription>This is a high-level estimate and does not account for taxes, salaries, or other variable expenses.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-center">
                    <div>
                      <p className="text-lg text-muted-foreground">Est. Monthly Net Profit</p>
                      <p className="text-5xl font-bold text-green-600">R{monthlyProfit.toLocaleString()}</p>
                    </div>
                     <div>
                      <p className="text-lg text-muted-foreground">Est. Annual Net Profit</p>
                      <p className="text-5xl font-bold text-green-600">R{annualProfit.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        </section>

        <section id="launch-checklist" className="space-y-8 mt-24">
             <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-10">
                Your 5-Day Launch Checklist
            </h2>
            {roadmapData.map((day) => (
                <Card key={day.day} className="shadow-xl glassmorphism animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary flex items-center">
                            <day.icon className="w-7 h-7 mr-3" />
                            {day.day} - {day.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {day.tasks.map((task, index) => (
                            <div key={task.id} className="p-4 bg-background/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
                                <div className="flex items-center flex-shrink-0">
                                    <Checkbox
                                        id={task.id}
                                        checked={tasksStatus[task.id] || false}
                                        onCheckedChange={() => handleTaskToggle(task.id)}
                                        className="h-6 w-6"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label
                                        htmlFor={task.id}
                                        className={cn(
                                            "text-lg font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                            tasksStatus[task.id] && "line-through text-muted-foreground"
                                        )}
                                    >
                                        {task.label}
                                    </label>
                                    {task.details && <p className="text-sm text-muted-foreground mt-1">{task.details}</p>}
                                </div>
                                <AssigneeBadge assignee={task.assignee} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </section>
      </div>
    </div>
  );
}
