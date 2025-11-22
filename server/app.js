const express = require('express');
const path = require('path');
const { Connection, Request, TYPES } = require('tedious');

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

app.post('/api/signup', (req, res) => {
    console.log(req.body);   
});

app.post('/api/signin', (req, res) => {
    console.log(req.body);
    res.send({
        validLogin: true
    });
});

app.post('/API/createReport', (req, res) => {
    const {
        location,
        category,
        description,
        priority,
        submissionTime,
        completion,
        deleted,
        img,        // base64 string from frontend
        userID
    } = req.body;

    console.log("Incoming report:", req.body);

    // Convert base64 → buffer (VARBINARY)
    const imageBuffer = img ? Buffer.from(img, 'base64') : null;

    const sql = `
        INSERT INTO reports (
            location,
            category,
            description,
            priority,
            submissionTime,
            completion,
            deleted,
            img,
            userID
        )
        OUTPUT INSERTED.reportID
        VALUES (@location, @category, @description, @priority,
                @submissionTime, @completion, @deleted, @img, @userID)
    `;

    const request = new Request(sql, (err) => {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ error: "Database insert failed", details: err });
        }
    });

    // Add SQL parameters
    request.addParameter("location", TYPES.VarChar, location);
    request.addParameter("category", TYPES.VarChar, category);
    request.addParameter("description", TYPES.VarChar, description);
    request.addParameter("priority", TYPES.Int, priority);
    request.addParameter("submissionTime", TYPES.DateTime, new Date(submissionTime));
    request.addParameter("completion", TYPES.Bit, completion);
    request.addParameter("deleted", TYPES.Bit, deleted);
    request.addParameter("img", TYPES.VarBinary, imageBuffer);
    request.addParameter("userID", TYPES.Int, userID);

    // Capture the inserted reportID
    let insertedID = null;

    request.on('row', columns => {
        insertedID = columns[0].value;  // result of OUTPUT INSERTED.reportID
    });

    request.on('requestCompleted', () => {
        res.json({
            success: true,
            reportID: insertedID
        });
    });

    connection.execSql(request);
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