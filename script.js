// Global variables for the balloon functionality
let balloon;
let clickCount = 0;
let scene, camera, renderer;
let balloonMesh, rope;
let particleSystem;
let photoGalleryShown = false;

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded - initializing form fields...");

    // Add diagnostic event listeners to form fields
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', function () {
            console.log(`Field focused: ${this.id}`);
        });

        input.addEventListener('input', function () {
            console.log(`Input received in ${this.id}: ${this.value}`);
        });
    });

    // Populate date dropdowns
    const daySelect = document.getElementById('day');
    const monthSelect = document.getElementById('month');
    const yearSelect = document.getElementById('year');

    // Add days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i < 10 ? '0' + i : i.toString();
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // Add months
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = (index + 1) < 10 ? '0' + (index + 1) : (index + 1).toString();
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Add years
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i.toString();
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Form submission - Fixed event handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const day = document.getElementById('day').value;
            const month = document.getElementById('month').value;
            const year = document.getElementById('year').value;

            console.log("Form submitted with:", name, email, day, month, year);

            // Check if the inputs match Bikram's info
            if (name.toLowerCase() === 'bikram mondal' &&
                email.toLowerCase() === 'codesnippets45@gmail.com' &&
                day === '25' &&
                month === '12' &&
                year === '2004') {
                // Navigate to secret page
                document.getElementById('signup-page').classList.add('hidden');
                document.getElementById('secret-page').classList.remove('hidden');
            } else {
                // Show success modal for regular users
                document.getElementById('success-modal').style.display = 'flex';
            }
        });
    } else {
        console.error("Sign-up form not found!");
    }

    // Unlock button
    const unlockBtn = document.getElementById('unlock-btn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', function () {
            const secretCode = document.getElementById('secret-code').value;
            const secretError = document.getElementById('secret-error');

            console.log("Unlock attempted with code:", secretCode);

            // Check if the secret code is correct
            if (secretCode === '15102024') {
                secretError.style.display = 'none';
                document.getElementById('secret-page').classList.add('hidden');

                // Don't show birthday card, only initialize balloon
                // const birthdayCard = document.getElementById('birthday-card');
                // birthdayCard.classList.remove('hidden');
                // birthdayCard.style.display = 'block';

                // Initialize 3D space background
                initBalloon();
            } else {
                // Show error message
                secretError.style.display = 'block';
            }
        });
    } else {
        console.error("Unlock button not found!");
    }

    // Close modal
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', function () {
            document.getElementById('success-modal').style.display = 'none';
        });
    }

    // Function to create confetti
    function createConfetti(parent) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random position and color
        const colors = ['#ff9a9e', '#fad0c4', '#ffecd2', '#fcb69f', '#ffb6b9', '#fae3d9', '#a18cd1', '#fbc2eb', '#8fd3f4', '#84fab0'];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = -10 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';

        parent.appendChild(confetti);

        // Animation
        let posY = -10;
        let posX = parseFloat(confetti.style.left);
        let speed = 1 + Math.random() * 3;
        let opacity = 1;

        const frame = function () {
            posY += speed;
            posX += (Math.random() - 0.5) * 2;
            opacity -= 0.01;

            confetti.style.top = posY + 'px';
            confetti.style.left = posX + '%';
            confetti.style.opacity = opacity;

            if (posY < parent.offsetHeight && opacity > 0) {
                requestAnimationFrame(frame);
            } else {
                confetti.remove();
            }
        };

        requestAnimationFrame(frame);
    }
});

