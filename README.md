# React + Tailwind

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules. One top of the standard Vite setup, [tailwindcss](https://tailwindcss.com/) is installed and ready to be used in React components.

Additional references:

- [Getting started with Vite](https://vitejs.dev/guide/)
- [Tailwind documentation](https://tailwindcss.com/docs/installation)

## Backend for Email Registration

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root with your SMTP credentials:
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=465
   SMTP_USER=your@email.com
   SMTP_PASS=yourpassword
   EMAIL_FROM=your@email.com
   ```
3. Start the backend server:
   ```bash
   node email-backend.js
   ```

The backend will run on http://localhost:4000 and provide `/register-email` and `/verify-email` endpoints.
