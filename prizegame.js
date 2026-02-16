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

    function spinAnimation(prize){
        prizeDisplay.classList.add("spinning");
        let spinCount = 0;
        let speed = 50;

        function step(){
            prizeDisplay.textContent = spinItems[Math.floor(Math.random()*spinItems.length)];
            spinCount++;
            if(spinCount > 20) speed += 15;
            if(spinCount < 40){
                setTimeout(step, speed);
            } else {
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent = prize;
                showResult(prize);
            }
        }
        step();
    }

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
    }

    startBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const row = getUserRow(username);
        if(!row) return alert("ไม่พบชื่อในระบบ");

        if(row[2] === "YES"){
            prizeDisplay.textContent = `คุณเล่นแล้ว ได้: ${row[1]}`;
            startBtn.disabled = true;
            return;
        }

        selectedPrize = row[1] || "🧧 ลุ้นใหม่ในกิจกรรมครั้งหน้า";
        prizeDisplay.textContent = "🎰 กำลังสุ่ม...";
        startBtn.disabled = true;

        spinAnimation(selectedPrize);
    });
  })();
});
