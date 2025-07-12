'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, MessageCircle, Calculator, Smartphone, Users, Zap, ArrowRight, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LandingPage() {
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);

  const demoSteps = [
    {
      title: "AI Expense Input",
      description: "I paid $45 for tacos for me, Ben, and Chloe",
      result: "✨ Parsed: $45 split 3 ways ($15 each)"
    },
    {
      title: "Group Chat Integration",
      description: "Expenses appear naturally in your conversations",
      result: "💬 Seamless messaging + expense tracking"
    },
    {
      title: "Smart Balances",
      description: "You owe $12, You're owed $28",
      result: "📊 Real-time balance calculations"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Logging",
      description: "Just describe your expense in plain English and let AI handle the rest"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Social Interface",
      description: "Chat with friends while tracking expenses in one seamless experience"
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Smart Splitting",
      description: "Automatic calculations with support for equal, custom, and percentage splits"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile First",
      description: "Designed for your phone with voice input and camera receipt scanning"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      avatar: "SC",
      quote: "Finally, an expense app that doesn't feel like work. The AI feature is magic!"
    },
    {
      name: "Mike Rodriguez",
      avatar: "MR",
      quote: "Our roommate group loves how easy it is to just text about expenses."
    },
    {
      name: "Emma Thompson",
      avatar: "ET",
      quote: "Best app for group trips. No more awkward money conversations!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-white/20 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SplitSettle
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/auth/login')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/auth/register')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Try It Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Expense Sharing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Split expenses as easily as texting your friends
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The first expense-sharing app that feels like a conversation. Add expenses with AI,
            chat with your group, and settle up with one tap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6"
            >
              Try It Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 hover:bg-white/50"
            >
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See SplitSettle in Action</h2>
            <p className="text-gray-600">Click through our interactive demo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeDemo === index
                      ? 'ring-2 ring-blue-500 bg-blue-50/50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveDemo(index)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  {activeDemo === index && (
                    <CardContent className="pt-0">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-700 font-medium">{step.result}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Magic in Action</h3>
                <p className="opacity-90">Watch expenses get parsed automatically</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SplitSettle?</h2>
            <p className="text-gray-600">Built for the way you actually share expenses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Groups Everywhere</h2>
            <p className="text-gray-600">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">{testimonial.name}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Group Expenses?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of groups who've made expense sharing effortless
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SplitSettle
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:text-blue-600">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}