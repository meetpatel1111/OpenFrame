const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { VM } = require('vm');

class ScriptManager extends EventEmitter {
  constructor() {
    super();
    this.scripts = new Map();
    this.scriptDir = path.join(__dirname, '../../scripts');
    this.isInitialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      // Create scripts directory if it doesn't exist
      if (!fs.existsSync(this.scriptDir)) {
        fs.mkdirSync(this.scriptDir, { recursive: true });
      }

      // Load scripts
      await this.loadScripts();
      this.isInitialized = true;
      console.log('Script Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Script Manager:', error);
    }
  }

  loadScripts() {
    try {
      const scriptFiles = fs.readdirSync(this.scriptDir)
        .filter(file => file.endsWith('.js'));

      for (const file of scriptFiles) {
        this.loadScript(path.join(this.scriptDir, file));
      }
    } catch (error) {
      console.error('Failed to load scripts:', error);
    }
  }

  loadScript(scriptPath) {
    try {
      const scriptCode = fs.readFileSync(scriptPath, 'utf8');
      const scriptName = path.basename(scriptPath, '.js');
      
      // Parse script metadata
      const metadata = this.parseScriptMetadata(scriptCode);
      
      // Create script context
      const context = this.createScriptContext();
      
      // Compile script
      const script = new VM({
        timeout: 30000, // 30 second timeout
        sandbox: this.createSandbox()
      });

      // Execute script to get exports
      script.run(scriptCode, context);
      const scriptExports = context.module.exports;

      // Validate script
      if (this.validateScript(scriptName, scriptExports, metadata)) {
        this.scripts.set(scriptName, {
          name: scriptName,
          exports: scriptExports,
          metadata: metadata,
          path: scriptPath,
          enabled: true
        });

        console.log(`Script loaded: ${scriptName}`);
        this.emit('scriptLoaded', { name: scriptName, script: scriptExports });
      }
    } catch (error) {
      console.error(`Failed to load script ${scriptPath}:`, error);
    }
  }

  parseScriptMetadata(scriptCode) {
    const metadata = {
      name: 'Unknown Script',
      version: '1.0.0',
      description: 'No description available',
      author: 'Unknown',
      permissions: [],
      dependencies: []
    };

    // Try to extract metadata from script comments
    const metadataMatch = scriptCode.match(/\/\*\s*@metadata\s*{([^}]+)\s*}\s*\*\//);
    if (metadataMatch) {
      try {
        const metadataString = metadataMatch[1];
        return JSON.parse(metadataString);
      } catch (e) {
        // Invalid JSON, use defaults
      }
    }

    return metadata;
  }

  createScriptContext() {
    // Create a context for script execution
    const context = {
      console: {
        log: (...args) => console.log(`[Script]`, ...args),
        error: (...args) => console.error(`[Script]`, ...args),
        warn: (...args) => console.warn(`[Script]`, ...args)
      },
      module: {
        exports: {}
      },
      // Expose OpenFrame APIs to scripts
      openframe: {
        // Media operations
        play: (filePath) => this.emit('play', filePath),
        pause: () => this.emit('pause'),
        stop: () => this.emit('stop'),
        seek: (time) => this.emit('seek', time),
        
        // UI operations
        showNotification: (message, type = 'info') => this.emit('showNotification', { message, type }),
        
        // Settings
        getSetting: (key) => this.emit('getSetting', key),
        setSetting: (key, value) => this.emit('setSetting', { key, value }),
        
        // File operations
        showOpenDialog: (options) => this.emit('showOpenDialog', options),
        showSaveDialog: (options) => this.emit('showSaveDialog', options),
        
        // Media info
        probeMedia: (filePath) => this.emit('probeMedia', filePath),
        
        // Conversion
        convertMedia: (options) => this.emit('convertMedia', options),
        
        // Recording
        startRecording: (options) => this.emit('startRecording', options),
        stopRecording: () => this.emit('stopRecording'),
        
        // AI operations
        generateSubtitles: (audioPath, options) => this.emit('generateSubtitles', { audioPath, options }),
        enhanceAudio: (audioPath, options) => this.emit('enhanceAudio', { audioPath, options }),
        enhanceVideo: (videoPath, options) => this.emit('enhanceVideo', { videoPath, options }),
        
        // System operations
        executeCommand: (command, args) => this.emit('executeCommand', { command, args }),
        readFile: (filePath) => this.emit('readFile', filePath),
        writeFile: (filePath, content) => this.emit('writeFile', { filePath, content }),
        
        // Utility functions
        formatDuration: (seconds) => this.formatDuration(seconds),
        formatFileSize: (bytes) => this.formatFileSize(bytes),
        getCurrentTime: () => this.emit('getCurrentTime'),
        getMediaInfo: () => this.emit('getMediaInfo')
      }
    };

    return context;
  }

  createSandbox() {
    return {
      // Allow only safe modules and functions
      require: (module) => {
        const allowedModules = ['path', 'fs', 'crypto', 'util', 'url', 'querystring'];
        if (allowedModules.includes(module)) {
          return require(module);
        }
        throw new Error(`Module '${module}' is not allowed in scripts`);
      },
      // Allow only safe global functions
      global: {
        console: console,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        Math: Math,
        Date: Date,
        JSON: JSON,
        parseInt: parseInt,
        parseFloat: parseFloat,
        encodeURIComponent: encodeURIComponent,
        decodeURIComponent: decodeURIComponent
      }
    };
  }

  validateScript(scriptName, scriptExports, metadata) {
    try {
      // Check required script properties
      if (!scriptExports.name && !metadata.name) {
        console.error(`Script ${scriptName} is missing name`);
        return false;
      }

      // Check script version
      if (!metadata.version) {
        console.warn(`Script ${scriptName} doesn't specify version`);
      }

      // Validate script functions
      if (scriptExports.functions && Array.isArray(scriptExports.functions)) {
        for (const func of scriptExports.functions) {
          if (typeof func !== 'function') {
            console.error(`Script ${scriptName} has invalid function: ${func.name || 'anonymous'}`);
            return false;
          }
        }
      }

      // Check script permissions
      if (metadata.permissions && Array.isArray(metadata.permissions)) {
        const allowedPermissions = ['media', 'ui', 'settings', 'files', 'system', 'ai'];
        for (const permission of metadata.permissions) {
          if (!allowedPermissions.includes(permission)) {
            console.warn(`Script ${scriptName} requests unsupported permission: ${permission}`);
          }
        }
      }

      return true;
    } catch (error) {
      console.error(`Script validation failed for ${scriptName}:`, error);
      return false;
    }
  }

  executeScript(scriptName, functionName, ...args) {
    try {
      const script = this.scripts.get(scriptName);
      if (!script || !script.enabled) {
        throw new Error(`Script ${scriptName} not found or disabled`);
      }

      if (script.exports.functions && script.exports.functions[functionName]) {
        console.log(`Executing script: ${scriptName}.${functionName}`);
        const result = script.exports.functions[functionName](...args);
        this.emit('scriptExecuted', { scriptName, functionName, args, result });
        return result;
      } else {
        throw new Error(`Function ${functionName} not found in script ${scriptName}`);
      }
    } catch (error) {
      console.error(`Script execution failed (${scriptName}.${functionName}):`, error);
      throw error;
    }
  }

  executeScriptAll(functionName, ...args) {
    const results = [];
    
    for (const [scriptName, script] of this.scripts) {
      if (script.enabled && script.exports.functions && script.exports.functions[functionName]) {
        try {
          const result = script.exports.functions[functionName](...args);
          results.push({ script: scriptName, result });
        } catch (error) {
          console.error(`Script execution failed (${scriptName}.${functionName}):`, error);
          results.push({ script: scriptName, error: error.message });
        }
      }
    }
    
    return results;
  }

  getScriptList() {
    return Array.from(this.scripts.values()).map(script => ({
      name: script.name,
      version: script.metadata.version,
      description: script.metadata.description,
      author: script.metadata.author,
      permissions: script.metadata.permissions,
      dependencies: script.metadata.dependencies,
      enabled: script.enabled,
      path: script.path,
      functions: script.exports.functions ? Object.keys(script.exports.functions) : []
    }));
  }

  async enableScript(scriptName) {
    const script = this.scripts.get(scriptName);
    if (script) {
      script.enabled = true;
      this.emit('scriptEnabled', { name: scriptName });
    }
  }

  async disableScript(scriptName) {
    const script = this.scripts.get(scriptName);
    if (script) {
      script.enabled = false;
      this.emit('scriptDisabled', { name: scriptName });
    }
  }

  installScript(scriptPath) {
    try {
      const destination = path.join(this.scriptDir, path.basename(scriptPath));
      
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Script file not found: ${scriptPath}`);
      }

      fs.copyFileSync(scriptPath, destination);
      console.log(`Script installed: ${path.basename(scriptPath)}`);
      
      // Load the newly installed script
      this.loadScript(destination);
    } catch (error) {
      console.error(`Failed to install script:`, error);
    }
  }

  uninstallScript(scriptName) {
    try {
      const script = this.scripts.get(scriptName);
      if (script) {
        // Remove script file
        if (fs.existsSync(script.path)) {
          fs.unlinkSync(script.path);
          console.log(`Script uninstalled: ${scriptName}`);
        }
        
        // Remove from memory
        this.scripts.delete(scriptName);
        this.emit('scriptUnloaded', { name: scriptName });
      }
    } catch (error) {
      console.error(`Failed to uninstall script:`, error);
    }
  }

  createScript(scriptName, scriptContent, metadata = {}) {
    try {
      const scriptPath = path.join(this.scriptDir, `${scriptName}.js`);
      
      const defaultMetadata = {
        name: scriptName,
        version: '1.0.0',
        description: 'Custom script',
        author: 'User',
        permissions: ['media', 'ui'],
        dependencies: []
      };

      const finalMetadata = { ...defaultMetadata, ...metadata };
      
      const scriptWithMetadata = `/**\n * @metadata ${JSON.stringify(finalMetadata)}\n */\n\n${scriptContent}`;
      
      fs.writeFileSync(scriptPath, scriptWithMetadata);
      console.log(`Script created: ${scriptName}`);
      
      // Load the newly created script
      this.loadScript(scriptPath);
    } catch (error) {
      console.error(`Failed to create script:`, error);
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

  destroy() {
    // Clear all scripts from memory
    this.scripts.clear();
    
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

module.exports = ScriptManager;
