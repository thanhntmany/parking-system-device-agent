import express from 'express'
import path from 'node:path'
import { spawn } from 'node:child_process'

class AppApi {
    constructor(app) {
        this.httpApp = express()
        this.httpApp.disable('x-powered-by');
    }

    start(port = 80) {
        const { httpApp: app } = this;

        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        app.get('/video', (req, res) => {
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
        // rebuilt project in pure C to achieve real-time speed
        app.get('/mp4', (req, res) => {
            res.contentType('video/mp4');

            // capture image
            // ffmpeg -i rtsp://admin:qaz@1a@3@192.168.0.100:554/Streaming/Channels/101 -ss 00:00:01 -vframes 1 output.jpg

            // NOTE: set Audio Encoding to AAC first
            const ffmpegArgs = [
                '-i', `rtsp://admin:qaz@1a@3@192.168.0.100:554/Streaming/Channels/101`,
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

        const server = this.server = app.listen(port, '0.0.0.0', function () {
            const { address: host, port } = server.address()
            console.log("\nApp listening at http://%s:%s", host, port)
        });
    }
}


export default app => new AppApi(app)