// 3D Space Background
function initSpaceBackground() {
    // Create scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Add colored nebulae (particle systems)
    const nebulaColors = [0xff9a9e, 0xfad0c4, 0xffecd2, 0xfcb69f, 0xa18cd1, 0xfbc2eb];
    const nebulae = [];

    for (let i = 0; i < 6; i++) {
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaMaterial = new THREE.PointsMaterial({
            color: nebulaColors[i % nebulaColors.length],
            size: 3,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        const nebulaVertices = [];
        const nebulaSize = 300;
        const nebulaParticles = 500;

        for (let j = 0; j < nebulaParticles; j++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI - Math.PI / 2;
            const distance = Math.random() * nebulaSize;

            const x = distance * Math.cos(theta) * Math.cos(phi);
            const y = distance * Math.sin(phi);
            const z = distance * Math.sin(theta) * Math.cos(phi);

            nebulaVertices.push(x, y, z);
        }

        nebulaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nebulaVertices, 3));
        const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);

        nebula.position.set(
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000
        );

        scene.add(nebula);
        nebulae.push(nebula);
    }

    // Position camera
    camera.position.z = 5;

    // Animation function
    function animate() {
        requestAnimationFrame(animate);

        // Rotate stars slowly
        stars.rotation.x += 0.0001;
        stars.rotation.y += 0.0002;

        // Animate nebulae
        nebulae.forEach((nebula, index) => {
            nebula.rotation.x += 0.0002 * (index % 3 + 1);
            nebula.rotation.y += 0.0003 * (index % 2 + 1);
            nebula.rotation.z += 0.0001 * (index % 4 + 1);
        });

        // Animate balloon if it exists
        if (balloon) {
            // Make balloon float gently
            const time = Date.now() * 0.001;
            balloon.position.y = 1.0 + Math.sin(time) * 0.2;

            // Slight rotation
            balloon.rotation.y = Math.sin(time * 0.5) * 0.1;
            balloon.rotation.x = Math.sin(time * 0.7) * 0.05;

            // Update rope positions if the rope exists
            if (rope && rope.geometry) {
                updateRope();
            }

            // Update particle system if it exists
            if (particleSystem) {
                particleSystem.rotation.y += 0.01;
            }
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start animation
    animate();
}

// Function to initialize balloon (replaces the old createHeartTree function)
function initBalloon() {
    // Only initialize if balloon hasn't been initialized yet
    if (window.balloonInitialized) return;

    // Initialize space background if not already done
    if (!scene) {
        initSpaceBackground();
    }

    // Create the balloon
    createBalloon();

    // Make the balloon clickable by adding the active class
    const balloonElement = document.getElementById('heart-tree');
    if (balloonElement) {
        balloonElement.classList.add('balloon-active');
    }

    window.balloonInitialized = true;
}

function createBalloon() {
    // Create balloon group
    balloon = new THREE.Group();

    // Create the balloon
    const balloonGeometry = new THREE.SphereGeometry(1, 32, 32);
    // Give the balloon a shiny material with slight transparency
    const balloonMaterial = new THREE.MeshPhongMaterial({
        color: 0xff5555, // Changed back to red from yellow
        shininess: 100,
        specular: 0xffffff,
        emissive: 0x220000, // Changed back to original emissive for red balloon
        transparent: true,
        opacity: 0.9
    });

    balloonMesh = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.add(balloonMesh);

    // Create balloon tie
    const tieGeometry = new THREE.ConeGeometry(0.15, 0.5, 16);
    const tieMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.y = -1.1;
    tie.rotation.x = Math.PI; // Flip to point down
    balloon.add(tie);

    // Create rope
    createRope();

    // Add balloon to scene
    balloon.position.y = 1.0; // Position lowered from 1.5 to 1.0
    balloon.scale.set(1.5, 1.5, 1.5); // Make balloon larger
    scene.add(balloon);

    // Make balloon clickable
    const balloonElement = document.getElementById('heart-tree');
    balloonElement.addEventListener('click', function () {
        // Only react to clicks if balloon is active and visible
        if (balloon && !photoGalleryShown) {
            clickCount++;

            // Make the balloon bounce on click
            bounceBalloon();

            // Add ripple effect
            createRippleEffect();

            // Pop balloon after third click
            if (clickCount >= 3) {
                popBalloon();
            }
        }
    });
}

function createRope() {
    // Create a segmented rope using a line
    const ropePoints = [];
    const segments = 10;

    for (let i = 0; i <= segments; i++) {
        const y = -1.2 - (i / segments) * 5; // Start from bottom of balloon and go down

        // Add slight curve to make it look more natural
        const xCurve = Math.sin((i / segments) * Math.PI) * 0.2;
        ropePoints.push(new THREE.Vector3(xCurve, y, 0));
    }

    const ropeGeometry = new THREE.BufferGeometry().setFromPoints(ropePoints);
    const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 2 });
    rope = new THREE.Line(ropeGeometry, ropeMaterial);
    scene.add(rope);
}

