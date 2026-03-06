import express from 'express';
import editly from 'editly';
import { createCanvas } from 'canvas';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

const TMP = '/tmp';

// 1. Text to Video
app.post('/video', async (req, res) => {
    const { text } = req.body;
    const outputPath = path.join(TMP, `video-${Date.now()}.mp4`);

    try {
        await editly({
            outPath: outputPath,
            width: 640,
            height: 360,
            fps: 24,
            clips: [{
                duration: 5,
                layers: [
                    { type: 'fill', color: '#000000' },
                    { type: 'title', text: text || 'Default Text' }
                ]
            }]
        });

        res.download(outputPath, () => fs.unlinkSync(outputPath));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2. Text to Image
app.post('/image', async (req, res) => {
    const { text } = req.body;
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');

    // Simple background and text render
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, 800, 800);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text || 'Hello World', 400, 400);

    const outputPath = path.join(TMP, `img-${Date.now()}.png`);
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', () => {
        res.download(outputPath, () => fs.unlinkSync(outputPath));
    });
});

app.listen(8080, () => console.log('Server running on 8080'));
