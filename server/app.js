const express = require('express');
const path = require('path');
const { Connection, Request } = require('tedious');

const app = express();
const PORT = 3000;

const config = {
  server: "hackathon-server.database.windows.net",
  authentication: {
    type: "default",
    options: {
      userName: "hackathonOCU2025",
      password: "hackOKC!!"
    }
  },
  options: {
    database: "maintenanceCrewDB",
    encrypt: true,
    trustServerCertificate: false,
    port: 1433
  }
};

const connection = new Connection(config);

connection.on('connect', err => {
  if (err) {
    console.error("error:", err);
  } else {
    console.log("working");
  }
});

connection.connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes - serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'loginSignup.html'), (err) => {
    if (err) {
      console.error('Error serving login page:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'report.html'), (err) => {
    if (err) {
      console.error('Error serving report page:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'loginSignup.html'), (err) => {
    if (err) {
      console.error('Error serving dashboard:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'loginSignup.html'), (err) => {
    if (err) {
      console.error('Error serving user page:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'loginSignup.html'), (err) => {
    if (err) {
      console.error('Error serving admin page:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/worker-reports', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'workerReport.html'), (err) => {
    if (err) {
      console.error('Error serving worker reports page:', err);
      res.status(500).send('Error loading page');
    }
  });
});

// API route to handle report submissions
app.post('/api/reports', (req, res) => {
  const report = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  // In a real app, this would save to a database
  // For now, we'll just return success
  res.json({ success: true, report });
});

// LISTEN FOR SIGNUP
app.post('/api/signup', (req, res) => {
    console.log(req.body);
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port or stop the process using this port.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});