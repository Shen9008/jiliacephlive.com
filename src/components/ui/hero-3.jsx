
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FaChevronDown,
  FaArrowRight,
  FaArrowDown,
  FaBars,
  FaXmark,
} from 'react-icons/fa6';
import LogoIcon from '@/assets/logo-icon';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.65, bounce: 0 },
  },
};

export function Hero3({
  logo,
  logoText = 'Watermelon',

  navItems = [
    { label: 'Solutions', href: '#', hasDropdown: true },
    { label: 'Technology', href: '#', hasDropdown: true },
    { label: 'Documentation', href: '#' },
    { label: 'Community', href: '#' },
  ],

  signInText = 'Sign in',
  signInHref = '#',
  tagline = 'Quantum-powered. Designed for scale.',
  titleLine1 = 'Unleashing Potential',
  titleLine2 = 'Across The Cosmos.',
  description = 'We engineer decentralized infrastructure and quantum applications that accelerate compute speeds and unlock next-generation solutions.',
  primaryCtaText = 'Explore Platform',
  primaryCtaHref = '#',
  secondaryCtaText = 'Request Access',
  secondaryCtaHref = '#',
  backgroundImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920',

  stats = [
    { value: '250+', label: 'Nodes Deployed' },
    { value: '1.2B', label: 'Queries Processed' },
    { value: '99.9%', label: 'Uptime Guaranteed' },
  ],

  scrollText = 'Scroll to Discover',
  scrollHref = '#'
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="dark bg-background text-foreground relative min-h-screen w-full overflow-hidden font-sans [&_h1]:drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] [&_p]:drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]">
      {backgroundImage && (
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none h-full w-full object-cover object-center brightness-40 select-none"
          />
        </div>
      )}

      <motion.header
        initial={{ opacity: 0, y: -14, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0 }}
        className="absolute top-0 left-0 z-30 w-full"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 md:px-16 lg:px-20">
          <a
            href="/"
            className="text-foreground flex items-center gap-2.5 text-2xl font-light tracking-tight sm:text-xl"
          >
            <span className="text-primary flex items-center justify-center">
              {logo || <LogoIcon className="size-8 text-white" />}
            </span>
            <span>{logoText}</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group text-zinc-100 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
              >
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <FaChevronDown className="text-zinc-200 h-3 w-3 fill-current transition-transform duration-200 group-hover:translate-y-0.5" />
                )}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href={signInHref}
              className="border-primary/50 bg-gradient-to-r from-rose-500 via-red-600 to-rose-800 text-white hover:from-rose-400 hover:via-red-500 hover:to-rose-700 rounded-full border px-6 py-2 text-sm font-medium shadow-lg shadow-red-900/30 backdrop-blur-sm transition-all duration-200"
            >
              {signInText}
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-foreground hover:bg-accent flex items-center justify-center rounded-full p-2 transition-colors md:hidden"
            aria-label="Toggle navigation menu"
          >
            <FaBars className="h-5 w-5 fill-current" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="bg-background/95 fixed inset-0 z-50 flex flex-col p-6 backdrop-blur-md md:hidden"
          >
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="text-foreground flex items-center gap-2.5 text-lg font-semibold tracking-tight"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-primary flex items-center justify-center">
                {logo || <LogoIcon className="size-8 fill-current" />}
              </span>
              <span>{logoText}</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground hover:bg-accent flex items-center justify-center rounded-full p-2 transition-colors"
              aria-label="Close menu"
            >
              <FaXmark className="h-5 w-5 fill-current" />
            </button>
          </div>

          <nav className="mt-12 flex flex-col gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="border-border/40 text-foreground hover:text-primary flex items-center justify-between border-b pb-3 text-lg font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <FaChevronDown className="text-muted-foreground h-4 w-4 fill-current" />
                )}
              </a>
            ))}
          </nav>

          <div className="mt-auto">
            <a
              href={signInHref}
              onClick={() => setMobileMenuOpen(false)}
              className="bg-gradient-to-r from-rose-500 via-red-600 to-rose-800 text-white hover:from-rose-400 hover:via-red-500 hover:to-rose-700 flex w-full items-center justify-center rounded-full border border-red-500/40 py-3 text-base font-semibold transition-colors"
            >
              {signInText}
            </a>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 pt-32 pb-12 sm:px-10 md:px-16 md:pt-40 lg:px-20 lg:pt-48">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.38 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <div className="max-w-4xl">
            {tagline && (
              <motion.p
                variants={item}
                className="sm:text-md mb-4 font-light tracking-wide text-white"
              >
                {tagline}
              </motion.p>
            )}

            <motion.h1
              variants={item}
              className="text-foreground mb-6 text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl "
            >
              {titleLine1 && <span className="block">{titleLine1}</span>}
              {titleLine2 && <span className="block">{titleLine2}</span>}
            </motion.h1>

            {description && (
              <motion.p
                variants={item}
                className="sm:text-md md:text-md leading-wide mx-auto mb-4 max-w-2xl text-base text-zinc-50"
              >
                {description}
              </motion.p>
            )}

            <motion.div
              variants={item}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            >
              {primaryCtaText && (
                <a
                  href={primaryCtaHref}
                  className="rounded-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-800 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/35 transition-all duration-200 hover:from-rose-400 hover:via-red-500 hover:to-rose-700 sm:text-base"
                >
                  {primaryCtaText}
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaHref}
                  className="group inline-flex items-center gap-2 text-sm font-light text-zinc-100 transition-colors duration-200 hover:text-zinc-300 sm:text-base"
                >
                  <span>{secondaryCtaText}</span>
                  <FaArrowRight className="h-4 w-4 fill-current transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="border-border/20 mt-12 w-full border-t pt-8 sm:mt-16"
        >
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-center">
            {stats.length > 0 && (
              <div className="flex flex-col divide-y divide-white/50 md:flex-row md:items-center md:divide-x md:divide-y-0">
                {stats.map((stat) => (
                  <motion.div
                    variants={item}
                    key={stat.label}
                    className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0 md:px-6 md:py-0 md:first:pl-0 md:last:pr-0"
                  >
                    <span className="text-foreground text-3xl font-light tracking-tight sm:text-4xl">
                      {stat.value}
                    </span>

                    <span className="text-xs text-zinc-100 sm:text-sm">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {scrollText && (
              <motion.a
                variants={item}
                href={scrollHref}
                className="text-zinc-100 hover:text-white flex items-center justify-center gap-2 self-center text-xs font-semibold transition-colors sm:text-sm md:self-auto"
              >
                <span>{scrollText}</span>
                <FaArrowDown className="h-4 w-4 fill-current" />
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
