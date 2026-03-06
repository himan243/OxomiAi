const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Path for JSON database and upload folder
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure database and uploads directory exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([
    {
      id: '1',
      title: 'Majuli Raas Leela',
      description: 'A spiritual and cultural extravaganza performed by the monks of Satras.',
      category: 'Festivals',
      district: 'majuli',
      type: 'image',
      status: 'approved',
      mediaUrl: `http://localhost:${PORT}/uploads/placeholder.jpg`, // Dynamic port
      contributor: 'Admin'
    }
  ], null, 2));
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Helper to read DB
const readDB = () => {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  // Auto-fix old ports to current PORT
  return data.map(item => ({
    ...item,
    mediaUrl: item.mediaUrl.replace('localhost:5000', `localhost:${PORT}`)
  }));
};
// Helper to write DB
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Multer Storage Configuration (Local Disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR)); // Serve uploaded files statically

// --- Routes ---

// Get all approved content
app.get('/api/content', (req, res) => {
  const db = readDB();
  const approved = db.filter(item => item.status === 'approved');
  res.json(approved);
});

// Get content for a specific district
app.get('/api/content/:districtId', (req, res) => {
  const { districtId } = req.params;
  const db = readDB();
  const filtered = db.filter(item => 
    item.district.toLowerCase() === districtId.toLowerCase() && 
    item.status === 'approved'
  );
  res.json(filtered);
});

// Submit new content with file upload
app.post('/api/submit', upload.single('media'), (req, res) => {
  const { title, description, category, district, contributor } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Media file is required' });
  }

  const db = readDB();
  const newEntry = {
    id: Date.now().toString(),
    title,
    description,
    category,
    district,
    contributor: contributor || 'Guest User',
    type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
    status: 'pending',
    mediaUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
    createdAt: new Date()
  };

  db.push(newEntry);
  writeDB(db);

  console.log('New submission received:', newEntry.title);
  res.status(201).json({ message: 'Submitted for moderation', data: newEntry });
});

// Admin: Get all pending content
app.get('/api/admin/pending', (req, res) => {
  const db = readDB();
  const pending = db.filter(item => item.status === 'pending');
  res.json(pending);
});

// Admin: Approve content
app.put('/api/admin/approve/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const item = db.find(c => c.id === id);
  if (item) {
    item.status = 'approved';
    writeDB(db);
    res.json({ message: 'Content approved', data: item });
  } else {
    res.status(404).json({ message: 'Content not found' });
  }
});

// Admin: Reject/Delete content
app.delete('/api/admin/reject/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const newDB = db.filter(c => c.id !== id);
  writeDB(newDB);
  res.json({ message: 'Content rejected and removed' });
});

app.get('/', (req, res) => {
  res.send('OxomiAi Functional Local Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
