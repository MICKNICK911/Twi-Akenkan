// Main JavaScript for audio functionality and memory management

// ===== CASE TOGGLE MANAGER =====
const CaseManager = {
    currentMode: 'lowercase', // 'lowercase' or 'uppercase'
    isActive: false,
    
    // Initialize case toggle
    init() {
        this.loadCasePreference();
        this.setupCaseToggle();
        this.setupCaseElements();
        this.setupKeyboardShortcut();
    },
    
    // Load saved case preference
    loadCasePreference() {
        const savedCaseMode = localStorage.getItem('audio-case-mode');
        if (savedCaseMode) {
            this.currentMode = savedCaseMode;
            this.updateCaseMode(savedCaseMode);
        }
    },
    
    // Setup case toggle button
    setupCaseToggle() {
        const caseToggle = document.getElementById('caseToggle');
        const caseStatus = document.getElementById('caseStatus');
        
        if (caseToggle) {
            // Set initial state
            this.updateToggleUI();
            
            // Add click event
            caseToggle.addEventListener('click', () => {
                this.toggleCaseMode();
                
                // Add click animation
                caseToggle.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    caseToggle.style.transform = '';
                }, 150);
            });
            
            // Add focus styles for accessibility
            caseToggle.addEventListener('focus', () => {
                caseToggle.style.outline = `2px solid var(--accent-color)`;
                caseToggle.style.outlineOffset = '2px';
            });
            
            caseToggle.addEventListener('blur', () => {
                caseToggle.style.outline = 'none';
            });
        }
    },
    
    // Setup elements with .case class
    setupCaseElements() {
        // Add .case class to some elements automatically if not present
        // You can also manually add .case class to any element in your HTML
        
        // Example: Add .case class to all h1, h2, h3 elements (optional)
        // document.querySelectorAll('h1, h2, h3').forEach(el => {
        //     if (!el.classList.contains('case')) {
        //         el.classList.add('case');
        //     }
        // });
        
        // Example: Add .case class to all track titles (optional)
        document.querySelectorAll('.player-header h1').forEach(el => {
            if (!el.classList.contains('case')) {
                el.classList.add('case');
            }
        });
        
    },
    
    // Toggle between uppercase and lowercase
    toggleCaseMode() {
        this.currentMode = this.currentMode === 'lowercase' ? 'uppercase' : 'lowercase';
        this.updateCaseMode(this.currentMode);
        this.saveCasePreference();
        
        // Add visual feedback
        this.showCaseChangeNotification();
    },
    
    // Update case mode
    updateCaseMode(mode) {
        // Remove existing case classes
        document.body.classList.remove('uppercase-mode', 'lowercase-mode');
        
        // Add new case class
        document.body.classList.add(`${mode}-mode`);
        
        // Update UI
        this.updateToggleUI();
        
        // Dispatch custom event for any additional handling
        document.dispatchEvent(new CustomEvent('caseModeChanged', {
            detail: { mode }
        }));
    },
    
    // Update toggle button UI
    updateToggleUI() {
        const caseToggle = document.getElementById('caseToggle');
        const caseStatus = document.getElementById('caseStatus');
        
        if (caseToggle) {
            if (this.currentMode === 'uppercase') {
                caseToggle.classList.add('active');
                if (caseStatus) caseStatus.textContent = 'AA';
            } else {
                caseToggle.classList.remove('active');
                if (caseStatus) caseStatus.textContent = 'Aa';
            }
        }
    },
    
    // Save preference to localStorage
    saveCasePreference() {
        localStorage.setItem('audio-case-mode', this.currentMode);
    },
    
    // Setup keyboard shortcut (Alt + C)
    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Alt + C toggles case mode
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                this.toggleCaseMode();
                
                // Visual feedback for keyboard shortcut
                this.showKeyboardShortcutFeedback();
            }
            
            // Alt + Shift + C resets to lowercase
            if (e.altKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.currentMode = 'lowercase';
                this.updateCaseMode('lowercase');
                this.saveCasePreference();
                this.showResetNotification();
            }
        });
    },
    
    // Show notification when case mode changes
    showCaseChangeNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'case-notification';
        notification.innerHTML = `
            <i class="fas fa-font"></i>
            <span>Text case changed to ${this.currentMode === 'uppercase' ? 'UPPERCASE' : 'lowercase'}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            border-left: 4px solid var(--accent-color);
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s;
            font-weight: 500;
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#caseNotificationStyles')) {
            const style = document.createElement('style');
            style.id = 'caseNotificationStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    },
    
    // Show keyboard shortcut feedback
    showKeyboardShortcutFeedback() {
        const caseToggle = document.getElementById('caseToggle');
        if (caseToggle) {
            caseToggle.style.transform = 'scale(1.1)';
            caseToggle.style.boxShadow = '0 0 0 3px var(--accent-color)';
            
            setTimeout(() => {
                caseToggle.style.transform = '';
                caseToggle.style.boxShadow = '';
            }, 300);
        }
    },
    
    // Show reset notification
    showResetNotification() {
        const notification = document.createElement('div');
        notification.className = 'case-notification';
        notification.innerHTML = `
            <i class="fas fa-redo"></i>
            <span>Text case reset to lowercase</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            border-left: 4px solid var(--success-color);
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    },
    
    // Get current case mode
    getCurrentMode() {
        return this.currentMode;
    },
    
    // Force update all .case elements (useful for dynamic content)
    updateAllCaseElements() {
        document.querySelectorAll('.case').forEach(element => {
            // This will automatically apply based on CSS text-transform
            // No need to manually change text content
        });
    }
};

