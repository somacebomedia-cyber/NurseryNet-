
// src/app/(main)/terms/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg glassmorphism">
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-10 w-10 text-primary" />
                    <CardTitle className="text-3xl">Terms of Service</CardTitle>
                </div>
                <CardDescription>Last updated: June 22, 2024</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-foreground/90">
                <h2 className="text-primary font-headline">1. Agreement to Terms</h2>
                <p>By using our services, you agree to be bound by these Terms. If you don’t agree to be bound by these Terms, do not use the Services. These terms are a legal agreement between you and NurseryNet ("we," "us," or "our").</p>
                
                <h2 className="text-primary font-headline">2. Use of Services</h2>
                <p>You may use the Services only if you are not barred from using the Services under applicable law. You agree not to use the Services for any illegal or unauthorized purpose.</p>
                
                <h2 className="text-primary font-headline">3. Content</h2>
                <p>You are responsible for any content you provide, including compliance with applicable laws, rules, and regulations. You should only provide content that you are comfortable sharing with others. Any use or reliance on any content or materials posted via the Services or obtained by you through the Services is at your own risk.</p>

                <h2 className="text-primary font-headline">4. Termination</h2>
                <p>We may terminate or suspend your access to the Services at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                
                <p><em>This is a placeholder terms of service document. Please replace this content with your own official terms.</em></p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
