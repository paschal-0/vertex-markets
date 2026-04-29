# Vunex Markets Landing Design Plan (Visual Style Adoption Only)

## 1) Intent

Adopt the **look/feel** of the reference (premium dark, glossy, cinematic, 3D), but keep all content and storytelling strictly for:
- forex + OTC trading
- chart intelligence
- dual-system architecture
- trading/admin product flow

Do not reuse escrow/payment-product messaging from the reference.

---

## 2) Visual Direction

- Glossy black foundation
- Strong contrast white typography
- Subtle glassmorphism panels
- Premium 3D hero centerpiece with orbital motion
- Accent color used with discipline (lime/blue only as signal and CTA accents)

---

## 3) Color System

Base:
- `#030407` background
- `#0A0F17` elevated sections
- `#131A26` cards/panels
- `#EAF0F8` primary text
- `#9EABBF` secondary text

Accents:
- `#B7F34A` primary signal accent
- `#1E7BFF` secondary interaction accent (hover/active only)
- `#00C78A` positive values
- `#D45F7A` negative values

Rule:
- Dark neutrals dominate the page.
- Accents are controlled and purposeful.

---

## 4) Section Blueprint (Trading-Specific)

## Section A: Hero (Trading Command Center)
- Left: headline, subcopy, CTA pair
- Right: 3D terminal/orbital chart composition
- Floating chips:
  - `Low-Latency Execution`
  - `Live Market Feed`
  - `Risk-Control Engine`

Suggested copy:
- Eyebrow: `INSTITUTIONAL TRADING INFRASTRUCTURE`
- Headline: `Trade With Precision. Execute With Confidence.`
- Subcopy: `A premium forex and OTC platform powered by real-time chart intelligence and dual-system backend architecture.`
- CTAs: `Launch Trader UI`, `View Architecture`

## Section B: Trust Ribbon
- One large dark-glass ribbon with partner/integration logos (or placeholder marks)
- Label: `Built with production-grade infrastructure standards`

## Section C: Core Capability Cards (4)
1. `Ultra-Low Latency`
2. `Real-Time Chart Engine`
3. `Secure Wallet & Ledger`
4. `Admin Risk Controls`

## Section D: Live Market Operations
- Left: explanation block + bullet points
- Right: live operations board (pairs, price, status, timestamp)
- Bottom metric strip:
  - `Daily Volume`
  - `Active Traders`
  - `Execution P95`
  - `Connected Regions`

## Section E: Dual-System Architecture
- Visual node map:
  - `Chart API Core`
  - `Main API Core`
  - `Redis Event Bus`
- Animated pulse lines and sequence flow

## Section F: Final Conversion Band
- Left: strong final headline + CTA
- Right: premium 3D object (trading terminal module, not escrow/vault theme)
- Headline: `Ready To Deploy A Premium Trading Experience?`

---

## 5) 3D & Motion Language

3D objects:
- Terminal slab
- Candlestick/price wave mesh
- Orbital rings
- Data node particles

Motion:
- Slow autonomous idle loops
- Scroll-based reveal timing
- Card hover lift + border glow
- No chaotic animations

GSAP easing:
- `power3.out`
- `expo.out`
- `sine.inOut`

---

## 6) Stitch Prompt (Corrected)

Design a premium landing page for **Vunex Markets** (forex/OTC trading platform).

Use this visual style:
- glossy black, cinematic, futuristic
- high-end 3D hero object with orbit rings and market-energy feel
- glassmorphism panels and strong typography hierarchy

Important constraint:
- adopt only the visual quality and composition style
- do not use escrow/payment-product messaging
- keep all content about trading, charts, execution, and architecture

Required sections:
1. Hero trading command center (left copy, right 3D terminal)
2. Trust/logo ribbon
3. Four capability cards
4. Live market operations board
5. Dual-system architecture visualization
6. Final CTA band

Color constraints:
- mostly dark neutrals
- controlled accent highlights
- positive/negative market colors only where needed

Output must feel custom, premium, and production-ready for Next.js + Three.js + GSAP implementation.

---

## 7) Anti-Generic Constraints

Avoid:
- generic SaaS gradients
- random blobs with no structural meaning
- copied escrow/payment language

Require:
- trading-focused information architecture
- premium visual polish
- disciplined spacing and typography
- clear CTA hierarchy


---

## 8) Auth Screen Prompt Pack (NEW)
If you are looking for the newly added auth prompts, start at `START OF AUTH PROMPT PACK` below.

### START OF AUTH PROMPT PACK
### Authentication Flow UI Blueprint (Premium Dark Glass)

This section defines the full visual and interaction language for:
- Sign Up
- Sign In
- OTP Verification
- Forgot Password
- Reset Password

### Global Auth Canvas

- Full-viewport dark environment on the same brand foundation as landing:
  - primary background: near-pure black with subtle depth gradients
  - optional low-opacity noise layer for texture
  - restrained volumetric light bloom behind the auth card
- Keep composition centered and calm:
  - one dominant auth panel
  - one supporting side visual panel on desktop (optional on mobile)
- Visual mood: cinematic, institutional, trustworthy, high-end

### Auth Panel (Shared Across All Auth Screens)

- Card shape:
  - large rounded corners (`20px`-`28px`)
  - thin soft border (`rgba(255,255,255,0.14)` to `0.22`)
  - dark glass fill (`rgba(7,10,15,0.52)` to `0.68`)
  - strong backdrop blur (`14px`-`20px`)
- Surface treatment:
  - top inner highlight sweep (very subtle, not neon)
  - soft inner shadow for depth
  - faint edge glow in white/blue mix at very low opacity
- Layout:
  - desktop: 2-column split (`~56% form / ~44% visual`)
  - tablet/mobile: single-column stacked form-first
