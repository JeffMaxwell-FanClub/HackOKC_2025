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

function runQuery(query) {
  return new Promise((resolve, reject) => {
    const results = [];

    const request = new Request(query, (err) => {
      if (err) reject(err);
      else resolve(results);
    });

    request.on("row", columns => {
      const row = {};
      columns.forEach(col => {
        row[col.metadata.colName] = col.value;
      });
      results.push(row);
    });

    connection.execSql(request);
  });
}

app.get('/API/allReports', async (req, res) => {
  const query = `
    SELECT 
      r.reportID,
      r.location,
      r.category,
      r.description,
      r.priority,
      r.submissionTime,
      r.completion,
      r.deleted,
      u.name AS submittedBy
    FROM reports r
    LEFT JOIN [user] u ON r.userID = u.userID
    WHERE r.deleted = 0
    ORDER BY r.submissionTime DESC;
  `;

  try {
    const data = await runQuery(query);
    res.json({ success: true, reports: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.post('/API/assignReport', async (req, res) => {
  const { workerID, reportID } = req.body;

  const query = `
    INSERT INTO assignedReports (workerID, reportID)
    VALUES (${workerID}, ${reportID});
  `;

  try {
    await runQuery(query);
    res.json({ success: true, message: "Report assigned successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/API/assignedReports', async (req, res) => {
  const { workerID } = req.query;

  const query = `
    SELECT 
      ar.assignID,
      w.workerID,
      w.name AS workerName,
      r.reportID,
      r.location,
      r.category,
      r.description,
      r.priority,
      r.submissionTime,
      r.completion
    FROM assignedReports ar
    INNER JOIN worker w ON ar.workerID = w.workerID
    INNER JOIN reports r ON ar.reportID = r.reportID
    ${workerID ? `WHERE ar.workerID = ${workerID}` : ""}
    ORDER BY r.submissionTime DESC;
  `;

  try {
    const data = await runQuery(query);
    res.json({ success: true, assigned: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/API/completedReports', async (req, res) => {
  const query = `
    SELECT 
      r.reportID,
      r.location,
      r.category,
      r.description,
      r.priority,
      r.submissionTime,
      r.completion,
      u.name AS submittedBy
    FROM reports r
    LEFT JOIN [user] u ON r.userID = u.userID
    WHERE r.completion = 1 AND r.deleted = 0
    ORDER BY r.submissionTime DESC;
  `;

  try {
    const data = await runQuery(query);
    res.json({ success: true, completed: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
