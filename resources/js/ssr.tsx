import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp } from '@inertiajs/react'
import React from 'react'
import { renderToString } from 'react-dom/server'

const appName = import.meta.env.VITE_APP_NAME || 'Call for Projects'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: renderToString,
    title: (title: string) => `${title} - ${appName}`,
    resolve: async (name: string) => {
      // Log pour déboguer la résolution des pages
      console.log('SSR resolving page:', name)

      try {
        // Essayons d'abord avec le nom tel quel (majuscule)
        const pageComponent = await resolvePageComponent(
          `../views/pages/${name}.tsx`,
          import.meta.glob('../views/pages/**/*.tsx')
        )
        console.log('SSR page resolved successfully:', name)
        return pageComponent
      } catch (error) {
        console.error('SSR page resolution failed for:', name)

        // Si ça échoue, essayons avec la première lettre en majuscule
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
        try {
          console.log('SSR trying capitalized name:', capitalizedName)

          const pageComponent = await resolvePageComponent(
            `../views/pages/${capitalizedName}.tsx`,
            import.meta.glob('../views/pages/**/*.tsx')
          )
          console.log('SSR page resolved with capitalized name:', capitalizedName)
          return pageComponent
        } catch (secondError) {
          console.error(
            'SSR page resolution failed for capitalized name:',
            capitalizedName,
            secondError
          )
          throw error
        }
      }
    },
    setup: ({ App, props }: { App: React.ComponentType<any>; props: any }) => {
      return React.createElement(App, props)
    },
  })
}
