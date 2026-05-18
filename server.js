const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure the folder name is consistent: "upload"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload'); // Make sure this folder exists in your project root
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.static(path.join(__dirname)));
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home / Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload file (with username tagging)
app.post('/upload', upload.single('myFile'), (req, res) => {
    if (!req.file) {
        return res.send('No file uploaded');
    }

    const uploader = req.body.username || "Unknown";

    res.send(`
        <h2>File Uploaded Successfully</h2>
        <p>${req.file.filename}</p>
        <p>Uploaded by: ${uploader}</p>
        <button onclick="window.location.href='dashboard.html'">
            Back to Dashboard
        </button>
    `);
});

// View resources
app.get('/resources', (req, res) => {
    const uploadDir = path.join(__dirname, 'upload');

    fs.readdir(uploadDir, (err, files) => {
        if (err || files.length === 0) {
            return res.send(`
                <h2>No resources available</h2>
                <button onclick="window.location.href='dashboard.html'">Back</button>
            `);
        }

        let html = `<h1>Available Resources</h1><ul>`;
        files.forEach(file => {
            html += `<li><a href="/upload/${file}" target="_blank">${file}</a></li>`;
        });
        html += `</ul><button onclick="window.location.href='dashboard.html'">Back</button>`;

        res.send(html);
    });
});

// Manage resources
app.get('/manage-resources', (req, res) => {
    const uploadDir = path.join(__dirname, 'upload');

    fs.readdir(uploadDir, (err, files) => {
        if (err || files.length === 0) {
            return res.send(`
                <h2>No resources to manage</h2>
                <button onclick="window.location.href='dashboard.html'">Back</button>
            `);
        }

        let html = `<h1>Manage Resources</h1><ul>`;
        files.forEach(file => {
            html += `
                <li>${file}
                    <form action="/delete-file" method="POST" style="display:inline;">
                        <input type="hidden" name="filename" value="${file}">
                        <button type="submit">Delete</button>
                    </form>
                </li><br>
            `;
        });
        html += `</ul><button onclick="window.location.href='dashboard.html'">Back</button>`;

        res.send(html);
    });
});

// Delete file
app.post('/delete-file', (req, res) => {
    const filePath = path.join(__dirname, 'upload', req.body.filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.send('Error deleting file');
        }
        res.redirect('/manage-resources');
    });
});

// Extra routes
app.get('/catalog', (req, res) => res.redirect('/resources'));
app.get('/manage', (req, res) => res.redirect('/manage-resources'));

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
