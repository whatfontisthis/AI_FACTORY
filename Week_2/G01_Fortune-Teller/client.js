/**
 * Fortune Teller Client-Side Interactions
 * 오늘의 운세 클라이언트 인터랙션 스크립트
 * Enhanced with smoother animations
 */

// DOM Elements
const fortuneButton = document.getElementById('fortune-button');
const fortuneResult = document.getElementById('fortune-result');
const crystalBall = document.getElementById('crystal-ball');
const crystalIcon = document.getElementById('crystal-icon');
const magicDustContainer = document.getElementById('magic-dust-container');

// Animation timing functions for smoother transitions
const easing = {
    // Smooth deceleration
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    // Smooth acceleration-deceleration
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    // Elastic bounce effect
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    // Smooth overshoot
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
};

// Fortune Result Elements
const fortuneIcon = document.getElementById('fortune-icon');
const fortuneTitle = document.getElementById('fortune-title');
const fortuneMessage = document.getElementById('fortune-message');
const luckyNumber = document.getElementById('lucky-number');
const luckyColor = document.getElementById('lucky-color');
const luckyColorPreview = document.getElementById('lucky-color-preview');
const fortuneAdvice = document.getElementById('fortune-advice');

// Fortune Data
const fortunes = [
    {
        icon: '🌟',
        title: '대길 (大吉)',
        message: '오늘은 모든 일이 순조롭게 풀리는 최고의 날입니다! 새로운 도전을 시작하기에 완벽한 타이밍이며, 주변 사람들과의 관계도 더욱 돈독해질 것입니다.',
        advice: '용기를 가지고 첫 걸음을 내딛으세요. 행운이 당신과 함께합니다.'
    },
    {
        icon: '✨',
        title: '길 (吉)',
        message: '좋은 기운이 감도는 하루입니다. 작은 행운들이 연속으로 찾아오며, 노력한 만큼 결실을 맺을 수 있는 날입니다.',
        advice: '긍정적인 마음을 유지하면 더 큰 행운이 찾아옵니다.'
    },
    {
        icon: '🌙',
        title: '중길 (中吉)',
        message: '평온하고 안정적인 하루가 될 것입니다. 급하게 서두르기보다는 차분하게 하루를 보내면 좋은 결과를 얻을 수 있습니다.',
        advice: '조급해하지 마세요. 천천히 그러나 꾸준히 나아가세요.'
    },
    {
        icon: '💫',
        title: '소길 (小吉)',
        message: '작지만 확실한 행복이 찾아오는 날입니다. 일상 속 소소한 즐거움에 감사하는 마음을 가지면 하루가 더욱 풍요로워집니다.',
        advice: '주변의 작은 것들에 감사하는 마음을 가져보세요.'
    },
    {
        icon: '🔮',
        title: '평 (平)',
        message: '무난한 하루가 예상됩니다. 큰 변화나 사건은 없지만, 그 속에서 안정을 찾을 수 있습니다. 내면의 평화에 집중해보세요.',
        advice: '평범한 하루 속에서도 특별함을 발견할 수 있습니다.'
    },
    {
        icon: '🌸',
        title: '말길 (末吉)',
        message: '처음에는 어려움이 있을 수 있지만, 끝에는 좋은 결과가 기다리고 있습니다. 인내심을 가지고 기다리면 보상이 찾아옵니다.',
        advice: '어려움 뒤에 반드시 좋은 일이 옵니다. 포기하지 마세요.'
    },
    {
        icon: '🌊',
        title: '흉 (凶)',
        message: '조심해야 할 하루입니다. 중요한 결정은 미루고, 평소보다 신중하게 행동하는 것이 좋습니다. 하지만 걱정하지 마세요, 조심하면 무탈합니다.',
        advice: '오늘은 무리하지 말고 휴식을 취하는 것도 좋습니다.'
    },
    {
        icon: '🦋',
        title: '변화운 (變化運)',
        message: '새로운 변화가 찾아오는 날입니다. 예상치 못한 기회가 올 수 있으니, 열린 마음으로 받아들일 준비를 하세요.',
        advice: '변화를 두려워하지 마세요. 그것이 성장의 시작입니다.'
    }
];

const colors = [
    { name: '금색', hex: '#FFD700' },
    { name: '보라색', hex: '#9B59B6' },
    { name: '파란색', hex: '#3498DB' },
    { name: '초록색', hex: '#2ECC71' },
    { name: '분홍색', hex: '#E91E63' },
    { name: '주황색', hex: '#FF9800' },
    { name: '하늘색', hex: '#87CEEB' },
    { name: '빨간색', hex: '#E74C3C' },
    { name: '흰색', hex: '#FFFFFF' },
    { name: '은색', hex: '#C0C0C0' }
];

