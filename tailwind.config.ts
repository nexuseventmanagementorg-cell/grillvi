import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        grill: {
          black: "#0B0B0C",
          dark: "#121215",
          charcoal: "#1A1A20",
          card: "#18181E",
          cardHover: "#202028",
          border: "#2A2A34",
          borderLight: "#383846",
          gold: {
            DEFAULT: "#E5A93C",
            light: "#F5C76D",
            dark: "#B87C1D",
            muted: "#9E7B35",
          },
          orange: {
            DEFAULT: "#E65100",
            light: "#FF7043",
            dark: "#BF360C",
          },
          red: {
            DEFAULT: "#D84315",
            dark: "#9E2A00",
          },
          text: {
            primary: "#F3F4F6",
            secondary: "#9CA3AF",
            muted: "#6B7280",
          },
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(229, 169, 60, 0.2)",
        goldGlow: "0 0 25px rgba(229, 169, 60, 0.35)",
        orangeGlow: "0 0 25px rgba(230, 81, 0, 0.4)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F5C76D 0%, #E5A93C 50%, #B87C1D 100%)',
        'fiery-gradient': 'linear-gradient(135deg, #FF7043 0%, #E65100 50%, #D84315 100%)',
        'dark-radial': 'radial-gradient(circle at 50% 0%, #1F1F27 0%, #0B0B0C 70%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
