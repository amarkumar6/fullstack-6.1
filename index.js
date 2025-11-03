// index.js
const express = require('express');
const bodyParser = require('express').json;
const logger = require('./middlewares/logger');
const { authenticate, authorize, JWT_SECRET } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser());
app.use(logger); // global logging

// Public route: login (issue JWT)
app.post('/login', (req, res) => {
  // Very simple example — in real apps validate user + password
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  // For demo: if username === 'admin' treat as admin
  const role = username === 'admin' ? 'admin' : 'user';

  const token = jwt.sign(
    { sub: username, role }, 
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// Protected route: any authenticated user
app.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'This is your profile', user: req.user });
});

// Protected route: only admin
app.delete('/admin/danger', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin-only action performed' });
});

// Route-level middleware example (only logs extra info for this route)
function routeLogger(req, res, next) {
  console.log('Route-level logger:', req.method, req.url);
  next();
}
app.get('/special', routeLogger, (req, res) => res.send('special route'));

// Attach error handler as the last middleware
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
