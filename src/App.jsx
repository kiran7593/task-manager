import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/tasks')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load tasks')
        }

        return response.json()
      })
      .then((data) => {
        setTasks(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading tasks:', error)
        setError('Unable to load tasks.')
        setLoading(false)
      })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (task.trim() === '') {
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: task,
        }),
      })

      const newTask = await response.json()

      setTasks([...tasks, newTask])
      setTask('')
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  async function toggleTask(id) {
    const taskToUpdate = tasks.find((task) => task.id === id)

    if (!taskToUpdate) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: taskToUpdate.text,
          completed: !taskToUpdate.completed,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()

      setTasks(
        tasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      )
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') {
      return task.completed === 0
    }

    if (filter === 'completed') {
      return task.completed === 1
    }

    return true
  })

  return (
    <div className="app">
      <div className="task-container">
        <header className="task-header">
          <h1>Task Manager</h1>
          <p>Manage your tasks in one place.</p>
        </header>

        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={task}
            onChange={(event) => setTask(event.target.value)}
          />

          <button type="submit">Add Task</button>
        </form>

        <div className="task-count">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>

        <div className="filters">
          <button
            className={filter === 'all' ? 'active-filter' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>

          <button
            className={filter === 'active' ? 'active-filter' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>

          <button
            className={filter === 'completed' ? 'active-filter' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {loading && <p>Loading tasks...</p>}

        {error && <p>{error}</p>}

        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${
                task.completed ? 'completed' : ''
              }`}
            >
              <span className="task-text">
                {task.text}
              </span>

              <div className="task-actions">
                <button
                  className="complete-button"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App