- Width:
  - desktop max width `1120px`-`1240px`
  - form column max text measure `440px`-`500px`

### Typography System (Auth)

- Font family remains premium sans used in landing (`Sora`/`Manrope` style)
- Heading:
  - white (`#F4F8FF`)
  - weight `700`-`760`
  - slight negative tracking
- Body/supporting text:
  - muted gray (`#A7B3C5`)
  - line-height `1.45`-`1.6`
- Labels:
  - brighter than body for clarity (`#D8E0EC`)
- Error text:
  - restrained red (`#E97A8E`)
- Success text:
  - restrained green (`#66D7AE`)

### Inputs (All Screens)

- Field shell:
  - height `52px`-`56px`
  - dark glossy fill (`rgba(255,255,255,0.03)` + black base)
  - border `1px solid rgba(255,255,255,0.16)`
  - radius `12px`-`14px`
- Focus behavior:
  - border brightens to white/blue tint
  - subtle outer glow ring
  - smooth `180ms` transition
- Placeholder:
  - muted neutral (`rgba(220,230,245,0.42)`)
- Icons:
  - monochrome line icons, thin stroke, left-aligned in inputs where needed

### Buttons (All Screens)

- Primary button:
  - deep electric blue gradient (`#2D78FF` -> `#1B59E6`)
  - white label, medium-bold
  - radius `12px`
  - shadow bloom in blue at low opacity
  - hover: slight lift (`-1px`), brightness +4%
  - active: settle to base with reduced glow
- Secondary action (text or ghost):
  - ghost background (`rgba(255,255,255,0.03)`)
  - border `rgba(255,255,255,0.2)`
  - white text at lower emphasis than primary

### Screen-by-Screen Design Instructions

#### A) Sign Up Screen

- Header block:
  - eyebrow: `CREATE YOUR ACCOUNT`
  - title: `Join Vunex Markets`
  - subcopy: institutional trust + speed + security positioning
- Form fields:
  - Full Name
  - Email
  - Password
  - Confirm Password
  - Optional referral/invite code (collapsed by default)
- Compliance row:
  - checkbox for Terms + Privacy
  - compact legal text in muted gray
- CTA block:
  - primary: `Create Account`
  - secondary link: `Already have an account? Sign in`
- Supporting desktop visual:
  - minimal dark trading UI preview or abstract glass market grid
  - avoid clutter and keep luminance below form prominence

#### B) Sign In Screen

- Header block:
  - eyebrow: `WELCOME BACK`
  - title: `Sign In to Vunex`
  - subcopy: secure access, low-latency trading workspace
- Form fields:
  - Email
  - Password
- Utility row:
  - remember me toggle (left)
  - `Forgot password?` link (right)
- CTA block:
  - primary: `Sign In`
  - secondary link: `New to Vunex? Create account`
- Optional security micro-note:
  - `Protected with OTP verification`

#### C) OTP Verification Screen

- Purpose:
  - verify login/signup with 6-digit one-time code
- Layout center focus:
  - six separated OTP cells with premium glass styling
  - auto-advance cursor on input
  - paste support for full code
- Header block:
  - title: `Verify Your Identity`
  - subcopy: `Enter the 6-digit code sent to your email`
- Controls:
  - primary: `Verify Code`
  - secondary: `Resend Code` with countdown timer (`00:30`)
  - tertiary text link: `Use a different email`
- Visual feedback:
  - invalid code shakes row softly + red border flash
  - success transitions to brief white/blue confirmation glow

#### D) Forgot Password Screen

- Intent:
  - single-purpose lightweight flow
- Header:
  - title: `Forgot Password?`
  - subcopy: reassurance + instructions
- Form:
  - Email field only
- CTA:
  - primary: `Send Reset Code`
  - secondary: `Back to Sign In`
- Result state:
  - success inline panel confirming reset code sent
  - no account enumeration in copy (security-safe wording)

#### E) Reset Password Screen

- Header:
  - title: `Reset Your Password`
  - subcopy: choose a strong new password
- Form fields:
  - Reset Code (6 digits)
  - New Password
  - Confirm New Password
- Password quality indicator:
  - minimal 4-step strength bar (muted -> green)
  - concise rules under field
- CTA:
  - primary: `Update Password`
  - secondary: `Back to Sign In`
- Completion state:
  - success card with `Password Updated`
  - action button: `Continue to Sign In`

### Motion & Interaction (Auth-Specific)

- Panel entrance:
  - fade + slight upward drift (`12px`) with `power3.out`
- Input focus:
  - smooth glow gain, no harsh pop
- Error micro-interactions:
  - tiny shake (`x: 6 -> -4 -> 2 -> 0`) under `220ms`
- Success transitions:
  - clean crossfade between steps, no flashy morphs
- Background ambient:
  - extremely slow orb/light movement, almost imperceptible
- Rule:
  - motion must communicate state and quality, never distract

### Responsive Behavior

- Desktop (`>=1200px`):
  - split layout with side visual
- Tablet (`768px-1199px`):
  - reduce side visual dominance; form remains primary
- Mobile (`<768px`):
  - full-width stacked form
  - sticky bottom primary CTA allowed for OTP/reset screens
  - maintain generous tap targets (`>=44px`)

### Accessibility & UX Quality Bars

- Contrast:
  - all primary text must pass AA on dark surfaces
- Keyboard flow:
  - clear focus ring and logical tab order
- Error clarity:
  - field-level message + top summary for multi-error forms
- Loading states:
  - button spinner + disabled inputs during submit
- OTP support:
  - mobile numeric keypad hints
  - one-tap paste behavior where available
### END OF AUTH PROMPT PACK

