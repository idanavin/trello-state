// ---------------------------------------------------------------------------
// getUserName — stable per browser session, readable from ?user= query param
// ---------------------------------------------------------------------------

export function getUserName(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('user')
  if (fromUrl) return fromUrl
  const key = 'trello-state-username'
  let name = localStorage.getItem(key)
  if (!name) {
    name = `User-${Math.floor(Math.random() * 9000) + 1000}`
    localStorage.setItem(key, name)
  }
  return name
}
