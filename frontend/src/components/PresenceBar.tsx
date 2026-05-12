interface PresenceBarProps {
  users: string[]
}

export function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) {
    return <div className="presence-bar">No users connected</div>
  }

  return (
    <div className="presence-bar">
      <span className="presence-label">Connected: </span>
      {users.join(', ')}
    </div>
  )
}
