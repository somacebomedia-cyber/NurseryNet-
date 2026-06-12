// src/app/(main)/hardware/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, HandCoins, Wifi, CheckCircle, ShieldCheck, Zap, Package, Gift, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const hardwareProducts = [
  {
    name: "NurseryNet Smart Overhead Scanner",
    image: "https://images.unsplash.com/photo-1629161141935-5cab66395eee",
    imageHint: "overhead document scanner",
    price: "R 2,899",
    badge: "Wi-Fi Connected",
    badgeIcon: Wifi,
    description: "The ultimate solution for high-volume scanning. This overhead scanner captures documents and artwork instantly without shadows or page-turning issues. Connects via Wi-Fi directly to the NurseryNet app for a seamless workflow.",
    features: [
      "Wi-Fi connected for wireless scanning",
      "Overhead design prevents page curl and shadows",
      "Ideal for books, delicate art, and stacked worksheets",
      "Auto-detects and crops documents",
      "High-speed capture for busy classrooms",
    ],
    ctaLink: "#",
  },
  {
    name: "NurseryNet Document Stand",
    image: "https://images.unsplash.com/photo-1589792942289-8d3b84054a36",
    imageHint: "document scanning stand smartphone",
    price: "R 549",
    badge: "Most Accessible",
    badgeIcon: HandCoins,
    description: "A budget-friendly and flexible way to digitize documents using any smartphone. This stand holds your phone steady for perfect, glare-free scans every time, integrating with the NurseryNet app.",
    features: [
      "Use any smartphone as a high-quality scanner",
      "Folds flat for easy storage",
      "Built-in, glare-free LED lighting",
      "Perfect for worksheets, artwork, and documents",
      "Connects seamlessly with the NurseryNet app",
    ],
    ctaLink: "#",
  },
];

export default function HardwarePage() {
  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <HardDrive className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            NurseryNet Hardware
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Supercharge your preschool with our fully integrated hardware solutions, designed to work seamlessly with the NurseryNet platform.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start justify-center">
          {hardwareProducts.map((product) => (
            <Card key={product.name} className="shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 glassmorphism w-full flex flex-col h-full max-w-sm mx-auto">
              <CardHeader className="items-center text-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  data-ai-hint={product.imageHint}
                  width={400}
                  height={400}
                  className="rounded-lg shadow-lg mb-4 w-full h-auto aspect-square object-cover"
                />
                 <Badge variant="secondary" className="bg-primary/10 text-primary py-1 px-4 text-sm font-semibold mb-2">
                    {product.badgeIcon && <product.badgeIcon className="h-4 w-4 mr-2" />}
                    {product.badge}
                </Badge>
                <CardTitle className="text-3xl text-primary">{product.name}</CardTitle>
                <p className="text-4xl font-bold text-foreground mt-2">{product.price}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-center mb-6">{product.description}</p>
                <div className="space-y-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500 shrink-0" />
                      <span className="text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6">
                <Button asChild size="lg" className="w-full text-lg">
                  <Link href={product.ctaLink}>
                    <Package className="mr-2 h-5 w-5"/>
                    Buy Now (Coming Soon)
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <section id="why-choose-us" className="mt-24 text-center">
             <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Why Choose NurseryNet Hardware?
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="p-6">
                    <Zap className="h-10 w-10 text-primary mx-auto mb-3"/>
                    <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
                    <p className="text-muted-foreground">Our hardware is built from the ground up to work perfectly with your NurseryNet dashboard. No complicated setup, no hassle.</p>
                </div>
                 <div className="p-6">
                    <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-3"/>
                    <h3 className="text-xl font-semibold mb-2">Unmatched Security</h3>
                    <p className="text-muted-foreground">From encrypted video streams to secure data transfer, we prioritize the safety of your school and your families' data.</p>
                </div>
                 <div className="p-6">
                    <Wifi className="h-10 w-10 text-primary mx-auto mb-3"/>
                    <h3 className="text-xl font-semibold mb-2">Plug & Play Simplicity</h3>
                    <p className="text-muted-foreground">We believe technology should be easy. Our devices are designed for quick, simple installation by anyone.</p>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
