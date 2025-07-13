type User = {
  employerProfile: string
  workerProfile: string
}

export const user = $state<{ current: User | null; hasMultipleRoles: boolean }>({
  current: null,
  get hasMultipleRoles() {
    return !!(this.current?.employerProfile && this.current?.workerProfile)
  },
})
export function setCurrentUser(userData: any) {
  user.current = userData
}

export function clearCurrentUser() {
  user.current = null
}
