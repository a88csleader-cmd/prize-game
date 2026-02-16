// ================== CONFIG ==================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrAbrWLUyu6Nlnz1iVPx5GFLhuPlX057M4dEyTFqNrs7-BkzYvRnQ4gZGXHe81W1YG/exec";
// ============================================

document.addEventListener("DOMContentLoaded", function () {
(function(){

    const container = document.getElementById('prize-game-container');
    if(!container) return;

    const startBtn = container.querySelector('#start-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    let prizeData = [
        ['lan94774', '188 บาท', 'YES'],
        ['testuser', '288 บาท', ''],
        ['demo123', '88 บาท', ''],
        ['guest', '🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า', '']
    ];

    let selectedPrize = null;

    const spinItems = [
        "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า"
    ];

    function getUserRow(username){
        return prizeData.find(r => r[0]?.toLowerCase() === username.toLowerCase());
    }

    function spinAnimation(selectedPrize){
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
                showWinEffect(selectedPrize);
            }
        }
        spinStep();
    }

    function createLineButton(){
        let lineBtn = document.getElementById("line-contact-btn");
        if(!lineBtn){
            lineBtn = document.createElement("a");
            lineBtn.id = "line-contact-btn";
            lineBtn.className = "line-btn pulse";
            lineBtn.target = "_blank";
            lineBtn.href = "https://line.me/R/ti/p/@685pkvqa"; // LINE OA ของคุณ
            lineBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" class="line-icon"> ติดต่อเจ้าหน้าที่ผ่าน LINE';
            container.appendChild(lineBtn);
        }
    }

    function showWinEffect(prize){
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
        prizeDisplay.style.transform = "scale(1.2)";
        prizeDisplay.classList.add("win-effect");

        statusDiv.innerHTML = "🎉 กรุณาแคปหน้าจอผลลัพธ์นี้และติดต่อเจ้าหน้าที่เพื่อรับรางวัล";
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

        setTimeout(()=>{ prizeDisplay.style.transform="scale(1)"; },600);
    }

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

        selectedPrize = userRow[1] || "🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า";
        prizeDisplay.innerHTML = "🎰 กำลังสุ่ม...";
        startBtn.disabled = true;
        spinAnimation(selectedPrize);

        // ส่งผลลัพธ์กลับ Apps Script
        fetch(SCRIPT_URL,{
            method:"POST",
            body: JSON.stringify({username, prize:selectedPrize})
        }).catch(e=>console.error(e));
    });

})();
