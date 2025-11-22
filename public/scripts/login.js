const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const dashboardView = document.getElementById('dashboard-view');


function showSignup() {
    loginView.classList.add('hidden-section');
    signupView.classList.remove('hidden-section');
    clearMessages();
}
function showLogin() {
    signupView.classList.add('hidden-section');
    loginView.classList.remove('hidden-section');
    clearMessages();
}

function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  // Simulate saving to database
  fetch("http://localhost:3000/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
      role: "2",
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Response:", data))
    .catch((error) => console.error("Error:", error));

  const users = JSON.parse(localStorage.getItem("campusUsers")) || [];

  // Show success
  const msgBox = document.getElementById("signup-message");
  msgBox.textContent = "Account created! Redirecting to login...";
  msgBox.className =
    "mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200";
  msgBox.classList.remove("hidden");

  setTimeout(() => {
    showLogin();
    // Pre-fill login for convenience
    document.getElementById("login-email").value = email;
  }, 1500);
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");

  try {
    const response = await fetch("http://localhost:3000/api/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    const validLogin = data.validLogin;

    let role = "student";
    if (email === "admin@admin.com") {
      role = "maintenance";
    }

    if (validLogin) {
      loginView.classList.add("hidden-section");
      dashboardView.classList.remove("hidden-section");

      const roleDisplay =
        role === "maintenance" ? "Maintenance Staff" : "Student/Faculty";

      document.getElementById("welcome-msg").innerHTML =
        `Welcome back!<br><span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-2 inline-block">${roleDisplay}</span>`;

      const maintenanceActions = document.getElementById("maintenance-actions");
      const dashboardActions = document.getElementById("dashboard-actions");

      if (role === "maintenance") {
        maintenanceActions.classList.remove("hidden");
        dashboardActions.classList.add("hidden");
      } else {
        maintenanceActions.classList.add("hidden");
        dashboardActions.classList.remove("hidden");
      }
    } else {
      errorBox.textContent = "Invalid email or password.";
      errorBox.classList.remove("hidden");
    }

  } catch (error) {
    console.error("Error:", error);
  }
}


//logout just leave
function handleLogout() {
    dashboardView.classList.add('hidden-section');
    loginView.classList.remove('hidden-section');
    clearMessages();
}

function clearMessages() {
    document.getElementById('signup-message').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
}

// // Add click handler to verify authentication before navigation
// document.addEventListener('DOMContentLoaded', function() {
//     const newRequestLink = document.querySelector('a[href="/report"]');
//     if (newRequestLink) {
//         newRequestLink.addEventListener('click', function(e) {
//             const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//             if (!currentUser.email) {
//                 e.preventDefault();
//                 alert('Please log in first');
//                 window.location.href = '/';
//             }
//         });
//     }
// });


// TERRIBLE, NEEDS TO BE A REAL PAGE!!!!!!!!!!!
function viewReports() {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Get reports from localStorage
    const reports = JSON.parse(localStorage.getItem('campusReports')) || [];
    
    // Filter reports for current user (or show all if admin/maintenance)
    const userReports = currentUser.role === 'maintenance' || currentUser.role === 'admin' 
        ? reports 
        : reports.filter(r => r.userId === currentUser.email);
    
    if (userReports.length === 0) {
        alert('No reports found. Submit a new request to get started!');
    } else {
        // Create a simple display of reports
        const reportList = userReports.map(r => 
            `\n${r.formattedTime || new Date(r.timestamp).toLocaleString()} - ${r.type} at ${r.location} (${r.status})`
        ).join('');
        alert(`You have ${userReports.length} report(s):${reportList}\n\nFull report viewing feature coming soon!`);
    }
}