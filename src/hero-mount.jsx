import { createRoot } from 'react-dom/client';

import { Hero3 } from '@/components/ui/hero-3';
import '@/index.css';

const AFFILIATE =
  'https://reffpa.com/L?tag=d_5503298m_1236c_&site=5503298&ad=1236';

const navItems = [
  { label: 'Home', href: '/index.html' },
  { label: 'Slots', href: '/slots.html' },
  { label: 'Live casino', href: '/live-casino.html' },
  { label: 'Promotions', href: '/promotions.html' },
  { label: 'Player guide', href: '/player-guide.html' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Responsible play', href: '/responsible-gambling.html' },
];

function mountHero() {
  const rootEl = document.getElementById('hero-root');
  if (!rootEl) return;

  document.documentElement.classList.add('dark');
  document.body.classList.add('has-react-hero');

  createRoot(rootEl).render(
    <Hero3
      logo={
        <img
          src="/images/logo.png"
          alt="JiliAce"
          width={240}
          height={96}
          className="h-10 w-auto max-w-[168px] object-contain object-left"
          decoding="async"
          fetchPriority="high"
        />
      }
      logoText=""
      navItems={navItems}
      signInText="Play now"
      signInHref={AFFILIATE}
      tagline="Philippines · JiliAce casino guide"
      titleLine1="JiliAce PH — one lobby,"
      titleLine2="zero boring nights"
      description="JiliAce stacks JILI Slot speed, streamed live dealers, and a promo hub into one mobile-friendly lobby—so you're not juggling five apps to find a good time."
      primaryCtaText="Play now"
      primaryCtaHref={AFFILIATE}
      secondaryCtaText="Promotions guide"
      secondaryCtaHref="/promotions.html"
      complianceText="18+ only · Curaçao OGL/2024/1262/0493"
      complianceLinkText="verify at cert.cga.cw"
      complianceHref="https://cert.cga.cw/"
      stats={[
        { value: '500+', label: 'Casino titles' },
        { value: '24/7', label: 'Live tables' },
        { value: 'GCash', label: 'Friendly cashier' },
      ]}
      scrollText="Explore the guide"
      scrollHref="#hl-picks"
    />,
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountHero);
} else {
  mountHero();
}
