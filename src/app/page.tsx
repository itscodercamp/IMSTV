
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Car, Users, ShieldCheck, Gem, BarChart, Tv, Palette, Search, IndianRupee, PieChart, Workflow, UserCheck, Smartphone, FileText, Globe, Loader2, User as UserIcon, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { translateContent, type TranslateContentOutput } from '@/ai/flows/translate-content';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const englishContent: TranslateContentOutput = {
    header: {
        home: "Home",
        features: "Features",
        yourWebsite: "Your Website",
        marketplace: "Marketplace",
        login: "Login",
        getStarted: "Get Started",
        getStartedCta: "Get Started"
    },
    hero: {
        title: "The Ultimate Dealership Management System",
        subtitle: "An all-in-one platform for Indian car dealers. Manage your inventory, staff, and leads with unparalleled efficiency, and sell more cars through your own website and our exclusive marketplace.",
        ctaPrimary: "Start Your Free Trial",
        ctaSecondary: "Explore Features"
    },
    pillars: {
        title: "One Platform, Complete Control, More Growth",
        subtitle: "Stop juggling multiple tools. IMS by Trusted Vehicles provides three powerful, integrated solutions to supercharge your dealership.",
        pillar1Title: "All-in-One IMS Software",
        pillar1Desc: "The heart of your operation. A powerful, intuitive dashboard to manage your entire dealership—from inventory and finances to employees and customer leads.",
        pillar2Title: "Your Personal Dealership Website",
        pillar2Desc: "Establish your brand online with a stunning, SEO-optimized website that automatically syncs with your inventory, capturing leads directly for you.",
        pillar3Title: "Indian Legal Dealer Marketplace",
        pillar3Desc: "The future of car sales. A commission-free marketplace connecting you exclusively with genuine, verified buyers. No fraud, just business."
    },
    productivity: {
        title: "How We Boost Your Productivity",
        subtitle: "Our Inventory Management System is designed to simplify your daily operations and give you back your most valuable asset: time. Here’s how."
    },
    dealerPortal: {
        title: "For the Dealer: Your Command Center",
        subtitle: "The Dealer Portal gives you a bird's-eye view of your entire business, empowering you to make smarter, data-driven decisions.",
        feature1: "Powerful Dashboard:",
        feature1Desc: "Instantly see your total stock value, vehicles sold, profit margins, and active leads. Track aging inventory to move stock faster.",
        feature2: "Effortless Inventory Management:",
        feature2Desc: "Add, edit, and track every vehicle with detailed information, images, and financial data. Know the status of your stock (For Sale, Sold, Refurbishment) at a glance.",
        feature3: "Complete Employee Management:",
        feature3Desc: "Onboard new staff, manage their profiles, set login credentials for their personal portal, and handle salary slips, all in one place.",
        feature4: "Centralized Lead & Salary Hub:",
        feature4Desc: "Monitor all incoming leads from your entire team and manage monthly payroll with our simple salary slip generator."
    },
    employeePortal: {
        title: "For Your Employees: A Tool for Success",
        subtitle: "Empower your sales team with their own dedicated portal, designed to make their job easier and more efficient.",
        feature1: "Secure Personal Login:",
        feature1Desc: "Every employee gets their own login, giving them access to the tools they need without overwhelming them with unnecessary information.",
        feature2: "Streamlined Lead Capture:",
        feature2Desc: "Your team can quickly add new customer leads. They can link a lead to a car in your inventory or add details for a vehicle a customer wants you to source.",
        feature3: "Focused Lead Management:",
        feature3Desc: "The \"My Leads\" tab shows each employee only the leads they are responsible for, helping them stay organized and follow up effectively.",
        feature4: "Easy Access to Information:",
        feature4Desc: "Employees can view their own profile, track their recent leads, and see their monthly salary slips."
    },
    personalWebsite: {
        badge: "EXCLUSIVE OFFER",
        title: "Get Your Own Professional Dealership Website",
        subtitle: "Stop relying only on social media and third-party platforms. Build your own brand and credibility with a personal website that's fully integrated with your inventory. All for just",
        annualFee: "₹999 + GST annually.",
        benefit1: "Automatic Inventory Sync",
        benefit1Desc: "Your website is always up-to-date. Any vehicle you add to your IMS is automatically listed on your site.",
        benefit2: "Customizable Themes",
        benefit2Desc: "Choose a design that matches your brand identity. Present a professional image that stands out from the competition.",
        benefit3: "Free SEO",
        benefit3Desc: "We optimize your website to rank higher on search engines like Google, bringing you more organic customers for free."
    },
    marketplace: {
        badge: "INDUSTRY FIRST",
        title: "Join the Indian Legal Dealer Marketplace",
        subtitle: "Say goodbye to fraudulent buyers, high commissions, and endless negotiations. Our marketplace connects you with genuine, verified customers at an unbeatable price:",
        listingFee: "₹59 per listing.",
        benefit1: "Genuine Customers Only",
        benefit1Desc: "We verify every buyer to ensure you only deal with serious, legitimate customers who are ready to purchase.",
        benefit2: "Zero Commission on Sales",
        benefit2Desc: "You keep 100% of your profit. We charge a small, flat listing fee, not a percentage of your",
        hardEarnedSale: "hard-earned sale."
    },
    security: {
        title: "Your Data, Safe and Secure",
        subtitle: "We understand that your business data is your most valuable asset. We use industry-standard security protocols and robust database management to ensure your dealership's data, employee information, and customer leads are always protected. Your privacy and security are our top priority. You own your data, always."
    },
    finalCta: {
        title: "Ready to Transform Your Dealership?",
        subtitle: "Join dozens of dealers across India who are managing their business smarter, faster, and more profitably with IMS.",
        cta: "Sign Up Now - It's Free to Start"
    },
    footer: {
        copyright: "© {new_date} Trusted Vehicles. All rights reserved.",
        login: "Login",
        register: "Register"
    }
};