// State
let isAnimating = false;

/**
 * Get random item from array
 */
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random number between min and max
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create magic dust particle with smoother animation
 */
function createMagicDust(x, y) {
    const particle = document.createElement('div');
    const size = getRandomNumber(4, 12);
    const particleColors = ['#FFD700', '#A855F7', '#FBBF24', '#C084FC', '#F59E0B', '#E879F9'];
    const color = getRandomItem(particleColors);

    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, ${color}, ${color}88);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}44;
        will-change: transform, opacity;
    `;

    magicDustContainer.appendChild(particle);

    // Animate particle with smoother physics
    const angle = getRandomNumber(0, 360);
    const velocity = getRandomNumber(80, 200);
    const vx = Math.cos(angle * Math.PI / 180) * velocity;
    const vy = Math.sin(angle * Math.PI / 180) * velocity;
    const rotationSpeed = getRandomNumber(-360, 360);

    let startTime = null;
    const duration = getRandomNumber(1200, 2000);

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            particle.remove();
            return;
        }

        // Use easing for smoother movement
        const easedProgress = easing.easeOutCubic(progress);

        // Smooth position with deceleration
        const currentX = vx * easedProgress * 0.8;
        const currentY = vy * easedProgress * 0.8 - (progress * 80); // Gentle upward drift

        // Smooth opacity fade using easeInOutCubic
        const opacity = 1 - easing.easeInOutCubic(progress);

        // Scale with slight bounce
        const scale = 1 - progress * 0.6;

        // Smooth rotation
        const rotation = rotationSpeed * progress;

        particle.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale}) rotate(${rotation}deg)`;
        particle.style.opacity = opacity;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

/**
 * Create burst of magic dust with staggered smooth timing
 */
function createMagicBurst(centerX, centerY, count = 30) {
    // Use smoother staggered timing for burst effect
    for (let i = 0; i < count; i++) {
        // Smooth stagger delay using ease-out curve
        const staggerProgress = i / count;
        const easedDelay = easing.easeOutCubic(staggerProgress) * 400;

        setTimeout(() => {
            // Radial distribution for more natural burst
            const angle = (i / count) * Math.PI * 2 + getRandomNumber(-20, 20) * Math.PI / 180;
            const radius = getRandomNumber(10, 60);
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            createMagicDust(centerX + offsetX, centerY + offsetY);
        }, easedDelay);
    }
}

/**
 * Add crystal ball shake animation with smooth wobble
 */
function shakeCrystalBall() {
    crystalBall.style.animation = 'none';
    crystalBall.offsetHeight; // trigger reflow
    crystalBall.classList.add('shake');

    // Add glow pulse during shake
    crystalBall.style.filter = 'brightness(1.2) drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))';

    setTimeout(() => {
        crystalBall.classList.remove('shake');
        crystalBall.style.animation = '';
        // Smoothly fade out the extra glow
        crystalBall.style.transition = 'filter 0.5s ease-out';
        crystalBall.style.filter = '';
    }, 600);
}

/**
 * Show loading state with smooth transitions
 */
function showLoadingState() {
    // Smooth icon transition
    crystalIcon.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    crystalIcon.style.transform = 'scale(0.8)';
    crystalIcon.style.opacity = '0.7';

    setTimeout(() => {
        crystalIcon.textContent = '✨';
        crystalIcon.style.transform = 'scale(1.1)';
        crystalIcon.style.opacity = '1';
        crystalIcon.style.animation = 'pulse 1s ease-in-out infinite';
    }, 150);

    fortuneButton.disabled = true;
    fortuneButton.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    fortuneButton.style.opacity = '0.8';
    fortuneButton.querySelector('span:nth-child(2)').textContent = '운세를 보는 중...';
}

/**
 * Reset button state with smooth transitions
 */
function resetButtonState() {
    // Smooth icon restoration
    crystalIcon.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out';
    crystalIcon.style.transform = 'scale(0.8)';
    crystalIcon.style.opacity = '0.7';
    crystalIcon.style.animation = '';

    setTimeout(() => {
        crystalIcon.textContent = '🔮';
        crystalIcon.style.transform = 'scale(1)';
        crystalIcon.style.opacity = '1';
    }, 200);

    // Smooth button restoration
    fortuneButton.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    fortuneButton.style.opacity = '1';
    fortuneButton.disabled = false;
    fortuneButton.querySelector('span:nth-child(2)').textContent = '다시 보기';
}

