import { useEffect, useState } from 'react'
import './Dashboard.css'

const today = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date())

const filters = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'To do' },
  { id: 'done', label: 'Done' },
]

function Dashboard({ user }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/tasks', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => [])
        if (!response.ok) throw new Error(result.message || 'Could not load your tasks.')
        setTasks(result)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setMessage(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const completedCount = tasks.filter((task) => task.done).length
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'open') return !task.done
    if (filter === 'done') return task.done
    return true
  })
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
  async function addTask(event) {
    event.preventDefault()
    const title = newTask.trim()
    if (!title || isSaving) return

    setIsSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Could not save this task.')
      setTasks((currentTasks) => [...currentTasks, result])
      setNewTask('')
      setFilter('all')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleTask(task) {
    setMessage('')
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Could not update this task.')
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => currentTask.id === result.id ? result : currentTask),
      )
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function removeTask(taskId) {
    setMessage('')
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not remove this task.')
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function clearCompleted() {
    const completedTasks = tasks.filter((task) => task.done)
    setMessage('')
    try {
      const responses = await Promise.all(
        completedTasks.map((task) => fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })),
      )
      if (responses.some((response) => !response.ok)) {
        throw new Error('Some completed tasks could not be removed.')
      }
      setTasks((currentTasks) => currentTasks.filter((task) => !task.done))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function signOut() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Could not sign out. Please try again.')
      window.location.reload()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <a className="dashboard-brand" href="#today" aria-label="Good, Slowly home">
          <span className="dashboard-brand-mark" aria-hidden="true">g.</span>
          <span>good, slowly</span>
        </a>
        <div className="dashboard-account">
          <span className="dashboard-account-email">{user.email}</span>
          <button className="dashboard-signout" type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="planner-main" id="today">
        <section className="planner-intro">
          <div>
            <p className="planner-eyebrow"><span /> YOUR SPACE, YOUR PACE</p>
            <h1>Today,<br /><em>at your pace.</em></h1>
            <p className="planner-subtitle">A little room for what matters today.</p>
          </div>
          <div className="today-note">
            <span className="today-note-label">TODAY</span>
            <span className="today-note-date">{today}</span>
            <span className="today-note-star" aria-hidden="true">*</span>
          </div>
        </section>

        <section className="planner-board" aria-labelledby="tasks-heading">
          <header className="planner-board-heading">
            <div>
              <p className="planner-board-kicker">YOUR DAILY LIST</p>
              <h2 id="tasks-heading">The little things</h2>
            </div>
            <span className="planner-total" aria-label={`${tasks.length} total tasks`}>
              {tasks.length.toString().padStart(2, '0')}
            </span>
          </header>

          <div className="planner-progress">
            <div className="planner-progress-copy">
              <span>{completedCount} of {tasks.length} complete</span>
              <span>{progress}%</span>
            </div>
            <div
              className="planner-progress-track"
              role="progressbar"
              aria-label="Tasks completed"
              aria-valuemin="0"
              aria-valuemax={tasks.length || 1}
              aria-valuenow={completedCount}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="planner-toolbar">
            <div className="planner-filters" role="group" aria-label="Filter tasks">
              {filters.map(({ id, label }) => (
                <button
                  className={filter === id ? 'planner-filter is-active' : 'planner-filter'}
                  type="button"
                  key={id}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {completedCount > 0 && (
              <button className="planner-clear" type="button" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="planner-empty">Loading your list...</p>
          ) : visibleTasks.length > 0 ? (
            <ul className="planner-task-list">
              {visibleTasks.map((task) => (
                <li className={task.done ? 'planner-task is-done' : 'planner-task'} key={task.id}>
                  <label className="planner-task-label">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task)}
                    />
                    <span className="planner-checkbox" aria-hidden="true" />
                    <span className="planner-task-title">{task.title}</span>
                  </label>
                  <button
                    className="planner-remove"
                    type="button"
                    aria-label={`Remove ${task.title}`}
                    onClick={() => removeTask(task.id)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="planner-empty">
              {tasks.length === 0
                ? 'A fresh page. Add your first little thing below.'
                : 'Nothing in this view just yet.'}
            </p>
          )}

          {message && <p className="planner-message" role="status">{message}</p>}

          <form className="planner-add-form" onSubmit={addTask}>
            <label className="planner-visually-hidden" htmlFor="new-task">Add a task</label>
            <input
              id="new-task"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="Add a little thing..."
              maxLength={120}
              required
            />
            <button type="submit" aria-label="Add task" disabled={isSaving || !newTask.trim()}>
              {isSaving ? '...' : '+'}
            </button>
          </form>
        </section>
      </main>

      <footer className="dashboard-footer">
        <span>BUILT BY PANKAJ MOGARE</span>
        <span>{completedCount} SMALL {completedCount === 1 ? 'WIN' : 'WINS'} TODAY</span>
      </footer>
    </div>
  )
}

export default Dashboard