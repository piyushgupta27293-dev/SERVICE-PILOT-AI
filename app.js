/* ==========================================
   SERVICEPILOT AI
   COMPLETE JAVASCRIPT
========================================== */

/* ---------- LOCAL STORAGE ---------- */

const USERS_KEY = "servicepilot_users";
const CURRENT_USER_KEY = "servicepilot_currentUser";
const BOOKINGS_KEY = "servicepilot_bookings";
const MESSAGES_KEY = "servicepilot_messages";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function getBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
}

/* ---------- ELEMENT SELECTOR ---------- */

const $ = (id) => document.getElementById(id);

/* ---------- NOTIFICATION ---------- */

let toastTimer;

function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ---------- SAFE HTML ---------- */

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

/* ==========================================
   1. PAGE NAVIGATION
========================================== */

function navigatePage() {
  const pageId = location.hash.replace("#", "") || "home";

  const pages = document.querySelectorAll(".page");

  let found = false;

  pages.forEach((page) => {
    const active = page.id === pageId;

    page.classList.toggle("active", active);

    if (active) found = true;
  });

  if (!found) {
    $("home").classList.add("active");
  }

  document.querySelectorAll(".navbar nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + pageId);
  });

  $("navbarMenu")?.classList.remove("show");

  if (pageId === "dashboard") {
    renderDashboard();
  }

  if (pageId === "login") {
    $("loginEmail")?.focus();
  }

  updateNavbar();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

window.addEventListener("hashchange", navigatePage);

/* ==========================================
   2. MOBILE NAVIGATION
========================================== */

$("menuToggle")?.addEventListener("click", () => {
  $("navbarMenu").classList.toggle("show");
});

/* ==========================================
   3. NAVBAR LOGIN / LOGOUT UPDATE
========================================== */

function updateNavbar() {
  const user = getCurrentUser();

  const navButtons = $("navButtons");

  if (!navButtons) return;

  if (user) {
    navButtons.innerHTML = `

            <span style="font-size:12px;font-weight:600;">
                Hi, ${escapeHTML(user.name.split(" ")[0])}
            </span>

            <a href="#dashboard" class="btn-outline">
                Dashboard
            </a>

            <a href="#logout" id="navLogout" class="btn-primary">
                Logout
            </a>

        `;

    $("navLogout").addEventListener("click", logoutUser);
  } else {
    navButtons.innerHTML = `

            <a href="#login" class="btn-outline">
                Login
            </a>

            <a href="#signup" class="btn-primary">
                Sign Up
            </a>

        `;
  }
}

/* ==========================================
   4. SIGNUP FUNCTION
========================================== */

$("signupForm")?.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = $("signupName").value.trim();

  const email = $("signupEmail").value.trim().toLowerCase();

  const password = $("signupPassword").value;

  const confirmPassword = $("confirmPassword").value;

  if (password.length < 6) {
    showToast("Password must contain at least 6 characters.");

    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match!");

    return;
  }

  const users = getUsers();

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    showToast("Email already registered. Please login.");

    return;
  }

  const newUser = {
    name,
    email,
    password,
  };

  users.push(newUser);

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      name,
      email,
    }),
  );

  this.reset();

  updateNavbar();

  showToast("Account created successfully!");

  location.hash = "#dashboard";
});

/* ==========================================
   5. LOGIN FUNCTION
========================================== */

$("loginForm")?.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();

  const password = $("loginPassword").value;

  const users = getUsers();

  const user = users.find(
    (item) => item.email === email && item.password === password,
  );

  if (!user) {
    showToast("Invalid email or password!");

    return;
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      name: user.name,
      email: user.email,
    }),
  );

  this.reset();

  updateNavbar();

  showToast("Login successful! Welcome back.");

  location.hash = "#dashboard";
});

/* ==========================================
   6. LOGOUT FUNCTION
========================================== */

function logoutUser(event) {
  if (event) event.preventDefault();

  localStorage.removeItem(CURRENT_USER_KEY);

  updateNavbar();

  showToast("You have logged out successfully!");

  location.hash = "#logout";
}

$("dashboardLogout")?.addEventListener("click", logoutUser);

/* ==========================================
   7. SERVICE BOOKING BUTTONS
========================================== */

document.querySelectorAll(".book-service").forEach((button) => {
  button.addEventListener("click", () => {
    const serviceName = button.dataset.service;

    $("bookingService").value = serviceName;

    location.hash = "#booking";
  });
});

