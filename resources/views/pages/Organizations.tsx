import { Link } from '@inertiajs/react'
import { Button } from '../../js/components/ui/button'
import Layout from './Layout'

interface Organization {
  id: number
  name: string
  description: string
  slug: string
  createdAt: string
  updatedAt: string
  membersCount?: number
  projectsCount?: number
  userRole?: string
}

interface OrganizationsProps {
  organizations: Organization[]
  canCreate?: boolean
}

export default function Organizations({
  organizations = [],
  canCreate = false,
}: OrganizationsProps) {
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-orange-100 text-orange-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'manager':
        return 'Manager'
      case 'member':
        return 'Membre'
      default:
        return 'Invité'
    }
  }

  return (
    <Layout title="Organisations">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organisations</h1>
              <p className="text-gray-600 mt-2">Gérez vos équipes et collaborations</p>
            </div>

            <Button asChild>
              <Link href="/organizations/create">+ Nouvelle organisation</Link>
            </Button>
          </div>

          {/* Organizations Grid */}
          {organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((organization) => (
                <div
                  key={organization.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {organization.name}
                      </h3>
                      <p className="text-xs text-gray-500">@{organization.slug}</p>
                    </div>

                    {organization.userRole && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(organization.userRole)}`}
                      >
                        {getRoleLabel(organization.userRole)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {organization.description || 'Aucune description disponible'}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {organization.membersCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Membres</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {organization.projectsCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Projets</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Créée le {new Date(organization.createdAt).toLocaleDateString('fr-FR')}
                    </span>

                    <div className="space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organizations/${organization.id}`}>Voir</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune organisation</h3>
              <p className="text-gray-600 mb-6">
                Créez votre première organisation pour commencer à collaborer en équipe
              </p>

              <Button asChild>
                <Link href="/organizations/create">Créer ma première organisation</Link>
              </Button>
            </div>
          )}

          {/* Benefits Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Pourquoi créer une organisation ?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-purple-500 text-3xl mb-3">👥</div>
                <h4 className="text-lg font-semibold text-purple-900 mb-2">Travail d'équipe</h4>
                <p className="text-purple-700 text-sm">
                  Invitez des collaborateurs et gérez les permissions facilement
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-blue-500 text-3xl mb-3">📊</div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Gestion centralisée</h4>
                <p className="text-blue-700 text-sm">
                  Organisez tous vos projets au même endroit avec une vision globale
                </p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg text-center">
                <div className="text-orange-500 text-3xl mb-3">🔒</div>
                <h4 className="text-lg font-semibold text-orange-900 mb-2">Sécurité avancée</h4>
                <p className="text-orange-700 text-sm">
                  Contrôlez qui peut voir et modifier vos projets sensibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
