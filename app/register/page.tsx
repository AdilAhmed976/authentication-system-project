import SignupForm from "@/form/signup"

const RegisterPage = () => {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-8">
    <section className="w-full max-w-sm md:max-w-lg">
      <SignupForm />
    </section>
  </main>
  )
}

export default RegisterPage
