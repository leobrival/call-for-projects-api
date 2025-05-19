import vine from '@vinejs/vine'

export const signupValidator = vine.object({
  email: vine.string().email(),
  fullName: vine.string(),
  password: vine
    .string()
    .minLength(12)
    .regex(/[a-z]/) // minuscule
    .regex(/[A-Z]/) // majuscule
    .regex(/\d/) // chiffre
    .regex(/[^A-Za-z0-9]/), // symbole
})
