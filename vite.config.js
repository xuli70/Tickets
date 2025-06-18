import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		port: process.env.PORT || 5173,
		host: true,
		cors: true,
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: true,
	},
	preview: {
		port: process.env.PORT || 8080,
		host: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
		alias: {
			'@': path.resolve(process.cwd(), './src'),
		},
	},
	build: {
		outDir: 'dist',
		sourcemap: false,
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom'],
					'ui-vendor': [
						'@radix-ui/react-alert-dialog',
						'@radix-ui/react-avatar',
						'@radix-ui/react-checkbox',
						'@radix-ui/react-dialog',
						'@radix-ui/react-dropdown-menu',
						'@radix-ui/react-label',
						'@radix-ui/react-slider',
						'@radix-ui/react-slot',
						'@radix-ui/react-tabs',
						'@radix-ui/react-toast',
					],
				},
			},
		},
	},
});