import Link from 'next/link';
import { 
  Shield, 
  ShieldCheck,
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  Zap, 
  BarChart3, 
  ChevronRight,
  Scale
} from 'lucide-react';

/* ── Static feature data ── */
const features = [
  {
    icon: FileText,
    title: 'Document Incidents',
    description:
      'Log every extortion attempt — platform, captain details, location, time, and the exact fare demanded versus what the app showed.',
    badge: null,
    gradient: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    icon: Lock,
    title: 'Multi-Source Evidence',
    description:
      'Upload app fare screenshots, UPI payment proofs, audio recordings, and chat exports into one secure, tamper-proof case file.',
    badge: null,
    gradient: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
  },
  {
    icon: Sparkles,
    title: 'AI Protection Engine',
    description:
      'Our multi-modal AI engine analyzes your full evidence package together, generating verifiable consumer court dispute complaints.',
    badge: 'AI Engine Ready',
    gradient: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  },
];

const steps = [
  {
    num: '01',
    title: 'Log Incident Details',
    body: 'Fill in the structured report wizard with ride date, platform, captain identity, and fare difference.',
    icon: Zap,
  },
  {
    num: '02',
    title: 'Attach Proofs',
    body: 'Upload screenshots of the app fare, payment proof, or audio clips supporting your claim.',
    icon: FileText,
  },
  {
    num: '03',
    title: 'Generate Legal Complaint',
    body: 'Receive an evidence-backed complaint report ready for submission to platform support or consumer forums.',
    icon: Scale,
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#070a14]">

      {/* ── Background Mesh Light Orbs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="absolute top-0 left-1/4 w-[650px] h-[650px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 w-full glass-nav">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center glow-cyan">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              FairRide<span className="text-gradient-cyan">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 relative z-10">

        {/* ── Hero Section ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">

          {/* Glowing Status Pill */}
          <div className="inline-flex items-center gap-2.5 glass px-4 py-2 rounded-full border border-blue-500/30 mb-8 shadow-inner shadow-blue-500/20">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-widest">
              AI-POWERED COMMUTER PROTECTION ENGINE
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-white">
            Stop Ride Extortion.<br />
            <span className="text-gradient-cyan">Document. Analyze. Fight Back.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-400 leading-relaxed mb-10">
            FairRideAI helps commuters build bulletproof, evidence-backed case reports against captain fare overcharging, forced cancellations, and rider harassment.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-base rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:brightness-110 active:scale-[0.98] transition-all animate-pulse-glow"
            >
              <ShieldAlert className="w-5 h-5 text-cyan-300" />
              <span>Report an Incident Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <a 
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-slate-900/50 border border-slate-700/70 text-slate-200 font-semibold text-base rounded-xl hover:bg-slate-800/60 hover:border-slate-500/70 transition-all"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { value: '100% Secure', label: 'Tamper-Proof File Vault', icon: Lock },
              { value: '3-Step Wizard', label: 'Guided Reporting Process', icon: Zap },
              { value: 'AI Evidence', label: 'Multi-Modal Context Analysis', icon: Sparkles },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-card p-4 rounded-2xl flex items-center gap-3 text-left">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/20 text-cyan-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* ── Feature Cards ── */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/60">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Designed for Maximum Accountability
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Transform messy screenshots and bad experiences into structured, legally actionable evidence reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div 
                  key={f.title}
                  className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col justify-between relative"
                >
                  {f.badge && (
                    <span className="absolute top-5 right-5 text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {f.badge}
                    </span>
                  )}
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} border flex items-center justify-center mb-6`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2.5">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/60">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">How FairRideAI Works</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base">
              A seamless flow from instant documentation to structured evidence reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="glass-card p-8 rounded-2xl relative flex flex-col items-start">
                  <div className="flex items-center justify-between w-full mb-6">
                    <span className="text-3xl font-black text-gradient-cyan">{step.num}</span>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Final Call to Action ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 mb-20">
          <div className="glass-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden glow-blue-lg border-blue-500/30">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
                Take Control of Your Commute
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                Don&apos;t accept illegal cash extortion or forced cancellations. Document every incident with FairRideAI and demand fair treatment.
              </p>
              <Link 
                href="/register"
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-bold text-base rounded-xl shadow-2xl hover:brightness-110 transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>Create Your Free Account</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-300">
              FairRide<span className="text-cyan-400">AI</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            © 2026 FairRideAI. Protecting commuters from ride extortion.
          </p>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