// ===== THEME MANAGEMENT =====
const ThemeManager = {
    // Initialize theme from localStorage or system preference
    init() {
        this.loadTheme();
        this.setupThemeToggle();
        this.setupSystemThemeListener();
    },
    
    // Load saved theme or detect system preference
    loadTheme() {
        const savedTheme = localStorage.getItem('audio-theme');
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
            localStorage.setItem('audio-theme', prefersDark ? 'dark' : 'light');
        }
    },
    
    // Set theme
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('audio-theme', theme);
        this.updateThemeStatus();
        this.updateFavicon(theme);
        this.updateMetaThemeColor(theme);
    },
    
    // Toggle between light and dark
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add animation class for transition
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    },
    
    // Setup theme toggle button
    setupThemeToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleTheme();
                
                // Add click animation
                toggleBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    toggleBtn.style.transform = '';
                }, 150);
            });
        }
        
        // Also allow keyboard control
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                this.toggleTheme();
            }
        });
    },
    
    // Listen for system theme changes
    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Only follow system theme if user hasn't made a choice
        mediaQuery.addEventListener('change', (e) => {
            const savedTheme = localStorage.getItem('audio-theme');
            if (!savedTheme) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },
    
    // Update theme status text
    updateThemeStatus() {
        const themeStatus = document.getElementById('themeStatus');
        if (themeStatus) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            themeStatus.textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
        }
    },
    
    // Update favicon based on theme (optional)
    updateFavicon(theme) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.href = theme === 'dark' ? 'favicon-dark.ico' : 'favicon.ico';
        }
    },
    
    // Update meta theme color for mobile browsers
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'dark' ? '#1a202c' : '#4361ee';
    },
    
    // Get current theme
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

