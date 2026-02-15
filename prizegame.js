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

        // รายการรางวัลสำหรับสุ่ม (เพิ่มรางวัลให้หลากหลาย)
        const prizes = [
            "🎉 88 บาท",
            "🎉 188 บาท", 
            "🎉 288 บาท",
            "😢 ไม่ได้ของรางวัล",
            "🎁 888 บาท",
            "🍫 ช็อกโกแลต",
            "🎫 ลุ้นโชค 500 บาท",
            "💝 กล่องสุ่ม",
            "🎊 88 บาท",
            "🎊 188 บาท",
            "🎊 288 บาท"
        ].map(text => decodeThaiText(text));
        
        const defaultPrize = decodeThaiText("😢 ไม่ได้ของรางวัล");

        let intervalId;
        let selectedPrize = null;
        let prizeData = null;
        let spinCount = 0;

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
                
                statusDiv.textContent = `พร้อมเล่นแล้ว! ขอให้โชคดีค่ะ`;
                
            } catch (error) {
                console.error("Error:", error);
                statusDiv.textContent = "⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูล";
                
                // ข้อมูลตัวอย่างเมื่อเชื่อมต่อไม่ได้
                prizeData = [
                    ['lan94774', '🎉 188 บาท'],
                    ['testuser', '🎉 288 บาท'],
                    ['demo123', '🎉 88 บาท'],
                    ['guest', '😢 ไม่ได้ของรางวัล'],
                    ['member1', '🎁 888 บาท'],
                    ['member2', '🍫 ช็อกโกแลต']
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

            // หารางวัลจาก username
            selectedPrize = defaultPrize;
            let found = false;
            
            for (const row of prizeData) {
                if (row[0] && row[0].trim().toLowerCase() === username) {
                    selectedPrize = row[1]?.trim() || defaultPrize;
                    found = true;
                    console.log(`พบรางวัลสำหรับ ${username}:`, selectedPrize);
                    break;
                }
            }
            
            if (!found) {
                console.log(`ไม่พบ ${username} ในรายการ`);
                statusDiv.textContent = `⚠️ ไม่พบ ${username} ในรายการ จะได้รับรางวัลเริ่มต้น`;
            }

            selectedPrize = decodeThaiText(selectedPrize);

            // หยุดการสุ่มเก่าถ้ามี
            if (intervalId) {
                clearInterval(intervalId);
            }

            // เริ่มสุ่มแบบไม่สิ้นสุด
            spinCount = 0;
            prizeDisplay.classList.add('spinning');
            prizeDisplay.innerHTML = '<span class="loading-spinner"></span> กำลังสุ่ม...';
            
            intervalId = setInterval(() => {
                spinCount++;
                // สุ่มรางวัลจากรายการ prizes
                const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
                prizeDisplay.textContent = randomPrize;
                
                // ทุก 20 ครั้ง แสดงข้อความเร็วๆ
                if (spinCount % 20 === 0) {
                    prizeDisplay.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        prizeDisplay.style.transform = 'scale(1)';
                    }, 50);
                }
            }, 80); // เปลี่ยนทุก 80 มิลลิวินาที

            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            statusDiv.textContent = 'กำลังสุ่ม... กด "หยุด" เพื่อรับรางวัล';
        });

        stopBtn.addEventListener('click', () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            
            prizeDisplay.classList.remove('spinning');
            prizeDisplay.textContent = selectedPrize;
            prizeDisplay.style.transform = 'scale(1)';

            const username = usernameInput.value.trim().toLowerCase();
            recordPlay(username, selectedPrize);

            startBtn.textContent = "เล่นแล้ว";
            startBtn.style.display = 'block';
            startBtn.disabled = true;
            stopBtn.style.display = 'none';
            
            statusDiv.textContent = `🎉 บันทึกแล้ว: ${username} ได้รับ ${selectedPrize}`;
            
            // เอฟเฟกต์เมื่อได้รางวัล
            prizeDisplay.style.backgroundColor = '#f0f8ff';
            setTimeout(() => {
                prizeDisplay.style.backgroundColor = '#f9f9f9';
            }, 500);
        });

        // กด Enter เพื่อเริ่ม
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && startBtn.style.display !== 'none' && !startBtn.disabled) {
                startBtn.click();
            }
        });

        // ป้องกันการคลิก stop ตอนที่ยังไม่เริ่ม
        stopBtn.addEventListener('click', function(e) {
            if (!intervalId) {
                e.preventDefault();
                return false;
            }
        });

        // รีเซ็ตถ้าผู้ใช้ออกจากหน้า
        window.addEventListener('beforeunload', function() {
            if (intervalId) {
                clearInterval(intervalId);
            }
        });
    })();