/**
 * Display fortune result with smooth staggered animation
 */
function displayFortune(fortune, number, color) {
    // Update fortune card content (hidden initially)
    fortuneIcon.textContent = fortune.icon;
    fortuneTitle.textContent = fortune.title;
    fortuneMessage.textContent = fortune.message;
    luckyNumber.textContent = number;
    luckyColor.textContent = color.name;
    luckyColorPreview.style.backgroundColor = color.hex;
    fortuneAdvice.textContent = `"${fortune.advice}"`;

    // Get all animated elements
    const animatedElements = [
        fortuneIcon,
        fortuneTitle,
        fortuneMessage,
        luckyNumber.closest('.bg-purple-800\\/40'),
        luckyColor.closest('.bg-purple-800\\/40'),
        fortuneAdvice.closest('.bg-gradient-to-r')
    ].filter(Boolean);

    // Set initial state for staggered animation
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
    });

    // Show fortune result container with smooth animation
    fortuneResult.classList.remove('hidden');
    fortuneResult.style.opacity = '0';
    fortuneResult.style.transform = 'translateY(40px) scale(0.95)';

    // Trigger container animation
    requestAnimationFrame(() => {
        fortuneResult.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        fortuneResult.style.opacity = '1';
        fortuneResult.style.transform = 'translateY(0) scale(1)';

        // Stagger animate inner elements
        animatedElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + index * 100);
        });
    });

    // Smooth scroll to result
    setTimeout(() => {
        fortuneResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
}

/**
 * Fetch fortune from server (with fallback to local generation)
 */
async function getFortune() {
    try {
        // Try to fetch from server
        const response = await fetch('/api/fortune');
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Server not available');
    } catch (error) {
        // Fallback to local generation
        return generateLocalFortune();
    }
}

/**
 * Generate fortune locally
 */
function generateLocalFortune() {
    return {
        fortune: getRandomItem(fortunes),
        number: getRandomNumber(1, 99),
        color: getRandomItem(colors)
    };
}

/**
 * Main fortune reveal handler
 */
async function revealFortune() {
    if (isAnimating) return;
    isAnimating = true;

    // Get button position for magic burst
    const buttonRect = fortuneButton.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    // Show effects
    shakeCrystalBall();
    showLoadingState();
    createMagicBurst(centerX, centerY, 40);

    // Get crystal ball position for second burst
    const crystalRect = crystalBall.getBoundingClientRect();
    const crystalCenterX = crystalRect.left + crystalRect.width / 2;
    const crystalCenterY = crystalRect.top + crystalRect.height / 2;

    setTimeout(() => {
        createMagicBurst(crystalCenterX, crystalCenterY, 50);
    }, 300);

    // Get fortune data
    const fortuneData = await getFortune();

    // Wait for dramatic effect
    setTimeout(() => {
        // Update crystal icon to match fortune
        crystalIcon.textContent = fortuneData.fortune.icon;
        crystalIcon.style.animation = '';

        // Create final magic burst
        createMagicBurst(crystalCenterX, crystalCenterY, 60);

        // Display fortune
        displayFortune(fortuneData.fortune, fortuneData.number, fortuneData.color);

        // Reset button
        resetButtonState();
        isAnimating = false;
    }, 1500);
}

/**
 * Initialize shake animation CSS with smoother keyframes
 */
function initShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0) rotate(0deg) scale(1); }
            10% { transform: translateX(-3px) rotate(-1deg) scale(1.02); }
            20% { transform: translateX(5px) rotate(1.5deg) scale(1.03); }
            30% { transform: translateX(-6px) rotate(-2deg) scale(1.04); }
            40% { transform: translateX(6px) rotate(2deg) scale(1.03); }
            50% { transform: translateX(-5px) rotate(-1.5deg) scale(1.02); }
            60% { transform: translateX(4px) rotate(1deg) scale(1.01); }
            70% { transform: translateX(-3px) rotate(-0.5deg) scale(1.01); }
            80% { transform: translateX(2px) rotate(0.5deg) scale(1); }
            90% { transform: translateX(-1px) rotate(-0.2deg) scale(1); }
        }

        /* Smooth pulse animation for loading */
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.15);
                opacity: 0.8;
            }
        }

        /* Smooth glow pulse for crystal ball */
        @keyframes crystalGlow {
            0%, 100% {
                filter: brightness(1) drop-shadow(0 0 20px rgba(168, 85, 247, 0.5));
            }
            50% {
                filter: brightness(1.1) drop-shadow(0 0 35px rgba(168, 85, 247, 0.8));
            }
        }

        /* Smooth icon bounce */
        @keyframes iconBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        /* Add will-change for smoother GPU acceleration */
        #crystal-ball,
        #fortune-result,
        #crystal-icon {
            will-change: transform, opacity, filter;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add hover effect to crystal ball with smooth transitions
 */
