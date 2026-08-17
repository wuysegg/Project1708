document.addEventListener("DOMContentLoaded", () => {
    // === PHẦN ÂM THANH ===
    const sfxGenshin = document.getElementById("sfx-genshin");
    const bgm = document.getElementById("bgm");
    const sfxType = document.getElementById("sfx-type");
    const sfxPassWrong = document.getElementById("sfx-pass-wrong");
    const sfxPassRight = document.getElementById("sfx-pass-right");
    const sfxCapWrong = document.getElementById("sfx-cap-wrong");
    const sfxCapRight = document.getElementById("sfx-cap-right");

    // HÀM ĐẶC BIỆT: Phát âm thanh từ giây start đến giây end
    function playAudioSegment(audioElement, start, end, volume = 1.0) {
        audioElement.pause();
        // Xóa sự kiện cũ nếu có để tránh đụng độ
        if (audioElement._timeupdateHandler) {
            audioElement.removeEventListener('timeupdate', audioElement._timeupdateHandler);
        }
        
        audioElement.currentTime = start;
        audioElement.volume = volume;
        audioElement.play().catch(e => console.log("Audio play blocked", e));
        
        if (end) {
            audioElement._timeupdateHandler = () => {
                if (audioElement.currentTime >= end) {
                    audioElement.pause();
                    audioElement.removeEventListener('timeupdate', audioElement._timeupdateHandler);
                }
            };
            audioElement.addEventListener('timeupdate', audioElement._timeupdateHandler);
        }

    }
    // === TẠO TRÁI TIM BAY (FLOATING HEARTS) ===
    function createFloatingHearts() {
        const container = document.createElement('div');
        container.className = 'floating-hearts-container';
        document.getElementById('welcome-screen').appendChild(container);

        const numHearts = 18; // Số lượng trái tim
        for (let i = 0; i < numHearts; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            
            // Random kích thước, thời gian bay, vị trí và độ lắc
            const leftPos = Math.random() * 100; // 0% đến 100%
            const baseSize = 15; 
            const scale = Math.random() * 0.8 + 0.5; // Scale từ 0.5 đến 1.3
            const duration = Math.random() * 6 + 6; // Bay từ 6s đến 12s
            const delay = Math.random() * 5; // Độ trễ xuất hiện
            const drift = (Math.random() - 0.5) * 80; // Lắc lư sang trái/phải
            
            heart.style.left = `${leftPos}%`;
            heart.style.width = `${baseSize}px`;
            heart.style.height = `${baseSize}px`;
            heart.style.setProperty('--scale', scale);
            heart.style.setProperty('--duration', `${duration}s`);
            heart.style.setProperty('--drift', `${drift}px`);
            heart.style.animationDelay = `${delay}s`;

            container.appendChild(heart);
        }
    }
    // === MÀN HÌNH CHÀO TÍNH THỜI GIAN ===
    const startupOverlay = document.getElementById("startup-overlay");
    const startBtn = document.getElementById("start-btn");
    const timeCounter = document.getElementById("time-counter");

    startBtn.addEventListener("click", () => {
        startBtn.style.display = "none";
        timeCounter.style.display = "block";
        
        // Tính ngày từ 19h02 30/05/2026
        const startDate = new Date("2026-05-30T19:02:00");
        const now = new Date();
        const diff = Math.max(0, now - startDate); 
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        
        timeCounter.textContent = `${days} ngày, ${hours} giờ, ${mins} phút, ${secs} giây`;

        // Khoảng 2s màn hình trắng xóa -> Hiện pass + SFX Genshin (đoạn 1s - 2s)
        setTimeout(() => {
            playAudioSegment(sfxGenshin, 1.0, 2.0, 1.0);
            
            gsap.to(startupOverlay, {
                opacity: 0, 
                duration: 1.5, 
                onComplete: () => {
                    startupOverlay.style.display = "none";
                    // Phát nhạc Purple Lofi âm lượng nho nhỏ
                    bgm.volume = 0.2; 
                    bgm.play().catch(e => console.log(e));
                    createFloatingHearts();
                }
            });
        }, 2000);
    });

    // === CÁC BIẾN CHÍNH ===
    const passInput = document.getElementById("pass-input");
    const numButtons = document.querySelectorAll(".num-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const enterBtn = document.getElementById("enter-btn");
    const catImg = document.getElementById("cat");
    
    const welcomeScreen = document.getElementById("welcome-screen");
    const catDialogue = document.getElementById("cat-dialogue");
    const catWrapper = document.querySelector(".cat-wrapper");

    const captchaOverlay = document.getElementById("captcha-overlay");
    const captchaDialogue = document.getElementById("captcha-dialogue");
    const captchaOptions = document.getElementById("captcha-options");

    const CORRECT_PASSWORD = "30052026"; 
    let realPassword = ""; 
    let wrongCount = 0;       
    let isLocked = false;     

    const CAT_NORMAL = "assets/meo.png";       
    const CAT_ANGRY  = "assets/meo_angry.png"; 
    const CAT_SHOCK  = "assets/meo_shock.png"; 

    // === ANIMATION NẢY ĐỒNG BỘ VỚI KHUNG LÚN ===
    let bounceTimeline = null; 

    function setCatBounceLevel(level) {
        if (bounceTimeline) {
            bounceTimeline.kill();
            gsap.set(".cat-wrapper", { y: 0 }); 
            gsap.set(".cat-image", { scaleY: 1, scaleX: 1 }); 
            gsap.set("#pass-input", { y: 0, scaleY: 1 }); 
        }
        if (level === 0) return;

        let jumpY = -15, speed = 0.45, scaleYVal = 1.05;
        if (level === 2) { jumpY = -30; speed = 0.3; scaleYVal = 1.15; } 
        else if (level === 3) { jumpY = -45; speed = 0.18; scaleYVal = 1.25; }

        bounceTimeline = gsap.timeline({ repeat: -1 });

        bounceTimeline.to(".cat-wrapper", { y: jumpY, duration: speed, ease: "sine.out" }, 0)
                      .to(".cat-image", { scaleY: scaleYVal, scaleX: 2 - scaleYVal, duration: speed, ease: "sine.out" }, 0)
                      .to("#pass-input", { y: 0, scaleY: 1, duration: speed, ease: "sine.out" }, 0);

        bounceTimeline.to(".cat-wrapper", { y: 0, duration: speed, ease: "sine.in" }, speed)
                      .to(".cat-image", { scaleY: 1, scaleX: 1, duration: speed, ease: "sine.in" }, speed)
                      .to("#pass-input", { y: 2, scaleY: 0.92, duration: speed, ease: "sine.in" }, speed);
    }
    setCatBounceLevel(1);

    // === HÀM CHẠY CHỮ UNDERTALE ===
    const dialogues = ["dd/mm/yyyy", "một ngày đặc biệt", "...", "Hòa An"];
    let currentDialogueIndex = 0;
    let isTyping = false;

    // === EASTER EGG: BẤM VÀO MÈO 5 LẦN LIÊN TỤC ===
    let catClickCount = 0;
    let catClickTimer = null;

    catWrapper.addEventListener("click", () => {
        if (isTyping || isLocked) return;

        // Đếm số lần bấm liên tục trong vòng 2 giây
        catClickCount++;
        clearTimeout(catClickTimer);
        
        catClickTimer = setTimeout(() => {
            catClickCount = 0; // Reset nếu bấm chậm
        }, 2000);

        // Nếu bấm đủ 5 lần liên tục -> Kích hoạt bí mật!
        if (catClickCount === 5) {
            catClickCount = 0;
            catImg.src = CAT_SHOCK; // Mèo đổi mặt sốc/bất ngờ
            setCatBounceLevel(3);   // Mèo nhảy cẫng lên hào hứng
            
            showDialogueText("Bị phát hiện rồi à? Thôi được rồi...", () => {
                setTimeout(() => {
                    showDialogueText("Mật mã trái tim anh chỉ có một: Yêu Hân nhất trần đời! 🤍", () => {
                        setTimeout(() => {
                            catImg.src = CAT_NORMAL;
                            setCatBounceLevel(1);
                        }, 3000);
                    }, catDialogue);
                }, 1500);
            }, catDialogue);
            return;
        }

        // Hành vi mặc định cũ (chạy qua các câu thoại bình thường)
        showDialogueText(dialogues[currentDialogueIndex], () => {
            currentDialogueIndex = (currentDialogueIndex + 1) % dialogues.length;
        });
    });

    function showDialogueText(text, onComplete, element = catDialogue) {
        element.style.visibility = "visible";
        element.style.opacity = "1";
        typeWriterEffect(element, text, onComplete);
    }

    function typeWriterEffect(element, text, onComplete) {
        isTyping = true;
        element.textContent = "";
        let charIndex = 0;
        
        const typingInterval = setInterval(() => {
            element.textContent += text[charIndex];
            
            // SFX gõ chữ lạch cạch
            if(text[charIndex] !== " ") {
                sfxType.currentTime = 0;
                sfxType.play().catch(e => {}); 
            }
            
            charIndex++;
            if (charIndex >= text.length) {
                clearInterval(typingInterval);
                isTyping = false;
                if (onComplete) onComplete();
            }
        }, 50);
    }

    // === NHẬP MẬT KHẨU LÊN BÀN PHÍM SỐ ===
    numButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (isLocked) return;
            const value = button.textContent;
            if (value !== "⌫" && value !== "↵") {
                realPassword += value;
                passInput.value = "*".repeat(realPassword.length);
            }
        });
    });

    deleteBtn.addEventListener("click", () => {
        if (isLocked) return;
        realPassword = realPassword.slice(0, -1);
        passInput.value = "*".repeat(realPassword.length);
    });

    enterBtn.addEventListener("click", () => {
        if (isLocked) return;
        if (realPassword === CORRECT_PASSWORD) {
            isLocked = true; catImg.src = CAT_NORMAL; setCatBounceLevel(1); 
            // SFX Nhập đúng Pass (Đoạn 4s - 5s)
            playAudioSegment(sfxPassRight, 4.0, 5.0);

            showDialogueText("làm tốt lắm", () => {
                setTimeout(() => showDialogueText("vui lòng xác minh không phải robot", () => setTimeout(startRobotVerification, 1200)), 800);
            });
        }else if (realPassword === "17082007") {
            catImg.src = CAT_NORMAL; setCatBounceLevel(1);
            showDialogueText("Đúng là sinh nhật em, nhưng pass là ngày khác cơ 😝", () => {
                setTimeout(() => showDialogueText("thử lại nha!"), 2500);
            });
            realPassword = ""; passInput.value = "";}
        else {
            // SFX Nhập sai Pass (Đoạn 1s - 2s)
            playAudioSegment(sfxPassWrong, 1.0, 2.0);
            wrongCount++;
            
            gsap.to(welcomeScreen, { x: -15, duration: 0.05, repeat: 7, yoyo: true, onComplete: () => gsap.set(welcomeScreen, { x: 0 }) });
            realPassword = ""; passInput.value = "";

            if (wrongCount >= 13) {
                catImg.src = CAT_SHOCK; setCatBounceLevel(0);
                showDialogueText("huhu", () => setTimeout(() => showDialogueText("anh giận em lun!", () => setTimeout(startLockoutTimer, 1000)), 800));
            } else if (wrongCount >= 10) {
                catImg.src = CAT_SHOCK; setCatBounceLevel(3); showDialogueText("*??#?@!*@?!#@?*!");
            } else if (wrongCount >= 5) {
                catImg.src = CAT_ANGRY; setCatBounceLevel(2); showDialogueText("sai mật khẩu", () => setTimeout(() => showDialogueText("DD/MM/YYYY"), 800),);
            } else {
                catImg.src = CAT_NORMAL; setCatBounceLevel(1); showDialogueText("sai mật khẩu", () => setTimeout(() => showDialogueText("Hòa An"), 800));
            }
        }
    });

    function startLockoutTimer() {
        isLocked = true; let secondsLeft = 10; setCatBounceLevel(0);
        catDialogue.textContent = `anh sẽ bùn trong vòng ${secondsLeft}s`;
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) catDialogue.textContent = `anh sẽ bùn trong vòng ${secondsLeft}s`;
            else {
                clearInterval(countdownInterval);
                catImg.src = CAT_NORMAL; setCatBounceLevel(1); wrongCount = 0; 
                catDialogue.textContent = "anh hết bùn ời"; isLocked = false;
            }
        }, 1000);
    }

    // === LOGIC CAPTCHA ===
    const questions = [
        { q: "vui lòng trả lời những câu hỏi sau để chứng minh khum phải là robot !", options: ["Bắt đầu ngay!", "Sẵn sàng"], correctIndex: 0 },
        { q: "Vấn đề đau đầu nhất của anh ở thời điểm hiện tại là gì?", options: ["Hôm nay ăn gì, mai ăn gì, ngày kia ăn gì?", "Làm sao để kiếm thật nhiều tiền mua trà sữa?", "Làm thế nào để bắt cóc em về chung một nhà mà công an không bắt?","Ngày mai học môn gì?"], correctIndex: 2 },
        { q: "Thức uống yêu thích của Hân là gì", options: ["Bạc xỉu", "Trà", "Sữa"], correctIndex: 0 },
        { q: "Hân không nên làm gì trong kì kinh nguyệt ?", options: ["Ăn cay", "Thức khuya", "Ghét Thảo", "TẤT CẢ CÁC ĐÁP ÁN TRÊN!"], correctIndex: 3 },
        { q: "Hôm nay là ngày gì?", options: ["Ngày bình thường", "Ngày rất đặc biệt"], correctIndex: 1 },
        { q: "em có yêu anh không", options: ["Có", "Không"], isFinal: true }
    ];

    let currentQuestionIndex = 0;
    let yesBtnScale = 1; let noBtnScale = 1;

    function startRobotVerification() {
        captchaOverlay.style.display = "flex";
        gsap.fromTo(".captcha-box", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" });
        loadQuestion(0);
    }

    function updateProgressBar(index, status) {
        const bar = document.getElementById(`prog-${index}`);
        if (!bar) return;
        bar.classList.remove("pink", "red", "black");
        if (status === "correct") bar.classList.add("black");
        else if (status === "wrong") bar.classList.add("red");
        else bar.classList.add("pink");
    }

    function loadQuestion(index) {
        captchaOptions.innerHTML = "";
        captchaOptions.classList.remove("row-layout");
        const qData = questions[index];

        typeWriterEffect(captchaDialogue, qData.q, () => {
            if (qData.isFinal) renderFinalQuestion(qData);
            else renderStandardQuestion(qData, index);
        });
    }

    function renderStandardQuestion(qData, qIndex) {
        qData.options.forEach((optText, optIdx) => {
            const btn = document.createElement("button");
            btn.classList.add("captcha-opt-btn"); btn.textContent = optText;
            btn.addEventListener("click", () => {
                if (optIdx === qData.correctIndex) {
                    // Chọn đúng Captcha (đoạn 1s - 2s)
                    playAudioSegment(sfxCapRight, 1.0, 2.0);
                    updateProgressBar(qIndex, "correct");
                    gsap.to("#captcha-cat-img", { scaleX: 1.25, scaleY: 0.75, duration: 0.15, yoyo: true, repeat: 1 });
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) setTimeout(() => loadQuestion(currentQuestionIndex), 300);
                } else {
                    // Chọn sai Captcha (đoạn 0s - 1s)
                    playAudioSegment(sfxCapWrong, 0.0, 1.0);
                    updateProgressBar(qIndex, "wrong");
                    gsap.to("body", { x: -12, y: 5, duration: 0.05, repeat: 7, yoyo: true, onComplete: () => gsap.set("body", {x: 0, y: 0}) });
                    gsap.to(".captcha-box", { x: 10, duration: 0.05, repeat: 7, yoyo: true });
                }
            });
            captchaOptions.appendChild(btn);
        });
    }

    function renderFinalQuestion(qData) {
        captchaOptions.classList.add("row-layout");

        const btnYes = document.createElement("button");
        btnYes.id = "btn-yes"; btnYes.classList.add("captcha-opt-btn"); btnYes.textContent = "Có";
        btnYes.style.transformOrigin = "left center"; btnYes.style.position = "relative"; btnYes.style.zIndex = "10"; 

        const btnNo = document.createElement("button");
        btnNo.id = "btn-no"; btnNo.classList.add("captcha-opt-btn"); btnNo.textContent = "Không";
        btnNo.style.position = "relative"; btnNo.style.zIndex = "1";

        btnYes.addEventListener("click", () => {
            // Đúng câu chốt
            playAudioSegment(sfxCapRight, 1.0, 2.0);
            updateProgressBar(4, "correct");
            btnYes.disabled = true;

            gsap.to(btnYes, {
                opacity: 0, duration: 0.1, repeat: 5, yoyo: true,     
                onComplete: () => {
                    gsap.set(btnYes, { opacity: 1 }); 
                    gsap.to(bgm, { volume: 0, duration: 1.5 }); // Mờ dần nhạc Lofi
                    
                    gsap.to(captchaOverlay, {
                        opacity: 0, duration: 0.5,
                        onComplete: () => {
                            captchaOverlay.style.display = "none";
                            
                            // KIỂM TRA ĐÚNG NGÀY 17/08
                            const today = new Date();
                            // Lưu ý: Trong JS, tháng bắt đầu từ 0 (tháng 8 là index 7)
                            if (today.getDate() === 17 && today.getMonth() === 7) { 
                                showDialogueText("chúc mừng sinh nhật em yêu", () => {
                                    setTimeout(triggerWhiteoutAndRedirect, 1500);
                                }, catDialogue);
                            } else {
                                triggerWhiteoutAndRedirect();
                            }
                        }
                    });
                }
            });
        });

        let currentPushX = 0; 
        btnNo.addEventListener("click", () => {
            yesBtnScale += 0.4; btnYes.style.transform = `scale(${yesBtnScale})`;
            noBtnScale = Math.max(0.1, noBtnScale - 0.15);
            currentPushX += 65; 
            gsap.to(btnNo, { x: currentPushX, y: (Math.random() - 0.5) * 30, scale: noBtnScale, duration: 0.25, ease: "power2.out" });
        });

        captchaOptions.appendChild(btnYes); captchaOptions.appendChild(btnNo);
    }

    // === CHUYỂN CẢNH FADE OUT SANG NỀN ĐEN ===
    function triggerWhiteoutAndRedirect() {
        const fadeTransition = document.getElementById("fade-transition");
        fadeTransition.style.display = "block";
        
        // Từ từ làm đen toàn bộ màn hình
        gsap.to(fadeTransition, {
            opacity: 1, 
            duration: 1.5,
            ease: "power1.inOut",
            onComplete: () => {
                window.location.href = "gift.html";
            }
        });
    }
    // === HIỆU ỨNG TRÁI TIM NẢY LÊN KHI CLICK CHUỘT ===
    document.addEventListener('click', function(e) {
        const clickHeart = document.createElement('div');
        clickHeart.classList.add('click-heart');
    
        // Lấy tọa độ click chuột
        clickHeart.style.left = e.pageX + 'px';
        clickHeart.style.top = e.pageY + 'px';
    
        document.body.appendChild(clickHeart);
    
        // Tự động xóa trái tim sau 800ms để không làm nặng trình duyệt
        setTimeout(() => {
            clickHeart.remove();
        }, 800);
    });
});