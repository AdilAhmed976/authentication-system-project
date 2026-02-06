import LoginForm from "@/form/login"

const LogInPage = () => {
  return (
    <main className="bg-white flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <section className="w-full max-w-sm md:max-w-md">
        <LoginForm />
      </section>
    </main>
  )
}

export default LogInPage
