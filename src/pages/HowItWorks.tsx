import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronRight, CheckCircle2, Zap, DollarSign, Globe, Shield } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Copy Link",
      description: "Get your YT URL (Shorts or Long-form)",
      icon: <Globe className="h-6 w-6 text-purple-500" />
    },
    {
      number: 2,
      title: "Paste",
      description: "Add it to MoonTube no passwords needed",
      icon: <Zap className="h-6 w-6 text-yellow-500" />
    },
    {
      number: 3,
      title: "Earn",
      description: "Withdraw via PayPal",
      icon: <DollarSign className="h-6 w-6 text-green-500" />
    }
  ];

  const benefits = [
    {
      title: "Instant Monetization",
      description: "No requirements, no wait lists. Start earning from day one."
    },
    {
      title: "$0.500 Fixed RPM for ALL CONTENT",
      description: "Industry leading rates for Shorts and Long-form videos."
    },
    {
      title: "Global Payouts",
      description: "Fast and secure withdrawals via PayPal worldwide."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
          <HelpCircle className="h-4 w-4" />
          <span>Guide</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          How it Works
        </h1>
        <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
          Stop waiting for 4,000 watch hours. Paste your YouTube links and start earning a fixed $0.500 RPM on every view, including Shorts.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-20 relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent -translate-y-1/2 z-0" />
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative z-10 bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 flex items-center justify-center mb-6">
              {step.icon}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono text-purple-500 bg-purple-500/10 px-2 py-1 rounded">Step {step.number}</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-20 bg-neutral-900/30 border border-neutral-800/50 rounded-3xl p-8 md:p-12"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Shield className="h-7 w-7 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Transparent Business Model</h2>
            <p className="text-neutral-400 leading-relaxed text-lg">
              At MoonTube, we believe small creators deserve a fair share. We aggregate the views from our entire creator community to negotiate higher-tier advertising rates with premium networks. By bypassing the traditional YouTube Partner hurdles, we distribute these earnings back to you from view number one. We win when you win.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="bg-gradient-to-b from-neutral-900 to-black border border-neutral-800 rounded-3xl p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full" />
        
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-purple-500" />
          Benefits
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="text-purple-400 font-bold mb-2">{benefit.title}</h4>
              <p className="text-neutral-500 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-neutral-600 text-sm">
          Join thousands of creators who are already earning with MoonTube.
        </p>
      </motion.div>
    </div>
  );
}
