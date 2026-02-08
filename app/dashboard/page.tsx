"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient()
const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function handleSignOut() {
    await supabase.auth.signOut()
    setCurrentUser(null)    
    router.push("/login")
  }

  useEffect(() => {
    let isMounted = true
    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (!isMounted) {
          return
        }
        if (error) {
          setCurrentUser(null)
          return
        }
        setCurrentUser(data?.user ?? null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading user…</div>
  }

  if (!currentUser) {
    return <div className="p-10 text-center text-slate-400">No active session</div>
  }

  const metadata = currentUser.user_metadata
  const provider = currentUser.app_metadata?.provider
  const identities = currentUser.identities?.map((i) => i.provider).join(", ")

  return (
    <div className="mx-auto max-w-3xl p-8 text-white">
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-6 border-b border-white/10 pb-6">
          {metadata?.avatar_url && (
            <img
              src={metadata.avatar_url}
              alt="avatar"
              className="h-20 w-20 rounded-full border border-white/20"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold">
              {metadata?.full_name || metadata?.name || "User"}
            </h1>
            <p className="text-slate-400">{currentUser.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <Detail label="User ID" value={currentUser.id} mono />
          <Detail label="Phone" value={currentUser.phone} />
          <Detail label="Provider" value={provider} />
          <Detail label="Identities" value={identities} />
          <Detail
            label="Email Confirmed"
            value={
              currentUser.email_confirmed_at
                ? new Date(currentUser.email_confirmed_at).toLocaleString()
                : "No"
            }
          />
          <Detail
            label="Account Created"
            value={new Date(currentUser.created_at).toLocaleString()}
          />
          <Detail
            label="Last Sign In"
            value={
              currentUser.last_sign_in_at
                ? new Date(currentUser.last_sign_in_at).toLocaleString()
                : "—"
            }
          />
        </div>

        {/* Metadata */}
        <div className="mt-8">
          <h2 className="mb-3 text-slate-400">User Metadata</h2>
          <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-8 w-full rounded-full bg-white/10 py-3 font-semibold transition hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string
  value?: string | null
  mono?: boolean
}) {
  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-black/30 p-4">
      <span className="text-slate-400">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value || "—"}</span>
    </div>
  )
}
