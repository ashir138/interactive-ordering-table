import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Pizza3.14 design system tokens
        ember:           "hsl(24 95% 53%)",
        "ember-dim":     "hsl(24 60% 35%)",
        cheese:          "hsl(42 92% 62%)",
        "cheese-dim":    "hsl(42 70% 45%)",
        tomato:          "hsl(8 75% 55%)",
        crust:           "hsl(28 38% 22%)",
        basil:           "hsl(135 45% 50%)",
        cream:           "hsl(38 30% 92%)",
        void:            "hsl(240 10% 3%)",
        glass:           "hsl(240 8% 7%)",
        frost:           "hsl(240 6% 11%)",
        smoke:           "hsl(240 5% 40%)",
        ash:             "hsl(240 5% 25%)",
        "status-new":       "hsl(260 70% 65%)",
        "status-preparing": "hsl(200 85% 55%)",
        "status-baking":    "hsl(38 95% 55%)",
        "status-ready":     "hsl(142 70% 45%)",
        "status-served":    "hsl(240 5% 40%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        // Premium tabletop pairing (scoped to builder components via font-display / font-ui)
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "ring-breathe": {
          "0%, 100%": { boxShadow: "0 0 32px hsl(24 95% 53% / 0.45)" },
          "50%":      { boxShadow: "0 0 60px hsl(24 95% 53% / 0.85)" },
        },
        "pop-in": {
          "0%":   { transform: "scale(0.5)", opacity: "0" },
          "70%":  { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
        "spin-slow":      "spin-slow 18s linear infinite",
        "ring-breathe":   "ring-breathe 2s ease-in-out infinite",
        "pop-in":         "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "shimmer":        "shimmer 1.8s linear infinite",
        "count-up":       "count-up 0.3s ease-out both",
        "float":          "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
