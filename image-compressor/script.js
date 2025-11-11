const uploadInput = document.getElementById("upload");
const uploadBox = document.getElementById("uploadBox");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const qualityRange = document.getElementById("qualityRange");
const qualityValue = document.getElementById("qualityValue");
const downloadBtn = document.getElementById("downloadBtn");
const infoBox = document.getElementById("infoBox");

let img = new Image();
let originalSize = 0;
let compressedBlob = null;

// Handle upload
uploadInput.addEventListener("change", handleFile);
uploadBox.addEventListener("dragover", e => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});
uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));
uploadBox.addEventListener("drop", e => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

function handleFile(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    img.src = e.target.result;
    originalSize = file.size;
  };
  reader.readAsDataURL(file);
}

img.onload = compressImage;

function compressImage() {
  const quality = parseFloat(qualityRange.value);
  const maxWidth = 800;

  let width = img.width;
  let height = img.height;
  if (width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  canvas.toBlob(
    blob => {
      compressedBlob = blob;
      const compressedSize = blob.size;
      infoBox.innerHTML = `
        <b>Original:</b> ${(originalSize / 1024).toFixed(1)} KB |
        <b>Compressed:</b> ${(compressedSize / 1024).toFixed(1)} KB
      `;
      downloadBtn.disabled = false;
    },
    "image/jpeg",
    quality
  );
}

qualityRange.addEventListener("input", () => {
  qualityValue.textContent = Math.round(qualityRange.value * 100) + "%";
  if (img.src) compressImage();
});

// Download
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "compressed.jpg";
  link.href = URL.createObjectURL(compressedBlob);
  link.click();
});

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("themeToggle").textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});
