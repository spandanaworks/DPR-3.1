// main.js - Complete Working DPR Generator with Authentication

// ==================== AUTHENTICATION SYSTEM ====================
let users = JSON.parse(localStorage.getItem('dpr_users')) || [];

// Initialize demo user if no users exist
if (users.length === 0) {
    users.push({
        id: 1,
        name: "Demo User",
        email: "demo@example.com",
        password: "demo123",
        createdAt: new Date().toISOString(),
        dprs: []
    });
    localStorage.setItem('dpr_users', JSON.stringify(users));
}

// Current logged in user
let currentUser = JSON.parse(sessionStorage.getItem('dpr_current_user')) || null;

// Check if user is logged in
function checkAuth() {
    if (currentUser) {
        // Show main app, hide login/register
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage) loginPage.style.display = 'none';
        if (registerPage) registerPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        
        // Update user info in sidebar
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) userNameSpan.textContent = currentUser.name;
        
        // Initialize the DPR form after login
        initializeDPRForm();
    } else {
        // Show login page
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage) loginPage.style.display = 'flex';
        if (registerPage) registerPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'none';
    }
}

// Login function
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('dpr_current_user', JSON.stringify(currentUser));
        checkAuth();
        return true;
    }
    return false;
}

// Register function
function register(name, email, password) {
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: "Email already registered!" };
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString(),
        dprs: []
    };
    
    users.push(newUser);
    localStorage.setItem('dpr_users', JSON.stringify(users));
    
    return { success: true, message: "Registration successful! Please login." };
}

// Logout function
function logout() {
    sessionStorage.removeItem('dpr_current_user');
    currentUser = null;
    checkAuth();
}

// Show register page
function showRegister() {
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    if (loginPage) loginPage.style.display = 'none';
    if (registerPage) registerPage.style.display = 'flex';
    clearAlerts();
}

// Show login page
function showLogin() {
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    if (registerPage) registerPage.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';
    clearAlerts();
}

// Clear alert messages
function clearAlerts() {
    const loginAlert = document.getElementById('loginAlert');
    const registerAlert = document.getElementById('registerAlert');
    if (loginAlert) loginAlert.style.display = 'none';
    if (registerAlert) registerAlert.style.display = 'none';
}

// Reset DPR form
function resetDPRForm() {
    const form = document.getElementById('dpr-form');
    if (form) form.reset();
    
    // Clear members container
    const membersContainer = document.getElementById('members-container');
    if (membersContainer) membersContainer.innerHTML = '';
    
    // Reset financial calculations
    const costInputs = document.querySelectorAll(".project-cost");
    const totalCost = document.getElementById('total-cost');
    const totalFunds = document.getElementById('total-funds');
    const bankLoan = document.getElementById('bank-loan');
    const ownContribution = document.getElementById('own-contribution');
    const subsidy = document.getElementById('subsidy');
    
    if (costInputs.length) costInputs.forEach(input => input.value = '');
    if (totalCost) totalCost.value = '';
    if (totalFunds) totalFunds.value = '';
    if (bankLoan) bankLoan.value = '';
    if (ownContribution) ownContribution.value = '';
    if (subsidy) subsidy.value = '';
}

// Save DPR to user's history
function saveDPRToHistory(formData) {
    if (currentUser) {
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            if (!users[userIndex].dprs) users[userIndex].dprs = [];
            
            // Collect member data
            const members = [];
            const memberRows = document.querySelectorAll('#members-container tr');
            memberRows.forEach((row, idx) => {
                members.push({
                    sno: idx + 1,
                    name: row.querySelector('.member-name')?.value || '',
                    role: row.querySelector('.member-role')?.value || '',
                    age: row.querySelector('.member-age')?.value || '',
                    gender: row.querySelector('.member-gender')?.value || '',
                    qualification: row.querySelector('.member-qualification')?.value || '',
                    idType: row.querySelector('.member-id-type')?.value || '',
                    idNumber: row.querySelector('.member-id-number')?.value || '',
                    mobile: row.querySelector('.member-mobile')?.value || ''
                });
            });
            
            const dprData = {
                id: Date.now(),
                submittedAt: new Date().toISOString(),
                businessName: formData.get('business_name') || 'Unnamed Business',
                data: Object.fromEntries(formData),
                members: members,
                totalCost: document.getElementById('total-cost')?.value || '0',
                totalFunds: document.getElementById('total-funds')?.value || '0'
            };
            
            users[userIndex].dprs.push(dprData);
            localStorage.setItem('dpr_users', JSON.stringify(users));
            
            console.log('DPR Saved:', dprData);
        }
    }
}

