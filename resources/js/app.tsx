import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp } from '@inertiajs/react'
import React from 'react'
import { createRoot } from 'react-dom/client'

const appName = import.meta.env.VITE_APP_NAME || 'Call for Projects'

createInertiaApp({
  progress: { color: '#29d' },
  title: (title: string) => `${title} - ${appName}`,
  resolve: async (name: string) => {
    // Log pour déboguer la résolution des pages
    console.log('Client resolving page:', name)

    try {
      // Essayons d'abord avec le nom tel quel
      const pageComponent = await resolvePageComponent(
        `../views/pages/${name}.tsx`,
        import.meta.glob('../views/pages/**/*.tsx')
      )
      console.log('Client page resolved successfully:', name)
      return pageComponent
    } catch (error) {
      console.error('Client page resolution failed for:', name)

      // Si ça échoue, essayons avec la première lettre en majuscule
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
      try {
        console.log('Client trying capitalized name:', capitalizedName)

        const pageComponent = await resolvePageComponent(
          `../views/pages/${capitalizedName}.tsx`,
          import.meta.glob('../views/pages/**/*.tsx')
        )
        console.log('Client page resolved with capitalized name:', capitalizedName)
        return pageComponent
      } catch (secondError) {
        console.error(
          'Client page resolution failed for capitalized name:',
          capitalizedName,
          secondError
        )
        throw error
      }
    }
  },
  setup({ el, App, props }: { el: HTMLElement; App: React.ComponentType<any>; props: any }) {
    const root = createRoot(el)
    root.render(React.createElement(App, props))
  },
})