/* ==========================================
   8. BOOKING DATE VALIDATION
========================================== */

const today = new Date();

const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

$("bookingDate")?.setAttribute("min", localToday);

/* ==========================================
   9. BOOKING SUBMISSION
========================================== */

$("bookingForm")?.addEventListener("submit", function (event) {
  event.preventDefault();

  const user = getCurrentUser();

  if (!user) {
    showToast("Please login before booking a service.");

    location.hash = "#login";

    return;
  }

  const selectedDate = $("bookingDate").value;

  if (selectedDate < localToday) {
    showToast("Please select a valid future date.");

    return;
  }

  const booking = {
    id: "SP" + Date.now().toString().slice(-8),

    name: $("customerName").value.trim(),

    email: user.email,

    service: $("bookingService").value,

    date: selectedDate,

    time: $("bookingTime").value,

    address: $("bookingAddress").value.trim(),

    description: $("bookingDescription").value.trim(),

    status: "Pending",

    createdAt: new Date().toISOString(),
  };

  const bookings = getBookings();

  bookings.unshift(booking);

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  this.reset();

  $("bookingDate").setAttribute("min", localToday);

  showToast("Your service booking is confirmed!");

  location.hash = "#dashboard";
});

/* ==========================================
   10. USER DASHBOARD
========================================== */

function renderDashboard() {
  const user = getCurrentUser();

  if (!user) {
    $("profileName").textContent = "Name: Guest";

    $("profileEmail").textContent = "Email: Not logged in";

    $("totalBookings").textContent = 0;

    $("pendingBookings").textContent = 0;

    $("completedBookings").textContent = 0;

    $("bookingList").innerHTML = `

            <p>Please login to view your booking history.</p>

            <a href="#login" class="btn-primary">
                Login Now
            </a>

        `;

    return;
  }

  const bookings = getBookings().filter(
    (booking) => booking.email === user.email,
  );

  $("profileName").textContent = "Name: " + user.name;

  $("profileEmail").textContent = "Email: " + user.email;

  $("totalBookings").textContent = bookings.length;

  $("pendingBookings").textContent = bookings.filter(
    (b) => b.status === "Pending",
  ).length;

  $("completedBookings").textContent = bookings.filter(
    (b) => b.status === "Completed",
  ).length;

  if (bookings.length === 0) {
    $("bookingList").innerHTML = `

            <div style="text-align:center;padding:25px;">

                <h3>No Bookings Yet!</h3>

                <p>Start booking your home services today.</p>

                <br>

                <a href="#services" class="btn-primary">
                    Explore Services
                </a>

            </div>

        `;

    return;
  }

  $("bookingList").innerHTML = bookings
    .map(
      (booking) => `

        <div class="booking-item">

            <div>

                <h3>${escapeHTML(booking.service)}</h3>

                <p>
                    Booking ID: ${escapeHTML(booking.id)}
                </p>

                <p>
                    Date: ${escapeHTML(booking.date)}
                </p>

                <p>
                    Time: ${escapeHTML(booking.time)}
                </p>

                <p>
                    Address: ${escapeHTML(booking.address)}
                </p>

            </div>

            <span class="booking-status">

                ${escapeHTML(booking.status)}

            </span>

        </div>

    `,
    )
    .join("");
}

/* ==========================================
   11. AI HOME-SERVICE ASSISTANT
========================================== */

/*
   This is a keyword-based AI assistant demo.
   Real AI responses require backend + AI API.
*/

