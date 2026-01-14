const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();
    this.pluginDir = path.join(__dirname, '../../plugins');
    this.isInitialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      // Create plugins directory if it doesn't exist
      if (!fs.existsSync(this.pluginDir)) {
        fs.mkdirSync(this.pluginDir, { recursive: true });
      }

      // Load plugins
      await this.loadPlugins();
      this.isInitialized = true;
      console.log('Plugin Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Plugin Manager:', error);
    }
  }

  async loadPlugins() {
    try {
      const pluginFiles = fs.readdirSync(this.pluginDir)
        .filter(file => file.endsWith('.js'));

      for (const file of pluginFiles) {
        await this.loadPlugin(path.join(this.pluginDir, file));
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }

  loadPlugin(pluginPath) {
    try {
      const pluginCode = fs.readFileSync(pluginPath, 'utf8');
      const pluginName = path.basename(pluginPath, '.js');
      
      // Create a sandboxed environment for plugin
      const sandbox = this.createSandbox();
      
      // Execute plugin code in sandbox
      const plugin = new Function('sandbox', 'require', 'module', 'exports', pluginCode);
      plugin(sandbox, require, module, exports);

      // Validate plugin
      if (this.validatePlugin(pluginName, plugin)) {
        this.plugins.set(pluginName, {
          name: pluginName,
          instance: plugin,
          path: pluginPath,
          enabled: true
        });

        console.log(`Plugin loaded: ${pluginName}`);
        this.emit('pluginLoaded', { name: pluginName, plugin });
      }
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
    }
  }

  createSandbox() {
    // Create a sandboxed environment for plugins
    const sandbox = {
      console: {
        log: (...args) => console.log(`[Plugin]`, ...args),
        error: (...args) => console.error(`[Plugin]`, ...args),
        warn: (...args) => console.warn(`[Plugin]`, ...args)
      },
      // Expose safe APIs to plugins
      openframeAPI: {
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
        enhanceVideo: (videoPath, options) => this.emit('enhanceVideo', { videoPath, options })
      }
    };

    return sandbox;
  }

  validatePlugin(pluginName, plugin) {
    try {
      // Check required plugin properties
      if (!plugin.name || !plugin.version || !plugin.description) {
        console.error(`Plugin ${pluginName} is missing required properties`);
        return false;
      }

      // Check plugin API version compatibility
      if (plugin.apiVersion && plugin.apiVersion !== '1.0.0') {
        console.warn(`Plugin ${pluginName} uses API version ${plugin.apiVersion}, may not be compatible`);
      }

      // Validate plugin hooks
      if (plugin.hooks && typeof plugin.hooks === 'object') {
        const validHooks = ['onLoad', 'onUnload', 'onPlay', 'onPause', 'onStop'];
        for (const hook of Object.keys(plugin.hooks)) {
          if (!validHooks.includes(hook)) {
            console.warn(`Plugin ${pluginName} has unknown hook: ${hook}`);
          }
        }
      }

      return true;
    } catch (error) {
      console.error(`Plugin validation failed for ${pluginName}:`, error);
      return false;
    }
  }

  unloadPlugin(pluginName) {
    try {
      const plugin = this.plugins.get(pluginName);
      if (plugin) {
        // Call plugin unload hook
        if (plugin.instance && plugin.instance.hooks && plugin.instance.hooks.onUnload) {
          plugin.instance.hooks.onUnload();
        }

        this.plugins.delete(pluginName);
        console.log(`Plugin unloaded: ${pluginName}`);
        this.emit('pluginUnloaded', { name: pluginName });
      }
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginName}:`, error);
    }
  }

  async enablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.enabled = true;
      this.emit('pluginEnabled', { name: pluginName });
    }
  }

  async disablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.enabled = false;
      this.emit('pluginDisabled', { name: pluginName });
    }
  }

  getPluginList() {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.instance.version,
      description: plugin.instance.description,
      author: plugin.instance.author || 'Unknown',
      enabled: plugin.enabled,
      path: plugin.path
    }));
  }

  executePluginHook(pluginName, hookName, ...args) {
    const plugin = this.plugins.get(pluginName);
    if (plugin && plugin.enabled && plugin.instance.hooks && plugin.instance.hooks[hookName]) {
      try {
        return plugin.instance.hooks[hookName](...args);
      } catch (error) {
        console.error(`Plugin hook execution failed (${pluginName}.${hookName}):`, error);
      }
    }
    return null;
  }

  executePluginHookAll(hookName, ...args) {
    const results = [];
    
    for (const [pluginName, plugin] of this.plugins) {
      if (plugin.enabled && plugin.instance.hooks && plugin.instance.hooks[hookName]) {
        try {
          const result = plugin.instance.hooks[hookName](...args);
          results.push({ plugin: pluginName, result });
        } catch (error) {
          console.error(`Plugin hook execution failed (${pluginName}.${hookName}):`, error);
          results.push({ plugin: pluginName, error: error.message });
        }
      }
    }
    
    return results;
  }

  installPlugin(pluginPath) {
    try {
      const destination = path.join(this.pluginDir, path.basename(pluginPath));
      
      if (!fs.existsSync(pluginPath)) {
        throw new Error(`Plugin file not found: ${pluginPath}`);
      }

      fs.copyFileSync(pluginPath, destination);
      console.log(`Plugin installed: ${path.basename(pluginPath)}`);
      
      // Load the newly installed plugin
      this.loadPlugin(destination);
    } catch (error) {
      console.error(`Failed to install plugin:`, error);
    }
  }

  uninstallPlugin(pluginName) {
    try {
      const plugin = this.plugins.get(pluginName);
      if (plugin) {
        // Unload plugin first
        this.unloadPlugin(pluginName);
        
        // Remove plugin file
        if (fs.existsSync(plugin.path)) {
          fs.unlinkSync(plugin.path);
          console.log(`Plugin uninstalled: ${pluginName}`);
        }
      }
    } catch (error) {
      console.error(`Failed to uninstall plugin:`, error);
    }
  }

  destroy() {
    // Unload all plugins
    for (const pluginName of this.plugins.keys()) {
      this.unloadPlugin(pluginName);
    }
    
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

module.exports = PluginManager;
