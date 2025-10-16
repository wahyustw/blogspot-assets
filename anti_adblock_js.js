/* Anti AdBlock Detection Script */
/* File: anti-adblock.js */

(function() {
  'use strict';
  
  // Variabel untuk deteksi
  var adBlockDetected = false;
  var checkInterval = null;
  var recheckDelay = 3000; // Cek ulang setiap 3 detik
  
  // Fungsi untuk inject HTML popup jika belum ada
  function injectPopupHTML() {
    if (document.getElementById('adbOverlay')) return;
    
    var popupHTML = `
      <div id="adbOverlay" class="adb-overlay">
        <div class="adb-popup">
          <div class="adb-header">
            <div class="adb-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2>AdBlock Terdeteksi!</h2>
            <p>Kami mendeteksi Anda menggunakan AdBlock</p>
          </div>
          
          <div class="adb-body">
            <p>Untuk dapat mengakses konten secara gratis, mohon nonaktifkan AdBlock Anda untuk website ini. Iklan membantu kami menyediakan konten berkualitas untuk Anda.</p>
            
            <div class="adb-steps">
              <div class="adb-step">
                <div class="adb-step-number">1</div>
                <div class="adb-step-text">Klik icon AdBlock di browser Anda</div>
              </div>
              <div class="adb-step">
                <div class="adb-step-number">2</div>
                <div class="adb-step-text">Pilih "Nonaktifkan untuk situs ini"</div>
              </div>
              <div class="adb-step">
                <div class="adb-step-number">3</div>
                <div class="adb-step-text">Refresh halaman ini</div>
              </div>
            </div>
            
            <button class="adb-button" onclick="location.reload()">Saya Sudah Menonaktifkan</button>
          </div>
          
          <div class="adb-footer">
            Terima kasih atas dukungan Anda! 💜
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }
  
  // Fungsi untuk membuat elemen test AdBlock
  function createAdBait() {
    var bait = document.createElement('div');
    bait.className = 'ad ads advertisement adsbox doubleclick ad-placement ad-placeholder adbadge BannerAd';
    bait.style.cssText = 'width:1px!important;height:1px!important;position:absolute!important;left:-999px!important;top:-999px!important;';
    document.body.appendChild(bait);
    return bait;
  }
  
  // Fungsi deteksi AdBlock (metode 1: Element detection)
  function checkAdBlock1() {
    var bait = createAdBait();
    
    setTimeout(function() {
      if (!bait || bait.offsetHeight === 0 || bait.offsetWidth === 0 || 
          window.getComputedStyle(bait).display === 'none' ||
          window.getComputedStyle(bait).visibility === 'hidden') {
        adBlockDetected = true;
        showPopup();
      }
      if (bait && bait.parentNode) {
        bait.parentNode.removeChild(bait);
      }
    }, 100);
  }
  
  // Fungsi deteksi AdBlock (metode 2: Script detection)
  function checkAdBlock2() {
    var script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.onerror = function() {
      adBlockDetected = true;
      showPopup();
    };
    document.head.appendChild(script);
  }
  
  // Fungsi deteksi AdBlock (metode 3: Fetch API)
  function checkAdBlock3() {
    if (typeof fetch !== 'undefined') {
      fetch('https://googleads.g.doubleclick.net/pagead/id', {
        method: 'HEAD',
        mode: 'no-cors'
      }).catch(function() {
        adBlockDetected = true;
        showPopup();
      });
    }
  }
  
  // Fungsi untuk menampilkan popup
  function showPopup() {
    if (adBlockDetected) {
      injectPopupHTML();
      var overlay = document.getElementById('adbOverlay');
      if (overlay) {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Cegah scroll dan klik kanan
        document.addEventListener('contextmenu', preventAction);
        document.addEventListener('keydown', preventKeys);
      }
    }
  }
  
  // Fungsi prevent action
  function preventAction(e) {
    e.preventDefault();
    return false;
  }
  
  // Fungsi prevent keys (F12, Ctrl+Shift+I, dll)
  function preventKeys(e) {
    if (e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
      e.preventDefault();
      return false;
    }
  }
  
  // Fungsi untuk cek ulang secara berkala
  function startPeriodicCheck() {
    checkInterval = setInterval(function() {
      if (!adBlockDetected) {
        checkAdBlock1();
      }
    }, recheckDelay);
  }
  
  // Inisialisasi deteksi saat DOM ready
  function initDetection() {
    // Delay awal untuk memastikan semua resources loaded
    setTimeout(function() {
      checkAdBlock1();
      checkAdBlock2();
      checkAdBlock3();
      startPeriodicCheck();
    }, 1000);
  }
  
  // Event listener untuk DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetection);
  } else {
    initDetection();
  }
  
  // Cek saat visibility change (user kembali ke tab)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !adBlockDetected) {
      checkAdBlock1();
    }
  });
  
})();