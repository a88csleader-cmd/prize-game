(function(){
    const container=document.getElementById('prize-game-container');
    const startBtn=container.querySelector('#start-btn');
    const stopBtn=container.querySelector('#stop-btn');
    const prizeDisplay=container.querySelector('#prize-display');
    const usernameInput=container.querySelector('#username');
    const statusDiv=container.querySelector('#status');

    const CONFIG={ SCRIPT_URL:"https://script.google.com/macros/s/AKfycbyzoMlwucM_LuOc2KA7X6w-oGHVi_7YTYSzUPpOobZ44VEtP9Wt4MO4ti586Y396yD6/exec", DEFAULT_PRIZE:"ไม่ได้ของรางวัล" };

    let selectedPrize=null;

    function spinAnimation(finalPrize){
        let speed=50,count=0;
        prizeDisplay.classList.add("spinning");
        const spinItems=["🧧 8 บาท","🧧 18 บาท","🧧 28 บาท","🧧 38 บาท","🧧 58 บาท","🧧 68 บาท","🧧 88 บาท","🧧 128 บาท","🧧 168 บาท","🧧 188 บาท","🧧 288 บาท","❌ ไม่ได้ของรางวัล"];
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

    function recordPlay(username, prize){
        fetch(CONFIG.SCRIPT_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username:username,prize:prize})
        })
        .then(res=>res.json())
        .then(res=>{
            if(res.status==="error"){
                alert(res.message);
                prizeDisplay.textContent="❌ ไม่สามารถเล่นได้";
                startBtn.style.display="block"; stopBtn.style.display="none";
            }
        })
        .catch(err=>console.error("บันทึกไม่สำเร็จ",err));

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
        }catch(e){return false;}
    }

    startBtn.addEventListener('click',()=>{
        const username=usernameInput.value.trim().toLowerCase();
        if(!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const previous=hasPlayed(username);
        if(previous){ prizeDisplay.textContent=`คุณเล่นแล้ว ได้: ${previous}`; startBtn.disabled=true; return;}

        prizeDisplay.innerHTML="🎰 กำลังสุ่ม...";
        startBtn.style.display="none"; stopBtn.style.display="block";

        // เรียก Apps Script เพื่อเช็ค username และดึง prize
        fetch(CONFIG.SCRIPT_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username:username,prize:""})
        })
        .then(res=>res.json())
        .then(res=>{
            if(res.status==="error"){
                alert(res.message);
                prizeDisplay.textContent="❌ ไม่สามารถเล่นได้";
                startBtn.style.display="block"; stopBtn.style.display="none";
                return;
            }
            selectedPrize=res.prize || CONFIG.DEFAULT_PRIZE;
            spinAnimation(selectedPrize);
        })
        .catch(err=>{
            console.error(err);
            prizeDisplay.textContent="⚠️ เกิดข้อผิดพลาด";
            startBtn.style.display="block"; stopBtn.style.display="none";
        });
    });

    stopBtn.addEventListener('click',()=>{
        stopBtn.style.display="none"; startBtn.style.display="block";
        startBtn.textContent="เล่นแล้ว"; startBtn.disabled=true;
        recordPlay(usernameInput.value.trim(),selectedPrize);
    });

})();
