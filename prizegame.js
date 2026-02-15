(function() {
    const container = document.getElementById('prize-game-container');
    if(!container) return;

    const startBtn = container.querySelector('#start-btn');
    const stopBtn = container.querySelector('#stop-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    // ---------------- CONFIG ----------------
    const CONFIG = {
        SPREADSHEET_ID: '1cXn3MeDVm9aXizyrHZ5wg1YO-KXRu_miLLwKwPnt3-o',
        API_KEY: 'AIzaSyCx48x1ZIramjylyvWWXBLDMButbXyxzNM',
        SHEET_NAME: 'memberlist',
        DEFAULT_PRIZE: 'ไม่ได้ของรางวัล'
    };
    // ----------------------------------------

    let prizeData = null;  // จะโหลดจาก Google Sheets
    let selectedPrize = null;

    const spinItems = [
        "🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท",
        "🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท",
        "🧧 168 บาท","🧧 188 บาท","🧧 288 บาท",
        "💰 อั่งเปาพิเศษ","🎁 ของขวัญปีใหม่","❌ ไม่ได้ของรางวัล"
    ];

    // ---------------- ฟังก์ชัน ----------------
    function decodeThaiText(text){
        if(!text || typeof text !== 'string') return text;
        const textarea=document.createElement('textarea');
        let decoded=text;
        let maxLoops=3;
        while(decoded.includes('&#') && maxLoops>0){
            textarea.innerHTML=decoded;
            decoded=textarea.value;
            maxLoops--;
        }
        decoded=decoded.replace(/&#(\d+);/g,(m,d)=>String.fromCharCode(parseInt(d,10)));
        return decoded;
    }

    async function loadPrizeData(){
        statusDiv.innerHTML='⏳ กำลังโหลดข้อมูล...';
        try{
            const url=`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}!A:B?key=${CONFIG.API_KEY}`;
            const res = await fetch(url);
            if(!res.ok) throw new Error(res.status);
            const data = await res.json();
            if(data.values && data.values.length>0){
                prizeData = data.values.map(row => row.map(decodeThaiText));
                // ข้าม header
                if(prizeData[0][0] && prizeData[0][0].toLowerCase().includes('user')) prizeData.shift();
            } else prizeData = [];
            statusDiv.textContent=`🎉 พร้อมเล่นแล้ว! โหลดข้อมูล ${prizeData.length} รายการ`;
        } catch(e){
            console.error(e);
            statusDiv.textContent="⚠️ โหลดข้อมูลไม่ได้ ใช้ตัวอย่างแทน";
            prizeData=[
                ['lan94774','188 บาท','NO'],
                ['testuser','288 บาท','NO'],
                ['demo123','88 บาท','NO'],
                ['guest',CONFIG.DEFAULT_PRIZE,'NO']
            ];
        }
    }

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

    function hasPlayed(username){
        try{
            const played = JSON.parse(localStorage.getItem('prizeGame_played')||'{}');
            return played[username.toLowerCase()];
        }catch(e){return false;}
    }

    function recordPlay(username, prize){
        try{
            const played=JSON.parse(localStorage.getItem('prizeGame_played')||'{}');
            played[username.toLowerCase()]=prize;
            localStorage.setItem('prizeGame_played',JSON.stringify(played));
        }catch(e){}
    }

    // ---------------- Event ----------------
    startBtn.addEventListener('click',()=>{
        const username=usernameInput.value.trim();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");
        if(!prizeData) return alert("ข้อมูลยังโหลดไม่เสร็จ");

        const previous=hasPlayed(username);
        if(previous){
            prizeDisplay.textContent=`คุณเล่นแล้ว ได้: ${previous}`;
            startBtn.disabled=true;
            return;
        }

        const row=getUserRow(username);
        selectedPrize=row ? row[1] : CONFIG.DEFAULT_PRIZE;

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

        prizeDisplay.textContent = selectedPrize;
        if(selectedPrize !== CONFIG.DEFAULT_PRIZE){
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

        recordPlay(usernameInput.value.trim(), selectedPrize);

        statusDiv.textContent=`✅ บันทึกผลเรียบร้อยแล้ว: ${usernameInput.value.trim()} ได้ ${selectedPrize}`;
    });

    usernameInput.addEventListener('keypress',(e)=>{
        if(e.key==='Enter' && !startBtn.disabled && startBtn.style.display!=='none') startBtn.click();
    });

    // ---------------- เริ่มโหลดข้อมูล ----------------
    loadPrizeData();
})();
