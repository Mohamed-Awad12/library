
const express = require('express');
const connectDB = require('./config/database');
const parser = require('body-parser');
const bookRouter = require('./routes/books.routes');
const userRouter = require('./routes/user.routes');
const mongoose = require('mongoose');

const app = express();

connectDB(process.env.DB_URI);

app.use(parser.json());


app.use('/book', bookRouter);
app.use('/user', userRouter);

// health
app.get('/', (req, res) => {
    res.send('OK');
});

app.get('/health/db', (req, res) => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    res.send({
        state: states[mongoose.connection.readyState] || 'unknown'
    });
});

// Simple test UI
app.get('/test', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Library API Tester</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 20px; }
    input, button { padding: 8px; margin: 4px 0; }
    .card { border: 1px solid #ddd; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    pre { background: #f7f7f7; padding: 12px; border-radius: 6px; overflow: auto; }
    label { display: block; font-weight: 600; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Library API Tester</h1>
  <div class="card">
    <h3>Auth</h3>
    <label>Email</label>
    <input id="email" type="email" placeholder="email" />
    <label>Username</label>
    <input id="username" type="text" placeholder="username" />
    <label>Password</label>
    <input id="password" type="password" placeholder="password" />
    <div>
      <button id="register">Register</button>
      <button id="login">Login</button>
    </div>
    <div>Token: <code id="token">(none)</code></div>
  </div>

  <div class="card">
    <h3>Users</h3>
    <button id="getUsers">GET /user</button>
  </div>

  <div class="card">
    <h3>Books</h3>
    <label>Name</label>
    <input id="bookName" type="text" placeholder="Book name" />
    <label>Pages</label>
    <input id="bookPages" type="number" placeholder="Pages" />
    <div>
      <button id="publish">POST /book/publish</button>
      <button id="myBooks">GET /book/myBooks</button>
    </div>
  </div>

  <div class="card">
    <h3>Response</h3>
    <pre id="output"></pre>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    const out = (data) => { $('output').textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2); };
    let token = '';

    const headers = () => ({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    });

    $('register').onclick = async () => {
      try {
        const res = await fetch('/user/register', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            email: $('email').value,
            username: $('username').value,
            password: $('password').value
          })
        });
        const data = await res.json();
        if (data.token) {
          token = data.token;
          $('token').textContent = token.slice(0, 20) + '...';
        }
        out(data);
      } catch (e) { out(String(e)); }
    };

    $('login').onclick = async () => {
      try {
        const res = await fetch('/user/login', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            email: $('email').value,
            password: $('password').value
          })
        });
        const data = await res.json();
        if (data.token) {
          token = data.token;
          $('token').textContent = token.slice(0, 20) + '...';
        }
        out(data);
      } catch (e) { out(String(e)); }
    };

    $('getUsers').onclick = async () => {
      try {
        const res = await fetch('/user', { headers: headers() });
        out(await res.json());
      } catch (e) { out(String(e)); }
    };

    $('publish').onclick = async () => {
      try {
        const res = await fetch('/book/publish', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            name: $('bookName').value,
            pages: Number($('bookPages').value)
          })
        });
        out(await res.json());
      } catch (e) { out(String(e)); }
    };

    $('myBooks').onclick = async () => {
      try {
        const res = await fetch('/book/myBooks', { headers: headers() });
        out(await res.json());
      } catch (e) { out(String(e)); }
    };
  </script>
</body>
</html>`);
});


module.exports = app;
