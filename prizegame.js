document.addEventListener("DOMContentLoaded", function () {

(function() {

    // ================== CONFIG ==================
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8SInfWJv3A2mSkf4RA7ALWlKFnKVfZUdZQ4PXA8JEo3Y6bVuiXCRmwARPNT2XGrVR/exec"; // ใส่ URL Apps Script ของคุณ
    const SPREADSHEET_ID = '1cXn3MeDVm9aXizyrHZ5wg1YO-KXRu_miLLwKwPnt3-o';
    const API_KEY = 'AIzaSyCx48x1ZIramjylyvWWXBLDMButbXyxzNM';
    const SHEET_NAME = 'memberlist';
    // ============================================

    const container = document.getElementById('prize-game-container');
    if (!container) return;

    const startBtn = container.querySelector('#start-btn');
    const stopBtn = container.querySelector('#stop-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    let prizeData = null;
    let selectedPrize = null;

    // รางวัลสุ่มแบบเยอะ
    const spinItems = [
        "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท","🧧 388 บาท",
        "🧧 488 บาท","🧧 588 บาท","🧧 688 บาท","🧧 788 บาท","🧧 888 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","❌ ไม่ได้ของรางวัล"
    ];

    // ================= Load Google Sheets =================
    async function loadPrizeData() {
        statusDiv.textContent = "⏳ กำลังโหลดข้อมูล...";
        try {
            const range = `${SHEET_NAME}!A:C`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
            const resp = await fetch(url);
            const data = await resp.json();
            prizeData = data.values || [];
            if(prizeData.length > 0) prizeData.shift(); // ลบ header
            statusDiv.textContent = `🎉พร้อมเล่น ขอให้โชคดีค่ะ!`;
        } catch(e) {
            console.error(e);
            // fallback ข้อมูลตัวอย่าง
            prizeData = [
                ['lan94774', '188 บาท', 'YES'],
                ['testuser', '288 บาท', ''],
                ['demo123', '88 บาท', ''],
                ['guest', 'ไม่ได้ของรางวัล', '']
            ];
            statusDiv.textContent = "⚠️ ใช้ข้อมูลตัวอย่าง";
        }
    }
    loadPrizeData();

    // ================= Helper =================
    function getUserRow(username){
        return prizeData.find(r => r[0]?.toLowerCase() === username.toLowerCase());
    }

    // ================== Spin Animation ==================
    function spinAnimation(selectedPrize){
        let speed = 50;
        let spinCount = 0;

        prizeDisplay.classList.add("spinning");

        function spinStep(){
            prizeDisplay.textContent = spinItems[Math.floor(Math.random()*spinItems.length)];
            spinCount++;
            if(spinCount > 20) speed += 15; // ชะลอ
            if(spinCount < 40){
                setTimeout(spinStep, speed);
            } else {
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent = selectedPrize;
            }
        }
        spinStep();
    }

    // ================== Start Button ==================
    startBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const userRow = getUserRow(username);
        if(!userRow) return alert("ไม่พบชื่อในระบบ");

        if(userRow[2]==="YES"){
            prizeDisplay.textContent = `คุณเล่นแล้ว ได้: ${userRow[1]}`;
            startBtn.disabled = true;
            return;
        }

        selectedPrize = userRow[1] || "ไม่ได้ของรางวัล";

        prizeDisplay.innerHTML = "🎰 กำลังสุ่ม...";
        startBtn.style.display = "none";
        stopBtn.style.display = "block";

        spinAnimation(selectedPrize);
    });

    // ================== Stop Button ==================
    stopBtn.addEventListener('click', async () => {

        stopBtn.style.display = "none";
        startBtn.textContent = "เล่นแล้ว";
        startBtn.disabled = true;
        startBtn.style.display = "block";

        // เอฟเฟกต์ถูกรางวัล
        if(selectedPrize !== "ไม่ได้ของรางวัล"){
            prizeDisplay.style.color = "gold";
            prizeDisplay.style.fontSize = "32px";
            prizeDisplay.style.transform = "scale(1.2)";
            prizeDisplay.classList.add("win-effect");

            for(let i=0;i<8;i++){
                const firework = document.createElement("div");
                firework.className = "firework";
                firework.style.top = Math.random()*100 + "%";
                firework.style.left = Math.random()*100 + "%";
                container.appendChild(firework);
                setTimeout(()=>firework.remove(),1000);
            }

            setTimeout(()=>{prizeDisplay.style.transform="scale(1)";},500);
        }

        const username = usernameInput.value.trim();

        // บันทึกผลกลับ Apps Script
        try{
            await fetch(SCRIPT_URL,{
                method:"POST",
                body: JSON.stringify({username, prize:selectedPrize})
            });
        }catch(e){ console.error("บันทึกผลล้มเหลว", e); }

        statusDiv.textContent = "✅ บันทึกผลเรียบร้อยแล้ว";
    });

})();
});
