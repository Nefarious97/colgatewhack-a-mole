document.addEventListener('DOMContentLoaded', () => {
  // ===== Game elements =====
  const holes = [...document.querySelectorAll('.hole')];
  const stars = document.querySelectorAll('.star');
  const hammer = document.querySelector('.productHammer');
  const mainText = document.querySelector('.main-text');
  const subText = document.querySelector('.sub-text');
  const bumperImg = document.querySelector('.bumper-img');
  const playBtn = document.querySelector('.playBtnImg');

  let gameState = 0;
  let score = 0;

  // Confetti canvas
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const data = [
    { src: 'images/tooth.png', className: 'class0' },
    { src: 'images/tooth.png', className: 'class1' },
    { src: 'images/tooth.png', className: 'class2' },
    { src: 'images/dirty tooth.png', className: 'class3' },
  ];

  const good = 'good';
  const bad = 'bad';
  const append = 'append';
  const imgElements = {};

  holes.forEach(hole => hole.addEventListener('click', () => holeAnim(hole)));

  function starsys() {
    for (let i = 0; i < stars.length; i++) {
      const starID = document.getElementById(`star${i}`);
      if (score > i) appendStar(starID, good, i);
      else appendStar(starID, bad, i);
    }
  }

  function appendStar(starID, type, index) {
    if (type === good) {
      if (!imgElements[index]) {
        const img = document.createElement('img');
        img.src = 'images/white star.png';
        img.className = 'starmain';
        imgElements[index] = img;
        starID.appendChild(img);
        starAnim(img, starID);
      }
    } else {
      if (imgElements[index]) {
        starID.removeChild(imgElements[index]);
        createBadStar(starID, append);
        delete imgElements[index];
      }
    }
  }

  function starAnim(img, starID) {
    const starPlaceHolder = starID.querySelector('.starplaceholder');
    gsap.timeline()
      .to(starPlaceHolder, { scale: 2, duration: 0.3 })
      .to(starPlaceHolder, { scale: 0, duration: 0.2 })
      .to(img, { opacity: 1, scale: 2.5, duration: 0.2, ease: "power1.inOut" })
      .to(img, { scale: 1, opacity: 1, duration: 0.5, ease: "bounce.out" });
  }

  function createBadStar(starID, type) {
    const img = document.createElement('img');
    const img2 = document.createElement('img');
    img.src = 'images/broken star one.png';
    img2.src = 'images/broken star 2.png';
    img.className = 'brokenstar1 brokenstar';
    img2.className = 'brokenstar2 brokenstar';

    if (type === append) {
      starID.appendChild(img);
      starID.appendChild(img2);
      brokenStarAnim(img, img2, starID);
    }
  }

  function brokenStarAnim(b1, b2, starID) {
    gsap.timeline()
      .to([b1, b2], { opacity: 1, scale: 2, duration: 0.35 }, 0)
      .to(b1, { x: -30, y: -10, rotation: -15, duration: 0.25, ease: "power2.out" }, 0.05)
      .to(b2, { x: 30, y: -10, rotation: 15, duration: 0.25, ease: "power2.out" }, 0.05)
      .to([b1, b2], {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        onComplete: () => {
          if (starID.contains(b1)) starID.removeChild(b1);
          if (starID.contains(b2)) starID.removeChild(b2);
        }
      }, 0.35);
  }

  function updateScore(newScore) {
    score = newScore;
    starsys();
  }

  function appendProduct() {
    if (gameState !== 0) return;

    const i = Math.floor(Math.random() * holes.length);
    const holeID = document.getElementById(`hole${i}`);
    const product = createRandomProduct();

    if (!holeID) return;
    holeID.append(product);
    animateProduct(product, holeID);
  }

  function createRandomProduct() {
    const item = data[Math.floor(Math.random() * data.length)];

    const div = document.createElement('div');
    const container = document.createElement('div');
    const containerInner = document.createElement('div');
    const img = document.createElement('img');
    const div2 = document.createElement('div');

    container.className = 'container-prod';
    containerInner.className = 'container-inner';

    img.src = item.src;
    img.className = 'img';
    div2.className = 'circle';

    containerInner.appendChild(div2);
    containerInner.appendChild(img);

    div.appendChild(container);
    container.appendChild(containerInner);

    div.className = `product ${item.className}`;
    return div;
  }

  function animateProduct(product, holeID) {
    const img = product.querySelector('img.img');

    let y = 120;
    if (product.classList.contains('class1')) y = 90;

    const tl = gsap.timeline();
    tl.to(img, { y: -y, duration: 0.2, ease: "power1.out", rotation: 0 })
      .to({}, { duration: 0.5 })
      .to(img, { y: y, duration: 1, ease: "power1.out", rotation: -15 })
      .eventCallback("onComplete", () => {
        if (gameState === 0) {
          if (holeID.contains(product)) holeID.removeChild(product);
          appendProduct();
        }
      });

    holeAnim(holeID);

    product.addEventListener('click', () => {
      tl.kill();
      winningHit(product, holeID);
    });
  }

  function winningHit(product, holeID) {
    const img = product.querySelector('.img');
    if (gameState !== 0) return;

    // bad tooth
    if (product.classList.contains('class3')) {
      if (score > 0) score -= 1;
      updateScore(score);
      animRemoveProd(holeID, product, img);
      return;
    }

    // good tooth
    score += 1;
    updateScore(score);
    winningAnim(product, holeID);

    if (score === 4) {
      setTimeout(() => {
        const revP = document.querySelector('.revP');
        revP.style.display = 'block';

        gsap.to(revP, {
          opacity: 1,
          duration: 0.5,
          onComplete: function () {
            animProd();
            animateColgateLogo();
          }
        });
      }, 3000);

      lauchFireWorks();
    }
  }

  function animRemoveProd(hole, product, img) {
    gsap.timeline()
      .to(img, { y: -130, duration: 0.1 })
      .to(img, {
        y: 0, duration: 0.1,
        onComplete: function () {
          if (hole.contains(product)) hole.removeChild(product);
          appendProduct();
        }
      });
  }

  function holeAnim(hole) {
    if (gameState !== 0) return;
    gsap.timeline()
      .to(hole, { scale: 1.2, duration: 0.1, ease: "power1.out" })
      .to(hole, { scale: 1, duration: 0.1, ease: "power1.out" });
  }

  function mainBumperAnim() {
    const bumpershadow = document.querySelector('.bumper-img-shadow');
    gsap.timeline({ repeat: -1, repeatDelay: 3 })
      .fromTo(subText, { scale: 1 }, { scale: 1.2, duration: .8, ease: "power1.inOut", yoyo: true, repeat: -1 }, 0)
      .fromTo(bumperImg, { scale: 1 }, { scale: 1.2, duration: .8, ease: "power1.inOut", yoyo: true, repeat: -1 }, 0.2)
      .fromTo(bumpershadow, { scale: .8, opacity: 1 }, { scale: 1.2, duration: .8, ease: "power1.inOut", yoyo: true, repeat: -1, opacity: .3 }, 0.2)
      .fromTo(mainText, { scale: 1 }, { scale: 1.2, duration: .8, ease: "power1.inOut", yoyo: true, repeat: -1 }, 0.4);
  }

  function winningAnim(product, holeID) {
    let targetX, targetY, x, y;
    const img = product.querySelector('.img');
    gameState = 1;

    if (holeID.id === 'hole0') { x = 160; y = 300; targetX = 106; targetY = 380; }
    if (holeID.id === 'hole1') { x = 270; y = 300; targetX = 206; targetY = 380; }
    if (holeID.id === 'hole2') { x = 160; y = 390; targetX = 106; targetY = 480; }
    if (holeID.id === 'hole3') { x = 270; y = 390; targetX = 206; targetY = 480; }

    gsap.timeline()
      .to(img, { rotation: 0, y: -120, duration: 0.1 })
      .to(hammer, { x, y, scale: 1.5, opacity: 1, duration: 0.4, ease: "power1.out" })
      .to(hammer, { rotation: 30, duration: 0.2, ease: "power1.out", transformOrigin: "50% 90%" })
      .to(hammer, { rotation: -60, duration: 0.2, ease: "power1.out", transformOrigin: "50% 90%" })
      .call(() => { for (let i = 0; i < 3; i++) launchConfetti(targetX, targetY); })
      .to(hammer, { scale: 0, duration: 0.2, opacity: 0, ease: "power1.out" })
      .to(img, { rotation: 15, duration: 0.1, ease: "power1.inOut", repeat: 5, yoyo: true }, "-=0.25")
      .to(img, {
        duration: 0.5,
        rotation: 0,
        ease: 'elastic.out(1, 0.6)',
        onComplete: function () {
          gameState = 0;
          animRemoveProd(holeID, product, img);
        }
      });
  }

  function playBtntAnim() {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(playBtn, { duration: 0.5, scale: 1.3, ease: "power1.inOut", repeat: 1, yoyo: true });

    playBtn.addEventListener('click', () => {
      tl.kill();
      showInstructions();
    });
  }

  function showInstructions() {
    const goodTooth = document.querySelector('.goodTooth');
    const goodTooth2 = document.querySelector('.goodTooth2');
    const goodIcon = document.querySelector('.goodIcon');
    const goodTxt = document.querySelector('.goodTxt');

    const badTooth = document.querySelector('.badTooth');
    const BadIcon = document.querySelector('.BadIcon');
    const BadTxt = document.querySelector('.BadTxt');

    const blurOverlay = document.querySelector('.blurOverlay');
    const rulesText = document.querySelector('.rulesImg');

    gsap.timeline()
      .to(playBtn, { scale: 1.7, duration: 0.2, ease: "power1.inOut" }, 0)
      .to(playBtn, { scale: 0, duration: 0.2, ease: "power1.inOut" }, 0.2)
      .fromTo(rulesText, { scale: 0 }, { scale: 1.3, opacity: 1, duration: 0.5, ease: "power1.inOut" }, 0.6)
      .to(rulesText, { scale: 1, duration: 1.2, ease: "elastic.out(1, 0.6)" }, 1)
      .fromTo(goodTooth, { scale: 0, rotation: -15 }, { scale: 1.3, opacity: 1, duration: 0.5, ease: "power1.inOut", rotation: -15 }, 0.6)
      .to(goodTooth, { scale: 1, duration: 1.2, ease: "elastic.out(1, 0.6)", rotation: -15 }, 1)
      .fromTo(goodTooth2, { scale: 0, rotation: 15 }, { scale: 1.3, opacity: 1, duration: 0.4, ease: "power1.inOut", rotation: 15 }, 0.6)
      .to(goodTooth2, { scale: 1, duration: 1.1, ease: "elastic.out(1, 0.6)", rotation: 15 }, 1)
      .fromTo(goodIcon, { scale: 0.5, opacity: 0, rotation: -45 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 0.6)
      .fromTo(goodTxt, { scale: 0.5, opacity: 0, rotation: -45 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 0.6)
      .fromTo(badTooth, { scale: 0 }, { scale: 1.3, opacity: 1, duration: 0.4, ease: "power1.inOut" }, 0.6)
      .to(badTooth, { scale: 1, duration: 1.0, ease: "elastic.out(1, 0.6)" }, 1)
      .fromTo(BadIcon, { scale: 0.5, opacity: 0, rotation: -45 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 0.6)
      .fromTo(BadTxt, { scale: 0.5, opacity: 0, rotation: -45 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 0.6)
      .to([rulesText, goodTooth, goodTooth2, goodIcon, goodTxt, badTooth, BadIcon, BadTxt, blurOverlay], {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          [rulesText, goodTooth, goodTooth2, goodIcon, goodTxt, badTooth, BadIcon, BadTxt, blurOverlay].forEach(el => {
            if (el) el.style.display = 'none';
          });
        }
      }, "+=.1");
  }

  // ===== Confetti =====
  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

  function launchConfetti(targetX, targetY) {
    const originX = targetX / canvas.width;
    const originY = targetY / canvas.height;

    myConfetti({
      ticks: 200,
      gravity: 0.2,
      decay: 0.96,
      startVelocity: 5,
      particleCount: 100,
      spread: 360,
      scalar: Math.random() * 0.5 + 0.3,
      origin: { x: originX, y: originY },
      image: { source: 'images/omega-test2.png', options: {} }
    });
  }

  function lauchFireWorks() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  // ===== Colgate logo animation =====
  function animateColgateLogo() {
    const logo = document.querySelector('.colgateLogo');
    if (!logo) return;

    gsap.fromTo(logo,
      { opacity: 0, y: 18, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" }
    );

    gsap.to(logo, {
      scale: 1.06,
      duration: 0.4,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut",
      delay: 0.65
    });
  }

  // ===== PAGE 2 Carousel =====
  const carousel = document.querySelector(".carousel");
  const items = document.querySelectorAll(".item");
  let currdeg = 0;
  let startX, currentX, isDragging = false;
  const rotationAmount = 120;
  const itemCount = items.length;
  const sensitivity = 0.5;

  let revState = 0;
  let revTl = gsap.timeline({});

  if (carousel) {
    carousel.addEventListener("touchstart", handleTouchStart, false);
    carousel.addEventListener("touchmove", handleTouchMove, false);
    carousel.addEventListener("touchend", handleTouchEnd, false);
    carousel.addEventListener("mousedown", handleMouseDown);
    carousel.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleTouchStart(e) {
    isDragging = true;
    revState = 1;
    updateRev();
    startX = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    if (!isDragging || revState !== 1) return;
    currentX = e.touches[0].clientX;
    const deltaX = (currentX - startX) * sensitivity;

    gsap.to(carousel, { y: 0, rotationY: currdeg + deltaX, ease: "sine.inOut" });
    items.forEach(item => gsap.to(item, { y: 0, rotationY: -(currdeg + deltaX), ease: "sine.inOut" }));
  }

  function handleTouchEnd() {
    isDragging = false;
    const finalRotation = Math.round((currdeg + ((currentX - startX) * sensitivity)) / rotationAmount) * rotationAmount;
    rotateCarousel(finalRotation - currdeg);
  }

  function handleMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    revState = 1;
    updateRev();
    startX = e.clientX;
  }

  function handleMouseMove(e) {
    e.preventDefault();
    if (!isDragging || revState !== 1) return;

    currentX = e.clientX;
    const deltaX = (currentX - startX);

    gsap.to(carousel, { y: 0, rotationY: currdeg + deltaX, ease: "sine.inOut" });
    items.forEach(item => gsap.to(item, { y: 0, rotationY: -(currdeg + deltaX), ease: "sine.inOut" }));

    items.forEach(item => item.classList.add('grabbing'));
  }

  function handleMouseUp() {
    if (!isDragging) return;

    const finalRotation = Math.round((currdeg + ((currentX - startX))) / rotationAmount) * rotationAmount;
    isDragging = false;

    items.forEach(item => item.classList.remove('grabbing'));
    rotateCarousel(finalRotation - currdeg);

    revState = 0;
    setTimeout(() => updateRev(), 1000);
  }

  function rotateCarousel(degree) {
    currdeg += degree;
    gsap.to(carousel, { y: 0, rotationY: currdeg, duration: 1.5, ease: "elastic.out(1, 0.6)" });
    items.forEach(item => gsap.to(item, { y: 0, rotationY: -currdeg, duration: 1.5, ease: "elastic.out(1, 0.6)" }));
    updateCarouselStyles();
  }

  function updateCarouselStyles() {
    items.forEach(item => item.classList.remove('center-item', 'back-item'));

    let minDistance = Infinity;
    let centerIndex = 0;

    items.forEach((item, index) => {
      let itemDeg = (currdeg % 360) + (index * rotationAmount);
      if (itemDeg < 0) itemDeg += 360;

      let distance = Math.abs(itemDeg % 360);
      if (distance > 180) distance = 360 - distance;

      if (distance < minDistance) {
        minDistance = distance;
        centerIndex = index;
      }
    });

    if (items[centerIndex]) items[centerIndex].classList.add('center-item');

    for (let i = 1; i <= 2; i++) {
      const backItemIndex = (centerIndex + i) % itemCount;
      if (items[backItemIndex]) items[backItemIndex].classList.add('back-item');
    }
  }

  function updateRev() {
    revTl.clear();

    if (revState === 0) {
      items.forEach((item, index) => {
        const delay = index * 0.5;
        revTl.fromTo(item, { y: "0" }, {
          y: "20",
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay
        }, 0);
      });
    } else if (revState === 1) {
      revTl.pause();
    }
  }

  function animProd() {
    revState = 0;

    items.forEach((item, index) => {
      const delay = index * 0.1;
      const tl = gsap.timeline({ delay });

      tl.fromTo(item,
        { y: 700, scale: 0.5, rotation: 15, opacity: 1 },
        { y: -180, scale: 1.2, rotation: 0, duration: 0.5, ease: "power2.out" }
      )
      .to(item, { y: 120, scale: 0.9, duration: 0.3, ease: "power2.inOut" })
      .to(item, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: function () {
          setTimeout(() => updateRev(), 1000);
        }
      });
    });
  }

  // CTA pulse
  gsap.to(".learn-more-rev", { scale: 1.2, duration: 0.5, yoyo: true, repeat: -1, ease: "power1.inOut" });

  // Start
  appendProduct();
  playBtntAnim();
  mainBumperAnim();
  updateCarouselStyles();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') gsap.globalTimeline.resume();
    else gsap.globalTimeline.pause();
  });
});
