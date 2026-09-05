import { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { FaArrowRight, FaArrowDown, FaBars, FaXmark } from 'react-icons/fa6';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.55, bounce: 0 },
  },
};

const itemStatic = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

export function Hero3({
  logo,
  logoText = 'JiliAce PH',

  navItems = [],

  signInText = 'Play now',
  signInHref = '#',
  tagline = '',
  titleLine1 = '',
  titleLine2 = '',
  description = '',
  primaryCtaText = 'Play now',
  primaryCtaHref = '#',
  secondaryCtaText = '',
  secondaryCtaHref = '#',
  backgroundImage = '',

  complianceText = '',
  complianceLinkText = '',
  complianceHref = '',

  stats = [],

  scrollText = 'Explore the guide',
  scrollHref = '#',
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const variants = reduceMotion ? { hidden: {}, visible: {} } : container;
  const child = reduceMotion ? itemStatic : item;

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    function onKey(e) {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    }

    document.addEventListener('keydown', onKey);
    document.body.classList.add('mobile-nav-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('mobile-nav-open');
    };
  }, [mobileMenuOpen]);

  return (
    <section className="hero-3-root dark bg-background text-foreground relative min-h-screen w-full overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-8%,rgba(200,30,58,0.2),transparent_58%),linear-gradient(180deg,#120c0d_0%,#0b0708_100%)]" />
      </div>
      {backgroundImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center select-none"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/58 to-[#0b0708]/94"
            aria-hidden="true"
          />
        </div>
      )}

      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 z-30 w-full border-b border-white/8 bg-[#0b0708]/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12">
          <a
            href="/"
            className="text-foreground flex min-h-11 items-center gap-2.5 text-lg font-medium tracking-tight"
          >
            {logo}
            {logoText ? <span className="sr-only sm:not-sr-only text-[var(--ivory,#f4efe8)]">{logoText}</span> : null}
          </a>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {navItems.map((navItem) => (
              <a
                key={navItem.label}
                href={navItem.href}
                className="text-[var(--ivory,#f4efe8)] hover:bg-white/5 inline-flex min-h-11 items-center rounded-md px-2.5 text-[0.8125rem] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
              >
                {navItem.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <a
              href={signInHref}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex min-h-11 items-center rounded-full bg-[#c81e3a] px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d42a46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
            >
              {signInText}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="text-foreground hover:bg-white/8 inline-flex size-11 items-center justify-center rounded-md transition-colors lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls={menuId}
          >
            <FaBars className="h-5 w-5 fill-current" aria-hidden="true" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0b0708]/96 p-5 backdrop-blur-md lg:hidden"
          >
            <div className="flex items-center justify-between">
              <a
                href="/"
                className="flex min-h-11 items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {logo}
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:bg-white/8 inline-flex size-11 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
                aria-label="Close menu"
              >
                <FaXmark className="h-5 w-5 fill-current" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1" aria-label="Site">
              {navItems.map((navItem) => (
                <a
                  key={navItem.label}
                  href={navItem.href}
                  className="text-[var(--ivory,#f4efe8)] hover:bg-white/5 flex min-h-11 items-center border-b border-white/8 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {navItem.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <a
                href={signInHref}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#c81e3a] py-3 text-base font-semibold text-white transition-colors hover:bg-[#d42a46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
              >
                {signInText}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-5 pt-28 pb-10 sm:px-8 md:pt-36 lg:px-12 lg:pt-40">
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <div className="max-w-4xl">
            {tagline && (
              <motion.p
                variants={child}
                className="mb-4 text-sm font-medium tracking-wide text-[var(--ivory,#f4efe8)] sm:text-base"
              >
                {tagline}
              </motion.p>
            )}

            <motion.h1
              variants={child}
              className="mb-6 font-display text-[2.25rem] leading-[1.12] font-medium tracking-tight text-[var(--ivory,#f4efe8)] sm:text-5xl md:text-6xl"
            >
              {titleLine1 && <span className="block">{titleLine1}</span>}
              {titleLine2 && <span className="block">{titleLine2}</span>}
            </motion.h1>

            {description && (
              <motion.p
                variants={child}
                className="mx-auto mb-5 max-w-2xl text-base leading-relaxed text-[#ebe4db] sm:text-lg"
              >
                {description}
              </motion.p>
            )}

            {(complianceText || complianceLinkText) && (
              <motion.p
                variants={child}
                className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-[var(--ivory,#f4efe8)]"
              >
                {complianceText}
                {complianceLinkText && complianceHref ? (
                  <>
                    {' · '}
                    <a
                      href={complianceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e8a0a8] underline decoration-[#e8a0a8]/50 underline-offset-3 hover:text-[#f4efe8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8]"
                    >
                      {complianceLinkText}
                    </a>
                  </>
                ) : null}
              </motion.p>
            )}

            <motion.div
              variants={child}
              className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
            >
              {primaryCtaText && (
                <a
                  href={primaryCtaHref}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex min-h-11 items-center rounded-full bg-[#c81e3a] px-7 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d42a46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8] sm:text-base"
                >
                  {primaryCtaText}
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaHref}
                  className="group inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-[var(--ivory,#f4efe8)] transition-colors duration-200 hover:text-[#e8a0a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8] sm:text-base"
                >
                  <span>{secondaryCtaText}</span>
                  <FaArrowRight className="h-4 w-4 fill-current transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          className="mt-10 w-full border-t border-white/10 pt-7 sm:mt-14"
        >
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-center">
            {stats.length > 0 && (
              <div className="flex flex-col divide-y divide-white/15 md:flex-row md:items-center md:divide-x md:divide-y-0">
                {stats.map((stat) => (
                  <motion.div
                    variants={child}
                    key={stat.label}
                    className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 md:px-6 md:py-0 md:first:pl-0 md:last:pr-0"
                  >
                    <span className="font-display text-3xl font-medium tracking-tight text-[var(--ivory,#f4efe8)] sm:text-4xl">
                      {stat.value}
                    </span>
                    <span className="text-xs text-[#ebe4db] sm:text-sm">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {scrollText && (
              <motion.a
                variants={child}
                href={scrollHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 self-center text-sm font-medium text-[var(--ivory,#f4efe8)] transition-colors hover:text-[#e8a0a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8a0a8] md:self-auto"
              >
                <span>{scrollText}</span>
                <FaArrowDown className="h-4 w-4 fill-current" aria-hidden="true" />
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
