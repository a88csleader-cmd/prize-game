(function(){
    const container = document.getElementById('prize-game-container');
    if(!container) return;

    const startBtn = container.querySelector('#start-btn');
    const stopBtn = container.querySelector('#stop-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    // ================= CONFIG =================
    const CONFIG = {
        SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz8SInfWJv3A2mSkf4RA7ALWlKFnKVfZUdZQ4PXA8JEo3Y6bVuiXCRmwARPNT2XGrVR/exec", // <-- ใส่ URL Apps Script ของคุณ
        SPIN_ITEMS:[
            "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
            "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
            "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
            "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","❌ ไม่ได้ของรางวัล"
        ],
        DEFAULT_PRIZE: "ไม่ได้ของรางวัล"
    };
    // =========================================

    let selectedPrize = null;

    function spinAnimation(finalPrize){
        let speed=50, count=0;
        prizeDisplay.classList.add("spinning");
        function step(){
            prizeDisplay.textContent = CONFIG.SPIN_ITEMS[Math.floor(Math.random()*CONFIG.SPIN_ITEMS.length)];
            count++;
            if(count>20) speed+=15;
            if(count<40) setTimeout(step,speed);
            else {
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent = finalPrize;

                if(finalPrize!==CONFIG.DEFAULT_PRIZE){
                    prizeDisplay.classList.add("win-effect");
                    for(let i=0;i<8;i++){
                        const firework=document.createElement("div");
                        firework.className="firework";
                        firework.style.top=Math.random()*100+"%";
                        firework.style.left=Math.random()*100+"%";
                        container.appendChild(firework);
                        setTimeout(()=>firework.remove(),1000);
                    }
                }
            }
        }
        step();
    }

    function recordPlay(username, prize){
        // ส่งไป Google Apps Script
        fetch(CONFIG.SCRIPT_URL,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, prize: prize })
        })
        .then(res => res.json())
        .then(res => console.log("บันทึกสำเร็จ:", res))
        .catch(err => console.error("บันทึกไม่สำเร็จ:", err));

        // เก็บ localStorage กันรีเฟรช
        try{
            const played=JSON.parse(localStorage.getItem('prizeGame_played')||'{}');
            played[username.toLowerCase()]=prize;
            localStorage.setItem('prizeGame_played',JSON.stringify(played));
        }catch(e){}
    }

    function hasPlayed(username){
        try{
            const played=JSON.parse(localStorage.getItem('prizeGame_played')||'{}');
            return played[username.toLowerCase()];
        }catch(e){ return false; }
    }

    startBtn.addEventListener('click',()=>{
        const username=usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const previous=hasPlayed(username);
        if(previous){
            prizeDisplay.textContent=`คุณเล่นแล้ว ได้: ${previous}`;
            startBtn.disabled=true;
            return;
        }

        // เลือกรางวัลแบบสุ่ม
        selectedPrize=CONFIG.SPIN_ITEMS[Math.floor(Math.random()*CONFIG.SPIN_ITEMS.length)];

        prizeDisplay.innerHTML="🎰 กำลังสุ่ม...";
        startBtn.style.display="none";
        stopBtn.style.display="block";

        spinAnimation(selectedPrize);
    });

    stopBtn.addEventListener('click',()=>{
        stopBtn.style.display="none";
        startBtn.style.display="block";
        startBtn.textContent="เล่นแล้ว";
        startBtn.disabled=true;

        recordPlay(usernameInput.value.trim(), selectedPrize);

        statusDiv.textContent=`✅ บันทึกผลเรียบร้อย: ${usernameInput.value.trim()} ได้ ${selectedPrize}`;
    });

    usernameInput.addEventListener('keypress',(e)=>{
        if(e.key==='Enter' && !startBtn.disabled && startBtn.style.display!=='none') startBtn.click();
    });
})();
