/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./entrypoints/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Aqua Dream theme color palette
        "aqua-dream": {
          // Light Sky Blue series (#ADD7F6)
          sky: {
            50: "hsl(214, 100%, 98%)",
            100: "hsl(214, 100%, 95%)",
            200: "hsl(214, 100%, 91%)", // #ADD7F6
            300: "hsl(214, 100%, 87%)",
            400: "hsl(214, 100%, 82%)",
            500: "hsl(214, 100%, 76%)",
            600: "hsl(214, 90%, 70%)",
            700: "hsl(214, 80%, 60%)",
            800: "hsl(214, 70%, 50%)",
            900: "hsl(214, 60%, 40%)",
          },
          // Medium Sky Blue series (#87BFFF)
          blue: {
            50: "hsl(217, 100%, 98%)",
            100: "hsl(217, 100%, 94%)",
            200: "hsl(217, 100%, 89%)",
            300: "hsl(217, 100%, 84%)",
            400: "hsl(217, 100%, 76%)", // #87BFFF
            500: "hsl(217, 100%, 70%)",
            600: "hsl(217, 95%, 65%)",
            700: "hsl(217, 90%, 55%)",
            800: "hsl(217, 85%, 45%)",
            900: "hsl(217, 80%, 35%)",
          },
          // Bright Blue series (#3F8EFC) - Primary
          primary: {
            50: "hsl(216, 100%, 97%)",
            100: "hsl(216, 100%, 93%)",
            200: "hsl(216, 100%, 87%)",
            300: "hsl(216, 100%, 80%)",
            400: "hsl(216, 100%, 72%)",
            500: "hsl(216, 100%, 62%)", // #3F8EFC
            600: "hsl(216, 95%, 55%)",
            700: "hsl(216, 90%, 48%)",
            800: "hsl(216, 85%, 40%)",
            900: "hsl(216, 80%, 32%)",
          },
          // Deep Blue series (#2667FF)
          secondary: {
            50: "hsl(228, 100%, 96%)",
            100: "hsl(228, 100%, 91%)",
            200: "hsl(228, 100%, 84%)",
            300: "hsl(228, 100%, 76%)",
            400: "hsl(228, 100%, 67%)",
            500: "hsl(228, 100%, 59%)", // #2667FF
            600: "hsl(228, 95%, 52%)",
            700: "hsl(228, 90%, 45%)",
            800: "hsl(228, 85%, 38%)",
            900: "hsl(228, 80%, 30%)",
          },
          // Dark Blue Purple series (#3B28CC)
          deep: {
            50: "hsl(249, 100%, 95%)",
            100: "hsl(249, 100%, 88%)",
            200: "hsl(249, 100%, 78%)",
            300: "hsl(249, 100%, 68%)",
            400: "hsl(249, 100%, 58%)",
            500: "hsl(249, 75%, 48%)", // #3B28CC
            600: "hsl(249, 70%, 42%)",
            700: "hsl(249, 65%, 36%)",
            800: "hsl(249, 60%, 30%)",
            900: "hsl(249, 55%, 24%)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: ["class"],
};
