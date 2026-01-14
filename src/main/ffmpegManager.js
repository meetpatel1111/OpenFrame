const ffmpeg = require('fluent-ffmpeg');
const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');

class FFmpegManager extends EventEmitter {
  constructor() {
    super();
    this.activeJobs = new Map();
    this.jobIdCounter = 0;
    
    // Set FFmpeg path if needed (for production)
    this.setFFmpegPath();
  }

  setFFmpegPath() {
    // In production, FFmpeg should be bundled with the app
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev) {
      const ffmpegPath = path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg');
      const ffprobePath = path.join(process.resourcesPath, 'ffmpeg', 'ffprobe');
      
      if (fs.existsSync(ffmpegPath)) {
        ffmpeg.setFfmpegPath(ffmpegPath);
      }
      if (fs.existsSync(ffprobePath)) {
        ffmpeg.setFfprobePath(ffprobePath);
      }
    }
  }

  generateJobId() {
    return `job_${++this.jobIdCounter}_${Date.now()}`;
  }

  async probe(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.formatProbeData(metadata));
        }
      });
    });
  }

  formatProbeData(metadata) {
    const format = metadata.format;
    const streams = metadata.streams;

    const result = {
      format: {
        name: format.format_name,
        duration: parseFloat(format.duration) || 0,
        size: parseInt(format.size) || 0,
        bitrate: parseInt(format.bit_rate) || 0,
        tags: format.tags || {}
      },
      streams: {
        video: [],
        audio: [],
        subtitle: []
      }
    };

    streams.forEach(stream => {
      const streamInfo = {
        index: stream.index,
        codec: stream.codec_name,
        codec_long: stream.codec_long_name,
        profile: stream.profile,
        bitrate: parseInt(stream.bit_rate) || 0,
        tags: stream.tags || {}
      };

      if (stream.codec_type === 'video') {
        streamInfo.width = stream.width || 0;
        streamInfo.height = stream.height || 0;
        streamInfo.fps = this.calculateFPS(stream);
        streamInfo.pixel_format = stream.pix_fmt || '';
        streamInfo.level = stream.level || 0;
        streamInfo.color_space = stream.color_space || '';
        streamInfo.color_range = stream.color_range || '';
        streamInfo.color_primaries = stream.color_primaries || '';
        streamInfo.color_transfer = stream.color_transfer || '';
        result.streams.video.push(streamInfo);
      } else if (stream.codec_type === 'audio') {
        streamInfo.channels = stream.channels || 0;
        streamInfo.sample_rate = parseInt(stream.sample_rate) || 0;
        streamInfo.channel_layout = stream.channel_layout || '';
        result.streams.audio.push(streamInfo);
      } else if (stream.codec_type === 'subtitle') {
        streamInfo.language = stream.tags?.language || '';
        result.streams.subtitle.push(streamInfo);
      }
    });

    return result;
  }

  calculateFPS(stream) {
    if (!stream.r_frame_rate) return 0;
    
    const parts = stream.r_frame_rate.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(stream.r_frame_rate) || 0;
  }

  async convert(options) {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      type: 'convert',
      status: 'starting',
      progress: 0,
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);
    this.emit('jobStarted', job);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(options.input);

      // Set output format
      if (options.format) {
        command.format(options.format);
      }

      // Video settings
      if (options.video) {
        if (options.video.codec) {
          command.videoCodec(options.video.codec);
        }
        if (options.video.bitrate) {
          command.videoBitrate(options.video.bitrate);
        }
        if (options.video.fps) {
          command.fps(options.video.fps);
        }
        if (options.video.resolution) {
          command.size(options.video.resolution);
        }
        if (options.video.aspect) {
          command.aspect(options.video.aspect);
        }
      }

      // Audio settings
      if (options.audio) {
        if (options.audio.codec) {
          command.audioCodec(options.audio.codec);
        }
        if (options.audio.bitrate) {
          command.audioBitrate(options.audio.bitrate);
        }
        if (options.audio.channels) {
          command.audioChannels(options.audio.channels);
        }
        if (options.audio.sampleRate) {
          command.audioFrequency(options.audio.sampleRate);
        }
      }

      // Subtitle settings
      if (options.subtitle) {
        if (options.subtitle.codec) {
          command.subtitleCodec(options.subtitle.codec);
        }
      }

      // Filters
      if (options.filters) {
        options.filters.forEach(filter => {
          command.videoFilter(filter);
        });
      }

      // Hardware acceleration
      if (options.hardwareAcceleration) {
        command.hardwareAcceleration(options.hardwareAcceleration);
      }

      // Output options
      command.output(options.output);

      // Event handlers
      command.on('start', (commandLine) => {
        job.status = 'running';
        job.command = commandLine;
        this.emit('jobProgress', job);
      });

      command.on('progress', (progress) => {
        job.progress = Math.round(progress.percent);
        job.currentTime = progress.timemark;
        job.currentKbps = progress.currentKbps;
        this.emit('jobProgress', job);
      });

      command.on('end', () => {
        job.status = 'completed';
        job.progress = 100;
        job.endTime = Date.now();
        job.duration = job.endTime - job.startTime;
        this.emit('jobCompleted', job);
        this.activeJobs.delete(jobId);
        resolve(job);
      });

      command.on('error', (err) => {
        job.status = 'error';
        job.error = err.message;
        job.endTime = Date.now();
        this.emit('jobError', job);
        this.activeJobs.delete(jobId);
        reject(err);
      });

      // Start the conversion
      command.run();
    });
  }

  async extractAudio(options) {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      type: 'extractAudio',
      status: 'starting',
      progress: 0,
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);
    this.emit('jobStarted', job);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(options.input)
        .noVideo()
        .audioCodec(options.codec || 'mp3')
        .audioBitrate(options.bitrate || '128k')
        .audioFrequency(options.sampleRate || 44100)
        .audioChannels(options.channels || 2)
        .output(options.output);

      this.setupCommandEvents(command, job, resolve, reject);
      command.run();
    });
  }

  async extractSubtitles(options) {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      type: 'extractSubtitles',
      status: 'starting',
      progress: 0,
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);
    this.emit('jobStarted', job);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(options.input)
        .noVideo()
        .noAudio()
        .codec('copy')
        .output(options.output);

      // Map subtitle stream
      if (options.streamIndex !== undefined) {
        command.outputOptions([`-map 0:s:${options.streamIndex}`]);
      }

      this.setupCommandEvents(command, job, resolve, reject);
      command.run();
    });
  }

  async generateThumbnail(options) {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      type: 'generateThumbnail',
      status: 'starting',
      progress: 0,
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);
    this.emit('jobStarted', job);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(options.input)
        .seekInput(options.time || '00:00:01')
        .frames(1)
        .size(options.size || '320x240')
        .output(options.output);

      this.setupCommandEvents(command, job, resolve, reject);
      command.run();
    });
  }

  async mergeFiles(options) {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      type: 'merge',
      status: 'starting',
      progress: 0,
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);
    this.emit('jobStarted', job);

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add input files
      options.inputs.forEach(input => {
        command.input(input);
      });

      // Use concat demuxer for same format files
      if (options.sameFormat) {
        const listFile = path.join(path.dirname(options.output), 'concat_list.txt');
        const listContent = options.inputs.map(input => `file '${input}'`).join('\n');
        fs.writeFileSync(listFile, listContent);

        command
          .input(listFile)
          .inputOptions(['-safe 0', '-f concat'])
          .outputOptions(['-c copy']);
      }

      command.output(options.output);
      this.setupCommandEvents(command, job, resolve, reject);
      command.run();
    });
  }

  setupCommandEvents(command, job, resolve, reject) {
    command.on('start', (commandLine) => {
      job.status = 'running';
      job.command = commandLine;
      this.emit('jobProgress', job);
    });

    command.on('progress', (progress) => {
      job.progress = Math.round(progress.percent);
      job.currentTime = progress.timemark;
      job.currentKbps = progress.currentKbps;
      this.emit('jobProgress', job);
    });

    command.on('end', () => {
      job.status = 'completed';
      job.progress = 100;
      job.endTime = Date.now();
      job.duration = job.endTime - job.startTime;
      this.emit('jobCompleted', job);
      this.activeJobs.delete(job.id);
      resolve(job);
    });

    command.on('error', (err) => {
      job.status = 'error';
      job.error = err.message;
      job.endTime = Date.now();
      this.emit('jobError', job);
      this.activeJobs.delete(job.id);
      reject(err);
    });
  }

  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  cancelJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      job.endTime = Date.now();
      this.emit('jobCancelled', job);
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  getSupportedFormats() {
    return {
      video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
      audio: ['mp3', 'aac', 'flac', 'wav', 'ogg', 'wma', 'm4a'],
      subtitle: ['srt', 'ass', 'ssa', 'vtt', 'sub', 'idx']
    };
  }

  getSupportedCodecs() {
    return {
      video: ['libx264', 'libx265', 'libvpx-vp9', 'libaom-av1', 'mpeg2video', 'libvpx'],
      audio: ['aac', 'mp3', 'libvorbis', 'libopus', 'flac', 'pcm_s16le'],
      subtitle: ['mov_text', 'srt', 'ass', 'webvtt']
    };
  }

  destroy() {
    // Cancel all active jobs
    this.activeJobs.forEach((job, jobId) => {
      this.cancelJob(jobId);
    });
    
    this.removeAllListeners();
  }
}

module.exports = FFmpegManager;