// ==================== DPR FORM INITIALIZATION ====================
function initializeDPRForm() {
    console.log("Initializing DPR Form...");
    
    // Get all sections
    const sections = document.querySelectorAll(".dpr-section");
    const nextButtons = document.querySelectorAll(".next-btn");
    const progressBar = document.getElementById("progress-bar");
    const totalSections = sections.length;
    let currentSection = 0;

    if (sections.length === 0) {
        console.error("No sections found!");
        return;
    }

    // Show first section
    function showSection(index) {
        sections.forEach((sec, i) => {
            sec.style.display = i === index ? "block" : "none";
        });
        updateProgress(index);
        
        // Update sidebar active state
        const sidebarLinks = document.querySelectorAll("#sidebar-nav .nav-link");
        sidebarLinks.forEach((link, i) => {
            if (i === index) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    function updateProgress(index) {
        const step = index + 1;
        const percent = Math.round((step / totalSections) * 100);
        if (progressBar) {
            progressBar.style.width = percent + "%";
            progressBar.textContent = `Step ${step}/${totalSections}`;
        }
    }

    // Add click handlers to next buttons
    nextButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentSection < totalSections - 1) {
                currentSection++;
                showSection(currentSection);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    showSection(0);

    // ==================== SECTION 2: DYNAMIC MEMBERS TABLE ====================
    const addMemberBtn = document.getElementById("add-member");
    const membersContainer = document.getElementById("members-container");
    let memberCount = 0;

    function createMemberRow(id) {
        const tr = document.createElement("tr");
        tr.setAttribute("data-member-id", id);
        tr.innerHTML = `
            <td class="member-sno">${id}</td>
            <td><input type="text" name="member_name_${id}" class="form-control form-control-sm member-name" placeholder="Full Name"></td>
            <td><input type="text" name="member_role_${id}" class="form-control form-control-sm member-role" placeholder="Role/Designation"></td>
            <td><input type="number" name="member_age_${id}" class="form-control form-control-sm member-age" placeholder="Age"></td>
            <td>
                <select name="member_gender_${id}" class="form-select form-select-sm member-gender">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                </select>
            </td>
            <td><input type="text" name="member_qualification_${id}" class="form-control form-control-sm member-qualification" placeholder="Educational Qualification"></td>
            <td><input type="text" name="member_id_type_${id}" class="form-control form-control-sm member-id-type" placeholder="ID Proof Type"></td>
            <td><input type="text" name="member_id_number_${id}" class="form-control form-control-sm member-id-number" placeholder="ID Proof Number"></td>
            <td><input type="text" name="member_mobile_${id}" class="form-control form-control-sm member-mobile" placeholder="Mobile Number"></td>
            <td><input type="file" name="member_photo_${id}" class="form-control form-control-sm member-photo" accept="image/*"></td>
            <td><input type="file" name="member_id_proof_${id}" class="form-control form-control-sm member-id-proof" accept="image/*,.pdf"></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-member">Remove</button></td>
        `;
        return tr;
    }

    if (addMemberBtn && membersContainer) {
        // Add initial member
        memberCount++;
        const firstRow = createMemberRow(memberCount);
        membersContainer.appendChild(firstRow);
        
        // Add remove listener to first row
        firstRow.querySelector(".remove-member").addEventListener("click", function() {
            if (membersContainer.children.length > 1) {
                this.closest('tr').remove();
                updateMemberNumbers();
            } else {
                alert("At least one member is required!");
            }
        });
        
        // Add member button click
        addMemberBtn.addEventListener("click", () => {
            memberCount++;
            const newRow = createMemberRow(memberCount);
            membersContainer.appendChild(newRow);
            
            newRow.querySelector(".remove-member").addEventListener("click", function() {
                if (membersContainer.children.length > 1) {
                    this.closest('tr').remove();
                    updateMemberNumbers();
                } else {
                    alert("At least one member is required!");
                }
            });
        });
    }

    function updateMemberNumbers() {
        const rows = membersContainer.querySelectorAll("tr");
        rows.forEach((row, index) => {
            const snoCell = row.querySelector(".member-sno");
            if (snoCell) {
                snoCell.textContent = index + 1;
            }
        });
    }

    // ==================== SECTION 7: FINANCIAL CALCULATIONS ====================
    function setupFinancialCalculations() {
        const costInputs = document.querySelectorAll(".project-cost");
        const totalCostField = document.getElementById("total-cost");
        const loanInput = document.getElementById("bank-loan");
        const ownInput = document.getElementById("own-contribution");
        const subsidyInput = document.getElementById("subsidy");
        const totalFundsField = document.getElementById("total-funds");

        function calculateTotalCost() {
            let sum = 0;
            costInputs.forEach(input => {
                sum += Number(input.value) || 0;
            });
            if (totalCostField) totalCostField.value = sum;
            return sum;
        }

        function calculateTotalFunds() {
            let sum = 0;
            if (loanInput) sum += Number(loanInput.value) || 0;
            if (ownInput) sum += Number(ownInput.value) || 0;
            if (subsidyInput) sum += Number(subsidyInput.value) || 0;
            if (totalFundsField) totalFundsField.value = sum;
            return sum;
        }

        costInputs.forEach(input => {
            input.addEventListener("input", () => {
                calculateTotalCost();
                calculateTotalFunds();
            });
        });
        
        if (loanInput) loanInput.addEventListener("input", calculateTotalFunds);
        if (ownInput) ownInput.addEventListener("input", calculateTotalFunds);
        if (subsidyInput) subsidyInput.addEventListener("input", calculateTotalFunds);

        calculateTotalCost();
        calculateTotalFunds();
    }
    setupFinancialCalculations();

    // ==================== SECTION 3: SEASONAL VARIATION ====================
    const seasonalRadios = document.querySelectorAll("#section3 input[name='seasonal']");
    const seasonalField = document.querySelector("#section3 .seasonal-field");
    if (seasonalRadios.length && seasonalField) {
        function toggleSeasonal() {
            const selected = document.querySelector("#section3 input[name='seasonal']:checked");
            seasonalField.style.display = (selected && selected.value === "yes") ? "block" : "none";
        }
        seasonalRadios.forEach(radio => radio.addEventListener("change", toggleSeasonal));
        toggleSeasonal();
    }

    // ==================== SECTION 9: WORKSPACE CONDITIONAL ====================
    const workspaceRadios = document.querySelectorAll("#section9 input[name='workspace']");
    const workspaceStatusField = document.querySelector("#section9 .workspace-field");
    const rentField = document.querySelector("#section9 .rent-field");
    if (workspaceRadios.length && workspaceStatusField && rentField) {
        function toggleWorkspace() {
            const selected = document.querySelector("#section9 input[name='workspace']:checked");
            const show = selected && selected.value === "yes";
            workspaceStatusField.style.display = show ? "block" : "none";
            rentField.style.display = show ? "block" : "none";
        }
        workspaceRadios.forEach(radio => radio.addEventListener("change", toggleWorkspace));
        toggleWorkspace();
    }

    // ==================== SECTION 11: ECO-FRIENDLY & TRAINING ====================
    const ecoRadios = document.querySelectorAll("#section11 input[name='eco_friendly']");
    const ecoField = document.querySelector("#section11 .eco-field");
    if (ecoRadios.length && ecoField) {
        function toggleEco() {
            const selected = document.querySelector("#section11 input[name='eco_friendly']:checked");
            ecoField.style.display = (selected && selected.value === "yes") ? "block" : "none";
        }
        ecoRadios.forEach(radio => radio.addEventListener("change", toggleEco));
        toggleEco();
    }

    const trainingRadios = document.querySelectorAll("#section11 input[name='training']");
    const trainingField = document.querySelector("#section11 .training-field");
    if (trainingRadios.length && trainingField) {
        function toggleTraining() {
            const selected = document.querySelector("#section11 input[name='training']:checked");
            trainingField.style.display = (selected && selected.value === "yes") ? "block" : "none";
        }
        trainingRadios.forEach(radio => radio.addEventListener("change", toggleTraining));
        toggleTraining();
    }

    // ==================== SECTION 14: GST & UDYAM ====================
    const gstRadios = document.querySelectorAll("#section14 input[name='gst']");
    const gstField = document.querySelector("#section14 .gst-field");
    if (gstRadios.length && gstField) {
        function toggleGST() {
            const selected = document.querySelector("#section14 input[name='gst']:checked");
            gstField.style.display = (selected && selected.value === "yes") ? "block" : "none";
        }
        gstRadios.forEach(radio => radio.addEventListener("change", toggleGST));
        toggleGST();
    }

    const udyamRadios = document.querySelectorAll("#section14 input[name='udyam']");
    const udyamField = document.querySelector("#section14 .udyam-field");
    if (udyamRadios.length && udyamField) {
        function toggleUdyam() {
            const selected = document.querySelector("#section14 input[name='udyam']:checked");
            udyamField.style.display = (selected && selected.value === "yes") ? "block" : "none";
        }
        udyamRadios.forEach(radio => radio.addEventListener("change", toggleUdyam));
        toggleUdyam();
    }

    // ==================== SECTION 15: LOAN HISTORY ====================
    const loanBeforeRadios = document.querySelectorAll("#section15 input[name='loan_before']");
    const loanFields = document.querySelector("#section15 .loan-fields");
    const defaultField = document.querySelector("#section15 .default-field");
    const defaultExplainField = document.querySelector("#section15 .default-explain-field");
    
    if (loanBeforeRadios.length && loanFields) {
        function toggleLoanFields() {
            const selected = document.querySelector("#section15 input[name='loan_before']:checked");
            const show = selected && selected.value === "yes";
            loanFields.style.display = show ? "block" : "none";
            if (defaultField) defaultField.style.display = show ? "block" : "none";
            if (!show && defaultExplainField) defaultExplainField.style.display = "none";
        }
        
        const defaultsRadios = document.querySelectorAll("#section15 input[name='loan_defaults']");
        function toggleDefaultsExplain() {
            const selected = document.querySelector("#section15 input[name='loan_defaults']:checked");
            if (defaultExplainField) {
                defaultExplainField.style.display = (selected && selected.value === "yes") ? "block" : "none";
            }
        }
        
        loanBeforeRadios.forEach(radio => radio.addEventListener("change", toggleLoanFields));
        defaultsRadios.forEach(radio => radio.addEventListener("change", toggleDefaultsExplain));
        toggleLoanFields();
    }

    // ==================== SECTION 13: SET DATE AUTOMATICALLY ====================
    const dateInput = document.getElementById("declaration-date");
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // ==================== SIDEBAR NAVIGATION ====================
    const sidebarLinks = document.querySelectorAll("#sidebar-nav .nav-link");
    sidebarLinks.forEach((link, idx) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href && href.startsWith("#section")) {
                const sectionId = href.substring(1);
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    const sectionIndex = Array.from(sections).indexOf(targetSection);
                    if (sectionIndex !== -1) {
                        currentSection = sectionIndex;
                        showSection(currentSection);
                    }
                }
            }
        });
    });

    // ==================== FORM SUBMISSION ====================
    const dprForm = document.getElementById("dpr-form");
    if (dprForm) {
        dprForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const formData = new FormData(dprForm);
            
            // Validate required fields
            const businessName = formData.get('business_name');
            if (!businessName) {
                alert("Please fill in the Business Name in Section 1!");
                currentSection = 0;
                showSection(0);
                return;
            }
            
            // Check if at least one member exists
            const memberRows = membersContainer ? membersContainer.querySelectorAll("tr").length : 0;
            if (memberRows === 0) {
                alert("Please add at least one member in Section 2!");
                currentSection = 1;
                showSection(1);
                return;
            }
            
            // Create summary
            let formSummary = "📋 DPR FORM SUBMISSION SUMMARY\n";
            formSummary += "=".repeat(40) + "\n\n";
            formSummary += `🏢 Business Name: ${businessName}\n`;
            formSummary += `👥 Total Members: ${memberRows}\n`;
            
            const totalCost = document.getElementById("total-cost")?.value;
            if (totalCost && totalCost > 0) {
                formSummary += `💰 Total Project Cost: ₹${parseInt(totalCost).toLocaleString()}\n`;
            }
            
            const totalFunds = document.getElementById("total-funds")?.value;
            if (totalFunds && totalFunds > 0) {
                formSummary += `💵 Total Funds: ₹${parseInt(totalFunds).toLocaleString()}\n`;
            }
            
            const contactPerson = formData.get('contact_name');
            if (contactPerson) {
                formSummary += `📞 Contact Person: ${contactPerson}\n`;
            }
            
            formSummary += "\n✅ DPR has been saved successfully!\n";
            formSummary += `📅 Submitted on: ${new Date().toLocaleString()}\n`;
            
            // Save to history
            saveDPRToHistory(formData);
            
            console.log("Form submitted successfully!");
            console.log("Form Data:", Object.fromEntries(formData));
            
            alert(formSummary);
            
            // Ask if user wants to start new DPR
            if (confirm("Do you want to start a new DPR form?")) {
                resetDPRForm();
                // Add initial member again
                if (addMemberBtn && membersContainer && membersContainer.children.length === 0) {
                    memberCount = 0;
                    memberCount++;
                    const newRow = createMemberRow(memberCount);
                    membersContainer.appendChild(newRow);
                    newRow.querySelector(".remove-member").addEventListener("click", function() {
                        if (membersContainer.children.length > 1) {
                            this.closest('tr').remove();
                            updateMemberNumbers();
                        } else {
                            alert("At least one member is required!");
                        }
                    });
                }
                currentSection = 0;
                showSection(0);
            }
        });
    }
    
    console.log("DPR Form initialized successfully with", totalSections, "sections");
}

