const loginView = document.getElementById('login-view')
const signupView = document.getElementById('signup-view')
const dashboardView = document.getElementById('dashboard-view')
const dashboardActions = document.getElementById('dashboard-actions');
const reportsView = document.getElementById('reports-view');
const maintenanceActions = document.getElementById('maintenance-actions');


function showSignup() {
  loginView.classList.add('hidden-section')
  signupView.classList.remove('hidden-section')
  clearMessages()
}
function showLogin() {
  signupView.classList.add('hidden-section')
  loginView.classList.remove('hidden-section')
  clearMessages()
}

function handleSignup(e) {
  e.preventDefault()

  const name = document.getElementById('signup-name').value
  const email = document.getElementById('signup-email').value
  const password = document.getElementById('signup-password').value
  const role = 'user'

  // Simulate saving to database
  fetch('https://jeffmaxwellfanclub.azurewebsites.net/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
      role: "2",
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log('Response:', data))
    .catch((error) => console.error('Error:', error))

  const users = JSON.parse(localStorage.getItem('campusUsers')) || []

  // Show success
  const msgBox = document.getElementById('signup-message')
  msgBox.textContent = 'Account created! Redirecting to login...'
  msgBox.className = 'mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200'
  msgBox.classList.remove('hidden-section')

  setTimeout(() => {
    showLogin()
    // Pre-fill login for convenience
    document.getElementById('login-email').value = email
  }, 1500)
}

