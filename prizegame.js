(function() {
        // ================== CONFIG ==================
    const SCRIPT_URL = "YOUR_SCRIPT_URL"; // ใส่ URL Apps Script ของคุณ
    const SPREADSHEET_ID = '1cXn3MeDVm9aXizyrHZ5wg1YO-KXRu_miLLwKwPnt3-o';
    const API_KEY = 'AIzaSyCx48x1ZIramjylyvWWXBLDMButbXyxzNM';
    const SHEET_NAME = 'memberlist';
    // ============================================
    
    const container = document.getElementById('prize-game-container');
    if(!container) return;

    const startBtn = container.querySelector('#start-btn');
    const stopBtn = container.querySelector('#stop-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    let prizeData = [
        ['lan94774','188 บาท','NO'],
        ['testuser','288 บาท','NO'],
        ['demo123','88 บาท','NO'],
        ['guest','ไม่ได้ของรางวัล','NO']
    ]; // ตัวอย่างข้อมูล
    let selectedPrize = null;

    const spinItems = [
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
        "🧧 388 บาท","🧧 488 บาท","🧧 588 บาท",
        "🧧 688 บาท","🧧 788 บาท","🧧 888 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","❌ ไม่ได้ของรางวัล"
    ];

    function getUserRow(username){
        return prizeData.find(r => r[0].toLowerCase()===username.toLowerCase());
    }

    function spinAnimation(selectedPrize){
        let speed=50, count=0;
        prizeDisplay.classList.add("spinning");

        function step(){
            prizeDisplay.textContent = spinItems[Math.floor(Math.random()*spinItems.length)];
            count++;
            if(count>20) speed+=15;
            if(count<40) setTimeout(step,speed);
            else prizeDisplay.classList.remove("spinning"), prizeDisplay.textContent=selectedPrize;
        }
        step();
    }

    startBtn.addEventListener('click',()=>{
        const username=usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const row=getUserRow(username);
        if(!row) return alert("ไม่พบชื่อในระบบ");

        if(row[2]==="YES") {
            prizeDisplay.textContent = `คุณเล่นแล้ว ได้: ${row[1]}`;
            startBtn.disabled=true;
            return;
        }

        selectedPrize=row[1]||"ไม่ได้ของรางวัล";

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

        if(selectedPrize!=="ไม่ได้ของรางวัล"){
            prizeDisplay.style.color="#B22222";
            prizeDisplay.style.backgroundColor="gold";
            prizeDisplay.style.border="3px solid #FFD700";
            prizeDisplay.style.fontSize="32px";
            prizeDisplay.style.fontWeight="bold";
            prizeDisplay.style.padding="15px";
            prizeDisplay.style.borderRadius="12px";
            prizeDisplay.style.transform="scale(1.2)";
            prizeDisplay.classList.add("win-effect");

            for(let i=0;i<8;i++){
                const firework=document.createElement("div");
                firework.className="firework";
                firework.style.top=Math.random()*100+"%";
                firework.style.left=Math.random()*100+"%";
                container.appendChild(firework);
                setTimeout(()=>firework.remove(),1000);
            }

            setTimeout(()=>{prizeDisplay.style.transform="scale(1)";},500);
        }

        // บันทึกผล localStorage
        const username=usernameInput.value.trim();
        const row=getUserRow(username);
        if(row) row[2]="YES";

        statusDiv.textContent=`✅ บันทึกผลเรียบร้อยแล้ว: ${username} ได้ ${selectedPrize}`;
    });
})();
</script>
