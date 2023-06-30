import AWS from 'aws-sdk';
import multer from 'multer';
import nc from 'next-connect';

import { createPhoto } from '../../../lib/db';
import { isAuthorized } from '../../../middleware/isAuthenticated';
import auth from '../../../middleware/auth';

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
    },
});

const handler = nc();

handler.use(auth);
handler.use(isAuthorized);

handler.use(upload.single('image'));

export const config = {
    api: {
        bodyParser: false,
    },
};

handler.post(async (req, res) => {
    if (!req.file) {
        res.status(400).send('No image file uploaded.');
        return;
    }

    const filename = req.file.originalname.replace(/[^\w.-]/g, '');
    const params = {
        Bucket: 'photography-4h',
        Key: `${filename}`,
        Body: req.file.buffer,
    };

    try {
        const result = await s3.upload(params).promise();
        await createPhoto(filename, req.body.challengeId, req, res);
        res.status(200).send('Image uploaded successfully: ' + result.Location);
    } catch (err) {
        console.error('Error uploading image to S3:', err);
        res.status(500).send('Failed to upload image.');
    }
});

export default handler;
