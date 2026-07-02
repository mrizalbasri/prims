'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight, CirclePlay } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Features', href: '#link' },
  { name: 'Pricing', href: '#link' },
  { name: 'About', href: '#link' },
]

export default function Hero() {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Header */}
      <header>
        <nav
          data-state={menuState ? 'active' : undefined}
          className={cn(
            'fixed z-20 w-full transition-all duration-300',
            isScrolled && 'bg-background/75 border-b border-black/5 backdrop-blur-lg'
          )}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0">
              <div className="flex w-full justify-between gap-6 lg:w-auto">
                <Link href="/" aria-label="home" className="flex items-center space-x-2">
                </Link>

                <button
                  onClick={() => setMenuState((s) => !s)}
                  aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>

                <div className="m-auto hidden size-fit lg:block">
                  <ul className="flex gap-1">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={item.href} className="text-base">
                            <span>{item.name}</span>
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="lg:hidden">
                  <ul className="space-y-6 text-base">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(isScrolled && 'lg:hidden')}
                  >
                    <Link href="#">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className={cn(isScrolled && 'lg:hidden')}>
                    <Link href="#">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                  >
                    <Link href="#">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="overflow-hidden">
        <section className="bg-linear-to-b to-muted from-background">
          <div className="relative py-12 md:py-20">
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
              <div className="md:w-[48%]">
                <div>
                  <h1 className={cn(
                    "max-w-xl text-balance text-5xl font-medium md:text-6xl transform transition-all duration-700 ease-out",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}>
                    Simple payments for startups
                  </h1>
                  <p className={cn(
                    "text-muted-foreground my-8 max-w-2xl text-balance text-xl transform transition-all duration-700 delay-150 ease-out",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}>
                    One tool that does it all. Search, generate, analyze, and chat—right inside
                    Tailark.
                  </p>

                  <div className={cn(
                    "flex items-center gap-3 transform transition-all duration-700 delay-300 ease-out",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}>
                    <Button asChild size="lg" className="pr-4.5">
                      <Link href="#link">
                        <span className="text-nowrap">Get Started</span>
                        <ChevronRight className="opacity-50" />
                      </Link>
                    </Button>
                    <Button key={2} asChild size="lg" variant="outline" className="pl-5">
                      <Link href="#link">
                        <CirclePlay className="fill-primary/25 stroke-primary" />
                        <span className="text-nowrap">Watch video</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className={cn(
                  "mt-10 transform transition-all duration-700 delay-450 ease-out",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                  <p className="text-muted-foreground">Trusted by teams at :</p>
                  <div className="mt-6 grid max-w-sm grid-cols-3 gap-6">
                    <div className="flex">
                      <img
                        className="h-4 w-fit"
                        src="https://html.tailus.io/blocks/customers/column.svg"
                        alt="Column Logo"
                        height="16"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="h-5 w-fit"
                        src="https://html.tailus.io/blocks/customers/nvidia.svg"
                        alt="Nvidia Logo"
                        height="20"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="h-4 w-fit"
                        src="https://html.tailus.io/blocks/customers/github.svg"
                        alt="GitHub Logo"
                        height="16"
                        width="auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              "perspective-near mt-24 md:absolute md:-right-6 md:bottom-20 md:left-[55%] md:top-20 md:mt-0 transform transition-all duration-1000 delay-300 ease-out",
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            )}>
              <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
                <div className="bg-background rounded-(--radius) shadow-foreground/10 ring-foreground/5 relative h-full skew-x-6 overflow-hidden border border-transparent shadow-md ring-1">
                  <img
                    src="https://tailark.com/_next/image?url=%2Fmist%2Ftailark.png&w=3840&q=75"
                    alt="app screen"
                    className="object-top-left size-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
