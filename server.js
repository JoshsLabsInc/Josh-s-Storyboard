const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Data storage (in production, use a database)
let storyboardData = {
    images: [],
    stats: {
        totalVisits: 0,
        totalImages: 0,
        totalFavorites: 0
    }
};

// Load existing data
try {
    if (fs.existsSync('data.json')) {
        const data = fs.readFileSync('data.json', 'utf8');
        storyboardData = JSON.parse(data);
    }
} catch (error) {
    console.log('No existing data found, starting fresh');
}

// Save data to file
function saveData() {
    fs.writeFileSync('data.json', JSON.stringify(storyboardData, null, 2));
}

// Routes
app.get('/', (req, res) => {
    storyboardData.stats.totalVisits++;
    saveData();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all images
app.get('/api/images', (req, res) => {
    res.json(storyboardData.images);
});

// Get stats
app.get('/api/stats', (req, res) => {
    res.json(storyboardData.stats);
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { title, description } = req.body;
        
        if (!title || !description) {
            // Delete the uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const newImage = {
            id: Date.now(),
            title,
            description,
            date: new Date().toISOString(),
            isFavorite: false,
            filename: req.file.filename,
            url: `/uploads/${req.file.filename}`
        };

        storyboardData.images.unshift(newImage);
        storyboardData.stats.totalImages = storyboardData.images.length;
        saveData();

        res.json({ 
            success: true, 
            image: newImage,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Toggle favorite
app.post('/api/favorite/:id', (req, res) => {
    const imageId = parseInt(req.params.id);
    const image = storyboardData.images.find(img => img.id === imageId);
    
    if (image) {
        image.isFavorite = !image.isFavorite;
        
        // Update favorites count
        storyboardData.stats.totalFavorites = storyboardData.images.filter(img => img.isFavorite).length;
        saveData();
        
        res.json({ success: true, isFavorite: image.isFavorite });
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

// Delete image
app.delete('/api/images/:id', (req, res) => {
    const imageId = parseInt(req.params.id);
    const imageIndex = storyboardData.images.findIndex(img => img.id === imageId);
    
    if (imageIndex !== -1) {
        const image = storyboardData.images[imageIndex];
        
        // Delete the image file
        try {
            fs.unlinkSync(path.join(__dirname, 'uploads', image.filename));
        } catch (error) {
            console.log('Error deleting image file:', error);
        }
        
        // Remove from array
        storyboardData.images.splice(imageIndex, 1);
        storyboardData.stats.totalImages = storyboardData.images.length;
        storyboardData.stats.totalFavorites = storyboardData.images.filter(img => img.isFavorite).length;
        saveData();
        
        res.json({ success: true, message: 'Image deleted successfully' });
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

// Admin login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    
    if (password === 'admin') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`Josh's Storyboard server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});