    (function() {
        // ป้องกันการชนกับโค้ดอื่น
        if (window.prizeGameLoaded) return;
        window.prizeGameLoaded = true;

        // ----------------- ตั้งค่าของคุณที่นี่ -----------------
        const SPREADSHEET_ID = '1cXn3MeDVm9aXizyrHZ5wg1YO-KXRu_miLLwKwPnt3-o';
        const API_KEY = 'AIzaSyCx48x1ZIramjylyvWWXBLDMButbXyxzNM';
        const SHEET_NAME = 'memberlist';
        // ------------------------------------------------------------

        // ฟังก์ชันถอดรหัสภาษาไทย
        function decodeThaiText(text) {
            if (!text || typeof text !== 'string') return text;
            
            let decoded = text;
            
            // ใช้ textarea ถอด HTML entity
            const textarea = document.createElement('textarea');
            
            // ถอดซ้ำจนกว่าจะไม่มี entity เหลือ
            let maxLoops = 3;
            while (decoded.includes('&#') && maxLoops > 0) {
                textarea.innerHTML = decoded;
                decoded = textarea.value;
                maxLoops--;
            }
            
            // แปลง numeric character references
            decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
                return String.fromCharCode(parseInt(dec, 10));
            });
            
            return decoded;
        }

        const prizes = ["88 บาท", "188 บาท", "288 บาท", "ไม่ได้ของรางวัล"].map(text => decodeThaiText(text));
        const defaultPrize = decodeThaiText("ไม่ได้ของรางวัล");

        let intervalId;
        let selectedPrize = null;
        let prizeData = null;

        // ใช้ container เฉพาะ
        const container = document.getElementById('prize-game-container');
        const startBtn = container.querySelector('#start-btn');
        const stopBtn = container.querySelector('#stop-btn');
        const prizeDisplay = container.querySelector('#prize-display');
        const usernameInput = container.querySelector('#username');
        const statusDiv = container.querySelector('#status');

        // โหลดข้อมูลจาก Google Sheets
        async function loadPrizeData() {
            statusDiv.innerHTML = '<span class="loading-spinner"></span> กำลังโหลดข้อมูล...';
            try {
                const range = `${SHEET_NAME}!A:B`;
                const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`ไม่สามารถโหลดข้อมูลได้ (${response.status})`);
                }
                
                const data = await response.json();
                
                if (data.values && data.values.length > 0) {
                    prizeData = data.values.map(row => 
                        row.map(cell => decodeThaiText(cell))
                    );
                    
                    // ข้าม header
                    if (prizeData.length > 0 && prizeData[0][0] && 
                        (prizeData[0][0].toLowerCase().includes('username') || 
                         prizeData[0][0].toLowerCase().includes('user'))) {
                        prizeData.shift();
                    }
                } else {
                    prizeData = [];
                }
                
                statusDiv.textContent = `พร้อมเล่นแล้ว!`;
                
            } catch (error) {
                console.error("Error:", error);
                statusDiv.textContent = "⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูล";
                
                // ข้อมูลตัวอย่างเมื่อเชื่อมต่อไม่ได้
                prizeData = [
                    ['lan94774', '188 บาท'],
                    ['testuser', '288 บาท'],
                    ['demo123', '88 บาท'],
                    ['guest', 'ไม่ได้ของรางวัล']
                ].map(row => row.map(cell => decodeThaiText(cell)));
                
                statusDiv.textContent += " ใช้ข้อมูลตัวอย่าง";
            }
        }

        loadPrizeData();

        // ฟังก์ชันเช็คการเล่น (ใช้ localStorage)
        function hasPlayed(username) {
            try {
                const played = JSON.parse(localStorage.getItem('prizeGame_played') || '{}');
                return played[username.toLowerCase()];
            } catch (e) {
                return false;
            }
        }

        function recordPlay(username, prize) {
            try {
                const played = JSON.parse(localStorage.getItem('prizeGame_played') || '{}');
                played[username.toLowerCase()] = prize;
                localStorage.setItem('prizeGame_played', JSON.stringify(played));
            } catch (e) {}
        }

        startBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim().toLowerCase();
            if (!username) {
                alert("กรุณาใส่ยูสเซอร์เนม");
                return;
            }
            
            if (!prizeData) {
                alert("กำลังโหลดข้อมูล กรุณารอสักครู่");
                return;
            }

            // เช็คเล่นแล้ว
            const previous = hasPlayed(username);
            if (previous) {
                const decodedPrize = decodeThaiText(previous);
                prizeDisplay.textContent = `คุณเล่นแล้ว ได้: ${decodedPrize}`;
                startBtn.textContent = "เล่นแล้ว";
                startBtn.disabled = true;
                return;
            }

            // หารางวัล
            selectedPrize = defaultPrize;
            for (const row of prizeData) {
                if (row[0] && row[0].trim().toLowerCase() === username) {
                    selectedPrize = row[1]?.trim() || defaultPrize;
                    break;
                }
            }
            selectedPrize = decodeThaiText(selectedPrize);

            // เริ่มสุ่ม
            prizeDisplay.innerHTML = '<span class="loading-spinner"></span> กำลังสุ่ม...';
            intervalId = setInterval(() => {
                prizeDisplay.textContent = prizes[Math.floor(Math.random() * prizes.length)];
            }, 80);

            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
        });

        stopBtn.addEventListener('click', () => {
            clearInterval(intervalId);
            prizeDisplay.textContent = selectedPrize;

            const username = usernameInput.value.trim().toLowerCase();
            recordPlay(username, selectedPrize);

            startBtn.textContent = "เล่นแล้ว";
            startBtn.style.display = 'block';
            startBtn.disabled = true;
            stopBtn.style.display = 'none';
            statusDiv.textContent = `บันทึก: ${username} ได้รับ ${selectedPrize}`;
        });

        // กด Enter เพื่อเริ่ม
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && startBtn.style.display !== 'none' && !startBtn.disabled) {
                startBtn.click();
            }
        });
    })();