function updateRope() {
    if (!rope || !balloon) return;

    // Update the first point of the rope to follow the balloon
    const positions = rope.geometry.attributes.position.array;

    // First point attaches to the balloon
    positions[0] = balloon.position.x;
    positions[1] = balloon.position.y - 1.2;
    positions[2] = balloon.position.z;

    // Update the rest of the rope to create a swinging effect
    const time = Date.now() * 0.002;
    const segments = (positions.length / 3) - 1;

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const xOffset = Math.sin(time + t * 2) * 0.1 * t;
        positions[i * 3] = balloon.position.x + xOffset;

        // Keep Y position (height) as is
        // Add slight z movement
        positions[i * 3 + 2] = balloon.position.z + Math.cos(time + t * 2) * 0.1 * t;
    }

    rope.geometry.attributes.position.needsUpdate = true;
}

function bounceBalloon() {
    // Use GSAP for smoother animations if available
    if (typeof gsap !== 'undefined') {
        // Save original scale
        const originalScale = { x: balloon.scale.x, y: balloon.scale.y, z: balloon.scale.z };

        // Timeline for bounce effect
        gsap.timeline()
            .to(balloon.scale, {
                x: originalScale.x * 1.2,
                y: originalScale.y * 1.2,
                z: originalScale.z * 1.2,
                duration: 0.1
            })
            .to(balloon.scale, {
                x: originalScale.x,
                y: originalScale.y,
                z: originalScale.z,
                duration: 0.3,
                ease: "elastic.out(1, 0.3)"
            });

        // Add upward bounce
        gsap.to(balloon.position, {
            y: balloon.position.y + 0.5,
            duration: 0.2,
            ease: "power1.out",
            yoyo: true,
            repeat: 1
        });
    } else {
        // Fallback animation if GSAP is not available
        const originalScale = balloon.scale.clone();
        const duration = 300; // ms
        const startTime = Date.now();

        function animateBounce() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Scale effect - bounce up then back to normal
            const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
            balloon.scale.set(
                originalScale.x * scale,
                originalScale.y * scale,
                originalScale.z * scale
            );

            if (progress < 1) {
                requestAnimationFrame(animateBounce);
            } else {
                balloon.scale.copy(originalScale);
            }
        }

        animateBounce();
    }
}

function createRippleEffect() {
    // Create a ripple effect around the balloon
    const rippleGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
    const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });

    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
    ripple.position.copy(balloon.position);
    ripple.rotation.x = Math.PI / 2; // Make it horizontal
    scene.add(ripple);

    // Animate ripple
    const startTime = Date.now();
    const duration = 1000; // ms

    function animateRipple() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Scale out and fade
        const scale = 1 + progress * 5;
        ripple.scale.set(scale, scale, 1);
        rippleMaterial.opacity = 0.7 * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(animateRipple);
        } else {
            scene.remove(ripple);
            ripple.geometry.dispose();
            rippleMaterial.dispose();
        }
    }

    animateRipple();
}

function popBalloon() {
    if (!balloon || !balloonMesh) return;

    // Create particle explosion
    createParticleExplosion();

    // Hide the balloon mesh (don't remove it yet to keep the group structure)
    balloonMesh.visible = false;

    // Remove the rope
    if (rope) {
        scene.remove(rope);
        rope.geometry.dispose();
        rope.material.dispose();
        rope = null;
    }

    // Play pop sound
    playPopSound();

    // Create confetti
    createConfettiExplosion();

    // Add greeting effect
    showGreetingEffect();

    // After a delay, show photos
    setTimeout(showPhotoGallery, 3000);
}

function showGreetingEffect() {
    // Create a floating message that appears
    const messages = [
        "Happy Birthday Bikram! 🎂",
        "May all your wishes come true! ✨",
        "Have a wonderful day! 🎉",
        "Enjoy your special day! 💖"
    ];

    messages.forEach((text, index) => {
        setTimeout(() => {
            const message = document.createElement('div');
            message.style.position = 'fixed';
            message.style.top = `${20 + index * 15}%`;
            message.style.left = '50%';
            message.style.transform = 'translate(-50%, -50%)';
            message.style.color = '#fff';
            message.style.fontSize = '2.5rem';
            message.style.fontWeight = 'bold';
            message.style.textShadow = '0 0 10px rgba(255,255,255,0.7)';
            message.style.opacity = '0';
            message.style.zIndex = '15';
            message.textContent = text;
            document.body.appendChild(message);

            // Animate in
            let startTime = Date.now();
            let duration = 1000;

            function fadeIn() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                message.style.opacity = progress.toString();

                if (progress < 1) {
                    requestAnimationFrame(fadeIn);
                } else {
                    // After a delay, fade out
                    setTimeout(() => {
                        startTime = Date.now();

                        function fadeOut() {
                            const elapsed = Date.now() - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            message.style.opacity = (1 - progress).toString();

                            if (progress < 1) {
                                requestAnimationFrame(fadeOut);
                            } else {
                                document.body.removeChild(message);
                            }
                        }

                        fadeOut();
                    }, 3000);
                }
            }

            fadeIn();
        }, index * 1000);
    });
}

