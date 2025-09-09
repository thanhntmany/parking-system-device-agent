import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { spawn } from 'node:child_process'

var uuidCount = 0
export default app => {
    const router = express.Router()

    router.get('/video/:id', async (req, res) => {
        res.contentType('video/mp4');
        const uuid = ++uuidCount
        console.log(`[stream@${uuid}] Start:`, req.path)

        const ffmpegArgs = [
            '-stream_loop', '-1',
            '-i', path.join(app.config.cwd, 'sample', `sample${req.params.id}.mp4`),
            '-movflags', 'frag_keyframe+empty_moov',
            '-c', 'copy',
            '-f', 'mp4',
            'pipe:1'
        ];
        console.log(`[stream@${uuid}] cmd:`, 'ffmpeg ' + ffmpegArgs.join(" "))

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
            stdio: ['pipe', 'pipe', 'ignore'] // stdin, stdout, stderr
        });
        ffmpegProcess.stdout.pipe(res);
        // ffmpegProcess.stderr.on('data', data => console.error(`FFmpeg stderr: ${data}`));
        ffmpegProcess.on('error', err => {
            console.error('Failed to start FFmpeg process:', err);
            res.status(500).send('Error streaming');
            ffmpegProcess.kill('SIGKILL')
        });

        // Terminate FFmpeg if client disconnects
        res.on('close', () => {
            console.log(`[stream@${uuid}]: Kill`)
            ffmpegProcess.kill('SIGKILL')
        });

    });

    router.get('/video/:id/capture', async (req, res) => {
        res.set('Content-Type', 'image/jpeg');
        const ffmpegArgs = [
            '-i', path.join(app.config.cwd, 'sample', `sample${req.params.id}.mp4`),
            '-vframes', '1',
            '-vcodec', 'mjpeg',
            '-f', 'image2pipe',
            '-q:v', '1',
            '-an', '-'
        ];
        console.log(`[img] cmd:`, 'ffmpeg ' + ffmpegArgs.join(" "))

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
            stdio: ['pipe', 'pipe', 'ignore'] // stdin, stdout, stderr
        });
        ffmpegProcess.stdout.pipe(res);
        // ffmpegProcess.stderr.on('data', data => console.error(`FFmpeg stderr: ${data}`));

        ffmpegProcess.on('error', err => {
            console.error('Failed to start FFmpeg process:', err);
            res.status(500).send('Error streaming');
            ffmpegProcess.kill('SIGKILL')
        });

        // Terminate FFmpeg if client disconnects
        res.on('close', () => {
            console.log(`[img: Kill`)
            ffmpegProcess.kill('SIGKILL')
        });
    })

    // #TODO:
    // current latency is proximate 3 seconds (video: I-Frame Interval: 10)
    // to achieve real-time speed:
    // - use faster protocol: udp based (websocket)
    // - rebuilt project in pure C
    router.get('/camera/:id', async (req, res) => {
        res.contentType('video/mp4');
        const uuid = ++uuidCount

        const camera = await fetch(`http://localhost:9080/api/camera/${req.params.id}/detail-all`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
        const { result, error } = camera
        if (error) return res.json({ error: error })
        const url = `${result.scheme}//${result.username}:${result.password}@${result.adress || "localhost"}:${result.port}/${result.pathname}`

        // NOTE: set Audio Encoding to AAC first
        const ffmpegArgs = [
            '-i', url,
            '-fflags', 'nobuffer',
            '-movflags', 'frag_keyframe',
            '-c', 'copy',
            '-f', 'mp4',
            'pipe:1'
        ];

        console.log(`[stream@${uuid}] cmd:`, 'ffmpeg ' + ffmpegArgs.join(" "))

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
            stdio: ['pipe', 'pipe', 'ignore'] // stdin, stdout, stderr
        });
        ffmpegProcess.stdout.pipe(res);

        // Terminate FFmpeg if client disconnects
        res.on('close', () => ffmpegProcess.kill('SIGKILL'));

        // ffmpegProcess.stderr.on('data', data => console.error(`FFmpeg stderr: ${data}`));

        ffmpegProcess.on('error', err => {
            console.error('Failed to start FFmpeg process:', err);
            res.status(500).send('Error streaming');
        });

    });

    router.get('/camera/:id/capture', cors(), async (req, res) => {
        const camera = await fetch(`http://localhost:9080/api/camera/${req.params.id}/detail-all`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
        const { result, error } = camera
        if (error) return res.json({ error: error })
        const url = `${result.scheme}//${result.username}:${result.password}@${result.adress || "localhost"}:${result.port}/${result.pathname}`

        res.set('Content-Type', 'image/jpeg');
        const ffmpegArgs = [
            '-i', url,
            '-fflags', 'nobuffer',
            '-vframes', '1',
            '-vcodec', 'mjpeg',
            '-f', 'image2pipe',
            '-q:v', '1',
            '-an', '-'
        ];
        console.log(`[img cmd:`, 'ffmpeg ' + ffmpegArgs.join(" "))

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
            stdio: ['pipe', 'pipe', 'ignore'] // stdin, stdout, stderr
        });
        ffmpegProcess.stdout.pipe(res);
        // ffmpegProcess.stderr.on('data', data => console.error(`FFmpeg stderr: ${data}`));

        ffmpegProcess.on('error', err => {
            console.error('Failed to start FFmpeg process:', err);
            res.status(500).send('Error streaming');
            ffmpegProcess.kill('SIGKILL')
        });

        // Terminate FFmpeg if client disconnects
        res.on('close', () => {
            console.log(`[img: Kill`)
            ffmpegProcess.kill('SIGKILL')
        });
    });

    return router
}