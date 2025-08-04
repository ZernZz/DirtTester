// ฟังก์ชันสร้าง input file (เหมือนเดิม)
function createFileInput() {
  const row = document.createElement("div");
  row.classList.add("file-row");
  const input = document.createElement("input");
  input.type = "file";
  input.name = "mediaFiles[]";
  input.accept = ".jpg,.jpeg,.png,.mp4";
  input.multiple = true;
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "ลบ";
  removeBtn.classList.add("remove-btn");
  removeBtn.addEventListener("click", () => row.remove());
  row.appendChild(input);
  row.appendChild(removeBtn);
  return row;
}

document.getElementById("addFileBtn").addEventListener("click", () => {
  document.getElementById("fileInputs").appendChild(createFileInput());
});

// --- ‼️ กรุณากรอกข้อมูลของคุณที่นี่ ‼️ ---
const firebaseConfig = {
  apiKey: "AIzaSyCad3vMEdmWQUcUDJA6BHYD6AZruzgqom4",
  authDomain: "testdirt-58ba4.firebaseapp.com",
  projectId: "testdirt-58ba4",
  storageBucket: "testdirt-58ba4.firebasestorage.app",
  messagingSenderId: "89792009820",
  appId: "1:89792009820:web:86ff41e9d3211f00997899"
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfix1lo9q/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "soil_test_uploads";

// --- เริ่มต้นการเชื่อมต่อ Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- จัดการการ Submit Form ---
document.getElementById("soilForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const saveBtn = e.target.querySelector(".btn-save");
  saveBtn.disabled = true;
  saveBtn.textContent = "กำลังอัปโหลดไฟล์...";

  try {
    // 1. อัปโหลดไฟล์ไปที่ Cloudinary
    const fileInputs = document.querySelectorAll("input[name='mediaFiles[]']");
    const filesToUpload = [];
    fileInputs.forEach(input => Array.from(input.files).forEach(file => filesToUpload.push(file)));
    
    const uploadPromises = filesToUpload.map(file => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      return fetch(CLOUDINARY_URL, { method: "POST", body: formData }).then(res => res.json());
    });

    const uploadedResponses = await Promise.all(uploadPromises);
    const fileURLs = uploadedResponses.map(res => res.secure_url);

    saveBtn.textContent = "กำลังบันทึกข้อมูล...";

    // 2. รวบรวมข้อมูลทั้งหมดเพื่อส่งไป Firebase
    const formDataForFirebase = {
      location: document.getElementById("location").value,
      mountain: document.getElementById("mountain").value,
      coffeeAge: document.getElementById("coffeeAge").value,
      testDate: document.getElementById("testDate").value,
      testNumber: document.getElementById("testNumber").value,
      ph: parseFloat(document.getElementById("ph").value),
      om: parseFloat(document.getElementById("om").value),
      n: parseFloat(document.getElementById("n").value),
      p: parseFloat(document.getElementById("p").value),
      k: parseFloat(document.getElementById("k").value),
      ec: parseFloat(document.getElementById("ec").value),
      moisture: parseFloat(document.getElementById("moisture").value),
      temperature: parseFloat(document.getElementById("temperature").value),
      files: fileURLs, // <-- URL จาก Cloudinary
      createdAt: new Date()
    };

    // 3. บันทึกข้อมูลลง Firestore
    await db.collection("soil_tests").add(formDataForFirebase);
    
    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    // กลับไปหน้า Home หลังจากบันทึกเสร็จ
    window.location.href = "index.html";

  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล!");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "บันทึกข้อมูล";
  }
});
