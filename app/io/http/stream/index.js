import express from 'express'
import path from 'node:path'
import { spawn } from 'node:child_process'


export default app => {
    const router = express.Router()

    router.get('/', (req, res) => {
        res.send('Hello World!')
    })

    router.get('/video', (req, res) => {
        res.contentType('video/mp4');

        const ffmpegArgs = [
            '-stream_loop', '-1',
            '-i', path.join(import.meta.dirname, "sample.mp4"),
            '-movflags', 'frag_keyframe+empty_moov',
            '-c', 'copy',
            '-f', 'mp4',
            'pipe:1'
        ];
        console.log(">>cmd:", 'ffmpeg ' + ffmpegArgs.join(" "))

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

    // #TODO:
    // current latency is proximate 3 seconds (video: I-Frame Interval: 10)
    // to achieve real-time speed:
    // - use faster protocol: udp based (websocket)
    // - rebuilt project in pure C
    router.get('/mp4', (req, res) => {
        res.contentType('video/mp4');

        // capture image
        // ffmpeg -i rtsp://admin:qaz@1a@3@192.168.0.100:554/Streaming/Channels/101 -ss 00:00:01 -vframes 1 output.jpg

        // NOTE: set Audio Encoding to AAC first
        const ffmpegArgs = [
            '-i', `rtsp://admin:qaz@1a@3@192.168.0.101:554/Streaming/Channels/101`,
            '-movflags', 'frag_keyframe',
            '-c', 'copy',
            '-f', 'mp4',
            'pipe:1'
        ];

        console.log(">>cmd:", 'ffmpeg ' + ffmpegArgs.join(" "))

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

    return router
}