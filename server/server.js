const express = require('express')
const cors = require('cors')
const db = require('./database')

const app = express()
app.use(cors())

const PORT = process.env.PORT || 5000

app.use(express.json())

app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all()

  res.json(tasks)
})

app.post('/api/tasks', (req, res) => {
  const { text } = req.body

  const result = db
    .prepare('INSERT INTO tasks (text, completed) VALUES (?, ?)')
    .run(text, 0)

  const newTask = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(result.lastInsertRowid)

  res.status(201).json(newTask)
})

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params
  const { text, completed } = req.body

  const result = db
    .prepare('UPDATE tasks SET text = ?, completed = ? WHERE id = ?')
    .run(text, completed ? 1 : 0, id)

  if (result.changes === 0) {
    return res.status(404).json({
      error: 'Task not found',
    })
  }

  const updatedTask = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(id)

  res.json(updatedTask)
})

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params

  const result = db
    .prepare('DELETE FROM tasks WHERE id = ?')
    .run(id)

  if (result.changes === 0) {
    return res.status(404).json({
      error: 'Task not found',
    })
  }

  res.json({
    message: `Task ${id} deleted`,
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
