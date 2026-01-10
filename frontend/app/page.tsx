import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Restaurant Management System
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Web-based dashboard for configuring restaurant management backend API
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Frontend
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Next.js 16 with React, TypeScript, and shadcn/ui
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Running</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Backend API
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                NestJS with Swagger documentation
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Not Started</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Keycloak
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                OAuth2/OIDC Authentication
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Not Started</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">
              Quick Links
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                <Link href="/api/docs" target="_blank">
                  API Documentation (Swagger)
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="http://localhost:8080" target="_blank">
                  Keycloak Admin Console
                </Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">
              Features
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Server-Side Rendering (SSR) with Next.js</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>API-first development approach with Swagger</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Keycloak OAuth2 authentication</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Role-based access control (RBAC)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Modern UI with shadcn/ui components</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Type-safe development with TypeScript</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
