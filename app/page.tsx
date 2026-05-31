import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#eeedea',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Orbitron, sans-serif',
    }}>
      {/* Compass watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 680, height: 680, opacity: 0.08, pointerEvents: 'none' }}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="100" cy="100" r="90" stroke="#1a1a1a" strokeWidth="0.5"/>
          <circle cx="100" cy="100" r="70" stroke="#1a1a1a" strokeWidth="0.3"/>
          <circle cx="100" cy="100" r="50" stroke="#1a1a1a" strokeWidth="0.2"/>
          <circle cx="100" cy="100" r="4" fill="#1a1a1a"/>
          <polygon points="100,10 106,90 100,80 94,90" fill="#1a1a1a"/>
          <polygon points="100,190 106,110 100,120 94,110" fill="#1a1a1a" opacity="0.5"/>
          <polygon points="190,100 110,106 120,100 110,94" fill="#1a1a1a" opacity="0.5"/>
          <polygon points="10,100 90,106 80,100 90,94" fill="#1a1a1a" opacity="0.5"/>
          <line x1="127" y1="27" x2="109" y2="91" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="173" y1="73" x2="109" y2="91" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="173" y1="127" x2="109" y2="109" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="127" y1="173" x2="109" y2="109" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="73" y1="173" x2="91" y2="109" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="27" y1="127" x2="91" y2="109" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="27" y1="73" x2="91" y2="91" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="73" y1="27" x2="91" y2="91" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4"/>
          <line x1="100" y1="20" x2="100" y2="30" stroke="#1a1a1a" strokeWidth="1"/>
          <line x1="100" y1="170" x2="100" y2="180" stroke="#1a1a1a" strokeWidth="0.5"/>
          <line x1="20" y1="100" x2="30" y2="100" stroke="#1a1a1a" strokeWidth="0.5"/>
          <line x1="170" y1="100" x2="180" y2="100" stroke="#1a1a1a" strokeWidth="0.5"/>
          <g transform="translate(100,100)" opacity="0.7">
            <ellipse cx="0" cy="-8" rx="12" ry="7" fill="#1a1a1a"/>
            <polygon points="-22,-2 0,-10 22,-2 0,4" fill="#1a1a1a"/>
            <polygon points="0,4 -6,16 0,12 6,16" fill="#1a1a1a"/>
            <circle cx="4" cy="-10" r="1.5" fill="#eeedea"/>
            <polygon points="6,-8 12,-7 7,-5" fill="#1a1a1a"/>
          </g>
        </svg>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Wordmark */}
        <div style={{ fontSize: 72, letterSpacing: '7.2px', color: '#1a1a1a', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 400 }}>M</span>
          <span style={{ fontWeight: 400 }}>I</span>
          <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
          <span style={{ fontWeight: 900 }}>K</span>
          <span style={{ fontWeight: 400 }}>A</span>
          <span style={{ fontWeight: 400 }}>L</span>
        </div>

        {/* Tagline */}
        <p style={{ fontFamily: "'Bungee Hairline', sans-serif", fontSize: 11, letterSpacing: 4, color: '#999', marginTop: 18, textAlign: 'center' }}>
          WISDOM &nbsp;·&nbsp; INSIGHT &nbsp;·&nbsp; INTELLIGENCE
        </p>

        {/* Button */}
        <Link
          href="/login"
          style={{
            marginTop: 52,
            display: 'inline-block',
            padding: '14px 40px',
            border: '1.5px solid #1a1a1a',
            borderRadius: 999,
            color: '#1a1a1a',
            fontFamily: "'Bungee Hairline', sans-serif",
            fontSize: 12,
            letterSpacing: 3,
            textDecoration: 'none',
          }}
        >
          SIGN IN TO MIKKAL
        </Link>

        {/* Invite only */}
        <p style={{ fontFamily: "'Bungee Hairline', sans-serif", fontSize: 10, letterSpacing: 3, color: '#bbb', marginTop: 16 }}>
          INVITE ONLY
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 28, left: 0, right: 0, textAlign: 'center', fontFamily: "'Bungee Hairline', sans-serif", fontSize: 10, letterSpacing: 3, color: '#bbb' }}>
        © MIKKAL &nbsp;·&nbsp; PRIVATE ACCESS
      </div>
    </div>
  )
}
