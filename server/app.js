const express = require('express');
const path = require('path');
const { Connection, Request, TYPES } = require('tedious');
// NLP Libraries (Natural Language Processing)
const Classifier = require('wink-naive-bayes-text-classifier');
const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');


const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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

app.get('/worker-reports2', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'workerReport2.html'), (err) => {
    if (err) {
      console.error('Error serving worker reports2 page:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/worker-reports3', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'workerReport3.html'), (err) => {
    if (err) {
      console.error('Error serving worker reports2 page:', err);
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
    WHERE r.deleted = 0 and r.completion != 1
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

app.post('/API/assignReport', (req, res) => {
    const { workerID, reportID } = req.body;

    if (!workerID || !reportID) {
        return res.status(400).json({ success: false, error: "Missing workerID or reportID." });
    }

    const sql = `
        INSERT INTO assignedReports (workerID, reportID)
        VALUES (@workerID, @reportID)
    `;

    const request = new Request(sql, (err, rowCount) => {
        if (err) {
            // Check for a unique key violation (if a report can only be assigned once)
            if (err.message.includes('UNIQUE KEY') || err.message.includes('PRIMARY KEY violation')) {
                 return res.status(409).json({ success: false, error: "This report may already be assigned." });
            }
            console.error("Assign report error:", err);
            return res.status(500).json({ error: "Database insert failed", details: err.message });
        }

        if (rowCount === 0) {
            // This is unlikely on an INSERT but good to check
            return res.status(500).json({ success: false, message: "Insert failed, no rows were affected." });
        }

        // Success!
        res.json({
            success: true,
            message: `Report ${reportID} successfully assigned to worker ${workerID}.`
        });
    });

    // Add parameters, ensuring they are integers
    request.addParameter("workerID", TYPES.Int, parseInt(workerID, 10));
    request.addParameter("reportID", TYPES.Int, parseInt(reportID, 10));

    connection.execSql(request);
});

// API route to mark a report as complete
// API route to mark a report as complete (using reportID from URL)
app.put('/API/completeReport/:reportID', (req, res) => {
    // Get the reportID from the URL parameters
    const { reportID } = req.params; 

    // Note: Your frontend also sends 'completionTime' in the body.
    // Since your 'reports' table in the ERD doesn't have a
    // 'completionTime' column, we will just ignore it and only
    // update the 'completion' bit.

    if (!reportID) {
        // This check is almost redundant since the route wouldn't match,
        // but it's good practice.
        return res.status(400).json({ success: false, error: "Missing reportID in URL." });
    }

    // SQL to update the 'completion' column in the reports table
    const sql = `
        UPDATE reports
        SET completion = 1
        WHERE reportID = @reportID
    `;

    const request = new Request(sql, (err, rowCount) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ error: "Database update failed", details: err });
        }

        if (rowCount === 0) {
            // No rows were updated, likely because the reportID does not exist
            return res.status(404).json({ success: false, message: `Report with ID ${reportID} not found.` });
        }

        // Successfully updated
        res.json({
            success: true,
            message: `Report ID ${reportID} marked as complete.`,
            updatedRows: rowCount
        });
    });

    // Add SQL parameter for the reportID
    request.addParameter("reportID", TYPES.Int, parseInt(reportID, 10)); // Ensure it's an integer

    connection.execSql(request);
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

// NLP PROCESSING (I DONT KNOW)

// --- 1. Load the Brain ---
const classifier = Classifier();
const nlp = winkNLP(model);
const its = nlp.its;

const prepTask = function (text) {
  const tokens = [];
  nlp.readDoc(text)
    .tokens()
    .filter((t) => (t.out(its.type) === 'word' && !t.out(its.stopWordFlag)))
    .each((t) => tokens.push(t.out(its.stem)));
  return tokens;
};

// Crucial: Must define prepTasks BEFORE importing
classifier.definePrepTasks([prepTask]);

try {
  // Read the file we created with train.js
  const modelData = fs.readFileSync('../public/nlp/model.json', 'utf-8');
  classifier.importJSON(modelData);
  classifier.consolidate();
  console.log('AI Model loaded successfully.');
} catch (error) {
  console.error('Error loading model. Did you run "node train.js"?');
  process.exit(1);
}

// --- 2. API Endpoint ---
app.post('/api/triage', (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  // Predict
  const prediction = classifier.predict(description);
  
  // Optional: Get detailed probability stats if you want them
  // const metrics = classifier.computeOdds(description);

  res.json({
    original_text: description,
    priority: prediction,
  });
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

