/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flyonui/dist/js/*.js",
    "./js/*.js",
    "./*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("flyonui"),
    require("flyonui/plugin")
  ],
  flyonui: {
    themes: ["light", "corporate"],
    vendors: true,
  }
}