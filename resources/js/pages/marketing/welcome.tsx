import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Heart, Sparkles, HelpCircle, Menu, X, Server, Cpu, BookOpen } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import ApplicationLogo from '@/components/application-logo';
import { MegaMenu } from '@/components/mega-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Marquee from '@/components/ui/marquee';
import Star10 from '@/components/ui/stars/s10';
import Star15 from '@/components/ui/stars/s15';
import Star20 from '@/components/ui/stars/s20';
import Star22 from '@/components/ui/stars/s22';
import Star30 from '@/components/ui/stars/s30';
import Star33 from '@/components/ui/stars/s33';
import Star40 from '@/components/ui/stars/s40';
import Star8 from '@/components/ui/stars/s8';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Welcome to dyzulk Cloud" />
            
            <div className="min-h-screen bg-background text-foreground font-base selection:bg-main selection:text-main-foreground flex flex-col">
                
                {/* Header / Navbar */}
                <header className="sticky top-0 z-50 bg-secondary-background border-b-4 border-border px-6 py-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6 md:gap-8">
                            <Link href="/" className="flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform">
                                <ApplicationLogo className="h-7 w-auto text-[#1b1b18] dark:text-[#EDEDEC]" />
                                <span className="hidden sm:inline-block bg-main text-main-foreground font-heading font-bold text-xs px-2 py-0.5 border-2 border-border rounded-base shadow-shadow">
                                    v1.0
                                </span>
                            </Link>
                            <div className="hidden md:block">
                                <MegaMenu />
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild variant="default" size="sm" className="shadow-shadow font-heading font-bold">
                                    <Link href={dashboardUrl}>
                                        Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="neutral" size="sm" className="hidden sm:inline-flex shadow-shadow font-heading font-bold">
                                        <Link href={login()}>
                                            Log in
                                        </Link>
                                    </Button>
                                    <Button asChild variant="default" size="sm" className="shadow-shadow font-heading font-bold">
                                        <Link href={register()}>
                                            Register
                                        </Link>
                                    </Button>
                                </>
                            )}

                            {/* Mobile Menu Toggle Button */}
                            <Button 
                                variant="neutral" 
                                size="sm"
                                className="md:hidden p-2 shadow-shadow border-2 border-border"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </nav>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t-2 border-border space-y-3 bg-background p-4 rounded-base border-2 border-border shadow-shadow">
                            <div className="font-heading font-bold text-sm text-foreground mb-2">Navigation</div>
                            <div className="grid grid-cols-2 gap-2 text-sm font-base">
                                <a href="#products" className="p-2 bg-secondary-background border-2 border-border rounded-base shadow-shadow font-bold flex items-center gap-2">
                                    <Server className="h-4 w-4 text-main" /> Products
                                </a>
                                <a href="#solutions" className="p-2 bg-secondary-background border-2 border-border rounded-base shadow-shadow font-bold flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-main" /> Solutions
                                </a>
                                <a href="https://laravel.com/docs" target="_blank" rel="noreferrer" className="p-2 bg-secondary-background border-2 border-border rounded-base shadow-shadow font-bold flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-main" /> Docs
                                </a>
                                {!auth.user && (
                                    <Link href={login()} className="p-2 bg-secondary-background border-2 border-border rounded-base shadow-shadow font-bold flex items-center gap-2">
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                {/* SECTION 1: HERO SECTION */}
                <section className="relative px-6 py-20 md:py-32 overflow-hidden border-b-4 border-border">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] text-foreground/20 bg-[size:20px_20px] pointer-events-none" />
                    
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <Badge variant="neutral" className="border-2 border-border shadow-shadow">
                                <Sparkles className="h-3.5 w-3.5 mr-1 text-main" />
                                Next-Gen Cloud Platform
                            </Badge>
                            
                            <h1 className="text-4xl md:text-6xl font-heading leading-none">
                                Deploy apps in seconds, <br />
                                <span className="bg-main px-2 py-1 inline-block border-2 border-border shadow-shadow rotate-[-1deg] my-1">
                                    no complexity.
                                </span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-foreground/80 max-w-xl">
                                Robust multi-tenant application hosting with automatic SSL, instant CDN deployment, and zero configuration management.
                            </p>
                            
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                                <Button asChild size="lg" variant="default">
                                    <Link href={register()}>
                                        Start Hosting Free
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="neutral">
                                    <a href="https://laravel.com/docs" target="_blank" rel="noreferrer">
                                        Explore Docs
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center items-center relative">
                            {/* Giant Spinning Star Decorators */}
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-4 bg-main rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                
                                {/* Main big star */}
                                <Star20 color="var(--main)" stroke="var(--border)" strokeWidth={6} className="w-48 h-48 md:w-64 md:h-64 transition-transform duration-1000 ease-out hover:rotate-45 filter drop-shadow-[4px_4px_0px_#000000]" />
                                
                                {/* Smaller decorative stars floating around */}
                                <Star10 color="#ff6b6b" stroke="var(--border)" strokeWidth={6} className="absolute -top-10 -left-10 w-16 h-16 animate-pulse filter drop-shadow-[2px_2px_0px_#000000]" />
                                <Star30 color="#4dabf7" stroke="var(--border)" strokeWidth={6} className="absolute -bottom-6 -right-6 w-16 h-16 animate-bounce filter drop-shadow-[2px_2px_0px_#000000]" />
                                
                                <div className="absolute -top-6 right-6 bg-secondary-background border-2 border-border rounded-base p-2 shadow-shadow rotate-[12deg]">
                                    <span className="text-xs font-bold">100% Solid</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: FEATURES GRID */}
                <section className="px-6 py-20 bg-secondary-background border-b-4 border-border">
                    <div className="max-w-6xl mx-auto space-y-12">
                        <div className="text-center space-y-4 max-w-xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-heading">Engineered for Devs</h2>
                            <p className="text-foreground/70">
                                Standard developer workflows supercharged with robust neobrutalist power.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                             <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-base bg-main border-2 border-border flex items-center justify-center mb-2 shadow-shadow">
                                        <Star15 color="var(--main)" stroke="var(--border)" strokeWidth={6} className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Strict Security</CardTitle>
                                    <CardDescription>
                                        Zero-trust secure SSL/TLS Strict mode with automated cert management.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-foreground/80">
                                    Certificates are generated instantly and renewed automatically in the background using Let's Encrypt CA.
                                </CardContent>
                            </Card>

                            <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-base bg-main border-2 border-border flex items-center justify-center mb-2 shadow-shadow">
                                        <Star22 color="var(--main)" stroke="var(--border)" strokeWidth={6} className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">App Cluster Compute</CardTitle>
                                    <CardDescription>
                                        Isolated docker containers for maximum reliability and scalability.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-foreground/80">
                                    Every single deployment spins up clean container sandboxes running in private networks with dedicated metrics.
                                </CardContent>
                            </Card>

                            <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-base bg-main border-2 border-border flex items-center justify-center mb-2 shadow-shadow">
                                        <Star33 color="var(--main)" stroke="var(--border)" strokeWidth={6} className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Attached Databases</CardTitle>
                                    <CardDescription>
                                        Deploy in-memory caches, key-value, and Postgres databases instantly.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-foreground/80">
                                    Connect serverless Redis, Postgres, or Valkey databases directly to your active apps in a single click.
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: INTERACTIVE SHOWCASE & MARQUEE */}
                <section className="py-20 border-b-4 border-border">
                    <div className="space-y-16">
                        
                        {/* Marquee Row */}
                        <div className="border-y-4 border-border bg-main py-4 rotate-[1deg] shadow-shadow">
                            <Marquee items={[
                                "Deploy in seconds",
                                "Automatic SSL",
                                "Strictly Secure",
                                "Valkey & Redis Caching",
                                "In-Depth Metrics",
                                "WAF DDoS Protection"
                            ]} />
                        </div>

                        {/* Interactive Accordion QA */}
                        <div className="max-w-3xl mx-auto px-6 space-y-8 pt-8">
                            <div className="text-center space-y-2">
                                <div className="inline-block bg-secondary-background border-2 border-border p-2 rounded-full mb-2">
                                    <HelpCircle className="h-6 w-6 text-foreground" />
                                </div>
                                <h2 className="text-3xl font-heading">Frequently Asked</h2>
                            </div>

                            <Accordion type="single" collapsible className="border-2 border-border rounded-base bg-secondary-background shadow-shadow p-2">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="font-heading hover:bg-main/10 px-4 rounded-base">
                                        How does deployment work?
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 text-foreground/80 text-sm">
                                        Just hook up your Git repository or use our API. Our build server triggers, builds a container, sets up CDN rules, and deploys to the cluster.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="font-heading hover:bg-main/10 px-4 rounded-base">
                                        Are custom domains supported?
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 text-foreground/80 text-sm">
                                        Yes! You can attach any custom domains. We will automatically generate Strict SSL/TLS certificates and serve the domains from the Edge.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="font-heading hover:bg-main/10 px-4 rounded-base">
                                        What databases can I use?
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 text-foreground/80 text-sm">
                                        You can provision PostgreSQL, Redis, Valkey, and S3-compatible object storage. Everything is deployed securely inside your team cluster.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </section>

                {/* SECTION 4: CALL TO ACTION */}
                <section className="px-6 py-20 md:py-32 bg-background flex-1 flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                        <Card className="border-2 border-border shadow-shadow rounded-base bg-secondary-background p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
                            <div className="absolute top-4 right-4 animate-bounce">
                                <Star40 color="var(--main)" stroke="var(--border)" strokeWidth={6} className="w-10 h-10 filter-none animate-bounce" />
                            </div>
                            
                            <h2 className="text-3xl md:text-5xl font-heading leading-tight">
                                Ready to deploy? <br />
                                Join today.
                            </h2>
                            <p className="text-foreground/80 text-sm md:text-base max-w-md mx-auto">
                                Deploy your first application on our starter tier completely free of charge. No credit card required.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-md mx-auto pt-4">
                                <Input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="bg-background border-2 border-border shadow-none h-11"
                                />
                                <Button size="lg" className="h-11">
                                    Get Started
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t-4 border-border bg-secondary-background px-6 py-8">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/80">
                        <div className="flex items-center gap-2">
                            <Star8 color="var(--main)" stroke="var(--border)" strokeWidth={6} className="w-5 h-5 filter-none" />
                            <span className="font-heading">dyzulk.cloud</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Built with</span>
                            <Heart className="h-4 w-4 text-red-500 fill-red-500 inline" />
                            <span>and Laravel & React.</span>
                        </div>
                        <div className="text-xs text-foreground/60">
                            © {new Date().getFullYear()} dyzulk Cloud. All rights reserved.
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
