// Main JavaScript for audio functionality and memory management

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
                    this.togglePlay(audioElement, playBtn, player);
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
    togglePlay(audioElement, playBtn, playerElement) {
        // Pause all other audio players
        this.pauseAllAudioExcept(audioElement);
        
        if (audioElement.paused) {
            audioElement.play()
                .then(() => {
                    if (playBtn) {
                        playBtn.classList.add('playing');
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
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
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
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
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
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
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
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