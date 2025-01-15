// Preload Text Animation
window.onload = function() {
    setTimeout(function() {
        document.getElementById('preload').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('preload').style.display = 'none';
        }, 1000);
    }, 2000); // Wait 2 seconds before disappearing the preload
};

// Teks Ketik Welcome Animation
const welcomeText = document.getElementById('welcome-text');
const text = "Welcome to Alfikyy Shop";

let i = 0;
let typingInterval = setInterval(function() {
    if (i < text.length) {
        welcomeText.innerHTML += text.charAt(i);
        i++;
    } else {
        clearInterval(typingInterval);
    }
}, 100);

// GSAP Scroll Animation
gsap.from(".hero-content h1", {
    opacity: 0,
    y: -100,
    duration: 1,
    ease: "power4.out"
});

gsap.from(".hero-content p", {
    opacity: 0,
    y: 50,
    delay: 0.5,
    duration: 1,
    ease: "power4.out"
});

gsap.from(".btn", {
    opacity: 0,
    scale: 0.8,
    delay: 1,
    duration: 1,
    ease: "bounce.out"
});

// ScrollMagic for Fade-in Effect on Scroll
const controller = new ScrollMagic.Controller();

new ScrollMagic.Scene({
    triggerElement: "#products",
    triggerHook: 0.8
})
.setClassToggle("#products", "fade-in") // Add fade-in class when section comes into view
.addTo(controller);

// GSAP Scroll Animation for Product Cards
gsap.from(".card", {
    opacity: 0,
    y: 50,
    stagger: 0.3,
    duration: 1,
    ease: "power3.out"
});
