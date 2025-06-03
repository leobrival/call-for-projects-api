'use client'

import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type RegisterFormData = {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
  terms: boolean
}

interface RegisterProps {
  errors?: {
    fullName?: string
    email?: string
    password?: string
    passwordConfirmation?: string
    terms?: string
    general?: string
  }
}

export default function Register({ errors = {} }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      terms: false,
    },
  })

  function onSubmit(values: RegisterFormData) {
    // Basic validation
    if (!values.fullName || !values.email || !values.password || !values.terms) return
    if (values.password !== values.passwordConfirmation) {
      form.setError('passwordConfirmation', { message: 'Les mots de passe ne correspondent pas.' })
      return
    }

    setIsSubmitting(true)

    router.post('/register', values, {
      onFinish: () => setIsSubmitting(false),
      onError: (errors) => {
        // Set server-side validation errors
        if (errors.fullName) form.setError('fullName', { message: errors.fullName })
        if (errors.email) form.setError('email', { message: errors.email })
        if (errors.password) form.setError('password', { message: errors.password })
        if (errors.passwordConfirmation)
          form.setError('passwordConfirmation', { message: errors.passwordConfirmation })
        if (errors.terms) form.setError('terms', { message: errors.terms })
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre plateforme et commencez à collaborer sur des projets
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John Doe" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="text-gray-400 text-sm">
                            {showPassword ? '🙈' : '👁️'}
                          </span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="mt-1 text-xs text-gray-500">
                      Au moins 8 caractères avec des lettres et des chiffres
                    </p>
                  </FormItem>
                )}
              />

              {/* Password Confirmation */}
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswordConfirmation ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        >
                          <span className="text-gray-400 text-sm">
                            {showPasswordConfirmation ? '🙈' : '👁️'}
                          </span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms and Conditions */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-900 font-normal">
                        J'accepte les{' '}
                        <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                          conditions d'utilisation
                        </Link>{' '}
                        et la{' '}
                        <Link
                          href="/privacy"
                          className="text-blue-600 hover:text-blue-500 underline"
                        >
                          politique de confidentialité
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </form>
          </Form>

          {/* Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Déjà un compte ? </span>
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium underline"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
