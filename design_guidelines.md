{
  "project": {
    "name": "Smart Bharat – AI-Powered Civic Companion",
    "design_personality": [
      "trustworthy + government-adjacent (clear, calm, structured)",
      "modern civic-tech (soft depth, crisp typography)",
      "inclusive + accessible (high contrast, large touch targets)",
      "delight via micro-motion (never gimmicky)"
    ],
    "north_star": "Make government services feel understandable and actionable in under 60 seconds; make issue reporting feel guided and trackable."
  },

  "inspiration_refs": {
    "search_refs": [
      {
        "title": "Dribbble search: side panel chat",
        "url": "https://dribbble.com/search/side-panel-chat"
      },
      {
        "title": "Dribbble search: government portal",
        "url": "https://dribbble.com/search/government-portal"
      },
      {
        "title": "Dribbble search: government dashboard",
        "url": "https://dribbble.com/search/government-dashboard"
      },
      {
        "title": "UXPin: progress trackers",
        "url": "https://www.uxpin.com/studio/blog/design-progress-trackers/"
      },
      {
        "title": "PatternFly: progress stepper guidelines",
        "url": "https://www.patternfly.org/components/progress-stepper/design-guidelines"
      }
    ],
    "fusion_direction": "Use a Swiss-style grid + government clarity (strong hierarchy, generous whitespace) fused with modern SaaS micro-interactions (Framer Motion) and a subtle Indian context accent (saffron as CTA + status highlights)."
  },

  "typography": {
    "font_pairing": {
      "primary": {
        "name": "Inter",
        "fallback": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        "usage": "All UI text for maximum legibility"
      },
      "optional_display": {
        "name": "Space Grotesk",
        "usage": "Hero headline only (optional). If used, keep body in Inter."
      }
    },
    "scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "h3": "text-lg font-semibold",
      "body": "text-sm md:text-base leading-relaxed",
      "small": "text-xs text-muted-foreground"
    },
    "content_rules": [
      "Prefer short sentences; avoid bureaucratic tone.",
      "Use bilingual labels where helpful: e.g., 'Language / भाषा'.",
      "Numbers: tabular-nums for tracking IDs and timelines."
    ]
  },

  "color_system": {
    "notes": [
      "User-specified palette must be followed: Primary Deep Indigo, Secondary Saffron/Orange, Background off-white/slate-50, Cards white with soft diffused shadows.",
      "No purple gradients. Keep gradients mild and limited to hero accents only (<20% viewport)."
    ],
    "tokens_hsl_for_shadcn": {
      "background": "210 40% 98%",
      "foreground": "222 47% 11%",
      "card": "0 0% 100%",
      "card-foreground": "222 47% 11%",
      "popover": "0 0% 100%",
      "popover-foreground": "222 47% 11%",

      "primary": "231 48% 28%",
      "primary-foreground": "210 40% 98%",

      "secondary": "33 92% 52%",
      "secondary-foreground": "222 47% 11%",

      "muted": "210 40% 96%",
      "muted-foreground": "215 16% 35%",

      "accent": "231 48% 94%",
      "accent-foreground": "231 48% 22%",

      "destructive": "0 84% 60%",
      "destructive-foreground": "210 40% 98%",

      "border": "214 32% 91%",
      "input": "214 32% 91%",
      "ring": "231 48% 40%",

      "success": "142 71% 35%",
      "warning": "33 92% 52%",
      "info": "199 89% 48%"
    },
    "hex_helpers": {
      "indigo_primary": "#2B2F7F",
      "indigo_700": "#2A2E73",
      "saffron": "#F59E0B",
      "bg_offwhite": "#F8FAFC",
      "text": "#0F172A",
      "muted_text": "#475569",
      "border": "#E2E8F0",
      "success": "#16A34A",
      "danger": "#DC2626"
    },
    "gradients_allowed": {
      "hero_background_only": {
        "tailwind": "bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(245,158,11,0.14),transparent_55%),radial-gradient(900px_circle_at_80%_0%,rgba(43,47,127,0.12),transparent_50%)]",
        "rule": "Decorative only; keep content blocks solid."
      },
      "chat_thinking_border": {
        "tailwind": "bg-[conic-gradient(from_180deg,rgba(245,158,11,0.55),rgba(43,47,127,0.55),rgba(245,158,11,0.55))]",
        "rule": "Used as a 2px border wrapper around chat panel only."
      }
    },
    "shadows": {
      "card": "shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)]",
      "card_hover": "shadow-[0_18px_45px_-22px_rgba(15,23,42,0.35)]",
      "floating": "shadow-[0_22px_60px_-28px_rgba(15,23,42,0.45)]"
    },
    "radius": {
      "base": "--radius: 0.75rem",
      "buttons": "rounded-xl",
      "cards": "rounded-2xl",
      "chat_panel": "rounded-2xl"
    }
  },

  "layout_and_grid": {
    "container": "max-w-6xl mx-auto px-4 sm:px-6",
    "page_sections": {
      "hero": "pt-10 sm:pt-14 pb-10",
      "content": "py-10 sm:py-14",
      "footer": "py-10"
    },
    "services_grid": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
    "dashboard_bento": "grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6",
    "bento_rules": [
      "Use 12-col grid on desktop; stack on mobile.",
      "Keep primary CTA and search in the first viewport.",
      "Avoid center-aligned paragraphs; left align for readability."
    ]
  },

  "components": {
    "component_path": {
      "shadcn_primary": [
        "/app/frontend/src/components/ui/button.jsx",
        "/app/frontend/src/components/ui/card.jsx",
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/input.jsx",
        "/app/frontend/src/components/ui/textarea.jsx",
        "/app/frontend/src/components/ui/select.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/progress.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/separator.jsx",
        "/app/frontend/src/components/ui/switch.jsx",
        "/app/frontend/src/components/ui/tooltip.jsx",
        "/app/frontend/src/components/ui/sonner.jsx"
      ],
      "recommended_new_components_to_create": [
        "src/components/layout/Navbar.jsx",
        "src/components/layout/Footer.jsx",
        "src/components/chat/CivicChatWidget.jsx",
        "src/components/chat/TypingDots.jsx",
        "src/components/services/ServiceCard.jsx",
        "src/components/services/ServiceDetailModal.jsx",
        "src/components/issues/IssueStepper.jsx",
        "src/components/issues/IssueTimeline.jsx",
        "src/components/motion/PageTransition.jsx",
        "src/components/motion/AnimatedCheckmark.jsx"
      ]
    },

    "navbar": {
      "structure": [
        "Left: Smart Bharat wordmark (text + small emblem)",
        "Center (desktop): Home, Services, Report Issue, Track Issue",
        "Right: Primary CTA 'Ask Civic AI' + Language toggle"
      ],
      "styles": {
        "wrapper": "sticky top-0 z-40 backdrop-blur bg-white/70 border-b",
        "nav_link": "text-sm font-medium text-slate-700 hover:text-slate-900",
        "active_link": "text-slate-900",
        "cta": "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
      },
      "mobile": "Use Sheet for hamburger menu; keep Language toggle visible in header."
    },

    "hero": {
      "layout": "Two-column on desktop: left copy + CTAs, right preview card stack (services + issue tracking). On mobile: stack with preview below.",
      "background": "Use the allowed radial gradient background only in hero section.",
      "cta_buttons": {
        "primary": "Button (default) with indigo fill",
        "secondary": "Button variant='outline' with saffron border + hover fill"
      },
      "micro_interactions": [
        "Primary CTA: whileHover y:-1, whileTap scale:0.95",
        "Preview cards: subtle parallax on mouse move (desktop only)"
      ]
    },

    "services": {
      "service_card": {
        "base": "Card rounded-2xl bg-white border shadow (diffused)",
        "content": [
          "Icon (Lucide) in indigo-tinted chip",
          "Service name",
          "1-line description",
          "Badges: 'Popular', 'Online', 'Needs Aadhaar' etc"
        ],
        "motion": {
          "whileHover": "y:-5 + shadow increase (spring)",
          "whileTap": "scale:0.98"
        },
        "cta": "Ghost button 'Simplify' + small arrow"
      },
      "service_detail_modal": {
        "use": "Dialog",
        "layout": "Header with service title + Apply Now button; body uses 3 cards/sections: Who is eligible, Documents needed, Estimated time/cost.",
        "apply_now": "External link button with rel='noreferrer' target='_blank'",
        "states": [
          "Loading skeleton while AI summary loads",
          "Error alert with retry"
        ]
      }
    },

    "issue_reporting": {
      "multi_step_form": {
        "use": ["Progress", "Tabs OR custom stepper", "Card", "Input", "Textarea", "Select", "Button"],
        "steps": [
          "1) Details (issue type optional; allow 'Auto-detect')",
          "2) Photo upload (AI vision categorizes)",
          "3) Location (text input + map placeholder card)",
          "4) Review & Submit"
        ],
        "progress_indicator": {
          "mobile": "Top progress bar + 'Step X of 4' label",
          "desktop": "Horizontal stepper with circles + labels"
        },
        "photo_ai_state": {
          "loading": "Show skeleton thumbnail + 'Analyzing photo…' with spinner",
          "result": "Badge with detected category (e.g., 'Pothole detected')"
        },
        "submission_success": {
          "animation": "Animated checkmark (SVG stroke) + expanding ring",
          "output": "Tracking ID in monospace/tabular nums + copy button"
        }
      },
      "tracking_timeline": {
        "use": "Custom timeline component using Card + Separator + Badge",
        "stages": ["Submitted", "In Review", "Resolved"],
        "visual": "Vertical timeline on mobile; horizontal on desktop",
        "status_colors": {
          "submitted": "indigo",
          "in_review": "saffron",
          "resolved": "success green"
        }
      }
    },

    "chat_widget": {
      "global_behavior": "Floating button bottom-right on all pages; expands into right-side panel (Sheet) with chat.",
      "floating_button": {
        "size": "h-12 w-12 sm:h-14 sm:w-14",
        "style": "bg-[hsl(var(--primary))] text-white rounded-2xl shadow-floating",
        "icon": "Lucide MessageCircle",
        "badge": "Optional unread dot (saffron)"
      },
      "panel": {
        "use": "Sheet (side='right')",
        "width": "w-[92vw] sm:w-[420px]",
        "header": "Title + Language toggle (Switch) + close",
        "thinking_state": "Wrap panel in 2px conic-gradient border that slowly rotates/pulses",
        "messages": "ScrollArea with staggered bubble entrance"
      },
      "chat_bubbles": {
        "user": "bg-slate-900 text-white rounded-2xl rounded-br-md",
        "ai": "bg-white border rounded-2xl rounded-bl-md",
        "meta": "timestamp text-xs text-muted-foreground"
      },
      "typing_indicator": {
        "spec": "Three dots pulsing with slight phase offset; no emoji",
        "implementation": "CSS keyframes + inline spans"
      }
    }
  },

  "motion": {
    "library": "framer-motion",
    "page_transition": {
      "initial": "{ opacity: 0, y: 10 }",
      "animate": "{ opacity: 1, y: 0 }",
      "transition": "{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
    },
    "micro_interactions": {
      "buttons": "whileTap={{ scale: 0.95 }}; hover uses subtle brightness/border shift (no transition:all)",
      "service_cards": "whileHover={{ y: -5 }} with spring { stiffness: 260, damping: 22 }",
      "stagger_lists": "container variants with staggerChildren: 0.1"
    },
    "success_animation": {
      "checkmark": "SVG path stroke-dashoffset animation",
      "ring": "motion.div scale from 0.6->1.2 opacity 0.35->0"
    },
    "reduced_motion": "Respect prefers-reduced-motion: disable parallax + reduce durations"
  },

  "accessibility": {
    "rules": [
      "WCAG AA contrast: indigo text on off-white; avoid saffron for body text (use for accents/CTAs only).",
      "Touch targets >= 44px; inputs >= h-11.",
      "Visible focus ring: ring-2 ring-[hsl(var(--ring))] ring-offset-2.",
      "Keyboard navigation: chat widget, sheet, dialogs fully reachable.",
      "Language toggle must have aria-label and visible label."
    ]
  },

  "data_testid_convention": {
    "rule": "All interactive and key informational elements MUST include data-testid in kebab-case describing role.",
    "examples": [
      "data-testid=\"navbar-services-link\"",
      "data-testid=\"hero-primary-cta-button\"",
      "data-testid=\"service-card-passport-renewal\"",
      "data-testid=\"service-detail-apply-now-button\"",
      "data-testid=\"chat-widget-open-button\"",
      "data-testid=\"chat-language-toggle\"",
      "data-testid=\"issue-step-next-button\"",
      "data-testid=\"issue-tracking-id-value\"",
      "data-testid=\"track-issue-submit-button\""
    ]
  },

  "images": {
    "image_urls": [
      {
        "category": "hero_background_support",
        "description": "Optional hero side image (use with heavy blur + low opacity overlay; do not reduce readability)",
        "url": "https://images.unsplash.com/photo-1589279068118-32d43608b1bc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGNpdHklMjBzdHJlZXQlMjBjaXZpYyUyMGluZnJhc3RydWN0dXJlJTIwY2xlYW4lMjBtb2Rlcm58ZW58MHx8fGJsdWV8MTc4MzQxMTQwMXww&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "how_it_works_section",
        "description": "City night walkway image for civic-tech vibe; use as small card media (not full-bleed)",
        "url": "https://images.unsplash.com/photo-1715753803757-fe8ab4ffcc0c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxpbmRpYSUyMGNpdHklMjBzdHJlZXQlMjBjaXZpYyUyMGluZnJhc3RydWN0dXJlJTIwY2xlYW4lMjBtb2Rlcm58ZW58MHx8fGJsdWV8MTc4MzQxMTQwMXww&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "footer_or_about_accent",
        "description": "Warm architecture accent image; use as tiny thumbnail or background blur blob",
        "url": "https://images.unsplash.com/photo-1655747313118-431d52eb4f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxpbmRpYSUyMG1vbnVtZW50JTIwYXJjaGl0ZWN0dXJlJTIwd2FybXxlbnwwfHx8b3JhbmdlfDE3ODM0MTE0MTN8MA&ixlib=rb-4.1.0&q=85"
      }
    ]
  },

  "implementation_notes_js": {
    "react_files": "Project uses .js (not .tsx). Write components in JSX with named exports for components and default exports for pages.",
    "global_css_changes": [
      "Replace CRA default App.css styles; do NOT center align .App.",
      "Update index.css :root tokens to match indigo/saffron palette above.",
      "Add keyframes for typing dots + chat thinking border rotation in index.css (scoped classes).",
      "Add subtle noise overlay utility via pseudo-element on hero only (optional)."
    ]
  },

  "instructions_to_main_agent": [
    "Update /app/frontend/src/index.css shadcn tokens to the provided HSL values; keep background off-white and cards white.",
    "Delete/neutralize CRA default App.css header centering; ensure no global text-align:center.",
    "Implement global PageTransition wrapper using Framer Motion with the specified y:10 fade.",
    "Use Sheet for the chat side panel; floating button fixed bottom-4 right-4 with data-testid='chat-widget-open-button'.",
    "Chat thinking state: wrap panel in a 2px conic-gradient border div and animate rotation (CSS keyframes) only while AI is responding.",
    "Services: Card grid with motion hover lift; Service detail uses Dialog with 3-section simplified content + Apply Now external link.",
    "Issue reporting: multi-step flow with Progress + stepper labels; on submit show AnimatedCheckmark + Tracking ID + timeline.",
    "Ensure every interactive element and key info has data-testid (kebab-case).",
    "Use sonner for toasts (success/error) and keep copy-to-clipboard feedback accessible."
  ]
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