function getAIResponse(message) {
  const text = message.toLowerCase();

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return `
            Hello! 👋 Welcome to ServicePilot AI.

            I can help you with:
            • Electrical problems
            • Plumbing issues
            • AC repair
            • Home cleaning
            • Appliance repair

            Tell me what problem you are facing!
        `;
  }

  if (
    text.includes("electric") ||
    text.includes("light") ||
    text.includes("fan") ||
    text.includes("switch") ||
    text.includes("wiring")
  ) {
    return `
            ⚡ Electrical Service Recommended!

            We suggest booking an Electrical Service.

            Our professional can help with:
            • Faulty switches
            • Fan installation
            • Lighting issues
            • Wiring problems

            Please avoid touching exposed wires.
            If you notice sparks or burning smells,
            switch off the main power if safe and
            contact a qualified electrician.

            Starting price: ₹299

            Would you like to book this service?
        `;
  }

  if (
    text.includes("water") ||
    text.includes("pipe") ||
    text.includes("leak") ||
    text.includes("tap") ||
    text.includes("plumb")
  ) {
    return `
            🔧 Plumbing Service Recommended!

            We suggest booking a Plumbing Service.

            Available solutions:
            • Water leakage
            • Tap repair
            • Pipe blockage
            • Bathroom fittings

            Starting price: ₹249

            Would you like to book a plumber?
        `;
  }

  if (
    text.includes("clean") ||
    text.includes("dust") ||
    text.includes("dirty")
  ) {
    return `
            🧹 Home Cleaning Recommended!

            Our cleaning service includes:

            • Deep home cleaning
            • Kitchen cleaning
            • Bathroom cleaning
            • General maintenance

            Starting price: ₹499

            Would you like to book cleaning?
        `;
  }

  if (
    text.includes("ac") ||
    text.includes("cooling") ||
    text.includes("air conditioner") ||
    text.includes("air conditioning")
  ) {
    return `
            ❄️ AC Repair Service Recommended!

            We can help with:

            • AC servicing
            • Filter cleaning
            • Cooling problems
            • AC maintenance

            Starting price: ₹399

            Would you like to book AC repair?
        `;
  }

  if (
    text.includes("paint") ||
    text.includes("wall") ||
    text.includes("colour") ||
    text.includes("color")
  ) {
    return `
            🎨 Painting Service Recommended!

            We can help with:

            • Interior painting
            • Exterior painting
            • Wall touch-ups
            • Colour consultation

            Would you like to book painting?
        `;
  }

  if (
    text.includes("fridge") ||
    text.includes("washing machine") ||
    text.includes("microwave") ||
    text.includes("appliance")
  ) {
    return `
            🪛 Appliance Repair Recommended!

            We suggest booking an Appliance Repair service.

            Our service covers common household appliance
            problems involving refrigerators, washing
            machines and microwaves.

            Would you like to book this service?
        `;
  }

  if (text.includes("book") || text.includes("booking")) {
    return `
            Great! Let's book your home service.

            Please open the Booking section and complete:

            1. Select a service.
            2. Choose your preferred date.
            3. Select a time slot.
            4. Enter your address.
            5. Confirm your booking.

            Click Booking in the navigation menu.
        `;
  }

  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("charge")
  ) {
    return `
            Here are our indicative starting prices:

            ⚡ Electrical: ₹299
            🔧 Plumbing: ₹249
            🧹 Cleaning: ₹499
            ❄️ AC Repair: ₹399
            🪛 Appliance Repair: ₹349

            Final charges may vary depending on
            the actual work required.
        `;
  }

  return `
        Thank you for sharing your problem!

        I can currently help identify these services:

        ⚡ Electrical
        🔧 Plumbing
        🧹 Cleaning
        ❄️ AC Repair
        🎨 Painting
        🪛 Appliance Repair

        Please describe your issue with a little
        more detail so I can suggest a suitable service.
    `;
}

/* ---------- CHAT MESSAGE DISPLAY ---------- */

function addChatMessage(message, type) {
  const chatMessages = $("chatMessages");

  const messageElement = document.createElement("div");

  messageElement.className = type === "user" ? "user-message" : "bot-message";

  // textContent safely displays user input
  messageElement.textContent = message;

  chatMessages.appendChild(messageElement);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ---------- CHAT FORM ---------- */

$("chatForm")?.addEventListener("submit", function (event) {
  event.preventDefault();

  const input = $("chatInput");

  const message = input.value.trim();

  if (!message) return;

  addChatMessage(message, "user");

  input.value = "";

  const response = getAIResponse(message);

  setTimeout(() => {
    addChatMessage(response, "bot");
  }, 500);
});

/* ==========================================
   12. CONTACT FORM
========================================== */

$("contactForm")?.addEventListener("submit", function (event) {
  event.preventDefault();

  const contact = {
    name: $("contactName").value.trim(),

    email: $("contactEmail").value.trim(),

    subject: $("contactSubject").value.trim(),

    message: $("contactMessage").value.trim(),

    date: new Date().toISOString(),
  };

  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");

  messages.push(contact);

  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

  this.reset();

  showToast("Thank you! Your message has been saved.");
});

/* ==========================================
   13. FOOTER / INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();

  navigatePage();

  console.log("ServicePilot AI website loaded successfully!");
});

/* ==========================================
   END OF SERVICEPILOT AI JAVASCRIPT
========================================== */
