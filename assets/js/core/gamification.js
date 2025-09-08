/**
 * 🎮 Gamification System
 * XP, Levels, Achievements, Streaks
 */

export const Gamification = {
    // Current user stats
    stats: {
        xp: 0,
        level: 1,
        totalLessons: 0,
        perfectRuns: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastActivity: null,
        achievements: []
    },
    
    // Level progression
    levels: {
        calculateLevel(xp) {
            // Level curve: 100 * 1.5^(level-1)
            let level = 1;
            let required = 100;
            
            while (xp >= required) {
                xp -= required;
                level++;
                required = Math.floor(100 * Math.pow(1.5, level - 1));
            }
            
            return { level, currentXP: xp, nextLevelXP: required };
        },
        
        getLevelTitle(level) {
            const titles = {
                1: "Script Kiddie",
                2: "Code Monkey", 
                3: "Byte Pusher",
                4: "Stack Surfer",
                5: "Register Wrangler",
                6: "Memory Master",
                7: "Exploit Explorer",
                8: "Binary Ninja",
                9: "Assembly Ace",
                10: "Reverse Engineer",
                11: "Shellcode Shaman",
                12: "Format String Fu Master",
                13: "Heap Hacker",
                14: "ROP Rockstar",
                15: "Kernel Kamikaze",
                16: "VM Virtuoso",
                17: "Crypto Crusher",
                18: "APT Architect",
                19: "Zero-Day Zenith",
                20: "Ghost Protocol"
            };
            return titles[level] || `Level ${level} Hacker`;
        }
    },
    
    // Achievement definitions
    achievements: {
        // Exploration achievements
        first_blood: {
            id: "first_blood",
            name: "First Blood",
            desc: "Complete your first lesson",
            icon: "🩸",
            xp: 100,
            check: (stats) => stats.totalLessons >= 1
        },
        
        curious_cat: {
            id: "curious_cat",
            name: "Curious Cat",
            desc: "Try all simulator commands",
            icon: "🐱",
            xp: 200,
            check: (stats, data) => data.commandsUsed >= 10
        },
        
        // Mastery achievements
        speed_demon: {
            id: "speed_demon",
            name: "Speed Demon",
            desc: "Complete a lesson in under 2 minutes",
            icon: "⚡",
            xp: 300,
            check: (stats, data) => data.fastestTime < 120
        },
        
        perfectionist: {
            id: "perfectionist",
            name: "Perfectionist",
            desc: "Complete 10 lessons without hints",
            icon: "💎",
            xp: 500,
            check: (stats) => stats.perfectRuns >= 10
        },
        
        // Persistence achievements
        week_warrior: {
            id: "week_warrior",
            name: "Week Warrior",
            desc: "7 day activity streak",
            icon: "🔥",
            xp: 400,
            check: (stats) => stats.currentStreak >= 7
        },
        
        month_master: {
            id: "month_master",
            name: "Month Master",
            desc: "30 day activity streak",
            icon: "🌟",
            xp: 1000,
            check: (stats) => stats.currentStreak >= 30
        },
        
        // Level achievements
        level_5: {
            id: "level_5",
            name: "Rising Star",
            desc: "Reach level 5",
            icon: "⭐",
            xp: 250,
            check: (stats) => stats.level >= 5
        },
        
        level_10: {
            id: "level_10",
            name: "Dedicated Hacker",
            desc: "Reach level 10",
            icon: "🏆",
            xp: 750,
            check: (stats) => stats.level >= 10
        },
        
        level_20: {
            id: "level_20",
            name: "Elite 1337",
            desc: "Reach the maximum level",
            icon: "👑",
            xp: 2000,
            check: (stats) => stats.level >= 20
        },
        
        // Special achievements
        night_owl: {
            id: "night_owl",
            name: "Night Owl",
            desc: "Complete lessons between 00:00-04:00",
            icon: "🦉",
            xp: 300,
            check: (stats, data) => data.nightSessions >= 5
        },
        
        bug_hunter: {
            id: "bug_hunter",
            name: "Bug Hunter",
            desc: "Report a bug in the system",
            icon: "🐛",
            xp: 1337,
            check: (stats, data) => data.bugsReported >= 1
        }
    },
    
    // Initialize gamification
    init() {
        this.loadStats();
        this.checkStreak();
        this.updateDisplay();
    },
    
    // Load stats from storage
    loadStats() {
        const saved = localStorage.getItem('hacker_lab_stats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    },
    
    // Save stats to storage
    saveStats() {
        localStorage.setItem('hacker_lab_stats', JSON.stringify(this.stats));
    },
    
    // Add XP and check for level up
    addXP(amount, reason) {
        const oldLevel = this.stats.level;
        this.stats.xp += amount;
        
        const levelInfo = this.levels.calculateLevel(this.stats.xp);
        this.stats.level = levelInfo.level;
        
        this.saveStats();
        
        // Show XP gain notification
        this.showNotification(`+${amount} XP`, reason, 'xp');
        
        // Check for level up
        if (this.stats.level > oldLevel) {
            this.onLevelUp(oldLevel, this.stats.level);
        }
        
        // Check for new achievements
        this.checkAchievements();
        
        this.updateDisplay();
    },
    
    // Handle level up
    onLevelUp(oldLevel, newLevel) {
        const title = this.levels.getLevelTitle(newLevel);
        this.showNotification(
            `LEVEL UP! Welcome to Level ${newLevel}`,
            `You are now a ${title}!`,
            'levelup'
        );
        
        // Epic animation
        this.playLevelUpAnimation();
    },
    
    // Check and award achievements
    checkAchievements(extraData = {}) {
        for (const [key, achievement] of Object.entries(this.achievements)) {
            if (!this.stats.achievements.includes(achievement.id)) {
                if (achievement.check(this.stats, extraData)) {
                    this.unlockAchievement(achievement);
                }
            }
        }
    },
    
    // Unlock achievement
    unlockAchievement(achievement) {
        this.stats.achievements.push(achievement.id);
        this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
        
        this.showNotification(
            `🏆 Achievement Unlocked!`,
            `${achievement.icon} ${achievement.name}: ${achievement.desc}`,
            'achievement'
        );
        
        this.playAchievementSound();
        this.saveStats();
    },
    
    // Update streak
    checkStreak() {
        const today = new Date().toDateString();
        const lastActivity = this.stats.lastActivity ? new Date(this.stats.lastActivity).toDateString() : null;
        
        if (lastActivity === today) {
            // Already active today
            return;
        }
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (lastActivity === yesterday) {
            // Streak continues
            this.stats.currentStreak++;
            this.stats.bestStreak = Math.max(this.stats.currentStreak, this.stats.bestStreak);
        } else if (lastActivity) {
            // Streak broken
            this.stats.currentStreak = 1;
        } else {
            // First time
            this.stats.currentStreak = 1;
        }
        
        this.stats.lastActivity = new Date().toISOString();
        this.saveStats();
    },
    
    // Complete lesson
    onLessonComplete(lessonId, timeSpent, hintsUsed, success) {
        this.stats.totalLessons++;
        
        // Base XP for completion
        let xp = 100;
        
        // Bonus for perfect run (no hints)
        if (hintsUsed === 0) {
            xp += 50;
            this.stats.perfectRuns++;
        }
        
        // Speed bonus
        if (timeSpent < 120) { // Under 2 minutes
            xp += 25;
        }
        
        // First try bonus
        if (success) {
            xp += 25;
        }
        
        this.addXP(xp, `Completed: ${lessonId}`);
        
        // Check achievements with lesson data
        this.checkAchievements({
            fastestTime: timeSpent,
            commandsUsed: 10 // TODO: Track actual commands
        });
        
        this.checkStreak();
    },
    
    // Update UI display (optimized with requestAnimationFrame)
    updateDisplay() {
        requestAnimationFrame(() => {
            const levelInfo = this.levels.calculateLevel(this.stats.xp);
            const levelTitle = this.levels.getLevelTitle(this.stats.level);
            
            // Update header display
            const levelDisplay = document.getElementById('user-level');
            if (levelDisplay) {
                levelDisplay.textContent = '';
                
                const badge = document.createElement('span');
                badge.className = 'level-badge';
                badge.textContent = `Lvl ${this.stats.level}`;
                
                const title = document.createElement('span');
                title.className = 'level-title';
                title.textContent = levelTitle;
                
                levelDisplay.appendChild(badge);
                levelDisplay.appendChild(title);
            }
            
            const xpDisplay = document.getElementById('user-xp');
            if (xpDisplay) {
                const xpPercent = (levelInfo.currentXP / levelInfo.nextLevelXP) * 100;
                xpDisplay.textContent = '';
                
                const barContainer = document.createElement('div');
                barContainer.className = 'xp-bar';
                
                const barFill = document.createElement('div');
                barFill.className = 'xp-fill';
                barFill.style.width = `${xpPercent}%`;
                barContainer.appendChild(barFill);
                
                const text = document.createElement('span');
                text.className = 'xp-text';
                text.textContent = `${levelInfo.currentXP} / ${levelInfo.nextLevelXP} XP`;
                
                xpDisplay.appendChild(barContainer);
                xpDisplay.appendChild(text);
            }
            
            const streakDisplay = document.getElementById('user-streak');
            if (streakDisplay) {
                streakDisplay.textContent = '';
                
                const fire = document.createElement('span');
                fire.className = 'streak-fire';
                fire.textContent = '🔥';
                
                const count = document.createElement('span');
                count.className = 'streak-count';
                count.textContent = this.stats.currentStreak;
                
                streakDisplay.appendChild(fire);
                streakDisplay.appendChild(count);
            }
        });
    },
    
    // Show notification
    showNotification(title, message, type) {
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'notification-title';
        titleDiv.textContent = title;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'notification-message';
        messageDiv.textContent = message;
        
        notification.appendChild(titleDiv);
        notification.appendChild(messageDiv);
        
        document.body.appendChild(notification);
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // Play level up animation
    playLevelUpAnimation() {
        const animation = document.createElement('div');
        animation.className = 'level-up-animation';
        animation.innerHTML = '🎉';
        document.body.appendChild(animation);
        
        setTimeout(() => animation.remove(), 2000);
    },
    
    // Play achievement sound
    playAchievementSound() {
        // Could add actual sound here
        console.log('🎵 Achievement sound!');
    },
    
    // Get stats for display
    getStats() {
        const levelInfo = this.levels.calculateLevel(this.stats.xp);
        return {
            ...this.stats,
            levelInfo,
            levelTitle: this.levels.getLevelTitle(this.stats.level),
            unlockedAchievements: this.stats.achievements.map(id => 
                Object.values(this.achievements).find(a => a.id === id)
            ).filter(Boolean)
        };
    }
};
