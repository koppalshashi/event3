// admin.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    const tableBody = document.getElementById('registrationTable');
    const logoutBtn = document.getElementById('logoutBtn');

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });
    }
// admin.js

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const registrationTable = document.getElementById('registrationTable');
    const dashboardMessage = document.getElementById('dashboardMessage');
    const logoutBtn = document.getElementById('logoutBtn');

    // Authentication Check
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Logout Button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });
    }

    // Function to display temporary messages
    function showTemporaryMessage(message, type) {
        if (!dashboardMessage) {
            alert(message);
            return;
        }
        dashboardMessage.textContent = message;
        dashboardMessage.style.backgroundColor = type === 'success' ? '#2ecc71' : '#e74c3c';
        dashboardMessage.style.color = '#fff';
        dashboardMessage.style.display = 'block';
        dashboardMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

        setTimeout(() => {
            dashboardMessage.style.display = 'none';
        }, 4000);
    }

    // Function to load all registrations
    async function loadRegistrations() {
        if (registrationTable) {
            registrationTable.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading registrations...</td></tr>';
        }
        try {
            const response = await fetch(`${window.location.origin}/api/admin/registrations`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    window.location.href = 'admin-login.html';
                }
                throw new Error('Failed to fetch registrations');
            }

            const registrations = await response.json();
            registrationTable.innerHTML = ''; // Clear loading message

            if (registrations.length === 0) {
                registrationTable.innerHTML = '<tr><td colspan="8" style="text-align:center;">No registrations found.</td></tr>';
                return;
            }

            registrations.forEach(reg => {
                const tr = document.createElement('tr');
                tr.dataset.id = reg._id;

                const name = `<td>${reg.studentName}</td>`;
                const college = `<td>${reg.college}</td>`;
                const email = `<td>${reg.email}</td>`;
                const event = `<td>${reg.event}</td>`;
                const utr = `<td>${reg.payment ? reg.payment.utrNumber : 'N/A'}</td>`;

                let screenshotHTML = `<td>N/A</td>`;
                if (reg.payment && reg.payment._id) {
                    screenshotHTML = `<td>
                        <a class="screenshot-link" href="${window.location.origin}/payment/${reg.payment._id}/screenshot" target="_blank">View</a>
                    </td>`;
                }

                let statusHTML, actionHTML;
                if (reg.isApproved) {
                    statusHTML = `<td><span class="status-approved">✅ Approved</span></td>`;
                    actionHTML = `<td>—</td>`;
                } else if (reg.isRejected) {
                    statusHTML = `<td><span class="status-rejected">❌ Rejected</span></td>`;
                    actionHTML = `<td>—</td>`;
                } else {
                    statusHTML = `<td><span class="status-pending">⏳ Pending</span></td>`;
                    actionHTML = `<td>
                        <div class="action-buttons">
                            <button class="btn btn-approve" data-id="${reg._id}">Approve</button>
                            <button class="btn btn-reject" data-id="${reg._id}">Reject</button>
                        </div>
                    </td>`;
                }

                tr.innerHTML = name + college + email + event + utr + screenshotHTML + statusHTML + actionHTML;
                registrationTable.appendChild(tr);
            });

        } catch (err) {
            console.error('Error fetching registrations:', err);
            showTemporaryMessage('Error fetching registrations.', 'error');
        }
    }

    // Event Delegation for Approve/Reject buttons
    if (registrationTable) {
        registrationTable.addEventListener('click', async e => {
            const approveBtn = e.target.closest('.btn-approve');
            const rejectBtn = e.target.closest('.btn-reject');
            let res;

            if (approveBtn) {
                const regId = approveBtn.dataset.id;
                if (confirm('Approve this registration?')) {
                    try {
                        res = await fetch(`${window.location.origin}/api/admin/approve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ id: regId })
                        });
                        const data = await res.json();
                        if (res.ok) {
                            showTemporaryMessage(data.message || 'Registration approved and email sent!', 'success');
                            loadRegistrations();
                        } else {
                            showTemporaryMessage(data.message || 'Approval failed.', 'error');
                        }
                    } catch (err) {
                        showTemporaryMessage('Failed to approve.', 'error');
                    }
                }
            } else if (rejectBtn) {
                const regId = rejectBtn.dataset.id;
                if (confirm('Reject this registration? This cannot be undone.')) {
                    try {
                        res = await fetch(`${window.location.origin}/api/admin/reject`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ id: regId })
                        });
                        const data = await res.json();
                        if (res.ok) {
                            showTemporaryMessage(data.message || 'Registration rejected!', 'success');
                            loadRegistrations();
                        } else {
                            showTemporaryMessage(data.message || 'Rejection failed.', 'error');
                        }
                    } catch (err) {
                        showTemporaryMessage('Failed to reject.', 'error');
                    }
                }
            }
        });
    }

    // Initial load of registrations
    await loadRegistrations();
});
    // Function to load registrations
    async function loadRegistrations() {
        try {
            const response = await fetch(`${window.location.origin}/api/admin/registrations`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    window.location.href = 'admin-login.html';
                }
                throw new Error('Failed to fetch registrations');
            }

            const registrations = await response.json();
            tableBody.innerHTML = '';

            registrations.forEach(reg => {
                const tr = document.createElement('tr');
                tr.dataset.id = reg._id;

                // Registration data
                const name = `<td>${reg.studentName}</td>`;
                const college = `<td>${reg.college}</td>`;
                const email = `<td>${reg.email}</td>`;
                const event = `<td>${reg.event}</td>`;

                // Payment data
                const utr = `<td>${reg.payment ? reg.payment.utrNumber : 'N/A'}</td>`;

                // Screenshot from MongoDB
                let screenshotHTML = `<td>N/A</td>`;
                if (reg.payment && reg.payment._id) {
                    screenshotHTML = `<td>
                        <a class="screenshot-link" href="${window.location.origin}/payment/${reg.payment._id}/screenshot" target="_blank">View</a>
                    </td>`;
                }

                // Status & Action
                let statusHTML, actionHTML;
                if (reg.isApproved) {
                    statusHTML = `<td><span class="status-approved">✅ Approved</span></td>`;
                    actionHTML = `<td>—</td>`;
                } else if (reg.isRejected) {
                    statusHTML = `<td><span class="status-rejected">❌ Rejected</span></td>`;
                    actionHTML = `<td>—</td>`;
                } else {
                    statusHTML = `<td><span class="status-pending">⏳ Pending</span></td>`;
                    actionHTML = `<td>
                        <div class="action-buttons">
                            <button class="btn btn-approve" data-id="${reg._id}">Approve</button>
                            <button class="btn btn-reject" data-id="${reg._id}">Reject</button>
                        </div>
                    </td>`;
                }

                tr.innerHTML = name + college + email + event + utr + screenshotHTML + statusHTML + actionHTML;
                tableBody.appendChild(tr);
            });

            // Approve buttons
            document.querySelectorAll('.btn-approve').forEach(btn => {
                btn.addEventListener('click', async e => {
                    const regId = e.target.dataset.id;
                    if (confirm('Approve this registration?')) {
                        try {
                            const res = await fetch(`${window.location.origin}/api/admin/approve/${regId}`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            if (res.ok) {
                                showTemporaryMessage('Registration approved and email sent!', 'success');
                                await loadRegistrations();
                            } else {
                                showTemporaryMessage(data.message || 'Approval failed.', 'error');
                            }
                        } catch (err) {
                            console.error(err);
                            showTemporaryMessage('Failed to approve.', 'error');
                        }
                    }
                });
            });

            // Reject buttons
            document.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', async e => {
                    const regId = e.target.dataset.id;
                    if (confirm('Reject this registration? This cannot be undone.')) {
                        try {
                            const res = await fetch(`${window.location.origin}/api/admin/reject/${regId}`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            if (res.ok) {
                                showTemporaryMessage('Registration rejected!', 'success');
                                await loadRegistrations();
                            } else {
                                showTemporaryMessage(data.message || 'Rejection failed.', 'error');
                            }
                        } catch (err) {
                            console.error(err);
                            showTemporaryMessage('Failed to reject.', 'error');
                        }
                    }
                });
            });

        } catch (err) {
            console.error('Error fetching registrations:', err);
            showTemporaryMessage('Error fetching registrations.', 'error');
        }
    }

    // Initial load
    await loadRegistrations();
});

// Temporary message function
function showTemporaryMessage(message, type) {
    const msgDiv = document.getElementById("dashboardMessage");
    if (!msgDiv) {
        alert(message);
        return;
    }

    msgDiv.textContent = message;
    msgDiv.style.backgroundColor = type === "success" ? "#2ecc71" : "#e74c3c";
    msgDiv.style.color = "#fff";
    msgDiv.style.display = "block";
    msgDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

    setTimeout(() => {
        msgDiv.style.display = "none";
    }, 4000);
}