async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  const errorBox = document.getElementById('login-error')

  try {
    const response = await fetch('https://jeffmaxwellfanclub.azurewebsites.net//api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    const validLogin = data.validLogin

    let role = 'student'
    if (email === 'admin@admin.com') {
      role = 'maintenance'
    }

    if (validLogin) {
      loginView.classList.add('hidden-section')
      dashboardView.classList.remove('hidden-section')

      const roleDisplay = role === 'maintenance' ? 'Maintenance Staff' : 'Student/Faculty'

      document.getElementById(
        'welcome-msg'
      ).innerHTML = `Welcome back!<br><span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-2 inline-block">${roleDisplay}</span>`

      const maintenanceActions = document.getElementById('maintenance-actions')
      const dashboardActions = document.getElementById('dashboard-actions')

      if (role === 'maintenance') {
        maintenanceActions.classList.remove('hidden-section')
        dashboardActions.classList.add('hidden-section')
        maintenanceActions.classList.remove('hidden')
        dashboardActions.classList.add('hidden')
      } else {
        maintenanceActions.classList.add('hidden-section')
        dashboardActions.classList.remove('hidden-section')
        maintenanceActions.classList.add('hidden')
        dashboardActions.classList.remove('hidden')
      }
    } else {
      errorBox.textContent = 'Invalid email or password.'
      errorBox.classList.remove('hidden-section')
      errorBox.classList.remove('hidden')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

function hideAllMainSections() {
  loginView.classList.add('hidden-section');
  signupView.classList.add('hidden-section');
  dashboardView.classList.add('hidden-section');
}

function showSignup() {
  hideAllMainSections();
  signupView.classList.remove('hidden-section');
  document.getElementById('signup-message').classList.add('hidden-section');
}

function showLogin() {
  hideAllMainSections();
  loginView.classList.remove('hidden-section');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.add('hidden-section');
}

function showDashboard() {
  hideAllMainSections();
  dashboardView.classList.remove('hidden-section');
  
  // Reset Dashboard State (Show buttons, hide reports)
  showDashboardMain();
}



function viewReports() {
  dashboardActions.classList.add('hidden-section');
  maintenanceActions.classList.add('hidden-section'); // Hide staff tools while viewing report table
  reportsView.classList.remove('hidden-section');
  
  // Trigger Data Fetch
  fetchReports();
}

async function fetchReports() {
  const tbody = document.getElementById('reports-table-body');
  const loading = document.getElementById('reports-loading');
  const empty = document.getElementById('reports-empty');

  // UI Reset
  tbody.innerHTML = '';
  loading.classList.remove('hidden-section');
  empty.classList.add('hidden-section');

  try {
      // --- API CALL ---
      // Calls your specific endpoint
      const response = await fetch('https://jeffmaxwellfanclub.azurewebsites.net//API/allReports');
      
      // Handle errors
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      // Handle Data (Expecting { reports: [...] } based on your code)
      const reports = data.reports || [];
      
      if (reports.length === 0) {
          loading.classList.add('hidden-section');
          empty.classList.remove('hidden-section');
          return;
      }

      // Render Rows
      const rows = reports.map(r => {
          // Format Completion/Status
          // Your SQL says: "WHERE ... completion != 1", so these are mostly active
          let statusBadge = '';
          if (r.completion == '1') {
              statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Completed</span>';
          } else {
              statusBadge = '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Pending</span>';
          }

          // Combine Category + Description for "Issue"
          const issueText = r.category ? `${r.category}: ${r.description}` : r.description;

          return `
              <tr class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 font-mono text-xs text-gray-500">#${r.reportID}</td>
                  <td class="px-6 py-4 font-medium text-gray-900">${issueText}</td>
                  <td class="px-6 py-4 text-gray-600">${r.location}</td>
                  <td class="px-6 py-4">${statusBadge}</td>
                  <td class="px-6 py-4 text-gray-500">${new Date(r.submissionTime).toLocaleDateString()}</td>
              </tr>
          `;
      }).join('');

      tbody.innerHTML = rows;

  } catch (error) {
      console.error("Fetch error:", error);
      // For PREVIEW purposes only: Show mock data if API fails
      // Remove this block in production if you strictly want real data only
      // renderMockData(tbody); 
  } finally {
      loading.classList.add('hidden-section');
  }
}


//logout just leave
function handleLogout() {
  dashboardView.classList.add('hidden-section')
  loginView.classList.remove('hidden-section')
  reportsView.innerHTML = '';
  showLogin();
  clearMessages()
}

function clearMessages() {
  document.getElementById('signup-message').classList.add('hidden-section')
  document.getElementById('login-error').classList.add('hidden-section')
}

function renderRows(data) {
  const tbody = document.getElementById('reports-table-body');
  const emptyMsg = document.getElementById('reports-empty');

  console.log('Rendering data:', data);

  // FIX: robustly handle if data is an Array OR an Object with .reports
  const reports = Array.isArray(data) ? data : (data?.reports || []);

  if (reports.length === 0) {
      if (emptyMsg) emptyMsg.classList.remove('hidden-section');
      return;
  } else {
      if (emptyMsg) emptyMsg.classList.add('hidden-section');
  }

  // Use .map() to build one large string (better performance than innerHTML += in a loop)
  const rowsHtml = reports.map(report => {
      // Color code status
      let statusClass = 'bg-gray-100 text-gray-800';
      // Ensure completion exists before checking, or fallback
      const completion = String(report.completion); 
      
      if(completion === '0') statusClass = 'bg-yellow-100 text-yellow-800';
      // else if(completion === 'In Progress') statusClass = 'bg-blue-100 text-blue-800';
      else if(completion === '1') statusClass = 'bg-green-100 text-green-800';

      return `
          <tr class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 font-medium text-gray-900">#${report.reportID}</td>
              <td class="px-6 py-4 font-semibold">${report.issue}</td>
              <td class="px-6 py-4"><i class="fa-solid fa-location-dot text-gray-400 mr-2"></i>${report.location}</td>
              <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass}">${report.status || 'Unknown'}</span>
              </td>
              <td class="px-6 py-4 text-gray-500">${report.submissionTime}</td>
          </tr>
      `;
  }).join('');

  tbody.innerHTML = rowsHtml;
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
// function viewReports() {
//     // Get current user
//     const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

//     // Get reports from localStorage
//     const reports = JSON.parse(localStorage.getItem('campusReports')) || [];

//     // Filter reports for current user (or show all if admin/maintenance)
//     const userReports = currentUser.role === 'maintenance' || currentUser.role === 'admin'
//         ? reports
//         : reports.filter(r => r.userId === currentUser.email);

//     if (userReports.length === 0) {
//         alert('No reports found. Submit a new request to get started!');
//     } else {
//         // Create a simple display of reports
//         const reportList = userReports.map(r =>
//             `\n${r.formattedTime || new Date(r.timestamp).toLocaleString()} - ${r.type} at ${r.location} (${r.status})`
//         ).join('');
//         alert(`You have ${userReports.length} report(s):${reportList}\n\nFull report viewing feature coming soon!`);
//     }
// }