type LanguageOption = 'English' | 'Hindi' | 'Marathi' | 'Roman Hindi' | 'Roman Marathi';

export default function ShowcasePage() {
    const { setTheme } = useTheme();
    const [content, setContent] = React.useState(englishContent);
    const [isTranslating, setIsTranslating] = React.useState(false);

    React.useEffect(() => {
        setTheme('light');
    }, [setTheme]);

    const handleTranslate = async (language: LanguageOption) => {
        if (language === 'English') {
            setContent(englishContent);
            return;
        }
        setIsTranslating(true);
        try {
            const translatedContent = await translateContent({
                content: englishContent,
                targetLanguage: language,
            });
            setContent(translatedContent);
        } catch (error) {
            console.error("Translation failed:", error);
            // Optionally, show a toast notification to the user
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="w-full bg-background text-foreground font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        <span className="text-lg md:text-xl font-bold text-foreground">IMS by <span className="text-primary">Trusted Vehicles</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">{content.header.home}</Link>
                        <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{content.header.features}</Link>
                        <Link href="#website" className="text-muted-foreground hover:text-foreground transition-colors">{content.header.yourWebsite}</Link>
                        <Link href="#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">{content.header.marketplace}</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isTranslating}>
                                    {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5" />}
                                    <span className="sr-only">Change Language</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleTranslate('English')}>English</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleTranslate('Roman Hindi')}>Roman Hindi</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTranslate('Roman Marathi')}>Roman Marathi</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleTranslate('Hindi')}>हिंदी (Hindi)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTranslate('Marathi')}>मराठी (Marathi)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                         <Button variant="ghost" asChild>
                            <Link href="/login">
                                <UserIcon className="mr-2 h-4 w-4" />
                                {content.header.login}
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section className="relative py-16 md:py-28">
                     <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div>
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary-rgb),0.1),rgba(255,255,255,0))]"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                                {content.hero.title.split(' ').slice(0,3).join(' ')} <span className="text-primary">{content.hero.title.split(' ').slice(3).join(' ')}</span>
                            </h1>
                            <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
                                {content.hero.subtitle}
                            </p>
                            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" asChild>
                                    <Link href="/login">
                                        Login to Get Started
                                        <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="#features">{content.hero.ctaSecondary}</Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
                
                 {/* Main Pillars Section */}
                <section className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{content.pillars.title}</h2>
                            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{content.pillars.subtitle}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-4 md:p-6">
                                <div className="flex justify-center mb-4"><BarChart className="h-10 w-10 text-primary"/></div>
                                <h3 className="text-lg md:text-xl font-semibold">{content.pillars.pillar1Title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{content.pillars.pillar1Desc}</p>
                            </div>
                             <div className="p-4 md:p-6">
                               <div className="flex justify-center mb-4"><Tv className="h-10 w-10 text-primary"/></div>
                                <h3 className="text-lg md:text-xl font-semibold">{content.pillars.pillar2Title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{content.pillars.pillar2Desc}</p>
                            </div>
                            <div className="p-4 md:p-6">
                                <div className="flex justify-center mb-4"><Gem className="h-10 w-10 text-primary"/></div>
                                <h3 className="text-lg md:text-xl font-semibold">{content.pillars.pillar3Title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{content.pillars.pillar3Desc}</p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Features Section */}
                <section id="features" className="py-16 md:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{content.productivity.title}</h2>
                            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{content.productivity.subtitle}</p>
                        </div>

                        {/* Dealer Portal Features */}
                        <div className="mt-12 p-4 md:p-8 rounded-xl bg-card border flex flex-col md:flex-row-reverse items-center gap-8">
                             <div className="w-full md:w-1/2">
                                <h3 className="text-xl md:text-2xl font-bold text-foreground">{content.dealerPortal.title}</h3>
                                <p className="mt-2 text-muted-foreground text-sm">{content.dealerPortal.subtitle}</p>
                                <ul className="mt-4 space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <PieChart className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.dealerPortal.feature1}</strong> {content.dealerPortal.feature1Desc}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Car className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.dealerPortal.feature2}</strong> {content.dealerPortal.feature2Desc}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Users className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.dealerPortal.feature3}</strong> {content.dealerPortal.feature3Desc}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <IndianRupee className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.dealerPortal.feature4}</strong> {content.dealerPortal.feature4Desc}</span>
                                    </li>
                                </ul>
                             </div>
                             <div className="w-full md:w-1/2">
                                <Image 
                                    src="https://placehold.co/600x400.png"
                                    alt="Dealer Dashboard"
                                    width={600}
                                    height={400}
                                    className="rounded-lg shadow-lg"
                                    data-ai-hint="dashboard screen"
                                />
                             </div>
                        </div>

                         {/* Employee Portal Features */}
                        <div className="mt-8 p-4 md:p-8 rounded-xl bg-card border flex flex-col md:flex-row items-center gap-8">
                             <div className="w-full md:w-1/2">
                                <h3 className="text-xl md:text-2xl font-bold text-foreground">{content.employeePortal.title}</h3>
                                <p className="mt-2 text-muted-foreground text-sm">{content.employeePortal.subtitle}</p>
                                <ul className="mt-4 space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <Smartphone className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.employeePortal.feature1}</strong> {content.employeePortal.feature1Desc}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <UserCheck className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.employeePortal.feature2}</strong> {content.employeePortal.feature2Desc}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Workflow className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.employeePortal.feature3}</strong> {content.employeePortal.feature3Desc}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                                        <span><strong className="font-semibold text-foreground">{content.employeePortal.feature4}</strong> {content.employeePortal.feature4Desc}</span>
                                    </li>
                                </ul>
                             </div>
                             <div className="w-full md:w-1/2">
                                <Image 
                                    src="https://placehold.co/600x400.png"
                                    alt="Employee Portal"
                                    width={600}
                                    height={400}
                                    className="rounded-lg shadow-lg"
                                    data-ai-hint="mobile app screen"
                                />
                             </div>
                        </div>

                    </div>
                </section>

                {/* Personal Website Section */}
                 <section id="website" className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                             <div className="w-full md:w-1/2">
                                <Image 
                                    src="https://placehold.co/600x400.png"
                                    alt="Personal Website for Dealer"
                                    width={600}
                                    height={400}
                                    className="rounded-lg shadow-lg"
                                    data-ai-hint="website screenshot"
                                />
                             </div>
                              <div className="w-full md:w-1/2">
                                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{content.personalWebsite.badge}</Badge>
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{content.personalWebsite.title}</h2>
                                <p className="mt-4 text-muted-foreground text-sm md:text-base">{content.personalWebsite.subtitle} <span className="font-bold text-foreground">{content.personalWebsite.annualFee}</span></p>
                                <div className="mt-6 space-y-3">
                                   <div className="flex items-start gap-4 p-4 rounded-lg">
                                        <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                            <Workflow className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{content.personalWebsite.benefit1}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{content.personalWebsite.benefit1Desc}</p>
                                        </div>
                                    </div>
                                   <div className="flex items-start gap-4 p-4 rounded-lg">
                                        <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                            <Palette className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{content.personalWebsite.benefit2}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{content.personalWebsite.benefit2Desc}</p>
                                        </div>
                                    </div>
                                   <div className="flex items-start gap-4 p-4 rounded-lg">
                                        <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                            <Search className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{content.personalWebsite.benefit3}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{content.personalWebsite.benefit3Desc}</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                 {/* Marketplace Section */}
                <section id="marketplace" className="py-16 md:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
                              <div className="w-full md:w-1/2">
                                <Badge className="mb-3 bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20">{content.marketplace.badge}</Badge>
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{content.marketplace.title}</h2>
                                <p className="mt-4 text-muted-foreground text-sm md:text-base">{content.marketplace.subtitle} <span className="font-bold text-foreground">{content.marketplace.listingFee}</span>.</p>
                                <div className="mt-6 space-y-3">
                                   <div className="flex items-start gap-4 p-4 rounded-lg">
                                        <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                            <UserCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{content.marketplace.benefit1}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{content.marketplace.benefit1Desc}</p>
                                        </div>
                                    </div>
                                   <div className="flex items-start gap-4 p-4 rounded-lg">
                                        <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                            <IndianRupee className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{content.marketplace.benefit2}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{content.marketplace.benefit2Desc} <span className="text-green-600 font-semibold">{content.marketplace.hardEarnedSale}</span></p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             <div className="w-full md:w-1/2">
                                <Image 
                                    src="https://placehold.co/600x400.png"
                                    alt="Dealer Marketplace"
                                    width={600}
                                    height={400}
                                    className="rounded-lg shadow-lg"
                                    data-ai-hint="marketplace cars"
                                />
                             </div>
                        </div>
                    </div>
                </section>

                 {/* Security Section */}
                 <section className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                             <div className="flex justify-center mb-4">
                                <ShieldCheck className="h-12 w-12 text-green-500"/>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{content.security.title}</h2>
                            <p className="mt-4 text-muted-foreground text-sm md:text-base">
                               {content.security.subtitle}
                            </p>
                        </div>
                    </div>
                </section>


                {/* CTA Section */}
                <section className="py-16 md:py-20 bg-primary/90 text-primary-foreground">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold">{content.finalCta.title}</h2>
                        <p className="mt-4 max-w-xl mx-auto text-sm md:text-base">
                           {content.finalCta.subtitle}
                        </p>
                        <div className="mt-8">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/login">
                                    Login Now <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-card border-t">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="h-6 w-6 text-primary" />
                           <span className="text-base font-semibold">IMS by Trusted Vehicles</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 md:mt-0">
                           {content.footer.copyright.replace('{new_date}', new Date().getFullYear().toString())}
                        </p>
                         <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">{content.footer.login}</Link>
                            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">{content.footer.register}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
