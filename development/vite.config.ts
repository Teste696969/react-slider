import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Output the production build to the project root directory
    outDir: '.',
    // Do not empty the root folder before build to avoid deleting source files
    emptyOutDir: false,
    // Keep default assets folder
    assetsDir: 'assets'
  }
})


