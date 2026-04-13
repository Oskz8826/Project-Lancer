import PocketBase from 'pocketbase'

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'

// Singleton for client-side usage
let clientInstance: PocketBase | null = null

export function getPocketBase(): PocketBase {
  if (typeof window === 'undefined') {
    // Server-side: new instance per request
    return new PocketBase(PB_URL)
  }
  if (!clientInstance) {
    clientInstance = new PocketBase(PB_URL)
    clientInstance.autoCancellation(false)

    // Sync auth to cookie so the middleware can read it server-side
    clientInstance.authStore.onChange(() => {
      if (clientInstance!.authStore.isValid) {
        document.cookie = `pb_auth=${JSON.stringify({ token: clientInstance!.authStore.token })}; path=/; max-age=604800; SameSite=Lax`
      } else {
        document.cookie = 'pb_auth=; path=/; max-age=0; SameSite=Lax'
      }
    }, true) // true = fire immediately with current state
  }
  return clientInstance
}

export const pb = getPocketBase()
