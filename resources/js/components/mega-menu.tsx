import React, { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const items = [
    {
        id: 'products',
        title: 'Products',
        content: (
            <div className="p-6 w-[400px]">
                <h3 className="font-semibold text-lg mb-2">Products</h3>
                <p className="text-sm text-muted-foreground">Discover our amazing products that help you scale.</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-md shadow-sm border dark:border-[#3E3E3A]">Cloud Hosting</div>
                    <div className="bg-muted/50 p-4 rounded-md shadow-sm border dark:border-[#3E3E3A]">Database</div>
                    <div className="bg-muted/50 p-4 rounded-md shadow-sm border dark:border-[#3E3E3A]">Storage</div>
                    <div className="bg-muted/50 p-4 rounded-md shadow-sm border dark:border-[#3E3E3A]">Edge Functions</div>
                </div>
            </div>
        )
    },
    {
        id: 'solutions',
        title: 'Solutions',
        content: (
            <div className="p-6 w-[500px]">
                <h3 className="font-semibold text-lg mb-2">Solutions</h3>
                <p className="text-sm text-muted-foreground">Tailored solutions for your business needs.</p>
                <div className="mt-4 flex gap-4">
                    <div className="bg-muted/50 p-4 rounded-md flex-1 shadow-sm border dark:border-[#3E3E3A]">
                        <h4 className="font-medium mb-1">Enterprise</h4>
                        <p className="text-xs text-muted-foreground">High performance and SLA for large teams.</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md flex-1 shadow-sm border dark:border-[#3E3E3A]">
                        <h4 className="font-medium mb-1">Startups</h4>
                        <p className="text-xs text-muted-foreground">Affordable scaling for growing businesses.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'resources',
        title: 'Resources',
        content: (
            <div className="p-6 w-[300px]">
                <h3 className="font-semibold text-lg mb-2">Resources</h3>
                <ul className="space-y-3 mt-4 text-sm">
                    <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                </ul>
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
            
            // To prevent Radix CSS animations from conflicting, we override with GSAP
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
                {/* The Animated Hover Pill */}
                <div
                    ref={pillRef}
                    className="absolute left-0 top-1 bottom-1 rounded-md bg-black/5 dark:bg-white/10 pointer-events-none opacity-0"
                />
                
                {items.map((item, index) => (
                    <NavigationMenuItem key={item.id}>
                        <NavigationMenuTrigger
                            onMouseEnter={(e) => {
                                setHoveredNode(e.currentTarget);
                                setPrevIndex(activeIndex);
                                setActiveIndex(index);
                            }}
                            className="relative bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent px-4 py-2 text-sm font-medium"
                        >
                            {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent 
                            // We disable the default Radix slide-in classes using tailwind arbitrary variants 
                            // so GSAP can fully control the entry animation
                            className="data-[motion^=from-]:animate-none data-[motion^=to-]:animate-none"
                        >
                            {item.content}
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
