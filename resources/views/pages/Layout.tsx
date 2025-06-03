import { Button } from '@/components/ui/button'
import { Head, Link, router, usePage } from '@inertiajs/react'
import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

interface User {
  id: number
  email: string
  fullName: string
}

interface PageProps extends Record<string, unknown> {
  auth?: {
    user?: User
  }
}

export default function Layout({ children, title = 'Call for Projects' }: LayoutProps) {
  const { auth } = usePage<PageProps>().props
  const user = auth?.user

  const handleLogout = () => {
    router.visit('/logout', { method: 'post' })
  }

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                  Call for Projects
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Button asChild variant="link">
                    <Link href="/" className="text-gray-600 hover:text-gray-900">
                      Accueil
                    </Link>
                  </Button>
                  <Button asChild variant="link">
                    <Link href="/projects" className="text-gray-600 hover:text-gray-900">
                      Projets
                    </Link>
                  </Button>
                  <Button asChild variant="link">
                    <Link href="/organizations" className="text-gray-600 hover:text-gray-900">
                      Organisations
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  // Utilisateur connecté
                  <>
                    <span className="text-sm text-gray-600">
                      Bonjour, <span className="font-medium">{user.fullName}</span>
                    </span>
                    <Button size="lg" variant="outline" onClick={handleLogout}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  // Utilisateur non connecté
                  <>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/login">Connexion</Link>
                    </Button>
                    <Button asChild size="lg">
                      <Link href="/signup">Inscription</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-500">
              © 2024 Call for Projects. Propulsé par AdonisJS + Inertia.js + React
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
