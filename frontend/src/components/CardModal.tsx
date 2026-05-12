import type { Card, CardFormValues } from '../types'

interface CardModalProps {
  initialValues?: Partial<Card>
  onSubmit: (values: CardFormValues) => void
  onClose: () => void
}

export function CardModal({ initialValues, onSubmit, onClose }: CardModalProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    onSubmit({
      title: (data.get('title') as string).trim(),
      description: (data.get('description') as string).trim(),
      assignee: (data.get('assignee') as string).trim(),
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialValues?.id ? 'Edit Card' : 'Add Card'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Title *
            <input
              name="title"
              required
              defaultValue={initialValues?.title ?? ''}
              autoFocus
              placeholder="Card title"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              defaultValue={initialValues?.description ?? ''}
              placeholder="Optional description"
              rows={3}
            />
          </label>
          <label>
            Assignee
            <input
              name="assignee"
              defaultValue={initialValues?.assignee ?? ''}
              placeholder="Who is this assigned to?"
            />
          </label>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialValues?.id ? 'Save' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
