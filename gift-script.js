window.onload = () => {
  document.body.classList.remove("container");
  // === THÊM ĐOẠN NÀY VÀO: Kích hoạt mờ lớp phủ hồng ===
  const transitionOverlay = document.getElementById("page-transition-overlay");
  if (transitionOverlay) {
    // Chờ 0.1s để trình duyệt render xong mới bắt đầu mờ đi
    setTimeout(() => {
      transitionOverlay.style.opacity = "0";
      // Xóa hẳn thẻ div sau khi mờ xong (2 giây) để tối ưu hiệu suất
      setTimeout(() => {
        transitionOverlay.style.display = "none";
      }, 2000);
    }, 100);
  }
  // ====================================================
  const backgroundMusic = document.getElementById("bg-music");
  
  // Phát nhạc khi click lần đầu
  document.body.addEventListener("click", () => {
    backgroundMusic.play().catch(error => {
      console.log("Trình duyệt chặn autoplay:", error);
    });
  }, { once: true });

  // --- LOGIC ẢNH XUNG QUANH ĐĨA NHẠC ---
  const mailIcon = document.getElementById("mail-icon");
  const scatteredGallery = document.getElementById("scattered-gallery");
  const focusBackdrop = document.getElementById("focus-backdrop");
  const galleryItems = document.querySelectorAll(".gallery-item");

  // 1. Nhấp vào lá thư nhỏ để làm xuất hiện các bức ảnh
  mailIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    scatteredGallery.classList.add("active");
    mailIcon.classList.add("hidden"); // Ẩn thư nhỏ đi
  });

  // Khởi tạo một biến zIndex để mỗi lần kéo ảnh nào, ảnh đó sẽ nổi lên trên cùng
  let highestZIndex = 600; 

  // 2. XỬ LÝ KÉO THẢ (DRAG & DROP) VÀ CLICK CHO TỪNG BỨC ẢNH
  galleryItems.forEach(item => {
    let isDragging = false;
    let startX, startY;
    let offsetX, offsetY;

    // HÀM: Bắt đầu nhấn chuột / chạm tay
    const dragStart = (e) => {
      // Nếu ảnh đang được phóng to giữa màn hình thì không cho kéo
      if (item.classList.contains("focused")) return;

      // Lấy tọa độ (hỗ trợ cả chuột trên máy tính và cảm ứng trên điện thoại)
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

      isDragging = false;
      startX = clientX;
      startY = clientY;

      // Tính toán khoảng cách từ con trỏ đến trung tâm của bức ảnh
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      offsetX = clientX - centerX;
      offsetY = clientY - centerY;

      // Cập nhật z-index để bức ảnh đang cầm luôn nằm trên cùng
      highestZIndex++;
      item.style.zIndex = highestZIndex;

      // Gắn sự kiện theo dõi quá trình di chuyển
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchmove', dragMove, { passive: false });
      document.addEventListener('touchend', dragEnd);
    };

    // HÀM: Quá trình di chuyển chuột / vuốt tay
    const dragMove = (e) => {
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

      // Nếu chuột/tay di chuyển quá 5px, đánh dấu đây là hành động "Kéo" chứ không phải "Click"
      if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
        isDragging = true;
        item.classList.add('dragging');
      }

      if (isDragging) {
        e.preventDefault(); // Ngăn trình duyệt cuộn trang khi đang vuốt ảnh
        
        // Cập nhật vị trí mới cho ảnh
        const newLeft = clientX - offsetX;
        const newTop = clientY - offsetY;
        item.style.left = `${newLeft}px`;
        item.style.top = `${newTop}px`;
      }
    };

    // HÀM: Thả chuột / rút tay ra
    const dragEnd = () => {
      item.classList.remove('dragging');
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchmove', dragMove);
      document.removeEventListener('touchend', dragEnd);
    };

    // Lắng nghe sự kiện "Bắt đầu kéo"
    item.addEventListener('mousedown', dragStart);
    item.addEventListener('touchstart', dragStart, { passive: false });

    // HÀM: Xử lý sự kiện CLICK (Mở ảnh)
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      // RẤT QUAN TRỌNG: Nếu người dùng vừa KÉO (Drag) xong thì KHÔNG thực hiện hiệu ứng Click (phóng to ảnh)
      if (isDragging) return;

      // Nếu click vào bức thư đã ở giữa -> Trạng thái mở phong bì thư
      if (item.classList.contains("focused") && item.classList.contains("is-letter")) {
        item.classList.add("opened");
        return;
      }

      // Xóa focus ở các ảnh khác (nếu có)
      galleryItems.forEach(i => {
        i.classList.remove("focused", "opened");
      });

      // Kích hoạt focus cho phần tử được click
      item.classList.add("focused");
      focusBackdrop.classList.add("active"); // Bật màn mờ mọi thứ
    });
  });

  // 3. Đóng trạng thái focus (trở về rải rác xung quanh) khi click vào màn mờ
  focusBackdrop.addEventListener("click", () => {
    galleryItems.forEach(item => {
      item.classList.remove("focused", "opened");
    });
    focusBackdrop.classList.remove("active");
  });
};