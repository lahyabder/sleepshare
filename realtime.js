// الاتصال مع السيرفر
const socket = io("https://sleepshare-backend.onrender.com", {
  transports: ["websocket"],
  timeout: 10000,
});

// الغرفة الحالية
let currentRoom = "Global";

// عناصر من الصفحة
const roomNameSpan = document.getElementById("current-room-name");
const sleepersCountSpan = document.getElementById("sleepers-count");
const roomButtons = document.querySelectorAll(".room-btn");
const joinButton = document.getElementById("join-sleep-btn");
const mapBox = document.getElementById("sleep-map");

// قيم مؤقتة للمستخدم
let ephemeralId = "EPH-" + Math.random().toString(36).substring(2, 10);
let geoCell = "SA-RIY";
let moodSymbol = "Wave";

// 1) تغيير الغرفة
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentRoom = btn.getAttribute("data-room") || "Global";

    roomButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    roomNameSpan.textContent = currentRoom;
    sleepersCountSpan.textContent = "0";
    mapBox.innerHTML = "";
  });
});

// 2) عند الضغط على الانضمام للنوم
joinButton.addEventListener("click", () => {
  socket.emit("join_sleep_session", {
    ephemeralId,
    geoCell,
    chosenRoom: currentRoom,
    moodSymbol,
  });

  console.log("Joined room:", currentRoom);
});

// 3) استقبال تحديث الخريطة
socket.on("sleep_map_update", (sleepers) => {
  const count = sleepers.length || 0;
  sleepersCountSpan.textContent = String(count);

  // مسح النقاط القديمة
  mapBox.innerHTML = "";

  // رسم النقاط
  sleepers.forEach((s) => {
    const dot = document.createElement("div");
    dot.className = "sleep-dot";

    dot.style.position = "absolute";
    dot.style.width = "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "50%";
    dot.style.background = "#7dd3fc";

    dot.style.left = Math.random() * 90 + "%";
    dot.style.top = Math.random() * 90 + "%";

    mapBox.appendChild(dot);
  });
});

// 4) رسائل اتصال
socket.on("connect", () => {
  console.log("Connected to backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
  sleepersCountSpan.textContent = "0";
  mapBox.innerHTML = "";
});
