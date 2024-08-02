import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const postsDir = path.join(__dirname, '../public/posts');

function readJSONFile(filePath) {
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    }
    return {};
}

function writeJSONFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

router.post('/create', (req, res) => {
    const { title, description, userId } = req.body;
    const postId = Date.now();
    const filePath = path.join(postsDir, `${postId}.json`);
    writeJSONFile(filePath, { title, description, userId });
    res.status(201).json({ message: 'Post created successfully', postId });
});

router.get('/', (req, res) => {
    const { userId } = req.query;
    let posts = fs.readdirSync(postsDir).map(file => readJSONFile(path.join(postsDir, file)));
    if (userId) {
        posts = posts.filter(post => post.userId === userId);
    }
    res.json(posts);
});

router.get('/:id', (req, res) => {
    const filePath = path.join(postsDir, `${req.params.id}.json`);
    const post = readJSONFile(filePath);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
});

router.put('/update/:id', (req, res) => {
    const { title, description, userId } = req.body;
    const filePath = path.join(postsDir, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Post not found' });
    }
    writeJSONFile(filePath, { title, description, userId });
    res.json({ message: 'Post updated successfully' });
});

router.delete('/delete/:id', (req, res) => {
    const filePath = path.join(postsDir, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Post not found' });
    }
    fs.unlinkSync(filePath);
    res.json({ message: 'Post deleted successfully' });
});

export default router;