// ================== CONFIG ==================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrAbrWLUyu6Nlnz1iVPx5GFLhuPlX057M4dEyTFqNrs7-BkzYvRnQ4gZGXHe81W1YG/exec"; // ตัวอย่าง: https://script.google.com/macros/s/xxx/exec
// ============================================

document.addEventListener("DOMContentLoaded", function () {
(function(){

    const container = document.getElementById('prize-game-container');
    if(!container){
        console.error("ไม่พบ #prize-game-container");
        return;
    }

    const startBtn = container.querySelector('#start-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    let selectedPrize = null;

    // รายการรางวัลแบบสุ่มโชว์ (ไม่ใช่รางวัลจริง)
    const spinItems = [
        "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า"
    ];

    // ================== Helper ==================
    function createLineButton(){
        if(document.getElementById("line-contact-btn")) return;
        const lineBtn = document.createElement("a");
        lineBtn.id = "line-contact-btn";
        lineBtn.className = "line-btn pulse";
        lineBtn.target = "_blank";
        lineBtn.href = "https://line.me/R/ti/p/@685pkvqa"; // LINE OA ของคุณ
        lineBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" class="line-icon"> ติดต่อเจ้าหน้าที่ผ่าน LINE';
        container.appendChild(lineBtn);
    }

    function showResult(prize){
        createLineButton();

        if(prize.includes("ลุ้นใหม่")){
            prizeDisplay.style.color = "#fff";
            prizeDisplay.classList.remove("win-effect");
            statusDiv.innerHTML = "📸 กรุณาแคปหน้าจอผลลัพธ์นี้เพื่อรับสิทธิ์ในครั้งต่อไป";
            statusDiv.style.color = "#FFD700";
            statusDiv.style.fontWeight = "bold";
            return;
        }

        prizeDisplay.style.color = "gold";
        prizeDisplay.classList.add("win-effect");
        statusDiv.innerHTML = "🎉 กรุณาแคปหน้าจอผลลัพธ์นี้และติดต่อเจ้าหน้าที่เพื่อรับรางวัล";
        statusDiv.style.color = "#FFD700";
        statusDiv.style.fontWeight = "bold";

        // พลุเล็ก ๆ
        for(let i=0;i<8;i++){
            const firework = document.createElement("div");
            firework.className = "firework";
            firework.style.top = Math.random()*100 + "%";
            firework.style.left = Math.random()*100 + "%";
            container.appendChild(firework);
            setTimeout(()=>firework.remove(),1000);
        }

        setTimeout(()=>{ prizeDisplay.style.transform="scale(1)"; },600);
    }

    // ================== Spin Animation ==================
    function spinAnimation(){
        let speed = 50;
        let spinCount = 0;
        prizeDisplay.classList.add("spinning");

        function spinStep(){
            prizeDisplay.textContent = spinItems[Math.floor(Math.random()*spinItems.length)];
            spinCount++;
            if(spinCount > 20) speed += 15;
            if(spinCount < 40){
                setTimeout(spinStep, speed);
            } else {
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent = selectedPrize;
                showResult(selectedPrize);
            }
        }
        spinStep();
    }

    // ================== Start Button ==================
    startBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        // แสดงรางวัลแบบสุ่มก่อน (fake) ให้เหมือนสุ่มจริง
        selectedPrize = spinItems[Math.floor(Math.random()*spinItems.length)];
        prizeDisplay.innerHTML = "🎰 กำลังสุ่ม...";
        startBtn.disabled = true;

        spinAnimation();

        // ส่งข้อมูลไป Apps Script เพื่อบันทึกรางวัลจริง
        try{
            await fetch(SCRIPT_URL, {
                method:"POST",
                body: JSON.stringify({username})
            });
        }catch(e){
            console.error("ส่งผลลัพธ์ไป Apps Script ล้มเหลว", e);
        }
    });

})();
});
