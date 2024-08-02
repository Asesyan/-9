import express from 'express';
import md5 from 'md5';
import fs from 'fs-extra';
import path from 'path';
import {fileURLToPath} from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersDir = path.join(__dirname, '..', 'public', 'users');


router.post('/registration', async (req, res) => {
    const {fName, lName, email, password} = req.body;


    if (!fName || !lName || !email || !password) {
        return res.status(400).send('All fields are required');
    }


    const hashedPassword = md5(password);

    const user = {
        fName,
        lName,
        email,
        password: hashedPassword
    };


    const userFilePath = path.join(usersDir, `${email}.json`);

    try {
        await fs.ensureDir(usersDir);
        await fs.writeJson(userFilePath, user);
        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('All fields are required');
    }

    const userFilePath = path.join(usersDir, `${email}.json`);

    try {
        if (!await fs.pathExists(userFilePath)) {
            return res.status(404).send('User not found');
        }

        const user = await fs.readJson(userFilePath);

        // Проверка пароля
        if (user.password !== md5(password)) {
            return res.status(400).send('Invalid password');
        }

        res.status(200).send('Login successful');
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

export default router;