function createParticleExplosion() {
    // Create particles to simulate balloon fragments
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = [];
    const particleColors = [];

    // Use the balloon's color for particles
    const color = new THREE.Color(0xff5555); // Changed back to match red balloon color

    for (let i = 0; i < particleCount; i++) {
        // Create particles in a sphere shape
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 0.1 + Math.random() * 0.9; // Vary the initial distance

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        particlePositions.push(x, y, z);

        // Slightly vary the colors
        const hue = (i / particleCount) * 0.2;
        const c = new THREE.Color().setHSL(hue, 0.9, 0.7);
        particleColors.push(c.r, c.g, c.b);
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.position.copy(balloon.position);
    scene.add(particleSystem);

    // Animate particles
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
        // Random velocity in all directions
        velocities.push(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
    }

    const startTime = Date.now();
    const duration = 2000; // ms

    function animateParticles() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const positions = particleSystem.geometry.attributes.position.array;

        // Update particle positions
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Add velocity and gravity
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1] - 0.001; // Gravity effect
            positions[i3 + 2] += velocities[i3 + 2];

            // Increase velocity for explosion effect
            velocities[i3] *= 1.01;
            velocities[i3 + 1] *= 1.01;
            velocities[i3 + 2] *= 1.01;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Fade out
        particleMaterial.opacity = 0.8 * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(animateParticles);
        } else {
            // Remove particles
            scene.remove(particleSystem);
            particleSystem.geometry.dispose();
            particleSystem.material.dispose();
            particleSystem = null;
        }
    }

    animateParticles();
}

function playPopSound() {
    // Create audio for pop sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-balloon-popping-01-40166.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
        console.log('Audio play failed:', error);
    });
}

function createConfettiExplosion() {
    const container = document.body;

    // Create multiple confetti elements
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            createConfetti(container);
        }, i * 20); // Stagger the confetti creation
    }
}

function showPhotoGallery() {
    photoGalleryShown = true;

    // Replace sample photos with the provided images
    const photos = [
        { src: 'images/image1.jpg', caption: 'Happy memories together!' },
        { src: 'images/image2.jpg', caption: 'May all your dreams comes true' },
        { src: 'images/image3.jpg', caption: 'Celebrating your special day!' },
        { src: 'images/image4.jpg', caption: 'May your day be filled with joy!' },
        { src: 'images/image5.jpg', caption: 'Here\'s to more beautiful memories!' }
    ];

    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    // Create and add photo elements
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = 'Birthday memory';

        const caption = document.createElement('div');
        caption.className = 'photo-caption';
        caption.textContent = photo.caption;

        photoItem.appendChild(img);
        photoItem.appendChild(caption);
        galleryContainer.appendChild(photoItem);

        // Animate in with delay
        setTimeout(() => {
            photoItem.classList.add('show');
        }, 300 + index * 200);
    });

    // Show the gallery
    document.getElementById('photo-gallery').style.display = 'block';

    // Play background music with a 1-second delay
    setTimeout(() => {
        const music = document.getElementById('background-music');
        music.loop = true;
        music.volume = 0.5; // Set volume to 50%

        // Try to play music (may fail due to browser autoplay policies)
        const playPromise = music.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay prevented by browser. User interaction required to play audio.');
            });
        }
    }, 1000);

    // Add close gallery functionality
    document.getElementById('close-gallery').addEventListener('click', function () {
        document.getElementById('photo-gallery').style.display = 'none';
        photoGalleryShown = false;

        // Pause music when gallery is closed
        const music = document.getElementById('background-music');
        music.pause();
    });
}