import express from 'express'
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

    router.get('/video/:id/frame', async (req, res) => {
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

        // capture image
        // ffmpeg -i rtsp://admin:qaz@1a@3@192.168.0.100:554/Streaming/Channels/101 -ss 00:00:01 -vframes 1 output.jpg

        // NOTE: set Audio Encoding to AAC first
        const ffmpegArgs = [
            '-i', `rtsp://admin:qaz@1a@3@192.168.0.100:554/Streaming/Channels/101`,
            '-fflags', 'nobuffer',
            // '-flags2', 'fast',
            // '-preset', 'ultrafast',
            // '-tune', 'zerolatency',
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

    router.get('/camera/:id/frame', async (req, res) => {
        res.set('Content-Type', 'image/jpeg');
        const ffmpegArgs = [
            '-i', `rtsp://admin:qaz@1a@3@192.168.0.100:554/Streaming/Channels/101`,
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