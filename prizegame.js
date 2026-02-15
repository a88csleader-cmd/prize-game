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
        SPREADSHEET_ID: "1cXn3MeDVm9aXizyrHZ5wg1YO-KXRu_miLLwKwPnt3-o", // Sheet ของคุณ
        SHEET_NAME: "memberlist",
        API_KEY: "AIzaSyCx48x1ZIramjylyvWWXBLDMButbXyxzNM",
        DEFAULT_PRIZE: "ไม่ได้ของรางวัล"
    };
    // =========================================

    let memberData = []; // [{username:"lan94774",prize:"188 บาท"},...]
    let selectedPrize = null;

    // ฟังก์ชันถอด HTML entity ภาษาไทย
    function decodeThai(text){ 
        if(!text) return text; 
        let ta=document.createElement('textarea'); ta.innerHTML=text; return ta.value.replace(/&#(\d+);/g,(m,d)=>String.fromCharCode(d)); 
    }

    // โหลดข้อมูลจาก Google Sheets
    async function loadSheetData(){
        statusDiv.textContent="⏳ กำลังโหลดข้อมูล...";
        try{
            const url=`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}!A:B?key=${CONFIG.API_KEY}`;
            const res=await fetch(url);
            const data=await res.json();
            if(data.values && data.values.length>1){
                memberData=data.values.slice(1).map(r=>({username:decodeThai(r[0]).trim().toLowerCase(), prize:decodeThai(r[1]).trim()}));
                statusDiv.textContent=`✅ พร้อมเล่นแล้ว! มี ${memberData.length} รายการ`;
            }else statusDiv.textContent="⚠️ ไม่พบข้อมูลสมาชิก";
        }catch(e){
            console.error(e);
            statusDiv.textContent="⚠️ โหลดข้อมูลไม่สำเร็จ";
        }
    }

    loadSheetData();

    function hasPlayed(username){
        try{
            const played=JSON.parse(localStorage.getItem('prizeGame_played')||'{}');
            return played[username.toLowerCase()];
        }catch(e){ return false; }
    }

    function recordPlay(username, prize){
        try{
            const played=JSON.parse(localStorage.getItem('prizeGame_played')||'{}');
            played[username.toLowerCase()]=prize;
            localStorage.setItem('prizeGame_played',JSON.stringify(played));
        }catch(e){}
    }

    function spinAnimation(finalPrize){
        let speed=50, count=0;
        prizeDisplay.classList.add("spinning");
        const spinItems = ["🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท","🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท","🧧 168 บาท","🧧 188 บาท","🧧 288 บาท","❌ ไม่ได้ของรางวัล"];
        function step(){
            prizeDisplay.textContent=spinItems[Math.floor(Math.random()*spinItems.length)];
            count++; if(count>20) speed+=15;
            if(count<40) setTimeout(step,speed);
            else{
                prizeDisplay.classList.remove("spinning");
                prizeDisplay.textContent=finalPrize;
                if(finalPrize!==CONFIG.DEFAULT_PRIZE){
                    prizeDisplay.classList.add("win-effect");
                    for(let i=0;i<8;i++){
                        const fw=document.createElement("div"); fw.className="firework";
                        fw.style.top=Math.random()*100+"%";
                        fw.style.left=Math.random()*100+"%";
                        container.appendChild(fw);
                        setTimeout(()=>fw.remove(),1000);
                    }
                }
            }
        }
        step();
    }

    startBtn.addEventListener('click',()=>{
        const username=usernameInput.value.trim().toLowerCase();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const previous=hasPlayed(username);
        if(previous){
            prizeDisplay.textContent=`คุณเล่นแล้ว ได้: ${previous}`;
            startBtn.disabled=true;
            return;
        }

        // หา prize จาก Sheet
        const member=memberData.find(m=>m.username===username);
        selectedPrize=member?member.prize:CONFIG.DEFAULT_PRIZE;

        prizeDisplay.innerHTML="🎰 กำลังสุ่ม...";
        startBtn.style.display="none"; stopBtn.style.display="block";
        spinAnimation(selectedPrize);
    });

    stopBtn.addEventListener('click',()=>{
        stopBtn.style.display="none"; startBtn.style.display="block";
        startBtn.textContent="เล่นแล้ว"; startBtn.disabled=true;
        recordPlay(usernameInput.value.trim(), selectedPrize);
        statusDiv.textContent=`✅ บันทึกผลเรียบร้อย: ${usernameInput.value.trim()} ได้ ${selectedPrize}`;
    });

    usernameInput.addEventListener('keypress',(e)=>{ if(e.key==='Enter' && !startBtn.disabled && startBtn.style.display!=='none') startBtn.click(); });

})();
