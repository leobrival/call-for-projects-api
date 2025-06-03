import { Link } from '@inertiajs/react'
import { Button } from '../../js/components/ui/button'
import Layout from './Layout'

interface Project {
  id: number
  title: string
  description: string
  organizationId: number
  createdBy: number
  createdAt: string
  updatedAt: string
  organization?: {
    id: number
    name: string
  }
}

interface ProjectsProps {
  projects: Project[]
}

export default function Projects({ projects = [] }: ProjectsProps) {
  return (
    <Layout title="Projets">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
              <p className="text-gray-600 mt-2">Découvrez et gérez vos projets collaboratifs</p>
            </div>

            <Button asChild>
              <Link href="/projects/create">+ Nouveau projet</Link>
            </Button>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.title}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">#{project.id}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

                  {project.organization && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.organization.name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                    </span>

                    <div className="space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/projects/${project.id}`}>Voir</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet disponible</h3>
              <p className="text-gray-600 mb-6">
                Commencez en créant votre premier projet collaboratif
              </p>

              <Button asChild>
                <Link href="/projects/create">Créer mon premier projet</Link>
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                💡 Conseils pour vos projets
              </h4>
              <p className="text-blue-700 text-sm">
                Utilisez des descriptions claires et définissez des objectifs précis pour attirer
                les meilleurs collaborateurs.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-green-900 mb-2">
                🤝 Collaboration efficace
              </h4>
              <p className="text-green-700 text-sm">
                Invitez des membres à votre organisation pour faciliter la gestion et le partage des
                projets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
