// ================== CONFIG ==================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrAbrWLUyu6Nlnz1iVPx5GFLhuPlX057M4dEyTFqNrs7-BkzYvRnQ4gZGXHe81W1YG/exec"; 
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
    const spinItems = [
        "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า"
    ];

    function createLineButton(){
        if(document.getElementById("line-contact-btn")) return;
        const lineBtn = document.createElement("a");
        lineBtn.id = "line-contact-btn";
        lineBtn.className = "line-btn pulse";
        lineBtn.target = "_blank";
        lineBtn.href = "https://line.me/R/ti/p/@685pkvqa";
        lineBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" class="line-icon"> ติดต่อเจ้าหน้าที่ผ่าน LINE';
        container.appendChild(lineBtn);
    }

    function showResult(prize){
        createLineButton();
        if(prize.includes("ลุ้นใหม่")){
            prizeDisplay.style.color = "#fff";
            statusDiv.innerHTML = "📸 กรุณาแคปหน้าจอผลลัพธ์นี้เพื่อรับสิทธิ์ในครั้งต่อไป";
            return;
        }
        prizeDisplay.style.color = "gold";
        statusDiv.innerHTML = "🎉 กรุณาแคปหน้าจอผลลัพธ์นี้และติดต่อเจ้าหน้าที่เพื่อรับรางวัล";

        // เอฟเฟกต์เล็กๆ
        for(let i=0;i<8;i++){
            const firework = document.createElement("div");
            firework.className = "firework";
            firework.style.top = Math.random()*100 + "%";
            firework.style.left = Math.random()*100 + "%";
            container.appendChild(firework);
            setTimeout(()=>firework.remove(),1000);
        }
    }

    function spinAnimation(fakePrize, callback){
        let speed = 50;
        let spinCount = 0;
        prizeDisplay.classList.add("spinning");

        function step(){
            prizeDisplay.textContent = spinItems[Math.floor(Math.random()*spinItems.length)];
            spinCount++;
            if(spinCount > 20) speed += 15;
            if(spinCount < 40){
                setTimeout(step, speed);
            } else {
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent = fakePrize;
                callback();
            }
        }
        step();
    }

    startBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        startBtn.disabled = true;
        const fakePrize = spinItems[Math.floor(Math.random()*spinItems.length)];
        prizeDisplay.textContent = "🎰 กำลังสุ่ม...";

        // สปินโชว์แบบปลอมก่อน
        spinAnimation(fakePrize, async () => {
            try{
                const resp = await fetch(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({username})
                });
                const data = await resp.json();

                if(data.status === "notfound"){
                    prizeDisplay.textContent = "❌ ไม่พบชื่อในระบบ";
                    statusDiv.textContent = "กรุณาตรวจสอบยูสเซอร์เนมอีกครั้ง";
                    startBtn.disabled = false;
                    return;
                }

                selectedPrize = data.prize || "🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า";
                prizeDisplay.textContent = selectedPrize;

                if(data.status === "played"){
                    statusDiv.textContent = "คุณเล่นไปแล้ว";
                } else {
                    showResult(selectedPrize);
                }

            } catch(e){
                console.error("ส่งข้อมูลไป Apps Script ล้มเหลว", e);
                prizeDisplay.textContent = "⚠️ เกิดข้อผิดพลาด";
                statusDiv.textContent = "ลองรีเฟรชหน้าจอแล้วเล่นอีกครั้ง";
            }
        });
    });

})();
});
