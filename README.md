# Distributed Homelab Linktree

A lightweight, stateless, and heavily optimized landing page for homelab environments. Built with Astro, styled with Tailwind CSS, and validated by Zod.

Designed specifically to run as a multi-replica Kubernetes deployment.

## How it works

1. Services are defined in `src/config/services.json`.
2. At build time, **Zod** parses this JSON file. If a URL is malformed or a required field is missing, the container build will fail.
3. Astro generates a completely static HTML/CSS site (`dist/`).
4. The final container uses an unprivileged Nginx image to serve these static files. 
5. Because there is no runtime state or backend API, Kubernetes can spawn as many replicas of this pod as needed.

## Local Development

1. Install dependencies:
   ```bash
   npm install