function initCrystalBallHover() {
    // Set base transition for smooth hover effects
    crystalBall.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease-out';
    crystalBall.style.cursor = 'pointer';

    crystalBall.addEventListener('mouseenter', () => {
        if (!isAnimating) {
            crystalBall.style.transform = 'scale(1.05) translateY(-5px)';
            crystalBall.style.filter = 'brightness(1.1) drop-shadow(0 10px 30px rgba(168, 85, 247, 0.6))';
        }
    });

    crystalBall.addEventListener('mouseleave', () => {
        if (!isAnimating) {
            crystalBall.style.transform = '';
            crystalBall.style.filter = '';
        }
    });

    // Add pressed effect for click feedback
    crystalBall.addEventListener('mousedown', () => {
        if (!isAnimating) {
            crystalBall.style.transition = 'transform 0.1s ease-out';
            crystalBall.style.transform = 'scale(0.98)';
        }
    });

    crystalBall.addEventListener('mouseup', () => {
        if (!isAnimating) {
            crystalBall.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            crystalBall.style.transform = 'scale(1.05) translateY(-5px)';
        }
    });

    // Click on crystal ball also reveals fortune
    crystalBall.addEventListener('click', () => {
        if (!isAnimating) {
            revealFortune();
        }
    });
}

/**
 * Add smooth button hover and click effects
 */
function initButtonEffects() {
    fortuneButton.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease-out';

    fortuneButton.addEventListener('mousedown', () => {
        if (!isAnimating && !fortuneButton.disabled) {
            fortuneButton.style.transform = 'scale(0.95)';
        }
    });

    fortuneButton.addEventListener('mouseup', () => {
        if (!isAnimating && !fortuneButton.disabled) {
            fortuneButton.style.transform = 'scale(1.05)';
            setTimeout(() => {
                fortuneButton.style.transform = '';
            }, 150);
        }
    });
}

/**
 * Initialize all interactions
 */
function init() {
    initShakeAnimation();
    initCrystalBallHover();
    initButtonEffects();

    // Fortune button click handler
    fortuneButton.addEventListener('click', revealFortune);

    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (document.activeElement === fortuneButton) {
                e.preventDefault();
                revealFortune();
            }
        }
    });

    // Add ambient particle effect on page load
    setTimeout(() => {
        createAmbientParticles();
    }, 1000);
}

/**
 * Create subtle ambient particles for mystical atmosphere
 */
function createAmbientParticles() {
    setInterval(() => {
        if (!isAnimating && Math.random() > 0.7) {
            const x = getRandomNumber(0, window.innerWidth);
            const y = getRandomNumber(0, window.innerHeight);
            createAmbientDust(x, y);
        }
    }, 2000);
}

/**
 * Create a single ambient particle (smaller and slower than magic dust)
 */
