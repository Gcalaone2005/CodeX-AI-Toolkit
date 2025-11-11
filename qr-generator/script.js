const qrCanvas = document.getElementById("qrCanvas");
const qrInput = document.getElementById("qrText");
const qrColor = document.getElementById("qrColor");
const qrBg = document.getElementById("qrBg");
const qrSize = document.getElementById("qrSize");
const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");
let logoImage = null;

// Generate QR
function generateQR() {
  const text = qrInput.value.trim() || "https://codex-ai-toolkit.example";
  const opts = {
    color: { dark: qrColor.value, light: qrBg.value },
    width: parseInt(qrSize.value)
  };
  QRCode.toCanvas(qrCanvas, text, opts, (err) => {
    if (err) return console.error(err);
    if (logoImage) overlayLogo();
  });
}

// Overlay logo in center
function overlayLogo() {
  const ctx = qrCanvas.getContext("2d");
  const size = qrCanvas.width;
  const logoSize = size * 0.2;
  const x = (size - logoSize) / 2;
  const y = (size - logoSize) / 2;
  ctx.drawImage(logoImage, x, y, logoSize, logoSize);
}

// Download QR as PNG
function downloadQR() {
  const link = document.createElement("a");
  link.download = "CodeX_QR.png";
  link.href = qrCanvas.toDataURL("image/png");
  link.click();
}

// Logo upload
logoInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoImage = new Image();
    logoImage.onload = () => {
      logoPreview.innerHTML = `<img src="${ev.target.result}" alt="logo">`;
      generateQR();
    };
    logoImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Example click suggestions
document.querySelectorAll(".chip-example").forEach(chip => {
  chip.addEventListener("click", () => {
    qrInput.value = chip.dataset.value;
    generateQR();
  });
});

// Live updates
[qrInput, qrColor, qrBg, qrSize].forEach(el =>
  el.addEventListener("input", generateQR)
);
document.getElementById("generateBtn").addEventListener("click", generateQR);
document.getElementById("downloadBtn").addEventListener("click", downloadQR);

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙";
});

// Default
window.addEventListener("load", generateQR);
