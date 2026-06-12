// src/app/(main)/contact/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-12 md:py-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Get In Touch
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
            We're here to help! Whether you have questions, feedback, or need support, please don't hesitate to reach out.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-2xl glassmorphism">
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center"><Send className="mr-2"/>Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Question about my profile" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} placeholder="Your message here..." />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  <Send className="mr-2 h-5 w-5"/> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <Card className="shadow-xl glassmorphism">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 mr-3 text-primary/80"/>
                  <a href="mailto:support@nurserynet.app" className="text-foreground hover:text-primary">support@nurserynet.app</a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 mr-3 text-primary/80"/>
                  <span className="text-foreground">(+27) 82 123 4567</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-3 text-primary/80 mt-1"/>
                  <span className="text-foreground">
                    123 Digital Avenue<br/>
                    Cape Town, Western Cape<br/>
                    South Africa
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xl glassmorphism overflow-hidden">
                <Image 
                    src="https://images.unsplash.com/photo-1594398932026-640f469a5ebe"
                    data-ai-hint="city map"
                    alt="Map showing office location"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
