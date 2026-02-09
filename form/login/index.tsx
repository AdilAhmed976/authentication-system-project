"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormProps, LoginFormValues } from "./login.types"
import { LoginSchema } from "./login.schema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { FieldDescription, FieldSeparator } from "@/components/ui/field"
import Image from "next/image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"

const LoginForm = ({}: LoginFormProps) => {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Logged in successfully")
      router.replace("/dashboard")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: false,
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {

      if (session?.user?.id) {
        router.replace("/dashboard")
        router.refresh()
      }
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [supabase , router])

  return (
    <div className={"flex flex-col md:gap-4 gap-2"}>
      <Card className="overflow-hidden p-0">
        <CardContent className="py-4 md:py-6 px-4 md:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              method="post"
              className="flex flex-col gap-4 sm:gap-6"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-xs">Login to your Account</p>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="bg-background pr-8"
                          id="password-toggle"
                          placeholder="Enter your password"
                          type={isVisible ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setIsVisible(!isVisible)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          {isVisible ? (
                            <EyeOff className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <Eye className="text-muted-foreground h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging In..." : "Log In"}{" "}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </Button>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Button variant="outline" type="button" onClick={handleLogInWithGoogle}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                <span>Login with Google</span>
              </Button>
              <p className="text-center text-xs">
                Don&apos;t have an account?{" "}
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href={"/register"}
                >
                  Sign up
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="text-xs text-center">
        By clicking continue, you agree to our <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>
      </FieldDescription>
    </div>
  )
}

export default LoginForm
