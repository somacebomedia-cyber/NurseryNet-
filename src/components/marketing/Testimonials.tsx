
"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"
import { useBrand } from '@/context/BrandContext';

const testimonialsData = {
  NurseryNet: [
    {
      name: "Thandiwe M.",
      role: "Parent",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
      dataAiHint: "mother smiling",
      text: "Finding the right preschool for our daughter felt overwhelming until we found NurseryNet. The detailed profiles and photos made it so easy to shortlist the best schools in our area. We found the perfect fit in just one weekend!"
    },
    {
      name: "David Chen",
      role: "Preschool Owner",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      dataAiHint: "man professional",
      text: "The AI tools are a game-changer. We generated a beautiful new logo and are now finding funding opportunities we never knew existed. NurseryNet is more than a directory; it's a true growth partner for our school."
    },
    {
      name: "Aisha Patel",
      role: "Job Seeker & Affiliate",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      dataAiHint: "woman happy",
      text: "The job board is so user-friendly. While I'm waiting to hear back on applications, I started sharing NurseryNet with schools I know. I've already earned real commissions through their affiliate program! It’s amazing to earn an income just by recommending a platform I believe in."
    }
  ],
  PrimaryNet: [
    {
      name: "Mr. Dlamini",
      role: "Primary School Principal",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop",
      dataAiHint: "school principal",
      text: "PrimaryNet's analytics dashboard gives us incredible insight into student performance and parent engagement. It has streamlined our reporting process and helped us make data-driven decisions for school improvement."
    },
    {
      name: "The Naidoo Family",
      role: "Parents",
      avatar: "https://images.unsplash.com/photo-1555952494-035d833b7653?w=100&h=100&fit=crop",
      dataAiHint: "family smiling",
      text: "Being able to track homework and see our son's grades in real-time through the parent portal has been fantastic. It makes supporting his learning journey so much easier. A huge step up in school communication."
    },
    {
      name: "Ms. Williams",
      role: "Grade 4 Teacher",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      dataAiHint: "teacher professional",
      text: "The AI grading assistant on PrimaryNet is a lifesaver. It handles the initial marking for multiple-choice and short-answer questions, freeing up hours of my time each week to focus on personalized feedback and lesson planning."
    }
  ],
  HighschoolNet: [
     {
      name: "James Anderson",
      role: "High School Student",
      avatar: "https://images.unsplash.com/photo-1577202214328-c04b77cefb5d?w=100&h=100&fit=crop",
      dataAiHint: "teenager student",
      text: "The AI career guidance tool was amazing. It analyzed my interests and grades and suggested career paths I'd never even considered. It's made choosing my final subjects much less stressful."
    },
    {
      name: "Dr. Evans",
      role: "School Counselor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
      dataAiHint: "woman counselor",
      text: "HighschoolNet's University Application Hub has centralized everything for our students. They can track deadlines, get AI feedback on their essays, and we can monitor their progress. It's an indispensable tool for our department."
    },
    {
      name: "Sarah Daniels",
      role: "Parent of a Matric Student",
      avatar: "https://images.unsplash.com/photo-1544717297-fa95b9ee9643?w=100&h=100&fit=crop",
      dataAiHint: "parent concerned",
      text: "Navigating the university application process was daunting. HighschoolNet gave my daughter the tools and confidence she needed. The AI essay feedback was particularly impressive and helpful."
    }
  ],
  TertiaryNet: [
    {
      name: "Priya Sharma",
      role: "Postgraduate Student",
      avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&h=100&fit=crop",
      dataAiHint: "female student",
      text: "The AI Research Assistant is like having a personal librarian available 24/7. It helps me find relevant papers, summarizes complex articles, and even checks my citations. It's saved me countless hours on my thesis."
    },
     {
      name: "Michael Johnson",
      role: "Career Services Director",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
      dataAiHint: "career director",
      text: "TertiaryNet's Corporate Partnership Portal has directly led to more internship and job placements for our graduates. It bridges the gap between academia and industry seamlessly."
    },
    {
      name: "Lerato Mokoena",
      role: "Final Year B.Com Student",
      avatar: "https://images.unsplash.com/photo-1610474232328-56836f43e46e?w=100&h=100&fit=crop",
      dataAiHint: "young student",
      text: "I built my entire CV using the AI builder and practiced for interviews with the prep tool. I landed a fantastic internship through a connection on the platform. TertiaryNet was crucial for my job search."
    }
  ]
};

const testimonialHeadlines = {
  NurseryNet: {
    title: "Loved by Our Community",
    subtitle: "Hear what parents, school owners, and job seekers are saying about NurseryNet."
  },
  PrimaryNet: {
    title: "Trusted by Educators & Families",
    subtitle: "See how principals, teachers, and parents are leveraging PrimaryNet for success."
  },
  HighschoolNet: {
    title: "Guiding the Next Generation",
    subtitle: "Discover how students, counselors, and parents are using HighschoolNet to prepare for the future."
  },
  TertiaryNet: {
    title: "Powering Academic & Career Success",
    subtitle: "Read how students and university staff are using TertiaryNet to achieve their goals."
  }
}

export default function Testimonials() {
  const { brand } = useBrand();
  const content = testimonialsData[brand] || testimonialsData.NurseryNet;
  const headlines = testimonialHeadlines[brand] || testimonialHeadlines.NurseryNet;

  return (
    <section className="w-full py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {headlines.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {headlines.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content.map((testimonial, index) => (
            <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 glassmorphism">
              <CardHeader className="pb-4">
                 <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <div className="relative">
                    <Quote className="absolute -top-2 -left-4 h-10 w-10 text-primary/10" />
                    <p className="relative text-foreground/80 italic z-10">&quot;{testimonial.text}&quot;</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
