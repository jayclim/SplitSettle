'use client';

import { Button } from './ui/button';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Globe,
  ShieldCheck,
  Smartphone,
  MessageCircle,
  Calculator,
  CheckCircle2,
  CreditCard,
  Wallet,
  DollarSign,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useUser } from '@clerk/nextjs';

function AuthButtons() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <Button 
        onClick={() => router.push('/dashboard')} 
        className="rounded-full px-6 bg-black hover:bg-slate-800 text-white"
      >
        Go to Dashboard
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" onClick={() => router.push('/sign-in')} className="font-medium">
        Log in
      </Button>
      <Button 
        onClick={() => router.push('/sign-up')} 
        className="rounded-full px-6 bg-black hover:bg-slate-800 text-white"
      >
        Get Started
      </Button>
    </>
  );
}

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">SplitSettle</span>
          </div>
          
          {/* <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-black transition-colors">Stories</a>
          </nav> */}

          <div className="flex items-center gap-4">
            <AuthButtons />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>AI-Powered Expense Splitting 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Split expenses as easily as <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">texting your friends.</span>
          </h1>
          
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            The first expense-sharing app that feels like a conversation. Add expenses with AI, chat with your group, and settle up with one tap.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Button 
              size="lg" 
              onClick={() => router.push('/sign-up')}
              className="rounded-full h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity"
            >
              Start Splitting Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* <Button 
              size="lg" 
              variant="outline"
              className="rounded-full h-14 px-8 text-lg border-2"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button> */}
          </div>
        </section>

        {/* 3-Column Features */}
        <section className="container mx-auto px-6 mb-32" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">All-in-One Expense Management</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-[2.5rem] bg-gradient-to-b from-blue-50 to-transparent border border-blue-100 hover:border-blue-200 transition-all duration-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Natural Chat</h3>
              <p className="text-slate-500 leading-relaxed">
                &quot;Dinner was $45 paid by me.&quot; Just type it in chat, and our AI handles the math instantly.
              </p>
            </div>

            <div className="group p-8 rounded-[2.5rem] bg-gradient-to-b from-violet-50 to-transparent border border-violet-100 hover:border-violet-200 transition-all duration-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Splitting</h3>
              <p className="text-slate-500 leading-relaxed">
                Complex splits made simple. Percentages, shares, or exact amounts—we handle it all.
              </p>
            </div>

            <div className="group p-8 rounded-[2.5rem] bg-gradient-to-b from-emerald-50 to-transparent border border-emerald-100 hover:border-emerald-200 transition-all duration-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Settlement</h3>
              <p className="text-slate-500 leading-relaxed">
                Settle debts with one tap using integrated payment links. No more awkward reminders.
              </p>
            </div>
          </div>
        </section>

        {/* 2x2 Grid Features */}
        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Modern Groups</h2>
            <p className="text-slate-500">Everything you need to manage shared expenses.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-orange-50/50 border border-orange-100 flex items-start gap-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Mobile First Design</h3>
                <p className="text-slate-500">Optimized for your phone. Snap receipts, split bills, and settle up on the go.</p>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-pink-50/50 border border-pink-100 flex items-start gap-6">
              <div className="p-3 bg-pink-100 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                <p className="text-slate-500">Your financial data is encrypted and secure. We prioritize your privacy.</p>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 flex items-start gap-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
                <p className="text-slate-500">Balances update instantly. Everyone sees the same numbers, always.</p>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-cyan-50/50 border border-cyan-100 flex items-start gap-6">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Globe className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Multi-currency</h3>
                <p className="text-slate-500">Traveling abroad? We automatically convert currencies for you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem/Integrations */}
        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Settle Up Your Way</h2>
            <p className="text-slate-500">Compatible with your favorite payment apps.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-xl"><CreditCard className="h-6 w-6" /> Venmo</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Wallet className="h-6 w-6" /> Cash App</div>
            <div className="flex items-center gap-2 font-bold text-xl"><DollarSign className="h-6 w-6" /> PayPal</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> Zelle</div>
          </div>
        </section>

        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Focus on the fun, we&apos;ll handle the math</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 overflow-hidden relative min-h-[400px]">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Intuitive Chat Interface</h3>
                <p className="text-slate-500 mb-8">Add expenses naturally as you chat. No clunky forms.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-white rounded-tl-3xl shadow-xl border border-slate-100 p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 text-sm w-2/3">
                      Paid $60 for groceries 🛒
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-purple-100"></div>
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 text-sm">
                      Got it! Split 3 ways?
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 overflow-hidden relative min-h-[400px]">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">What Our Users Say</h3>
                <p className="text-slate-500 mb-8">Hear from people who love SplitSettle.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-white rounded-tl-3xl shadow-xl border border-slate-100 p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <p className="text-gray-600 mb-4">&quot;SplitSettle has completely changed how we manage our apartment expenses. No more awkward conversations about money!&quot;</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <p className="font-semibold">Sarah J.</p>
                        <p className="text-sm text-gray-500">Roommate</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <p className="text-gray-600 mb-4">&quot;The best way to keep track of shared costs during trips. Highly recommended for any group travel.&quot;</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <p className="font-semibold">Mike T.</p>
                        <p className="text-sm text-gray-500">Traveler</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 mb-20">
          <div className="bg-black rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
              <p className="text-slate-400 text-lg mb-10">
                Join thousands of groups who have stopped fighting about money and started enjoying their time together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/sign-up')}
                  className="rounded-full h-14 px-8 text-lg bg-white text-black hover:bg-slate-200"
                >
                  Create Free Account
                </Button>
              </div>
            </div>
            
            {/* Decorative gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <span className="text-lg font-bold">SplitSettle</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                The modern way to track expenses, split bills, and settle debts with friends.
              </p>
            </div>
            
            {/* <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-black">Features</a></li>
                <li><a href="#" className="hover:text-black">Integrations</a></li>
                <li><a href="#" className="hover:text-black">Pricing</a></li>
                <li><a href="#" className="hover:text-black">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-black">About</a></li>
                <li><a href="#" className="hover:text-black">Careers</a></li>
                <li><a href="#" className="hover:text-black">Blog</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Stay Updated</h4>
              <p className="text-sm text-slate-500 mb-4">
                Subscribe to our newsletter for the latest updates.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" className="bg-black text-white hover:bg-slate-800">
                  Join
                </Button>
              </div>
            </div> */}
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2025 SplitSettle. All rights reserved. | designed and developed by{' '}
              <a href="https://jaydenclim.com" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                Jayden Lim
              </a>
            </p>
            {/* <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-black">Privacy Policy</a>
              <a href="#" className="hover:text-black">Terms of Service</a>
              <a href="#" className="hover:text-black">Cookies</a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}