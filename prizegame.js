document.addEventListener("DOMContentLoaded", function () {

(function() {

    // ================== CONFIG ==================
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrAbrWLUyu6Nlnz1iVPx5GFLhuPlX057M4dEyTFqNrs7-BkzYvRnQ4gZGXHe81W1YG/exec";
    // ============================================

    const container = document.getElementById('prize-game-container');
    if (!container) return;

    const startBtn = container.querySelector('#start-btn');
    const stopBtn = container.querySelector('#stop-btn'); // ถ้ายังมีใน HTML
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

function createLineButton(username, prize){

    let lineBtn = document.getElementById("line-contact-btn");

    const message =
`แจ้งรับสิทธิ์กิจกรรมอั่งเปา
Username: ${username}
ผลรางวัล: ${prize}`;

    const encodedMessage = encodeURIComponent(message);

    // 🔥 ใช้ลิงก์ OA ของคุณ
    const lineURL = `https://lin.ee/Nb2TD8R?text=${encodedMessage}`;

    if(!lineBtn){
        lineBtn = document.createElement("a");
        lineBtn.id = "line-contact-btn";
        lineBtn.className = "line-btn pulse";
        lineBtn.target = "_blank";
        container.appendChild(lineBtn);
    }

    lineBtn.href = lineURL;

    lineBtn.innerHTML = `
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" 
             class="line-icon">
        แจ้งผ่าน LINE
    `;

    // auto copy ข้อความไว้ใน clipboard ด้วย
    navigator.clipboard.writeText(message).catch(()=>{});
}


    if (stopBtn) stopBtn.style.display = "none";

    let isPlaying = false;

    // รายการสุ่มเพื่อทำ animation เท่านั้น (ไม่ใช่รางวัลจริง)
    const spinItems = [
        "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่",
        "❌ ไม่ได้ของรางวัล"
    ];

    // ================== Animation ==================
    function spinAnimation(finalPrize){

        let speed = 60;
        let spinCount = 0;

        prizeDisplay.classList.add("spinning");

        function spinStep(){
            prizeDisplay.textContent =
                spinItems[Math.floor(Math.random()*spinItems.length)];

            spinCount++;

            if(spinCount > 20) speed += 20; // ค่อยๆช้าลง

            if(spinCount < 45){
                setTimeout(spinStep, speed);
            } else {
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent = finalPrize;
                showWinEffect(finalPrize);
            }
        }

        spinStep();
    }

    // ================== เอฟเฟกต์ตอนถูกรางวัล ==================
function showWinEffect(prize){

    const username = usernameInput.value.trim();

    // สร้างปุ่ม LINE
    createLineButton(username, prize);

    // กรณีลุ้นใหม่
    if(prize.includes("ลุ้นใหม่")){

        prizeDisplay.style.color = "#fff";
        prizeDisplay.classList.remove("win-effect");

        statusDiv.innerHTML =
            "🧧 ขอขอบคุณที่ร่วมกิจกรรม ลุ้นใหม่ในครั้งถัดไปนะคะ 💖";

        statusDiv.style.color = "#FFD700";
        statusDiv.style.fontWeight = "bold";
        return;
    }

    // กรณีได้รางวัล
    prizeDisplay.style.color = "gold";
    prizeDisplay.style.transform = "scale(1.2)";
    prizeDisplay.classList.add("win-effect");

    statusDiv.innerHTML =
        "🎉 ยินดีด้วยค่ะ! กรุณากดปุ่มด้านล่างเพื่อแจ้งรับสิทธิ์";

    statusDiv.style.color = "#FFD700";
    statusDiv.style.fontWeight = "bold";

    for(let i=0;i<8;i++){
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.top = Math.random()*100 + "%";
        firework.style.left = Math.random()*100 + "%";
        container.appendChild(firework);
        setTimeout(()=>firework.remove(),1000);
    }

    setTimeout(()=>{
        prizeDisplay.style.transform="scale(1)";
    },600);
}



    // ================== ปุ่มเริ่ม ==================
    startBtn.addEventListener('click', async () => {

        if(isPlaying) return;

        const username = usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        isPlaying = true;
        startBtn.disabled = true;
        statusDiv.textContent = "⏳ กำลังตรวจสอบข้อมูล...";

        // ทำให้ดูเหมือนกำลังสุ่ม
        prizeDisplay.textContent = "🎰 กำลังสุ่ม...";
        
        try{

            // หน่วงเวลาเล็กน้อยให้ดูสมจริง
            await new Promise(r => setTimeout(r, 1200));

            const resp = await fetch(SCRIPT_URL,{
                method:"POST",
                body: JSON.stringify({username})
            });

            const result = await resp.json();

            if(result.status === "notfound"){
                alert("ไม่พบชื่อในระบบ");
                resetGame();
                return;
            }

            if(result.status === "played"){
                prizeDisplay.textContent = 
                    `คุณเล่นแล้ว ได้: ${result.prize}`;
                statusDiv.textContent = "⚠️ บัญชีนี้เล่นแล้ว";
                return;
            }

            // เริ่ม animation แล้วไปหยุดที่รางวัลจริง
            spinAnimation(result.prize);

            statusDiv.textContent = "✅ บันทึกผลเรียบร้อยแล้ว";

        }catch(e){
            console.error(e);
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
            resetGame();
        }

    });

    // ================== Reset ==================
    function resetGame(){
        isPlaying = false;
        startBtn.disabled = false;
        prizeDisplay.textContent = "🎁 กดเริ่มเพื่อเล่น";
        statusDiv.textContent = "";
    }

})();
});
