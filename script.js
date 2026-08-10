document.addEventListener("DOMContentLoaded", () => {
    // ------------------------------------
    // 1. KHAI BÁO BIẾN & PHẦN TỬ HTML
    // ------------------------------------
    const passInput = document.getElementById("pass-input");
    const numButtons = document.querySelectorAll(".num-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const enterBtn = document.getElementById("enter-btn");
    const catImg = document.getElementById("cat");
    
    const welcomeScreen = document.getElementById("welcome-screen");
    const mainGift = document.getElementById("main-gift");
    const finalScreen = document.getElementById("final-screen");


    const petalContainer = document.getElementById("petal-container");

    // Các phần tử Captcha
    const captchaOverlay = document.getElementById("captcha-overlay");
    const captchaDialogue = document.getElementById("captcha-dialogue");
    const captchaOptions = document.getElementById("captcha-options");

    const CORRECT_PASSWORD = "30052026"; 
    let realPassword = ""; 

    let wrongCount = 0;       
    let isLocked = false;     

    const CAT_NORMAL = "/assets/meo.png";       
    const CAT_ANGRY  = "/assets/meo_angry.png"; 
    const CAT_SHOCK  = "/assets/meo_shock.png"; 

    let catJumpTween = null;

    // ------------------------------------
    // 2. MÀN HÌNH CHÀO & HIỆU ỨNG MÈO
    // ------------------------------------
    

    function setCatBounceLevel(level) {
        if (catJumpTween) {
            catJumpTween.kill();
            gsap.set(".cat-wrapper", { y: 0, scaleY: 1, scaleX: 1 }); 
        }

        if (level === 0) return;

        let jumpY = -15;
        let speed = 0.45;
        let scaleYVal = 1.05;

        if (level === 2) {
            jumpY = -30;       
            speed = 0.3;       
            scaleYVal = 1.15;
        } else if (level === 3) {
            jumpY = -45;       
            speed = 0.18;      
            scaleYVal = 1.25;
        }

        catJumpTween = gsap.to(".cat-wrapper", {
            y: jumpY,
            duration: speed,
            scaleY: scaleYVal,
            scaleX: 2 - scaleYVal,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }

    setCatBounceLevel(1);

    // ------------------------------------
    // 3. THOẠI UNDERTALE
    // ------------------------------------
    const catWrapper = document.querySelector(".cat-wrapper");
    const catDialogue = document.getElementById("cat-dialogue");

    const dialogues = [
        "hãy nhập mật khẩu",
        "một ngày đặc biệt",
        "...",
        "Hòa An"
    ];

    let currentDialogueIndex = 0;
    let isTyping = false;

    catWrapper.addEventListener("click", () => {
        if (isTyping || isLocked) return;

        const textToType = dialogues[currentDialogueIndex];
        showDialogueText(textToType, () => {
            currentDialogueIndex = (currentDialogueIndex + 1) % dialogues.length;
        });
    });

    function showDialogueText(text, onComplete) {
        catDialogue.style.visibility = "visible";
        catDialogue.style.opacity = "1";
        typeWriterEffect(catDialogue, text, onComplete);
    }

    function typeWriterEffect(element, text, onComplete) {
        isTyping = true;
        element.textContent = "";
        let charIndex = 0;

        const typingInterval = setInterval(() => {
            element.textContent += text[charIndex];
            charIndex++;

            if (charIndex >= text.length) {
                clearInterval(typingInterval);
                isTyping = false;
                if (onComplete) onComplete();
            }
        }, 50);
    }

    // ------------------------------------
    // 4. BÀN PHÍM SỐ & CHECK MẬT KHẨU
    // ------------------------------------
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
        checkPassword();
    });

    function checkPassword() {
        if (realPassword === CORRECT_PASSWORD) {
            // == KHI NHẬP ĐÚNG ==
            isLocked = true; // Khóa không cho nhập nữa
            catImg.src = CAT_NORMAL; // Chuyển về mèo normal
            setCatBounceLevel(1); // Trạng thái nhảy bình thường

            // Hiện thoại thành công
            showDialogueText("làm tốt lắm", () => {
                setTimeout(() => {
                    showDialogueText("hehehe", () => {
                        setTimeout(() => {
                            showDialogueText("vui lòng xác minh không phải robot", () => {
                                setTimeout(startRobotVerification, 1200);
                            });
                        }, 800);
                    });
                }, 800);
            });

        } else {
            wrongCount++;

            gsap.to(welcomeScreen, { 
                x: -15, 
                duration: 0.05, 
                repeat: 7, 
                yoyo: true, 
                onComplete: () => { gsap.to(welcomeScreen, { x: 0 }); }
            });

            realPassword = "";
            passInput.value = "";

            if (wrongCount >= 13) {
                catImg.src = CAT_SHOCK;
                setCatBounceLevel(0);
                showDialogueText("huhu", () => {
                    setTimeout(() => {
                        showDialogueText("anh giận em lun!", () => {
                            setTimeout(startLockoutTimer, 1000);
                        });
                    }, 800);
                });
            } else if (wrongCount >= 10) {
                catImg.src = CAT_SHOCK;
                setCatBounceLevel(3);
                showDialogueText("*??#?@!*@?!#@?*!");
            } else if (wrongCount >= 5) {
                catImg.src = CAT_ANGRY;
                setCatBounceLevel(2);
                showDialogueText("sai mật khẩu", () => {
                    setTimeout(() => { showDialogueText("Hòa An"); }, 800);
                });
            } else {
                catImg.src = CAT_NORMAL;
                setCatBounceLevel(1);
                showDialogueText("sai mật khẩu", () => {
                    setTimeout(() => { showDialogueText("Hòa An"); }, 800);
                });
            }
        }
    }

    function startLockoutTimer() {
        isLocked = true;
        let secondsLeft = 10;
        setCatBounceLevel(0);

        catDialogue.textContent = `anh sẽ bùn trong vòng ${secondsLeft}s`;

        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                catDialogue.textContent = `anh sẽ bùn trong vòng ${secondsLeft}s`;
            } else {
                clearInterval(countdownInterval);
                catImg.src = CAT_NORMAL;
                setCatBounceLevel(1); 
                wrongCount = 0; 

                catDialogue.textContent = "anh hết bùn ời";
                isLocked = false;
            }
        }, 1000);
    }

    // ------------------------------------
    // 5. CƠ CHẾ VERIFY ROBOT (CAPTCHA)
    // ------------------------------------
    const questions = [
        {
            q: "vui lòng trả lời những câu hỏi sau để chứng minh",
            options: ["Bắt đầu ngay!", "Sẵn sàng"],
            correctIndex: 0
        },
        {
            q: "1 + 1 bằng mấy?",
            options: ["1", "2", "3"],
            correctIndex: 1
        },
        {
            q: "Hôm nay là ngày gì?",
            options: ["Ngày bình thường", "Ngày rất đặc biệt"],
            correctIndex: 1
        },
        {
            q: "Thủ đô của Việt Nam là gì?",
            options: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"],
            correctIndex: 0
        },
        {
            q: "em có yêu anh không",
            options: ["Có", "Không"],
            isFinal: true
        }
    ];

    let currentQuestionIndex = 0;
    let yesBtnScale = 1; // Kích thước nút Có
    let noBtnScale = 1;
    function startRobotVerification() {
        captchaOverlay.style.display = "flex";
        gsap.fromTo(".captcha-box", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" });
        
        currentQuestionIndex = 0;
        loadQuestion(currentQuestionIndex);
    }

    function updateProgressBar(index, status) {
        const bar = document.getElementById(`prog-${index}`);
        if (!bar) return;

        bar.classList.remove("pink", "red", "black");
        if (status === "correct") {
            bar.classList.add("black");
        } else if (status === "wrong") {
            bar.classList.add("red");
        } else {
            bar.classList.add("pink");
        }
    }

    function loadQuestion(index) {
        captchaOptions.innerHTML = "";
        captchaOptions.classList.remove("row-layout");

        const qData = questions[index];

        // Mèo đọc từng câu hỏi bằng hiệu ứng gõ chữ
        typeWriterEffect(captchaDialogue, qData.q, () => {
            // Khi gõ chữ xong mới render đáp án
            if (qData.isFinal) {
                renderFinalQuestion(qData);
            } else {
                renderStandardQuestion(qData, index);
            }
        });
    }

    function renderStandardQuestion(qData, qIndex) {
        qData.options.forEach((optText, optIdx) => {
            const btn = document.createElement("button");
            btn.classList.add("captcha-opt-btn");
            btn.textContent = optText;

            btn.addEventListener("click", () => {
                if (optIdx === qData.correctIndex) {
                    // Chọn ĐÚNG
                    updateProgressBar(qIndex, "correct");
                    
                    // 1. Hiệu ứng con mèo co bóp nhẹ
                    gsap.to("#captcha-cat-img", {
                        scaleX: 1.25, // Bè ra theo chiều ngang
                        scaleY: 0.75, // Lùn xuống theo chiều dọc
                        duration: 0.15,
                        yoyo: true,   // Tự động quay lại hình dáng ban đầu
                        repeat: 1
                    });

                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        // Thêm độ trễ 300ms để người xem kịp thấy mèo co bóp trước khi đổi câu hỏi
                        setTimeout(() => loadQuestion(currentQuestionIndex), 300);
                    }
                } else {
                    // Chọn SAI
                    updateProgressBar(qIndex, "wrong");
                    
                    // 2. Hiệu ứng rung toàn bộ màn hình
                    gsap.to("body", { 
                        x: -12, // Lắc sang trái/phải
                        y: 5,   // Lắc nhẹ lên/xuống
                        duration: 0.05, 
                        repeat: 7, 
                        yoyo: true,
                        onComplete: () => { 
                            // Trả lại vị trí cũ khi rung xong
                            gsap.set("body", {x: 0, y: 0}); 
                        }
                    });
                    
                    // Rung thêm cả hộp thoại Captcha để hiệu ứng mạnh mẽ hơn
                    gsap.to(".captcha-box", { x: 10, duration: 0.05, repeat: 7, yoyo: true });
                }
            });

            captchaOptions.appendChild(btn);
        });
    }

    // Xử lý riêng cho Câu 5: Em có yêu anh không (2 nút xếp hàng ngang)
    function renderFinalQuestion(qData) {
        captchaOptions.classList.add("row-layout");

        const btnYes = document.createElement("button");
        btnYes.id = "btn-yes";
        btnYes.classList.add("captcha-opt-btn");
        btnYes.textContent = "Có";
        
        // Cố định tâm phóng to ở bên trái để ép nút Không
        btnYes.style.transformOrigin = "left center";
        btnYes.style.position = "relative";
        btnYes.style.zIndex = "10"; 

        const btnNo = document.createElement("button");
        btnNo.id = "btn-no";
        btnNo.classList.add("captcha-opt-btn");
        btnNo.textContent = "Không";
        
        btnNo.style.position = "relative";
        btnNo.style.zIndex = "1";

        // Chọn CÓ -> Chớp chớp rồi Vô Màn hình chính
        btnYes.addEventListener("click", () => {
            updateProgressBar(4, "correct");
            
            // Khóa nút để ngăn click nhiều lần trong lúc chớp
            btnYes.disabled = true;

            // Hiệu ứng chớp chớp nút CÓ
            gsap.to(btnYes, {
                opacity: 0,
                duration: 0.1,
                repeat: 5,      // Lặp lại chớp tắt 5 lần
                yoyo: true,     // Đảo ngược (sáng -> tối -> sáng)
                onComplete: () => {
                    // Sau khi chớp xong mới bắt đầu mờ màn hình Captcha
                    gsap.set(btnYes, { opacity: 1 }); // Đảm bảo nút sáng rõ lại
                    
                    gsap.to(captchaOverlay, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            captchaOverlay.style.display = "none";
                            goToMainGift();
                        }
                    });
                }
            });
        });

        // Biến lưu trữ tổng khoảng cách nút Không bị đẩy văng đi
        let currentPushX = 0; 

        // Click KHÔNG -> Nút Có phình to, hất văng nút Không
        btnNo.addEventListener("click", () => {
            yesBtnScale += 0.4; 
            btnYes.style.transform = `scale(${yesBtnScale})`;

            noBtnScale = Math.max(0.1, noBtnScale - 0.15);

            currentPushX += 65; 
            const randomY = (Math.random() - 0.5) * 30;

            gsap.to(btnNo, {
                x: currentPushX,
                y: randomY,
                scale: noBtnScale,
                duration: 0.25,
                ease: "power2.out"
            });
        });

        captchaOptions.appendChild(btnYes);
        captchaOptions.appendChild(btnNo);
    }

    // ------------------------------------
    // 6. CHUYỂN CẢNH MÀN HÌNH CHÍNH
    // ------------------------------------
    function goToMainGift() {
        gsap.to(welcomeScreen, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                welcomeScreen.style.display = "none";
                mainGift.style.display = "block";
                gsap.fromTo(mainGift, { opacity: 0 }, { opacity: 1, duration: 1 });
                
                startMainGiftAnimation();
            }
        });
    }

    function startMainGiftAnimation() {
        const timeline = gsap.timeline();

        timeline.fromTo("#tree-svg", 
            { scale: 0.8, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }
        );

        timeline.fromTo(".photo-item", 
            { opacity: 0, y: 30, scale: 0.8 }, 
            { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.5, ease: "back.out(1.2)" },
            "-=1"
        );

        timeline.to({}, { duration: 3 });
        timeline.call(goToFinalScreen);
    }



    function goToFinalScreen() {
        gsap.to(mainGift, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                mainGift.style.display = "none";
                finalScreen.style.display = "block";
                gsap.fromTo(finalScreen, { opacity: 0 }, { opacity: 1, duration: 1 });

                createPetalShower();
            }
        });
    }

    function createPetalShower(count = 30) {
        for (let i = 0; i < count; i++) {
            const petal = document.createElement("div");
            petal.classList.add("falling-petal");
            petalContainer.appendChild(petal);

            const startX = Math.random() * window.innerWidth;
            const duration = Math.random() * 3 + 3;

            gsap.fromTo(petal, 
                { 
                    x: startX, 
                    y: -20, 
                    opacity: 1, 
                    rotation: 0 
                }, 
                { 
                    y: window.innerHeight + 20, 
                    x: startX + (Math.random() * 100 - 50), 
                    rotation: Math.random() * 360, 
                    duration: duration, 
                    repeat: -1, 
                    delay: Math.random() * 3,
                    ease: "none" 
                }
            );
        }
    }
});