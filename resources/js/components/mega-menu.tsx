import { ArrowUpRight, BookOpen, Cpu, Database, FileText, HardDrive, Server, ShieldCheck, Users, Zap } from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { gsap, useGSAP } from '@/lib/gsap';

const items = [
    {
        id: 'products',
        title: 'Products',
        content: (
            <div className="p-6 w-[420px] bg-background text-foreground">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-bold text-lg">Products</h3>
                    <span className="text-xs bg-main text-main-foreground font-bold px-2 py-0.5 border-2 border-border rounded-base shadow-shadow">Compute & Storage</span>
                </div>
                <p className="text-sm text-foreground/80 font-base mb-4">Discover high-performance cloud tools to deploy and scale instantly.</p>
                <div className="grid grid-cols-2 gap-3">
                    <a href="#products" className="group bg-secondary-background p-3 rounded-base border-2 border-border shadow-shadow hover:-translate-y-0.5 transition-transform block">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-main border-2 border-border rounded-base">
                                <Server className="h-4 w-4 text-main-foreground" />
                            </div>
                            <span className="font-heading font-bold text-sm group-hover:underline">Cloud Hosting</span>
                        </div>
                        <p className="text-xs text-foreground/70">Docker sandboxes with zero-downtime.</p>
                    </a>
                    <a href="#products" className="group bg-secondary-background p-3 rounded-base border-2 border-border shadow-shadow hover:-translate-y-0.5 transition-transform block">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-main border-2 border-border rounded-base">
                                <Database className="h-4 w-4 text-main-foreground" />
                            </div>
                            <span className="font-heading font-bold text-sm group-hover:underline">Databases</span>
                        </div>
                        <p className="text-xs text-foreground/70">Managed Postgres & Redis instances.</p>
                    </a>
                    <a href="#products" className="group bg-secondary-background p-3 rounded-base border-2 border-border shadow-shadow hover:-translate-y-0.5 transition-transform block">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-main border-2 border-border rounded-base">
                                <HardDrive className="h-4 w-4 text-main-foreground" />
                            </div>
                            <span className="font-heading font-bold text-sm group-hover:underline">S3 Storage</span>
                        </div>
                        <p className="text-xs text-foreground/70">High speed object storage buckets.</p>
                    </a>
                    <a href="#products" className="group bg-secondary-background p-3 rounded-base border-2 border-border shadow-shadow hover:-translate-y-0.5 transition-transform block">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-main border-2 border-border rounded-base">
                                <Cpu className="h-4 w-4 text-main-foreground" />
                            </div>
                            <span className="font-heading font-bold text-sm group-hover:underline">Edge Functions</span>
                        </div>
                        <p className="text-xs text-foreground/70">Serverless JS/Wasm global workers.</p>
                    </a>
                </div>
            </div>
        )
    },
    {
        id: 'solutions',
        title: 'Solutions',
        content: (
            <div className="p-6 w-[480px] bg-background text-foreground">
                <h3 className="font-heading font-bold text-lg mb-1">Solutions</h3>
                <p className="text-sm text-foreground/80 font-base mb-4">Tailored infrastructure built for speed and security.</p>
                <div className="flex gap-4">
                    <a href="#solutions" className="group bg-secondary-background p-4 rounded-base flex-1 border-2 border-border shadow-shadow hover:-translate-y-0.5 transition-transform block">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-1.5 bg-main border-2 border-border rounded-base">
                                <ShieldCheck className="h-4 w-4 text-main-foreground" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-foreground/50 group-hover:text-foreground transition-colors" />
                        </div>
                        <h4 className="font-heading font-bold text-base mb-1 group-hover:underline">Enterprise SLA</h4>
                        <p className="text-xs text-foreground/70">Isolated nodes, custom VPC, 99.99% uptime guarantee, and 24/7 dedicated support.</p>
                    </a>
                    <a href="#solutions" className="group bg-secondary-background p-4 rounded-base flex-1 border-2 border-border shadow-shadow hover:-translate-y-0.5 transition-transform block">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-1.5 bg-main border-2 border-border rounded-base">
                                <Zap className="h-4 w-4 text-main-foreground" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-foreground/50 group-hover:text-foreground transition-colors" />
                        </div>
                        <h4 className="font-heading font-bold text-base mb-1 group-hover:underline">Startup Launch</h4>
                        <p className="text-xs text-foreground/70">Generous free tier, automated SSL, and instant GitHub continuous integration.</p>
                    </a>
                </div>
            </div>
        )
    },
    {
        id: 'resources',
        title: 'Resources',
        content: (
            <div className="p-6 w-[340px] bg-background text-foreground">
                <h3 className="font-heading font-bold text-lg mb-1">Resources</h3>
                <p className="text-xs text-foreground/70 mb-3">Guides, documentation, and community.</p>
                <div className="space-y-2 font-base">
                    <a href="https://laravel.com/docs" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-base bg-secondary-background border-2 border-border shadow-shadow hover:translate-x-1 transition-transform">
                        <div className="p-1 bg-main border-2 border-border rounded-base">
                            <BookOpen className="h-4 w-4 text-main-foreground" />
                        </div>
                        <div>
                            <div className="font-heading font-bold text-xs">Documentation</div>
                            <div className="text-[11px] text-foreground/70">API references & guides</div>
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 p-2 rounded-base bg-secondary-background border-2 border-border shadow-shadow hover:translate-x-1 transition-transform">
                        <div className="p-1 bg-main border-2 border-border rounded-base">
                            <FileText className="h-4 w-4 text-main-foreground" />
                        </div>
                        <div>
                            <div className="font-heading font-bold text-xs">Blog & Updates</div>
                            <div className="text-[11px] text-foreground/70">Latest features & changelog</div>
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 p-2 rounded-base bg-secondary-background border-2 border-border shadow-shadow hover:translate-x-1 transition-transform">
                        <div className="p-1 bg-main border-2 border-border rounded-base">
                            <Users className="h-4 w-4 text-main-foreground" />
                        </div>
                        <div>
                            <div className="font-heading font-bold text-xs">Community</div>
                            <div className="text-[11px] text-foreground/70">Join Discord & forum</div>
                        </div>
                    </a>
                </div>
            </div>
        )
    }
];