// ==================== EVENT LISTENERS FOR AUTH ====================
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, setting up authentication...");
    
    // Login form handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            
            if (login(email, password)) {
                console.log("Login successful");
            } else {
                const alertDiv = document.getElementById("loginAlert");
                if (alertDiv) {
                    alertDiv.textContent = "Invalid email or password! Use demo@example.com / demo123";
                    alertDiv.style.display = "block";
                    setTimeout(() => {
                        alertDiv.style.display = "none";
                    }, 3000);
                }
            }
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;
            
            if (!name || !email || !password) {
                const alertDiv = document.getElementById("registerAlert");
                if (alertDiv) {
                    alertDiv.textContent = "Please fill all fields!";
                    alertDiv.style.display = "block";
                    setTimeout(() => {
                        alertDiv.style.display = "none";
                    }, 3000);
                }
                return;
            }
            
            if (password !== confirmPassword) {
                const alertDiv = document.getElementById("registerAlert");
                if (alertDiv) {
                    alertDiv.textContent = "Passwords do not match!";
                    alertDiv.style.display = "block";
                    setTimeout(() => {
                        alertDiv.style.display = "none";
                    }, 3000);
                }
                return;
            }
            
            const result = register(name, email, password);
            const alertDiv = document.getElementById("registerAlert");
            if (alertDiv) {
                alertDiv.textContent = result.message;
                alertDiv.className = result.success ? "alert alert-success" : "alert alert-danger";
                alertDiv.style.display = "block";
                
                if (result.success) {
                    setTimeout(() => {
                        showLogin();
                    }, 2000);
                } else {
                    setTimeout(() => {
                        alertDiv.style.display = "none";
                    }, 3000);
                }
            }
        });
    }
    
    // Check authentication status on load
    checkAuth();
});

// Make functions available globally
window.showRegister = showRegister;
window.showLogin = showLogin;
window.logout = logout;