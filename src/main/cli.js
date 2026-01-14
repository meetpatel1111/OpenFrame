#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const FFmpegManager = require('./ffmpegManager');

class OpenFrameCLI {
  constructor() {
    this.ffmpegManager = null;
    this.initialize();
  }

  async initialize() {
    try {
      this.ffmpegManager = new FFmpegManager();
      console.log('OpenFrame CLI initialized');
    } catch (error) {
      console.error('Failed to initialize FFmpeg Manager:', error.message);
      process.exit(1);
    }
  }

  async probe(filePath) {
    try {
      console.log(`Probing: ${filePath}`);
      const info = await this.ffmpegManager.probe(filePath);
      
      console.log('\n=== Media Information ===');
      console.log(`File: ${filePath}`);
      console.log(`Format: ${info.format.name}`);
      console.log(`Duration: ${this.formatDuration(info.format.duration)}`);
      console.log(`Size: ${this.formatFileSize(info.format.size)}`);
      
      if (info.streams.video.length > 0) {
        console.log('\n--- Video Streams ---');
        info.streams.video.forEach((stream, index) => {
          console.log(`Stream ${index + 1}:`);
          console.log(`  Codec: ${stream.codec}`);
          console.log(`  Resolution: ${stream.width}x${stream.height}`);
          console.log(`  Frame Rate: ${stream.fps}`);
          console.log(`  Bitrate: ${this.formatBitrate(stream.bitrate)}`);
        });
      }
      
      if (info.streams.audio.length > 0) {
        console.log('\n--- Audio Streams ---');
        info.streams.audio.forEach((stream, index) => {
          console.log(`Stream ${index + 1}:`);
          console.log(`  Codec: ${stream.codec}`);
          console.log(`  Channels: ${stream.channels}`);
          console.log(`  Sample Rate: ${stream.sampleRate} Hz`);
          console.log(`  Bitrate: ${this.formatBitrate(stream.bitrate)}`);
        });
      }
      
      if (info.streams.subtitle.length > 0) {
        console.log('\n--- Subtitle Streams ---');
        info.streams.subtitle.forEach((stream, index) => {
          console.log(`Stream ${index + 1}:`);
          console.log(`  Codec: ${stream.codec}`);
          console.log(`  Language: ${stream.language || 'Unknown'}`);
        });
      }
      
    } catch (error) {
      console.error('Probe failed:', error.message);
      process.exit(1);
    }
  }

  async convert(input, output, options = {}) {
    try {
      console.log(`Converting: ${input} -> ${output}`);
      
      const conversionOptions = {
        input,
        output,
        format: options.format || 'mp4',
        video: options.video || {},
        audio: options.audio || {},
        subtitle: options.subtitle || {},
        filters: options.filters || [],
        hardwareAcceleration: options.hardwareAcceleration || false
      };

      console.log('Conversion started...');
      const job = await this.ffmpegManager.convert(conversionOptions);
      
      console.log('Conversion completed successfully!');
      console.log(`Output: ${output}`);
      console.log(`Duration: ${this.formatDuration(job.duration / 1000)}`);
      
    } catch (error) {
      console.error('Conversion failed:', error.message);
      process.exit(1);
    }
  }

  async extractAudio(input, output, options = {}) {
    try {
      console.log(`Extracting audio: ${input} -> ${output}`);
      
      const extractOptions = {
        input,
        output,
        codec: options.codec || 'mp3',
        bitrate: options.bitrate || '192k',
        channels: options.channels || 2,
        sampleRate: options.sampleRate || 44100
      };

      const job = await this.ffmpegManager.extractAudio(extractOptions);
      
      console.log('Audio extraction completed successfully!');
      console.log(`Output: ${output}`);
      
    } catch (error) {
      console.error('Audio extraction failed:', error.message);
      process.exit(1);
    }
  }

  async extractSubtitles(input, output, options = {}) {
    try {
      console.log(`Extracting subtitles: ${input} -> ${output}`);
      
      const extractOptions = {
        input,
        output,
        streamIndex: options.streamIndex
      };

      const job = await this.ffmpegManager.extractSubtitles(extractOptions);
      
      console.log('Subtitle extraction completed successfully!');
      console.log(`Output: ${output}`);
      
    } catch (error) {
      console.error('Subtitle extraction failed:', error.message);
      process.exit(1);
    }
  }

  async generateThumbnail(input, output, options = {}) {
    try {
      console.log(`Generating thumbnail: ${input} -> ${output}`);
      
      const thumbnailOptions = {
        input,
        output,
        time: options.time || '00:00:01',
        size: options.size || '320x240'
      };

      const job = await this.ffmpegManager.generateThumbnail(thumbnailOptions);
      
      console.log('Thumbnail generated successfully!');
      console.log(`Output: ${output}`);
      
    } catch (error) {
      console.error('Thumbnail generation failed:', error.message);
      process.exit(1);
    }
  }

