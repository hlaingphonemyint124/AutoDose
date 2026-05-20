import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable code splitting for faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
    // Increase chunk size warning limit (large apps are expected)
    chunkSizeWarningLimit: 1000,
    // Enable source map for production debugging (optional: remove for smaller builds)
    sourcemap: false,
    // Minify for smaller bundles
    minify: "esbuild",
    // Target modern browsers for smaller output
    target: "es2020",
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize deps pre-bundling
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
});
