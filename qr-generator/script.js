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
    color: {
      dark: qrColor.value,
      light: qrBg.value
    },
    width: parseInt(qrSize.value) || 250
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
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, logoSize, logoSize, 8);
  ctx.clip();
  ctx.drawImage(logoImage, x, y, logoSize, logoSize);
  ctx.restore();
}

// Download as PNG
function downloadQR() {
  const link = document.createElement("a");
  link.download = "CodeX_QR.png";
  link.href = qrCanvas.toDataURL("image/png");
  link.click();
}

// Logo upload preview
logoInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoImage = new Image();
    logoImage.onload = () => {
      logoPreview.innerHTML = `<img src="${ev.target.result}" alt="logo preview">`;
      generateQR();
    };
    logoImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Auto preview updates
qrInput.addEventListener("input", generateQR);
qrColor.addEventListener("input", generateQR);
qrBg.addEventListener("input", generateQR);
qrSize.addEventListener("change", generateQR);

// Buttons
document.getElementById("generateBtn").addEventListener("click", generateQR);
document.getElementById("downloadBtn").addEventListener("click", downloadQR);

// Default QR on load
window.addEventListener("load", generateQR);

// Existing imports...
const examples = document.querySelectorAll(".chip-example");

examples.forEach(chip => {
  chip.addEventListener("click", () => {
    qrInput.value = chip.dataset.value;
    generateQR();
  });
});