  async batchConvert(inputDir, outputDir, options = {}) {
    try {
      console.log(`Batch converting: ${inputDir} -> ${outputDir}`);
      
      const files = fs.readdirSync(inputDir);
      const mediaFiles = files.filter(file => 
        /\.(mp4|avi|mov|mkv|webm|flv|wmv)$/i.test(file)
      );

      console.log(`Found ${mediaFiles.length} media files`);
      
      for (const file of mediaFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.[^.]+$/, '_converted.mp4'));
        
        await this.convert(inputPath, outputPath, options);
        console.log(`✓ Converted: ${file}`);
      }
      
      console.log('Batch conversion completed!');
      
    } catch (error) {
      console.error('Batch conversion failed:', error.message);
      process.exit(1);
    }
  }

  formatDuration(seconds) {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes) {
    if (!bytes) return '--';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  formatBitrate(bits) {
    if (!bits) return '--';
    
    if (bits >= 1000000) {
      return `${(bits / 1000000).toFixed(1)} Mbps`;
    } else {
      return `${(bits / 1000).toFixed(1)} kbps`;
    }
  }

  showVersion() {
    console.log('OpenFrame CLI v1.0.0');
    console.log('Professional media processing tool powered by FFmpeg');
    console.log('');
    console.log('Usage: openframe <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  probe <file>              - Analyze media file');
    console.log('  convert <input> <output>  - Convert media file');
    console.log('  extract-audio <input> <output> - Extract audio');
    console.log('  extract-subs <input> <output> - Extract subtitles');
    console.log('  thumbnail <input> <output> - Generate thumbnail');
    console.log('  batch <input-dir> <output-dir> - Batch convert');
    console.log('');
    console.log('Options:');
    console.log('  --format <format>         - Output format (mp4, mkv, webm, etc.)');
    console.log('  --video-codec <codec>     - Video codec (libx264, libx265, libvpx-vp9)');
    console.log('  --audio-codec <codec>     - Audio codec (aac, mp3, flac, opus)');
    console.log('  --video-bitrate <rate>    - Video bitrate (1000k, 2500k, 5000k)');
    console.log('  --audio-bitrate <rate>    - Audio bitrate (128k, 192k, 320k)');
    console.log('  --resolution <width:height> - Video resolution');
    console.log('  --fps <rate>              - Frame rate');
    console.log('  --hw-accel               - Enable hardware acceleration');
    console.log('  --stream-index <index>    - Stream index for extraction');
    console.log('  --time <timestamp>        - Thumbnail time (00:00:01)');
    console.log('  --size <width:height>    - Thumbnail size');
  }
}

// CLI Commands
const cli = new OpenFrameCLI();

program
  .name('openframe')
  .description('Professional media processing tool powered by FFmpeg')
  .version('1.0.0');

program
  .command('probe <file>')
  .description('Analyze media file')
  .action(async (file) => {
    await cli.probe(file);
  });

program
  .command('convert <input> <output>')
  .description('Convert media file')
  .option('-f, --format <format>', 'Output format')
  .option('--video-codec <codec>', 'Video codec')
  .option('--audio-codec <codec>', 'Audio codec')
  .option('--video-bitrate <rate>', 'Video bitrate')
  .option('--audio-bitrate <rate>', 'Audio bitrate')
  .option('--resolution <resolution>', 'Video resolution (width:height)')
  .option('--fps <rate>', 'Frame rate')
  .option('--hw-accel', 'Enable hardware acceleration')
  .action(async (input, output, options) => {
    await cli.convert(input, output, options);
  });

program
  .command('extract-audio <input> <output>')
  .description('Extract audio from media')
  .option('-c, --codec <codec>', 'Audio codec')
  .option('-b, --bitrate <rate>', 'Audio bitrate')
  .option('--channels <number>', 'Audio channels')
  .option('--sample-rate <rate>', 'Sample rate')
  .action(async (input, output, options) => {
    await cli.extractAudio(input, output, options);
  });

program
  .command('extract-subs <input> <output>')
  .description('Extract subtitles from media')
  .option('--stream-index <index>', 'Stream index')
  .action(async (input, output, options) => {
    await cli.extractSubtitles(input, output, options);
  });

program
  .command('thumbnail <input> <output>')
  .description('Generate thumbnail from media')
  .option('-t, --time <timestamp>', 'Thumbnail time')
  .option('-s, --size <size>', 'Thumbnail size (width:height)')
  .action(async (input, output, options) => {
    await cli.generateThumbnail(input, output, options);
  });

program
  .command('batch <input-dir> <output-dir>')
  .description('Batch convert media files')
  .option('-f, --format <format>', 'Output format')
  .option('--video-codec <codec>', 'Video codec')
  .option('--audio-codec <codec>', 'Audio codec')
  .option('--video-bitrate <rate>', 'Video bitrate')
  .option('--audio-bitrate <rate>', 'Audio bitrate')
  .option('--resolution <resolution>', 'Video resolution (width:height)')
  .option('--fps <rate>', 'Frame rate')
  .option('--hw-accel', 'Enable hardware acceleration')
  .action(async (inputDir, outputDir, options) => {
    await cli.batchConvert(inputDir, outputDir, options);
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error('Unknown command');
  cli.showVersion();
  process.exit(1);
});

// Parse command line arguments
program.parse();
