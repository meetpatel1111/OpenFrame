const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class VLCManager extends EventEmitter {
  constructor() {
    super();
    this.instance = null;
    this.player = null;
    this.media = null;
    this.currentFile = null;
    this.isInitialized = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 100;
    this.isPlaying = false;
    this.vlcProcess = null;
    this.tempDir = os.tmpdir();
    this.statusFile = path.join(this.tempDir, 'vlc_status.json');
    this.commandFile = path.join(this.tempDir, 'vlc_commands.txt');
    
    this.initialize();
  }

  async initialize() {
    try {
      // Check if VLC is installed
      const vlcPath = await this.findVLC();
      if (!vlcPath) {
        throw new Error('VLC is not installed. Please install VLC media player.');
      }

      console.log(`Found VLC at: ${vlcPath}`);
      
      // Set up command file for VLC communication
      this.setupCommandFile();
      
      // Start VLC in headless mode with HTTP interface
      this.startVLCServer(vlcPath);
      
      this.isInitialized = true;
      console.log('VLC Manager initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize VLC:', error);
      this.emit('error', error);
    }
  }

  async findVLC() {
    const possiblePaths = {
      win32: [
        'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
        'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe',
        path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'VideoLAN\\VLC\\vlc.exe'),
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'VideoLAN\\VLC\\vlc.exe')
      ],
      darwin: [
        '/Applications/VLC.app/Contents/MacOS/VLC',
        '/usr/local/bin/vlc'
      ],
      linux: [
        '/usr/bin/vlc',
        '/usr/local/bin/vlc',
        '/snap/bin/vlc'
      ]
    };

    const platform = process.platform;
    const paths = possiblePaths[platform] || [];

    for (const vlcPath of paths) {
      if (fs.existsSync(vlcPath)) {
        return vlcPath;
      }
    }

    // Try to find in PATH
    try {
      const { execSync } = require('child_process');
      const result = execSync('which vlc', { encoding: 'utf8' }).trim();
      if (result) return result;
    } catch (error) {
      // VLC not in PATH
    }

    return null;
  }

  setupCommandFile() {
    // Create command file for VLC communication
    try {
      fs.writeFileSync(this.commandFile, '');
    } catch (error) {
      console.error('Failed to create command file:', error);
    }
  }

  startVLCServer(vlcPath) {
    const args = [
      '--intf', 'rc',
      '--rc-quiet',
      '--extraintf', 'http',
      '--http-port', '8080',
      '--http-password', 'vlcpass',
      '--no-video-title-show',
      '--no-stats',
      '--no-disable-screensaver',
      '--no-snapshot-preview'
    ];

    this.vlcProcess = spawn(vlcPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    this.vlcProcess.stdout.on('data', (data) => {
      const output = data.toString();
      this.parseVLCOutput(output);
    });

    this.vlcProcess.stderr.on('data', (data) => {
      console.error('VLC stderr:', data.toString());
    });

    this.vlcProcess.on('close', (code) => {
      console.log(`VLC process exited with code ${code}`);
      this.isInitialized = false;
      this.emit('error', new Error('VLC process closed'));
    });

    // Give VLC time to start
    setTimeout(() => {
      this.startStatusMonitoring();
    }, 2000);
  }

  parseVLCOutput(output) {
    // Parse VLC status output
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('playing')) {
        this.isPlaying = true;
        this.emit('stateChanged', 'playing');
      } else if (line.includes('paused')) {
        this.isPlaying = false;
        this.emit('stateChanged', 'paused');
      } else if (line.includes('stopped')) {
        this.isPlaying = false;
        this.currentTime = 0;
        this.emit('stateChanged', 'stopped');
        this.emit('mediaEnded');
      }
    }
  }

  startStatusMonitoring() {
    // Monitor VLC status via HTTP interface
    const monitor = () => {
      if (!this.isInitialized) return;

      try {
        const http = require('http');
        const options = {
          hostname: 'localhost',
          port: '8080',
          path: '/requests/status.json',
          auth: 'admin:vlcpass'
        };

        const req = http.get(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const status = JSON.parse(data);
              this.updateStatus(status);
            } catch (error) {
              // Ignore JSON parse errors
            }
          });
        });

        req.on('error', (error) => {
          // VLC might not be ready yet
        });

        req.end();
      } catch (error) {
        // Ignore monitoring errors
      }

      setTimeout(monitor, 1000);
    };

    monitor();
  }

  updateStatus(status) {
    const newTime = Math.floor(status.time || 0);
    const newDuration = Math.floor(status.length || 0);
    
    if (newTime !== this.currentTime) {
      this.currentTime = newTime;
      this.emit('timeChanged', this.currentTime);
    }
    
    if (newDuration !== this.duration && newDuration > 0) {
      this.duration = newDuration;
    }
  }

  async play(filePath) {
    if (!this.isInitialized) {
      throw new Error('VLC Manager not initialized');
    }

    try {
      // Send play command to VLC
      await this.sendVLCCommand(`add "${filePath}"`);
      await this.sendVLCCommand('play');
      
      this.currentFile = filePath;
      console.log(`Playing: ${filePath}`);
      
      return true;
    } catch (error) {
      console.error('Failed to play media:', error);
      this.emit('error', error);
      throw error;
    }
  }

  pause() {
    if (!this.isInitialized) return;
    
    this.sendVLCCommand('pause');
    console.log('Playback paused');
  }

  stop() {
    if (!this.isInitialized) return;
    
    this.sendVLCCommand('stop');
    this.currentFile = null;
    console.log('Playback stopped');
  }

  async seek(time) {
    if (!this.isInitialized) return;
    
    await this.sendVLCCommand(`seek ${time}`);
    console.log(`Seeked to: ${time}s`);
  }

  async setVolume(volume) {
    if (!this.isInitialized) return;
    
    const clampedVolume = Math.max(0, Math.min(100, volume));
    await this.sendVLCCommand(`volume ${clampedVolume}`);
    this.volume = clampedVolume;
    console.log(`Volume set to: ${clampedVolume}%`);
  }

  getVolume() {
    return this.volume;
  }

  getTime() {
    return this.currentTime;
  }

  getDuration() {
    return this.duration;
  }

  isPlaying() {
    return this.isPlaying;
  }

  getMediaInfo() {
    if (!this.currentFile) return null;
    
    return {
      title: path.basename(this.currentFile),
      duration: this.duration,
      currentTime: this.currentTime,
      isPlaying: this.isPlaying
    };
  }

  async getTracks() {
    if (!this.isInitialized) return { audio: [], video: [], subtitle: [] };
    
    try {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: '8080',
        path: '/requests/track_list.json',
        auth: 'admin:vlcpass'
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.get(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(error);
            }
          });
        });
        req.on('error', reject);
      });

      return {
        audio: response.audio || [],
        video: response.video || [],
        subtitle: response.subtitle || []
      };
    } catch (error) {
      console.error('Failed to get tracks:', error);
      return { audio: [], video: [], subtitle: [] };
    }
  }

  async setAudioTrack(trackId) {
    if (!this.isInitialized) return;
    
    await this.sendVLCCommand(`audio_track ${trackId}`);
    console.log(`Audio track set to: ${trackId}`);
  }

  async setSubtitleTrack(trackId) {
    if (!this.isInitialized) return;
    
    await this.sendVLCCommand(`subtitle_track ${trackId}`);
    console.log(`Subtitle track set to: ${trackId}`);
  }

  async takeScreenshot() {
    if (!this.isInitialized) return null;
    
    try {
      const screenshotPath = path.join(this.tempDir, `screenshot_${Date.now()}.png`);
      await this.sendVLCCommand(`screenshot "${screenshotPath}"`);
      console.log(`Screenshot saved to: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return null;
    }
  }

  async setVideoFilter(filterName, enabled) {
    if (!this.isInitialized) return;
    
    const command = enabled ? `add ${filterName}` : `del ${filterName}`;
    await this.sendVLCCommand(command);
    console.log(`Video filter ${filterName}: ${enabled ? 'enabled' : 'disabled'}`);
  }

  async setAudioFilter(filterName, enabled) {
    if (!this.isInitialized) return;
    
    const command = enabled ? `add ${filterName}` : `del ${filterName}`;
    await this.sendVLCCommand(command);
    console.log(`Audio filter ${filterName}: ${enabled ? 'enabled' : 'disabled'}`);
  }

  sendVLCCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.vlcProcess || this.vlcProcess.killed) {
        reject(new Error('VLC process not available'));
        return;
      }

      try {
        this.vlcProcess.stdin.write(command + '\n');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  destroy() {
    if (this.vlcProcess && !this.vlcProcess.killed) {
      this.vlcProcess.kill('SIGTERM');
      this.vlcProcess = null;
    }

    // Clean up temp files
    try {
      if (fs.existsSync(this.commandFile)) {
        fs.unlinkSync(this.commandFile);
      }
      if (fs.existsSync(this.statusFile)) {
        fs.unlinkSync(this.statusFile);
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    this.isInitialized = false;
    console.log('VLC Manager destroyed');
  }
}

module.exports = VLCManager;
