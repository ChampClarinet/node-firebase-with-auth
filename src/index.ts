import * as express from 'express';
import { Storage } from '@google-cloud/storage';
import * as Multer from 'multer';
import * as Config from './config';
import greetLog from './greet.log';

const app = express();

const storage = new Storage({
    projectId: Config.FIREBASE.projectId,
    keyFilename: Config.KEY_FILE_NAME,
});

const bucket = storage.bucket(Config.FIREBASE.storageBucket);

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: Config.MAX_FILE_SIZE,
    }
});

app.listen(Config.PORT, () => console.log(greetLog));

app.post('/upload', multer.single('file'), (req, res) => {
    console.log('uploading image');

    const file = req.file;
    if (file) {
        (uploadImageToStorage(file)
            .then(url => {
                console.log('upload completed:', url);
                res.json({ status: 'success', url });
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({ status: 'error', message: error });
            })
        );
    } else return res.status(400).json({ message: 'no file provided', status: 'error' });
});

app.get('/get/:filename', async (req, res) => {
    const filename = req.params['filename'];
    const file = bucket.file(filename);
    try {
        const isExists = await file.exists();
        if (isExists.some(value => !value)) return res.status(404).json({ status: 'error', message: 'file not exists' });
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: +(new Date()) + Config.DOWNLOAD_URL_LIFETIME,
        });
        return res.json({ status: 'success', url });
    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ status: 'error', message: error });
    }
});

const uploadImageToStorage = (file: Express.Multer.File): Promise<string> => (
    new Promise((resolve, reject) => {
        if (!file) reject('No file');
        const newFileName = `${file.originalname}_${Date.now()}`;
        const fileUpload = bucket.file(newFileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            },
        });
        blobStream.on('error', error => reject(error));
        blobStream.on('finish', () => {
            const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
            resolve(url);
        });
        blobStream.end(file.buffer);
    })
);