// Global state
const AudioManager = {
    currentPlayers: new Map(), // Track all active audio elements
    isCleaning: false,
    
    // Initialize audio players on page
    initAudioPlayers() {
        console.log('Initializing audio players with memory optimization');
        
        // Find all audio players on the page
        const audioPlayers = document.querySelectorAll('.audio-player');
        
        audioPlayers.forEach((player, index) => {
            const audioElement = player.querySelector('audio');
            const playBtn = player.querySelector('.play-btn');
            const playBtnM = player.querySelector('.btn-multi');
            const progressBar = player.querySelector('.progress-bar');
            const progress = player.querySelector('.progress');
            const currentTimeEl = player.querySelector('.current-time');
            const durationEl = player.querySelector('.duration');
            const volumeSlider = player.querySelector('.volume-slider');
            const volumeLevel = player.querySelector('.volume-level');
            
            if (!audioElement) return;
            
            // Store reference for cleanup
            const playerId = `player-${index}-${Date.now()}`;
            this.currentPlayers.set(playerId, audioElement);
            
            // Set preload to metadata to avoid loading entire file
            audioElement.preload = 'metadata';
            
            // Load audio metadata
            audioElement.addEventListener('loadedmetadata', () => {
                if (durationEl) {
                    durationEl.textContent = this.formatTime(audioElement.duration);
                }
            });
            
            // Play/Pause button
            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    this.togglePlay(audioElement, playBtn, player, playBtnM);
                });
            }
            
            // Progress bar click
            if (progressBar && progress) {
                progressBar.addEventListener('click', (e) => {
                    const rect = progressBar.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    audioElement.currentTime = pos * audioElement.duration;
                });
            }
            
            // Update progress during playback
            audioElement.addEventListener('timeupdate', () => {
                if (!isNaN(audioElement.duration)) {
                    const percent = (audioElement.currentTime / audioElement.duration) * 100;
                    if (progress) {
                        progress.style.width = `${percent}%`;
                    }
                    if (currentTimeEl) {
                        currentTimeEl.textContent = this.formatTime(audioElement.currentTime);
                    }
                }
            });
            
            // Volume control
            if (volumeSlider && volumeLevel) {
                volumeSlider.addEventListener('click', (e) => {
                    const rect = volumeSlider.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    const volume = Math.max(0, Math.min(1, pos));
                    audioElement.volume = volume;
                    volumeLevel.style.width = `${volume * 100}%`;
                    
                    // Save volume preference
                    localStorage.setItem('audio-volume', volume);
                });
                
                // Load saved volume
                const savedVolume = localStorage.getItem('audio-volume');
                if (savedVolume !== null) {
                    audioElement.volume = parseFloat(savedVolume);
                    volumeLevel.style.width = `${audioElement.volume * 100}%`;
                }
            }
            
            // Handle audio end
            audioElement.addEventListener('ended', () => {
                if (playBtn) {
                    playBtn.classList.remove('playing');
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
                player.classList.remove('playing');
            });
            
            // Handle errors
            audioElement.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                this.handleAudioError(player, audioElement.src);
            });
        });
        
        // Set up beforeunload for cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanupAllAudio();
        });
        
        // Set up visibility change for pause on tab switch
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllAudio();
            }
        });
        
        console.log(`Initialized ${this.currentPlayers.size} audio players`);
    },
    
    // Toggle play/pause for a specific audio element
    togglePlay(audioElement, playBtn, playerElement, playBtnM) {
        // Pause all other audio players
        this.pauseAllAudioExcept(audioElement);
        
        if (audioElement.paused) {
            audioElement.play()
                .then(() => {
                    if (playBtn) {
                        playBtn.classList.add('playing');

                        if (!playBtnM) {
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        }
                    }
                    if (playerElement) {
                        playerElement.classList.add('playing');
                    }
                })
                .catch(error => {
                    console.error('Playback failed:', error);
                    this.handleAudioError(playerElement, audioElement.src);
                });
        } else {
            audioElement.pause();
            if (playBtn) {
                playBtn.classList.remove('playing');
                if (!playBtnM) {
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                        }
            }
            if (playerElement) {
                playerElement.classList.remove('playing');
            }
        }
    },
    
    // Pause all audio except the specified one
    pauseAllAudioExcept(exceptAudio) {
        this.currentPlayers.forEach((audio, id) => {
            if (audio !== exceptAudio && !audio.paused) {
                audio.pause();
                
                // Update UI
                const playerElement = audio.closest('.audio-player');
                if (playerElement) {
                    playerElement.classList.remove('playing');
                    const playBtn = playerElement.querySelector('.play-btn');
                    if (playBtn) {
                        playBtn.classList.remove('playing');
                        if (!playBtnM) {
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                        }
                    }
                }
            }
        });
    },
    
    // Pause all audio
    pauseAllAudio() {
        this.currentPlayers.forEach((audio, id) => {
            if (!audio.paused) {
                audio.pause();
                
                // Update UI
                const playerElement = audio.closest('.audio-player');
                if (playerElement) {
                    playerElement.classList.remove('playing');
                    const playBtn = playerElement.querySelector('.play-btn');
                    if (playBtn) {
                        playBtn.classList.remove('playing');

                        if (!playBtnM) {
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                        }
                    }
                }
            }
        });
    },
    
    // Clean up all audio resources
    cleanupAllAudio() {
        if (this.isCleaning) return;
        
        this.isCleaning = true;
        console.log('Cleaning up audio resources...');
        
        // Pause all audio
        this.pauseAllAudio();
        
        // Clear all audio sources to free memory
        this.currentPlayers.forEach((audio, id) => {
            audio.src = '';
            audio.load(); // Force browser to release resources
            
            // Remove event listeners by cloning and replacing
            const parent = audio.parentNode;
            if (parent) {
                const clone = audio.cloneNode(false);
                parent.replaceChild(clone, audio);
            }
        });
        
        // Clear the map
        this.currentPlayers.clear();
        
        // Force garbage collection hint (works in some browsers)
        if (window.gc) {
            window.gc();
        }
        
        console.log('Audio cleanup complete');
        this.isCleaning = false;
    },
    
    // Format time in MM:SS
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    
    // Handle audio loading/playback errors
    handleAudioError(playerElement, src) {
        if (!playerElement) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'audio-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Failed to load audio. The file may be missing or corrupted.</span>
        `;
        errorDiv.style.cssText = `
            background: #ffeaea;
            color: #d32f2f;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
        `;
        
        // Add error message to player
        playerElement.appendChild(errorDiv);
        
        // Disable play button if it exists
        const playBtn = playerElement.querySelector('.play-btn');
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.style.opacity = '0.5';
            playBtn.style.cursor = 'not-allowed';
        }
        
        console.error(`Audio load error: ${src}`);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    
    ThemeManager.init();
    CaseManager.init();
    
    // Initialize audio players if we're on an audio page
    if (document.querySelector('.audio-player')) {
        AudioManager.initAudioPlayers();
    }
    
    // Add smooth navigation with loading screen
    const navLinks = document.querySelectorAll('a[href$=".html"]:not([href="#"]):not([href^="http"])');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't intercept if it's the same page or has special attributes
            if (this.getAttribute('href') === window.location.pathname.split('/').pop() ||
                this.hasAttribute('target') ||
                this.hasAttribute('download')) {
                return;
            }
            
            // Only show loading screen for same-origin navigation
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Show loading overlay if it exists
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
            
            // Clean up audio before navigating (important for memory)
            if (typeof AudioManager !== 'undefined') {
                AudioManager.cleanupAllAudio();
            }
            
            // Small delay to allow cleanup and show loading screen
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        });
    });
    
    // Check browser memory if API is available
    if (performance && performance.memory) {
        const checkMemoryUsage = () => {
            const usedMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const totalMB = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            const limitMB = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            
            // Log memory usage (optional)
            if (usedMB > 200) {
                console.warn(`High memory usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
            }
        };
        
        // Check memory every 30 seconds
        setInterval(checkMemoryUsage, 30000);
    }
});