/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        'custom-card': 'repeat(3, 150px)',
      },
    },
  },
  plugins: [],
};
