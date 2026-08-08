/** 
 * NOTE: The project build uses Tailwind v4 via CLI in package.json.
 * This tailwind.config.js (v3 format) is intentionally kept here purely to enable 
 * IDE tooling (like Tailwind CSS IntelliSense) and PostCSS integrations 
 * that haven't fully migrated to v4 configuration yet.
 * 
 * @type {import('tailwindcss').Config} 
 */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
    "./plugins/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  important: '#accessibility-widget-root',
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable preflight so we don't break the consumer's CSS
  },
}
