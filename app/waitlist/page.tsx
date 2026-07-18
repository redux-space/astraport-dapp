'use client';

import React, { useState } from 'react';
import ThemeToggle from '../../components/ThemeToggle';

interface WaitlistFormData {
  email: string;
  username: string;
  isPremium: boolean;
}

interface FormErrors {
  email?: string;
  username?: string;
}

const WaitlistPage = () => {
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: '',
    username: '',
    isPremium: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const premiumFeatures = [
    {
      icon: '🚀',
      title: 'Priority Access',
      description: 'Be among the first 100 users to access the full platform',
    },
    {
      icon: '💎',
      title: 'Premium NFT Badge',
      description: 'Exclusive AstraPort founding member NFT for your wallet',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Early access to AI-powered portfolio insights',
    },
    {
      icon: '👥',
      title: 'VIP Community',
      description: 'Private Discord access with the core team',
    },
    {
      icon: '⚡',
      title: 'Zero Fees',
      description: 'Lifetime exemption from platform transaction fees',
    },
    {
      icon: '🎁',
      title: 'Token Airdrop',
      description: 'Guaranteed allocation of our future governance token',
    },
  ];

  const stats = {
    totalWaitlisted: 1247,
    premiumSpots: 100,
    premiumTaken: 73,
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!validateUsername(username)) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const available = !['admin', 'astraport', 'founder', 'ceo'].includes(username.toLowerCase());
    setUsernameAvailable(available);
    setCheckingUsername(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setFormData({ ...formData, username });
    if (username.length >= 3) {
      checkUsernameAvailability(username);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, letters, numbers and underscores only';
    } else if (usernameAvailable === false) {
      newErrors.username = 'This username is already taken';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-stellar-700 dark:via-brand-navy dark:to-stellar-700 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-brand-teal/15 dark:bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <svg className="w-12 h-12 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">You are on the list!</h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-8">
            {formData.isPremium
              ? 'Congratulations! You have secured a premium spot. Check your email for next steps.'
              : "Thanks for joining the waitlist. We'll notify you when it's your turn to access AstraPort."}
          </p>
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <p className="text-gray-500 dark:text-slate-400 mb-2">Your registration details</p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-slate-500">Email</span>
                <span className="text-gray-900 dark:text-white">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-slate-500">Username</span>
                <span className="text-gray-900 dark:text-white">@{formData.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-slate-500">Status</span>
                <span className={formData.isPremium ? 'text-brand-teal font-semibold' : 'text-brand-navy dark:text-stellar-300'}>
                  {formData.isPremium ? '⭐ Premium Member' : 'Standard Member'}
                </span>
              </div>
            </div>
          </div>
          <a
            href="/"
            className="inline-block mt-8 px-8 py-4 bg-brand-navy hover:bg-stellar-700 dark:bg-brand-teal dark:hover:bg-stellar-400 text-white dark:text-brand-navy font-semibold rounded-xl transition-all duration-300"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-stellar-700 dark:via-brand-navy dark:to-stellar-700 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-teal/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-navy/10 dark:bg-brand-teal/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 px-6 py-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/AstraPort_logo.svg" alt="AstraPort Logo" className="w-64 h-16 object-contain" />
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-gray-500 dark:text-slate-400 text-sm hidden sm:block">{stats.totalWaitlisted} already joined</span>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full text-brand-teal dark:text-stellar-300 text-sm mb-6">
            <span className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></span>
            Live waitlist • {stats.premiumSpots - stats.premiumTaken} premium spots remaining
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Join the Future of
            <br />
            <span className="bg-gradient-to-r from-brand-navy via-brand-teal to-brand-navy dark:from-brand-teal dark:via-teal-300 dark:to-brand-teal bg-clip-text text-transparent">DeFi Portfolio Management</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Secure your spot in AstraPort&apos;s private beta. Choose standard access or upgrade to premium for exclusive benefits and early privileges.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-white/10 shadow-2xl sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reserve Your Spot</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-4 bg-white dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-white/15'}`}
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Choose Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">@</span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleUsernameChange}
                      placeholder="username"
                      className={`w-full pl-8 pr-12 py-4 bg-white dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-white/15'}`}
                    />
                    {checkingUsername && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gray-400 dark:border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.username && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.username}</p>}
                </div>

                <div className="relative">
                  <div
                    onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${formData.isPremium ? 'bg-gradient-to-r from-brand-teal/15 to-brand-navy/10 dark:from-brand-teal/20 dark:to-brand-navy/30 border-brand-teal/50' : 'bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/15 hover:border-brand-teal/40'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${formData.isPremium ? 'bg-brand-teal/25' : 'bg-gray-200 dark:bg-white/10'}`}>
                          ⭐
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Go Premium
                            <span className="text-xs px-2 py-1 bg-brand-teal text-brand-navy rounded-full font-bold">LIMITED</span>
                          </h3>
                          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Unlock exclusive benefits and secure early access</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isPremium ? 'bg-brand-teal border-brand-teal' : 'border-gray-400 dark:border-slate-500'}`}>
                        {formData.isPremium && (
                          <svg className="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {formData.isPremium && (
                      <div className="mt-4 pt-4 border-t border-brand-teal/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-500 dark:text-slate-400 text-sm">Premium investment</span>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">$99</span>
                        </div>
                        <p className="text-brand-teal text-xs">Only {stats.premiumSpots - stats.premiumTaken} spots left</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${formData.isPremium ? 'bg-gradient-to-r from-brand-teal to-stellar-400 hover:from-stellar-400 hover:to-brand-teal text-brand-navy shadow-lg shadow-brand-teal/25' : 'bg-brand-navy hover:bg-stellar-700 dark:bg-brand-teal dark:hover:bg-stellar-400 text-white dark:text-brand-navy shadow-lg shadow-brand-navy/25 dark:shadow-brand-teal/25'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Securing your spot...
                    </>
                  ) : (
                    <>Join Waitlist - {formData.isPremium ? '$99' : 'Free'}</>
                  )}
                </button>

                <p className="text-center text-gray-400 dark:text-slate-500 text-xs">
                  By joining, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-brand-teal/40 hover:bg-white dark:hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-teal/15 to-brand-navy/10 dark:from-brand-teal/20 dark:to-brand-navy/30 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-white/10 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWaitlisted}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Waitlisted</p>
              </div>
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-white/10 text-center">
                <p className="text-3xl font-bold text-brand-navy dark:text-stellar-300">{stats.premiumTaken}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Premium Taken</p>
              </div>
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-white/10 text-center">
                <p className="text-3xl font-bold text-brand-teal">{stats.premiumSpots - stats.premiumTaken}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Spots Left</p>
              </div>
            </div>

            <div className="mt-8 bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-white/10">
              <p className="text-center text-gray-500 dark:text-slate-400 text-sm mb-4">Trusted by early adopters from</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
                <span className="text-gray-700 dark:text-white font-semibold text-lg">Stellar</span>
                <span className="text-gray-700 dark:text-white font-semibold text-lg">Coinbase</span>
                <span className="text-gray-700 dark:text-white font-semibold text-lg">a16z</span>
                <span className="text-gray-700 dark:text-white font-semibold text-lg">Paradigm</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-200 dark:border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-slate-500 text-sm">© 2024 AstraPort. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 dark:text-slate-400 hover:text-brand-teal dark:hover:text-white text-sm transition-colors">Twitter</a>
              <a href="#" className="text-gray-500 dark:text-slate-400 hover:text-brand-teal dark:hover:text-white text-sm transition-colors">Discord</a>
              <a href="#" className="text-gray-500 dark:text-slate-400 hover:text-brand-teal dark:hover:text-white text-sm transition-colors">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WaitlistPage;