function createAmbientDust(x, y) {
    const particle = document.createElement('div');
    const size = getRandomNumber(2, 5);
    const ambientColors = ['#A855F7', '#FBBF24', '#C084FC'];
    const color = getRandomItem(ambientColors);

    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px ${color}66;
        opacity: 0;
        z-index: 5;
    `;

    document.body.appendChild(particle);

    let startTime = null;
    const duration = getRandomNumber(3000, 5000);
    const driftX = getRandomNumber(-30, 30);
    const driftY = getRandomNumber(-50, -100);

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            particle.remove();
            return;
        }

        // Fade in, then fade out
        const opacity = progress < 0.3
            ? easing.easeOutCubic(progress / 0.3) * 0.6
            : 0.6 * (1 - easing.easeInOutCubic((progress - 0.3) / 0.7));

        const currentX = driftX * easing.easeOutCubic(progress);
        const currentY = driftY * easing.easeOutCubic(progress);

        particle.style.transform = `translate(${currentX}px, ${currentY}px)`;
        particle.style.opacity = opacity;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

/**
 * Mouse Sparkle Trail Effect
 * Creates magical sparkles that follow the cursor
 */
function initMouseSparkles() {
    let lastSparkleTime = 0;
    const sparkleInterval = 50; // Minimum ms between sparkles
    let lastMouseX = 0;
    let lastMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate mouse velocity for adaptive sparkle intensity
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const velocity = Math.sqrt(dx * dx + dy * dy);

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        // Only create sparkles if mouse is moving and enough time has passed
        if (velocity > 3 && now - lastSparkleTime > sparkleInterval) {
            lastSparkleTime = now;

            // Create 1-3 sparkles based on velocity
            const sparkleCount = Math.min(3, Math.floor(velocity / 10) + 1);
            for (let i = 0; i < sparkleCount; i++) {
                setTimeout(() => {
                    createMouseSparkle(mouseX, mouseY);
                }, i * 15);
            }
        }
    });
}

/**
 * Create a single sparkle particle at the cursor position
 */
function createMouseSparkle(x, y) {
    const sparkle = document.createElement('div');
    const size = getRandomNumber(4, 10);
    const sparkleColors = ['#FFD700', '#A855F7', '#FBBF24', '#E879F9', '#F59E0B', '#C084FC', '#FFFFFF'];
    const color = getRandomItem(sparkleColors);

    // Random offset from cursor position
    const offsetX = getRandomNumber(-15, 15);
    const offsetY = getRandomNumber(-15, 15);

    sparkle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, #FFFFFF, ${color});
        border-radius: 50%;
        left: ${x + offsetX}px;
        top: ${y + offsetY}px;
        pointer-events: none;
        box-shadow: 0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}88;
        z-index: 9999;
        will-change: transform, opacity;
    `;

    document.body.appendChild(sparkle);

    // Animate sparkle with physics
    const angle = getRandomNumber(0, 360);
    const velocity = getRandomNumber(20, 60);
    const vx = Math.cos(angle * Math.PI / 180) * velocity;
    const vy = Math.sin(angle * Math.PI / 180) * velocity - 30; // Slight upward bias
    const rotationSpeed = getRandomNumber(-180, 180);

    let startTime = null;
    const duration = getRandomNumber(600, 1000);

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            sparkle.remove();
            return;
        }

        // Smooth deceleration
        const easedProgress = easing.easeOutCubic(progress);

        // Position with gravity effect
        const currentX = vx * easedProgress;
        const currentY = vy * easedProgress + (progress * progress * 40); // Gravity

        // Fade out and shrink
        const opacity = 1 - easing.easeInOutCubic(progress);
        const scale = 1 - progress * 0.5;

        // Rotation
        const rotation = rotationSpeed * progress;

        sparkle.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale}) rotate(${rotation}deg)`;
        sparkle.style.opacity = opacity;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

/**
 * Spotlight Effect
 * Creates a glowing spotlight that follows the mouse cursor
 */
function initSpotlightEffect() {
    // Create spotlight element
    const spotlight = document.createElement('div');
    spotlight.id = 'cursor-spotlight';
    spotlight.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(
            circle at center,
            rgba(168, 85, 247, 0.15) 0%,
            rgba(168, 85, 247, 0.08) 25%,
            rgba(139, 92, 246, 0.04) 50%,
            transparent 70%
        );
        pointer-events: none;
        z-index: 1;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease-out;
        will-change: transform, left, top;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);

    // Create inner glow for more intensity
    const innerGlow = document.createElement('div');
    innerGlow.style.cssText = `
        position: fixed;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(
            circle at center,
            rgba(251, 191, 36, 0.12) 0%,
            rgba(245, 158, 11, 0.06) 40%,
            transparent 70%
        );
        pointer-events: none;
        z-index: 2;
        transform: translate(-50%, -50%);
        will-change: transform, left, top;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(innerGlow);

    // Smooth spotlight follow with lerp
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    const smoothness = 0.15; // Lower = smoother/slower follow

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    // Animation loop for smooth following
    function updateSpotlight() {
        // Lerp towards target position
        currentX += (targetX - currentX) * smoothness;
        currentY += (targetY - currentY) * smoothness;

        spotlight.style.left = `${currentX}px`;
        spotlight.style.top = `${currentY}px`;

        innerGlow.style.left = `${currentX}px`;
        innerGlow.style.top = `${currentY}px`;

        requestAnimationFrame(updateSpotlight);
    }

    updateSpotlight();

    // Hide spotlight when mouse leaves window
    document.addEventListener('mouseleave', () => {
        spotlight.style.opacity = '0';
        innerGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        spotlight.style.opacity = '1';
        innerGlow.style.opacity = '1';
    });
}

/**
 * Initialize all interactions
 */
function initEnhanced() {
    init();
    initMouseSparkles();
    initSpotlightEffect();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhanced);
} else {
    initEnhanced();
}
