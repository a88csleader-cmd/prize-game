document.addEventListener("DOMContentLoaded", function () {

(function() {

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8SInfWJv3A2mSkf4RA7ALWlKFnKVfZUdZQ4PXA8JEo3Y6bVuiXCRmwARPNT2XGrVR/exec";

    const SPREADSHEET_ID = '1cXn3MeDVm9aXizyrHZ5wg1YO-KXRu_miLLwKwPnt3-o';
    const API_KEY = 'AIzaSyCx48x1ZIramjylyvWWXBLDMButbXyxzNM';
    const SHEET_NAME = 'memberlist';

    let intervalId;
    let selectedPrize = null;
    let prizeData = null;

    const container = document.getElementById('prize-game-container');
    if (!container) return;

    const startBtn = container.querySelector('#start-btn');
    const stopBtn = container.querySelector('#stop-btn');
    const prizeDisplay = container.querySelector('#prize-display');
    const usernameInput = container.querySelector('#username');
    const statusDiv = container.querySelector('#status');

    async function loadPrizeData() {
        const range = `${SHEET_NAME}!A:C`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();
        prizeData = data.values || [];
        if (prizeData.length > 0) prizeData.shift();
    }

    loadPrizeData();

    startBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim().toLowerCase();
        if (!username) return alert("กรุณาใส่ยูสเซอร์เนม");

        const userRow = prizeData.find(r => r[0]?.toLowerCase() === username);

        if (!userRow) {
            alert("ไม่พบชื่อในระบบ");
            return;
        }

        if (userRow[2] === "YES") {
            prizeDisplay.textContent = `คุณเคยเล่นแล้ว ได้: ${userRow[1]}`;
            startBtn.disabled = true;
            return;
        }

        selectedPrize = userRow[1] || "ไม่ได้ของรางวัล";

        prizeDisplay.innerHTML = "🎰 กำลังสุ่ม...";

        intervalId = setInterval(() => {
            const demo = ["88 บาท","188 บาท","288 บาท","ไม่ได้ของรางวัล"];
            prizeDisplay.textContent = demo[Math.floor(Math.random()*demo.length)];
        }, 80);

        startBtn.style.display = "none";
        stopBtn.style.display = "block";
    });

    stopBtn.addEventListener('click', async () => {

        clearInterval(intervalId);
        prizeDisplay.textContent = selectedPrize;

        // เอฟเฟกต์ถูกรางวัล
        if (selectedPrize !== "ไม่ได้ของรางวัล") {
            prizeDisplay.style.color = "gold";
            prizeDisplay.style.fontSize = "32px";
            prizeDisplay.style.transform = "scale(1.2)";
            setTimeout(() => {
                prizeDisplay.style.transform = "scale(1)";
            }, 500);
        }

        const username = usernameInput.value.trim().toLowerCase();

        await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
                username: username,
                prize: selectedPrize
            })
        });

        stopBtn.style.display = "none";
        startBtn.textContent = "เล่นแล้ว";
        startBtn.disabled = true;
        startBtn.style.display = "block";

        statusDiv.textContent = "บันทึกผลเรียบร้อยแล้ว";
    });

})();
});
