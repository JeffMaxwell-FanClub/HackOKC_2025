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

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'loginSignup.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'report.html'));
});

app.get('/worker-reports', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'workerReport.html'));
});

// POST API
app.post('/api/reports', (req, res) => {
  const report = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  res.json({ success: true, report });
});

app.post('/api/signup', (req, res) => {
    console.log(req.body);   
});

app.post('/api/signin', (req, res) => {
    console.log(req.body);
    res.send({
        validLogin: true
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
