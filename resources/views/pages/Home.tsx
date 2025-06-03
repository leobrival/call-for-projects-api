import { Link } from '@inertiajs/react'
import { Button } from '../../js/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../js/components/ui/card'
import Layout from './Layout'

interface HomeProps {
  message?: string
}

export default function Home({ message }: HomeProps) {
  return (
    <Layout title="Accueil">
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue dans Call for Projects
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {message || 'Plateforme de gestion de projets avec AdonisJS, Inertia.js et React'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card>
                <CardHeader>
                  <div className="text-green-500 text-2xl mb-4">✅</div>
                  <CardTitle>AdonisJS Backend</CardTitle>
                  <CardDescription>
                    Framework robuste pour l'API REST avec authentification JWT
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="text-blue-500 text-2xl mb-4">⚡</div>
                  <CardTitle>Inertia.js</CardTitle>
                  <CardDescription>SPA moderne sans API avec Server-Side Rendering</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="text-purple-500 text-2xl mb-4">⚛️</div>
                  <CardTitle>React</CardTitle>
                  <CardDescription>Interface utilisateur moderne et réactive</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-12 space-x-4">
              <Button asChild size="lg">
                <Link href="/projects">Découvrir les projets</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/organizations">Voir les organisations</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