export function MegaMenu() {
    const [hoveredNode, setHoveredNode] = useState<HTMLElement | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [prevIndex, setPrevIndex] = useState<number | null>(null);
    
    const listRef = useRef<HTMLUListElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);

    // GSAP Hover Pill Animation
    useGSAP(() => {
        if (!pillRef.current) {
            return;
        }
        
        if (hoveredNode && listRef.current) {
            const listRect = listRef.current.getBoundingClientRect();
            const triggerRect = hoveredNode.getBoundingClientRect();
            const offsetLeft = triggerRect.left - listRect.left;
            const offsetWidth = triggerRect.width;
            
            gsap.to(pillRef.current, {
                x: offsetLeft,
                width: offsetWidth,
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        } else {
            gsap.to(pillRef.current, {
                opacity: 0,
                duration: 0.2,
            });
        }
    }, [hoveredNode]);

    // GSAP Directional Content Sliding
    useGSAP(() => {
        if (activeIndex !== null && prevIndex !== null && activeIndex !== prevIndex) {
            const isRight = activeIndex > prevIndex;
            
            gsap.fromTo(
                "[data-slot='navigation-menu-viewport']",
                { x: isRight ? 20 : -20 },
                { x: 0, duration: 0.3, ease: 'power2.out' }
            );
        }
    }, [activeIndex, prevIndex]);

    return (
        <NavigationMenu
            onMouseLeave={() => {
                setHoveredNode(null);
                setPrevIndex(activeIndex);
                setActiveIndex(null);
            }}
            className="hidden lg:flex"
        >
            <NavigationMenuList ref={listRef} className="relative p-1">
                {/* The Neobrutalist Animated Hover Pill */}
                <div
                    ref={pillRef}
                    className="absolute left-0 top-1 bottom-1 rounded-base border-2 border-border bg-main shadow-shadow pointer-events-none opacity-0"
                />
                
                {items.map((item, index) => (
                    <NavigationMenuItem key={item.id}>
                        <NavigationMenuTrigger
                            onMouseEnter={(e) => {
                                setHoveredNode(e.currentTarget);
                                setPrevIndex(activeIndex);
                                setActiveIndex(index);
                            }}
                            className="relative bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent px-4 py-2 text-sm font-heading font-bold text-foreground"
                        >
                            {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent 
                            className="data-[motion^=from-]:animate-none data-[motion^=to-]:animate-none border-2 border-border rounded-base shadow-shadow overflow-hidden"
                        >
                            {item.content}
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
