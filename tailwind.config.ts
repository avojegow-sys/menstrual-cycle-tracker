import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: "#E8A0BF",
        accent: "#BA90C6",
        canvas: "#FDF4FF",
        // Calendar day states
        period: "#E8A0BF",
        fertile: "#E7D5F0",
        ovulation: "#BA90C6",
        pms: "#FBE3EF",
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(186, 144, 198, 0.35)",
        card: "0 10px 30px -12px rgba(186, 144, 198, 0.30)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      backgroundImage: {
        "gradient-soft":
          "linear-gradient(135deg, #E8A0BF 0%, #BA90C6 100%)",
        "gradient-canvas":
          "linear-gradient(160deg, #FDF4FF 0%, #FBE3EF 100%)",
      },
      fontFamily: {
        sans: ["var(--font-system)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
