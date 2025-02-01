import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Already existing colors from your snippet
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // New brand colors
        brandBeige: "var(--brand-beige)",
        brandPlum: "var(--brand-plum)",
        brandRed: "var(--brand-red)",
        brandOrange: "var(--brand-orange)",
        brandGray: "var(--brand-gray)",
      },

      // Already existing font family
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif']
      },
    },
  },
  plugins: [],
} satisfies Config;
