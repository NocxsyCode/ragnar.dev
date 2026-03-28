document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    
    const songTag = document.getElementById('current-song-tag');
    const volumeSlider = document.getElementById('volume-slider');
    const song = { name: "Ragnar - Bio", src: "sarki1.mp3" };
    const audio = new Audio(song.src);
    audio.loop = true;
    let isPlaying = false;

    if (volumeSlider) {
        audio.volume = volumeSlider.value / 100;
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
    }

    function updateSongUI() {
        if (songTag) songTag.textContent = `Müzik: ${song.name}`;
    }

    function togglePlay() {
        if (!isPlaying) {
            audio.play().catch(e => console.log("Otomatik oynatma engellendi."));
            isPlaying = true;
        }
    }

    splashScreen.addEventListener('click', () => {
        splashScreen.classList.add('fade-out');
        mainContent.classList.remove('hidden');
        
        togglePlay();
        updateSongUI();

        setTimeout(() => {
            splashScreen.style.display = 'none';
            initParticles();
            fetchDiscordPresence();
            setInterval(fetchDiscordPresence, 15000); 
            startActivityTimer(); 
        }, 1000);
    });

    const discordUserId = '1219710011136147556';
    let activityStartTime = null;

    function startActivityTimer() {
        const timeEl = document.getElementById('activity-time');
        if (!timeEl) return;

        setInterval(() => {
            if (activityStartTime) {
                const totalSeconds = Math.floor((Date.now() - activityStartTime) / 1000);
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                
                let timeStr = "";
                if (h > 0) timeStr += `${h}:`;
                timeStr += `${m < 10 && (h > 0 || m > 0) ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
                
                timeEl.innerHTML = `<i class="fa-solid fa-gamepad"></i> ${timeStr} geçti`;
            }
        }, 1000);
    }

    async function fetchDiscordPresence() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
            const result = await response.json();

            if (result.success) {
                const data = result.data;
                const user = data.discord_user;

                const avatarImg = document.getElementById('user-avatar');
                const decoImg = document.getElementById('user-decoration');
                if (avatarImg) avatarImg.src = `https://cdn.discordapp.com/avatars/${discordUserId}/${user.avatar}.webp?size=256`;
                if (decoImg) {
                    if (user.avatar_decoration_data) {
                        decoImg.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`;
                        decoImg.classList.remove('hidden');
                    } else {
                        decoImg.classList.add('hidden');
                    }
                }

                const nameEl = document.getElementById('user-name');
                const tagEl = document.getElementById('user-tag');
                if (nameEl) nameEl.textContent = user.global_name || user.username;
                const customStatus = data.activities.find(a => a.type === 4);
                if (tagEl) tagEl.textContent = customStatus ? `"${customStatus.state}"` : `${user.username}#${user.discriminator}`;

                const activityEl = document.getElementById('user-activity');
                
                let activeActivity = data.activities.find(a => a.type !== 4);
                if (data.listening_to_spotify && data.spotify) {
                    activeActivity = {
                        name: "Spotify",
                        details: data.spotify.song,
                        state: data.spotify.artist,
                        timestamps: { start: data.spotify.timestamps.start },
                        type: 2
                    };
                }

                if (activityEl) {
                    if (activeActivity) {
                        activityEl.classList.remove('hidden');
                        activityStartTime = activeActivity.timestamps ? activeActivity.timestamps.start : null;

                        const typeLabel = document.getElementById('activity-type-label');
                        if (typeLabel) typeLabel.textContent = activeActivity.type === 2 ? "Dinliyor" : (activeActivity.type === 1 ? "Yayında" : "Oynuyor");

                        if (document.getElementById('activity-name')) document.getElementById('activity-name').textContent = activeActivity.name;
                        if (document.getElementById('activity-details')) document.getElementById('activity-details').textContent = activeActivity.details || "";
                        if (document.getElementById('activity-state')) document.getElementById('activity-state').textContent = activeActivity.state || "";

                        const largeImg = document.getElementById('activity-large-img');
                        const smallImg = document.getElementById('activity-small-img');
                        
                        let largeImgUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
                        if (activeActivity.name === "Spotify" && data.spotify) {
                            largeImgUrl = data.spotify.album_art_url;
                        } else if (activeActivity.assets && activeActivity.assets.large_image) {
                            largeImgUrl = formatDiscordAsset(activeActivity.application_id, activeActivity.assets.large_image);
                        }
                        if (largeImg) largeImg.src = largeImgUrl;

                        if (smallImg) {
                            if (activeActivity.assets && activeActivity.assets.small_image && activeActivity.name !== "Spotify") {
                                smallImg.src = formatDiscordAsset(activeActivity.application_id, activeActivity.assets.small_image);
                                smallImg.classList.remove('hidden');
                            } else {
                                smallImg.classList.add('hidden');
                            }
                        }
                    } else {
                        activityEl.classList.add('hidden');
                        activityStartTime = null;
                    }
                }

                const statusDot = document.getElementById('status-dot');
                if (statusDot) statusDot.className = `status-dot ${data.discord_status}`;
            }
        } catch (error) {
            console.error('Lanyard Hatası:', error);
        }
    }

    function formatDiscordAsset(appId, assetId) {
        if (!assetId) return "";
        if (assetId.startsWith('mp:external/')) {
            return `https://media.discordapp.net/external/${assetId.split('mp:external/')[1]}`;
        }
        if (assetId.startsWith('spotify:')) {
            return `https://i.scdn.co/image/${assetId.split('spotify:')[1]}`;
        }
        return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
    }

    function initParticles() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '5';
        canvas.style.pointerEvents = 'none';

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const stars = [];
        const count = 100;

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random()
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(star => {
                star.y -= star.speed;
                if (star.y < 0) star.y = height;

                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    }
});
