import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      layout: {
        dividerWeight: "1px", 
        disabledOpacity: 0.45, 
        fontSize: {
          tiny: "0.75rem",   // 12px
          small: "0.875rem", // 14px
          medium: "0.9375rem", // 15px
          large: "1.125rem", // 18px
        },
        lineHeight: {
          tiny: "1rem", 
          small: "1.25rem", 
          medium: "1.5rem", 
          large: "1.75rem", 
        },
        radius: {
          small: "8px", 
          medium: "12px", 
          large: "16px", 
        },
        borderWidth: {
          small: "1px", 
          medium: "1px", 
          large: "2px", 
        },
      },
      themes: {
        light: {
          colors: {
            "background": {
              "DEFAULT": "#f8f9fc"
            },
            "content1": {
              "DEFAULT": "rgba(255, 255, 255, 0.8)",
              "foreground": "#11181C"
            },
            "content2": {
              "DEFAULT": "rgba(255, 255, 255, 0.6)",
              "foreground": "#27272a"
            },
            "content3": {
              "DEFAULT": "rgba(255, 255, 255, 0.4)",
              "foreground": "#3f3f46"
            },
            "content4": {
              "DEFAULT": "rgba(255, 255, 255, 0.3)",
              "foreground": "#52525b"
            },
            "divider": {
              "DEFAULT": "rgba(17, 17, 17, 0.1)"
            },
            "focus": {
              "DEFAULT": "#5e72e4"
            },
            "foreground": {
              "50": "#fafafa",
              "100": "#f4f4f5",
              "200": "#e4e4e7",
              "300": "#d4d4d8",
              "400": "#a1a1aa",
              "500": "#71717a",
              "600": "#52525b",
              "700": "#3f3f46",
              "800": "#27272a",
              "900": "#18181b",
              "DEFAULT": "#11181C"
            },
            "overlay": {
              "DEFAULT": "#000000"
            },
            "primary": {
              "50": "#eef2ff",
              "100": "#e0e7ff",
              "200": "#c7d2fe",
              "300": "#a5b4fc",
              "400": "#818cf8",
              "500": "#5e72e4", // More vibrant primary
              "600": "#4f46e5",
              "700": "#4338ca",
              "800": "#3730a3",
              "900": "#312e81",
              "DEFAULT": "#5e72e4",
              "foreground": "#ffffff"
            },
            "secondary": {
              "50": "#f0f4fe",
              "100": "#d9e2fd",
              "200": "#b6c9fc",
              "300": "#8aa7f9",
              "400": "#5d7ef5",
              "500": "#4263eb", // More vibrant secondary
              "600": "#3651e2",
              "700": "#2f46cf",
              "800": "#2c3ea6",
              "900": "#293983",
              "DEFAULT": "#4263eb",
              "foreground": "#fff"
            },
            "success": {
              "50": "#ecfdf5",
              "100": "#d1fae5",
              "200": "#a7f3d0",
              "300": "#6ee7b7",
              "400": "#34d399",
              "500": "#10b981", // More vibrant success
              "600": "#059669",
              "700": "#047857",
              "800": "#065f46",
              "900": "#064e3b",
              "DEFAULT": "#10b981",
              "foreground": "#ffffff"
            },
            "warning": {
              "50": "#fffbeb",
              "100": "#fef3c7",
              "200": "#fde68a",
              "300": "#fcd34d",
              "400": "#fbbf24",
              "500": "#f59e0b", // More vibrant warning
              "600": "#d97706",
              "700": "#b45309",
              "800": "#92400e",
              "900": "#78350f",
              "DEFAULT": "#f59e0b",
              "foreground": "#ffffff"
            },
            "danger": {
              "50": "#fef2f2",
              "100": "#fee2e2",
              "200": "#fecaca",
              "300": "#fca5a5",
              "400": "#f87171",
              "500": "#ef4444", // More vibrant danger
              "600": "#dc2626",
              "700": "#b91c1c",
              "800": "#991b1b",
              "900": "#7f1d1d",
              "DEFAULT": "#ef4444",
              "foreground": "#ffffff"
            }
          }
        }
      }
    })
  ]
}