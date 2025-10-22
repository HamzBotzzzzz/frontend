  const VALID_USER = 'admin';
  const VALID_PASS = 'ilhamm';

  // ========== ELEMENTS ==========
  const loginScreen = document.getElementById('loginScreen');
  const mainApp = document.getElementById('mainApp');
  const loginBtn = document.getElementById('loginBtn');
  const demoBtn = document.getElementById('demoBtn');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loggedUserSpan = document.getElementById('loggedUser');
  const sidebarUser = document.getElementById('sidebarUser');
  const logoutBtn = document.getElementById('logoutBtn');
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  const waConnState = document.getElementById('waConnState');
  const pairingModal = document.getElementById('pairingModal');
  const pairingCodeDisplay = document.getElementById('pairingCodeDisplay');
  const pairingStatus = document.getElementById('pairingStatus');
  const closePairingModal = document.getElementById('closePairingModal');
  const generatePairingBtn = document.getElementById('generatePairingBtn');
  const waNumberInput = document.getElementById('waNumberInput');
  const countryInfo = document.getElementById('countryInfo');
  const executeBtn = document.getElementById('executeBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');
  const gpsStatus = document.getElementById('gpsStatus');
  const targetCountryInfo = document.getElementById('targetCountryInfo');

  // NEW ELEMENTS FOR QR CODE
  const qrModal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');
  const qrStatus = document.getElementById('qrStatus');
  const closeQrModal = document.getElementById('closeQrModal');
  const connectQrBtn = document.getElementById('connectQrBtn');
  const connectPairingBtn = document.getElementById('connectPairingBtn');

  // ========== SOCKET ==========
  const socket = io();

  // ========== SIMPLE VALIDATION - DIPERBAIKI ==========
  function validatePhoneNumber(number) {
    if (!number) return false;
    
    // Bersihkan nomor dari karakter non-digit dan plus
    const cleaned = number.replace(/[^\d+]/g, '');
    
    // Minimal 5 digit setelah kode negara
    return cleaned.replace(/\D/g, '').length >= 5;
  }

  function formatPhoneNumber(number) {
    if (!number) return '';
    
    // Jika sudah ada + di depan, biarkan
    if (number.startsWith('+')) {
      return number;
    }
    
    // Jika tidak ada +, tambahkan
    return '+' + number.replace(/\D/g, '');
  }

  function updateCountryInfo(number, element) {
    if (!number) {
      element.textContent = 'Masukkan nomor dengan kode negara. Contoh: +62 (Indonesia), +1 (US), +44 (UK), +93 (Afghanistan)';
      element.className = 'country-info';
      return;
    }
    
    const formatted = formatPhoneNumber(number);
    const cleaned = formatted.replace(/\D/g, '');
    
    if (cleaned.length < 5) {
      element.textContent = 'Nomor terlalu pendek. Minimal 5 digit setelah kode negara.';
      element.className = 'country-info invalid';
      return;
    }
    
    // Deteksi kode negara sederhana
    let country = 'Unknown';
    if (formatted.startsWith('+62')) country = 'Indonesia';
    else if (formatted.startsWith('+1')) country = 'USA/Canada';
    else if (formatted.startsWith('+44')) country = 'UK';
    else if (formatted.startsWith('+91')) country = 'India';
    else if (formatted.startsWith('+86')) country = 'China';
    else if (formatted.startsWith('+81')) country = 'Japan';
    else if (formatted.startsWith('+82')) country = 'South Korea';
    else if (formatted.startsWith('+93')) country = 'Afghanistan';
    else if (formatted.startsWith('+971')) country = 'UAE';
    else if (formatted.startsWith('+966')) country = 'Saudi Arabia';
    else if (formatted.startsWith('+60')) country = 'Malaysia';
    else if (formatted.startsWith('+65')) country = 'Singapore';
    else if (formatted.startsWith('+63')) country = 'Philippines';
    else if (formatted.startsWith('+84')) country = 'Vietnam';
    else if (formatted.startsWith('+66')) country = 'Thailand';
    else if (formatted.startsWith('+33')) country = 'France';
    else if (formatted.startsWith('+49')) country = 'Germany';
    else if (formatted.startsWith('+39')) country = 'Italy';
    else if (formatted.startsWith('+34')) country = 'Spain';
    else if (formatted.startsWith('+7')) country = 'Russia/Kazakhstan';
    else if (formatted.startsWith('+20')) country = 'Egypt';
    else if (formatted.startsWith('+234')) country = 'Nigeria';
    else if (formatted.startsWith('+27')) country = 'South Africa';
    else if (formatted.startsWith('+55')) country = 'Brazil';
    else if (formatted.startsWith('+52')) country = 'Mexico';
    else if (formatted.startsWith('+54')) country = 'Argentina';
    else if (formatted.startsWith('+56')) country = 'Chile';
    else if (formatted.startsWith('+57')) country = 'Colombia';
    else {
      const countryCode = formatted.match(/^\+\d+/);
      if (countryCode) {
        country = `Country Code: ${countryCode[0]}`;
      }
    }
    
    element.textContent = `🌍 ${country} | Format: ${formatted}`;
    element.className = 'country-info valid';
  }

  // ========== UI LOGIC ==========
  function showMainApp(username) {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    loggedUserSpan.textContent = username;
    sidebarUser.textContent = `User: ${username}`;
  }

  function showLoginScreen() {
    loginScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    loginUsername.value = '';
    loginPassword.value = '';
    hamburger.style.display = 'block';
    sidebar.classList.remove('active');
    loginUsername.focus();
  }

  function updateWAStatus(text, color) {
    waConnState.textContent = text;
    const dot = waConnState.parentElement.querySelector('.dot');
    if (dot) {
      dot.style.cssText = `width:10px; height:10px; background:${color}; border-radius:50%; box-shadow:0 0 12px ${color};`;
    }
  }

  loginBtn.addEventListener('click', () => {
    const u = loginUsername.value.trim();
    const p = loginPassword.value.trim();
    if (!u || !p) { 
      alert('Masukkan username & password'); 
      return; 
    }
    if (u === VALID_USER && p === VALID_PASS) {
      showMainApp(u);
      setTimeout(() => {
        socket.emit('check_status');
      }, 1000);
    } else {
      alert('Username atau Password salah!');
    }
  });

  [loginUsername, loginPassword].forEach(el => {
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') loginBtn.click();
    });
  });

  demoBtn.addEventListener('click', () => {
    loginUsername.value = VALID_USER;
    loginPassword.value = VALID_PASS;
    loginBtn.click();
  });

  logoutBtn.addEventListener('click', () => {
    if (confirm('Logout sekarang?')) {
      showLoginScreen();
    }
  });

  // Sidebar toggle
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.add("active");
    hamburger.style.display = "none";
  });

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("active");
    hamburger.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      if (sidebar.classList.contains("active")) {
        sidebar.classList.remove("active");
        hamburger.style.display = "block";
      }
    }
  });

  // ========== QR CODE LOGIC ==========
  connectQrBtn.addEventListener('click', () => {
    console.log('QR Code button clicked');
    
    qrModal.style.display = 'flex';
    qrStatus.textContent = 'Menghubungkan...';
    qrImage.src = '';
    
    socket.emit('connect_qr');
    
    updateWAStatus('Meminta QR Code...', '#ffcc00');
  });

  // Handle QR code dari server
  socket.on('qr_code', (qrData) => {
    if (qrData) {
        console.log('QR Code received');
        qrImage.src = qrData;
        qrStatus.textContent = 'Scan QR Code dengan WhatsApp';
        updateWAStatus('QR Code Ready', '#ffcc00');
    } else {
        qrImage.src = '';
        qrStatus.textContent = 'Connected!';
        setTimeout(() => {
            qrModal.style.display = 'none';
        }, 2000);
    }
  });

  // Tutup QR Modal
  closeQrModal.addEventListener('click', () => {
    qrModal.style.display = 'none';
  });

  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      qrModal.style.display = 'none';
    }
  });

  // ========== PAIRING CODE LOGIC - DIPERBAIKI ==========
  connectPairingBtn.addEventListener('click', () => {
    console.log('Pairing Code button clicked');
    
    pairingModal.style.display = 'flex';
    waNumberInput.value = '';
    pairingCodeDisplay.textContent = '• • • • • •';
    pairingStatus.textContent = 'Masukkan nomor WhatsApp dan klik Generate';
    pairingStatus.className = 'text-sm text-center mb-4 text-cyan-300';
    countryInfo.textContent = 'Masukkan nomor dengan kode negara. Contoh: +62 (Indonesia), +1 (US), +44 (UK), +93 (Afghanistan)';
    countryInfo.className = 'country-info';
    
    updateWAStatus('Menunggu input nomor...', '#ffcc00');
    
    // Focus ke input
    setTimeout(() => waNumberInput.focus(), 300);
  });

  // Real-time validation untuk input nomor pairing
  waNumberInput.addEventListener('input', (e) => {
    updateCountryInfo(e.target.value, countryInfo);
  });

  // Generate pairing code ketika tombol di modal diklik
  generatePairingBtn.addEventListener('click', () => {
    const number = waNumberInput.value.trim();
    
    // Validasi yang lebih fleksibel
    if (!number) {
        alert('Masukkan nomor WhatsApp!');
        return;
    }

    if (!validatePhoneNumber(number)) {
        alert('Format nomor tidak valid. Minimal 5 digit angka.\nContoh: +628123456789, +13151234567, +93701234567');
        return;
    }

    console.log('Requesting pairing for number:', number);
    
    // Format nomor sebelum dikirim
    const formattedNumber = formatPhoneNumber(number);
    
    // Kirim ke backend
    socket.emit('connect_pairing', { number: formattedNumber });
    
    // Update UI
    pairingCodeDisplay.textContent = 'Meminta...';
    pairingStatus.textContent = '🔄 Menghubungkan ke WhatsApp...';
    pairingStatus.className = 'text-sm text-center mb-4 text-cyan-300';
    
    updateWAStatus('Meminta pairing...', '#ffcc00');
    
    // Disable button sementara
    generatePairingBtn.disabled = true;
    generatePairingBtn.textContent = 'Meminta...';
    
    // Enable kembali setelah 5 detik
    setTimeout(() => {
        generatePairingBtn.disabled = false;
        generatePairingBtn.textContent = 'Generate Pairing Code';
    }, 5000);
  });

  // Handle pairing code dari server
  socket.on('pairing_code', (code) => {
    pairingCodeDisplay.textContent = code;
    pairingStatus.textContent = '📱 Buka WhatsApp → Settings → Linked Devices → Link with Pairing Code';
    updateWAStatus('Pairing Code Ready', '#ffcc00');
  });

  // Handle semua status dari server
  socket.on('wa_status', (status) => {
    console.log('WA Status:', status);
    
    switch(status) {
      case 'connected':
        updateWAStatus('Connected', '#00ff00');
        pairingStatus.textContent = '✅ WhatsApp Connected!';
        pairingStatus.className = 'text-sm text-center mb-4 text-green-400';
        qrStatus.textContent = '✅ Connected!';
        
        setTimeout(() => {
          pairingModal.style.display = 'none';
          qrModal.style.display = 'none';
        }, 2000);
        break;
        
      case 'disconnected':
        updateWAStatus('Disconnected', '#ff3366');
        pairingStatus.textContent = '❌ WhatsApp Disconnected';
        qrStatus.textContent = '❌ Disconnected';
        break;
        
      case 'connecting':
        pairingCodeDisplay.textContent = 'Menghubungkan...';
        pairingStatus.textContent = '🔄 Menghubungkan ke WhatsApp...';
        qrStatus.textContent = '🔄 Menghubungkan...';
        updateWAStatus('Connecting...', '#ffcc00');
        break;
        
      case 'requesting_qr':
        qrStatus.textContent = 'Meminta QR Code...';
        updateWAStatus('Requesting QR...', '#ffcc00');
        break;
        
      case 'qr_ready':
        qrStatus.textContent = 'QR Code Ready - Scan sekarang!';
        updateWAStatus('QR Ready', '#ffcc00');
        break;
        
      case 'requesting_pairing':
        pairingCodeDisplay.textContent = 'Menghubungkan...';
        pairingStatus.textContent = '🔄 Menghubungkan ke WhatsApp...';
        updateWAStatus('Connecting...', '#ffcc00');
        break;
        
      default:
        if (status.startsWith('error:')) {
          const errorMsg = status.split(':')[1];
          pairingStatus.textContent = `❌ ${errorMsg}`;
          pairingStatus.className = 'text-sm text-center mb-4 text-red-400';
          qrStatus.textContent = `❌ ${errorMsg}`;
          pairingCodeDisplay.textContent = 'Gagal';
          updateWAStatus('Error', '#ff0000');
        }
    }
  });

  closePairingModal.addEventListener('click', () => {
    pairingModal.style.display = 'none';
  });

  pairingModal.addEventListener('click', (e) => {
    if (e.target === pairingModal) {
      pairingModal.style.display = 'none';
    }
  });

  // ========== TARGET NUMBER VALIDATION ==========
  const whatsappInput = document.getElementById('whatsapp');
  whatsappInput.addEventListener('input', (e) => {
    updateCountryInfo(e.target.value, targetCountryInfo);
  });

  // ========== BUG OPTION SELECTION ==========
  let selectedOption = null;
  function selectOption(option) {
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    selectedOption = option;
    document.getElementById(`option${option}`).classList.add('selected');
  }

  document.getElementById('optionInvisible').addEventListener('click', () => selectOption('Invisible'));
  document.getElementById('optionFcHard').addEventListener('click', () => selectOption('FcHard'));
  document.getElementById('optionBulldozer').addEventListener('click', () => selectOption('Bulldozer'));
  document.getElementById('optionFcClick').addEventListener('click', () => selectOption('FcClick'));

  // ========== EXECUTE BUG - DIPERBAIKI ==========
  executeBtn.addEventListener('click', () => {
    const waState = waConnState.textContent.trim();
    if (waState !== 'Connected') {
      alert('Hubungkan WhatsApp dulu via menu sidebar!');
      return;
    }
    
    const whatsapp = document.getElementById('whatsapp').value.trim();
    if (!whatsapp) {
      alert('Masukkan nomor WhatsApp target!');
      return;
    }
    
    if (!validatePhoneNumber(whatsapp)) {
      alert('Format nomor target tidak valid. Minimal 5 digit angka.\nContoh: +628123456789, +13151234567, +93701234567');
      return;
    }
    
    if (!selectedOption) {
      alert('Pilih jenis bug terlebih dahulu!');
      return;
    }

    if (!confirm(`Kirim bug ${selectedOption} ke ${whatsapp}?`)) {
      return;
    }

    btnText.textContent = 'EXECUTING...';
    spinner.classList.remove('hidden');
    gpsStatus.classList.remove('hidden');

    // Format nomor target sebelum dikirim
    const formattedTarget = formatPhoneNumber(whatsapp);
    
    socket.emit('execute_bug', {
      target: formattedTarget,
      bugType: selectedOption
    });
  });

  // Handle execute result
  socket.on('execute_result', (res) => {
    alert(res.success ? '✅ ' + res.message : '❌ ' + res.message);
    btnText.textContent = 'EXECUTE BUG';
    spinner.classList.add('hidden');
    gpsStatus.classList.add('hidden');
  });

  // ========== PARTICLES BACKGROUND ==========
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
      });
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,255,0.15)';
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x > w || p.x < 0) p.dx *= -1;
        if (p.y > h || p.y < 0) p.dy *= -1;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    alert('Koneksi ke server terputus. Refresh halaman.');
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    if (reason === 'io server disconnect') {
      alert('Server memutuskan koneksi. Refresh halaman.');
    }
  });

  // Auto check status setiap 30 detik
  setInterval(() => {
    if (mainApp.style.display === 'block') {
      socket.emit('check_status');
    }
  }, 30000);

  // Initial status check
  setTimeout(() => {
    socket.emit('check_status');
  }, 1000);