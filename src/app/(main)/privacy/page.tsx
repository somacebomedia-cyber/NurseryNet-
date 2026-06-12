
// src/app/(main)/privacy/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg glassmorphism">
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                    <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                </div>
                <CardDescription>Last updated: June 22, 2024</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-foreground/90">
                <p>Welcome to NurseryNet. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy sets out how we collect, use, and protect any information that you give us when you use this website.</p>
                
                <h2 className="text-primary font-headline">Information We Collect</h2>
                <p>We may collect the following information:</p>
                <ul>
                    <li>Name and contact information including email address and phone number.</li>
                    <li>For preschool owners, details about your institution such as name, location, and services offered.</li>
                    <li>Demographic information, preferences, and interests.</li>
                    <li>Other information relevant to customer surveys and/or offers.</li>
                </ul>

                <h2 className="text-primary font-headline">How We Use Your Information</h2>
                <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
                <ul>
                    <li>Internal record keeping.</li>
                    <li>To improve our products and services.</li>
                    <li>To customize the website according to your interests.</li>
                    <li>To facilitate the connection between parents and preschools.</li>
                </ul>

                <h2 className="text-primary font-headline">Security</h2>
                <p>We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.</p>
                
                <h2 className="text-primary font-headline">Controlling Your Personal Information</h2>
                <p>You may choose to restrict the collection or use of your personal information. If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us.</p>
                
                <p><em>This is a placeholder privacy policy. Please replace this content with your own official policy.</em></p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
