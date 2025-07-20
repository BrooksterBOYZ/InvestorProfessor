// Global array to store investments (data persists only for the current session)
let investments = [];
let myChart; // Variable to hold the Chart.js instance

// Helper function to format numbers as currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Helper function to calculate ROI
function calculateROIValue(initial, current, cost) {
    if (initial <= 0) return 0; // Prevent division by zero or negative initial investment
    const netProfit = current - initial - cost;
    return (netProfit / initial) * 100;
}

// --- Page Switching Logic ---
function openPage(evt, pageId) {
    // Get all page sections and hide them
    const pageSections = document.getElementsByClassName("page-section");
    for (let i = 0; i < pageSections.length; i++) {
        pageSections[i].style.display = "none";
        pageSections[i].classList.remove('active'); // Remove active class for animation
    }

    // Get all nav buttons and remove the "active" class
    const navButtons = document.getElementsByClassName("nav-button");
    for (let i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove("active");
    }

    // Show the current page and add an "active" class to the button
    document.getElementById(pageId).style.display = "block";
    document.getElementById(pageId).classList.add('active'); // Add active class for animation
    evt.currentTarget.classList.add("active");

    // Specific actions for certain pages
    if (pageId === 'investment-hub') {
        displayInvestments();
        updateDashboardChart();
        showCalculatorInputs(); // Ensure calculator inputs are shown when hub is opened
    }
}

// --- Investment Calculator Logic (now part of Investment Hub) ---
const calculatorInputsDiv = document.getElementById('calculator-inputs');
const calculatorResultDiv = document.getElementById('calculator-result');

function showCalculatorInputs() {
    const selectedCalc = document.getElementById('calc-type-select').value;
    calculatorInputsDiv.innerHTML = ''; // Clear previous inputs
    calculatorResultDiv.textContent = 'Result: '; // Clear previous result
    calculatorResultDiv.style.color = '#28a745'; // Reset result color

    let htmlContent = '';

    if (selectedCalc === 'compound_interest') {
        htmlContent = `
            <div class="form-group tooltip-container">
                <label for="principal">Principal ($):</label>
                <input type="number" id="principal" value="10000" min="0">
                <span class="tooltiptext">Initial amount of money invested or borrowed.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="annual_rate">Annual Rate (%):</label>
                <input type="number" id="annual_rate" value="5" min="0">
                <span class="tooltiptext">The yearly interest rate as a percentage (e.g., 5 for 5%).</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="years">Years:</label>
                <input type="number" id="years" value="10" min="0">
                <span class="tooltiptext">The number of years the money is invested or borrowed for.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="compound_per_year">Compound Per Year:</label>
                <input type="number" id="compound_per_year" value="12" min="1">
                <span class="tooltiptext">How many times interest is compounded per year (e.g., 1 for annually, 12 for monthly).</span>
            </div>
            <div class="button-group">
                <button class="btn-action" onclick="calculateCompoundInterest()"><i class="fas fa-calculator"></i> Calculate</button>
            </div>
        `;
    } else if (selectedCalc === 'roi') {
        htmlContent = `
            <div class="form-group tooltip-container">
                <label for="initial_investment">Initial Investment ($):</label>
                <input type="number" id="initial_investment" value="1000" min="0">
                <span class="tooltiptext">The original cost of the investment.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="final_value">Final Value ($):</label>
                <input type="number" id="final_value" value="1200" min="0">
                <span class="tooltiptext">The current or selling value of the investment.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="total_cost">Total Cost ($):</label>
                <input type="number" id="total_cost" value="50" min="0">
                <span class="tooltiptext">Any additional costs associated with the investment (e.g., fees, maintenance).</span>
            </div>
            <div class="button-group">
                <button class="btn-action" onclick="calculateROI()"><i class="fas fa-calculator"></i> Calculate</button>
            </div>
        `;
    } else if (selectedCalc === 'annuity') {
        htmlContent = `
            <div class="form-group tooltip-container">
                <label for="payment">Payment Amount ($):</label>
                <input type="number" id="payment" value="100" min="0">
                <span class="tooltiptext">The amount of each regular payment.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="rate">Interest Rate (% per period):</label>
                <input type="number" id="rate" value="0.5" min="0">
                <span class="tooltiptext">The interest rate per compounding period (e.g., 0.5 for 0.5% monthly if payments are monthly).</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="periods">Number of Periods:</label>
                <input type="number" id="periods" value="120" min="0">
                <span class="tooltiptext">The total number of payment periods.</span>
            </div>
            <div class="button-group">
                <button class="btn-action" onclick="calculateAnnuityFV()"><i class="fas fa-calculator"></i> Calculate</button>
            </div>
        `;
    }
    calculatorInputsDiv.innerHTML = htmlContent;
}

function calculateCompoundInterest() {
    try {
        const principal = parseFloat(document.getElementById('principal').value);
        const annualRate = parseFloat(document.getElementById('annual_rate').value) / 100;
        const years = parseFloat(document.getElementById('years').value);
        const compoundPerYear = parseInt(document.getElementById('compound_per_year').value);

        if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || isNaN(compoundPerYear) ||
            principal < 0 || annualRate < 0 || years < 0 || compoundPerYear <= 0) {
            throw new Error("Invalid input. Please ensure all fields are numeric and positive, and compounding is at least once per year.");
        }

        let amount;
        if (compoundPerYear === 0) { // Simple interest if compounding is 0 (edge case, not typical for compound)
            amount = principal * (1 + annualRate * years);
        } else {
            amount = principal * Math.pow((1 + annualRate / compoundPerYear), (compoundPerYear * years));
        }
        calculatorResultDiv.textContent = `Result: Final Amount = ${formatCurrency(amount)}`;
        calculatorResultDiv.style.color = '#28a745';
    } catch (error) {
        calculatorResultDiv.textContent = `Error: ${error.message}`;
        calculatorResultDiv.style.color = 'red';
    }
}

function calculateROI() {
    try {
        const initialInvestment = parseFloat(document.getElementById('initial_investment').value);
        const finalValue = parseFloat(document.getElementById('final_value').value);
        const totalCost = parseFloat(document.getElementById('total_cost').value);

        if (isNaN(initialInvestment) || isNaN(finalValue) || isNaN(totalCost) || initialInvestment <= 0) {
            throw new Error("Invalid input. Initial Investment must be greater than zero.");
        }

        const roi = calculateROIValue(initialInvestment, finalValue, totalCost);
        calculatorResultDiv.textContent = `Result: ROI = ${roi.toFixed(2)}%`;
        calculatorResultDiv.style.color = (roi >= 0) ? '#28a745' : '#e74c3c'; // Green for positive, red for negative
    } catch (error) {
        calculatorResultDiv.textContent = `Error: ${error.message}`;
        calculatorResultDiv.style.color = 'red';
    }
}

function calculateAnnuityFV() {
    try {
        const payment = parseFloat(document.getElementById('payment').value);
        const rate = parseFloat(document.getElementById('rate').value) / 100; // Convert to decimal
        const periods = parseFloat(document.getElementById('periods').value);

        if (isNaN(payment) || isNaN(rate) || isNaN(periods) || payment < 0 || periods < 0) {
            throw new Error("Invalid input. Please ensure all fields are numeric and positive.");
        }

        let fv;
        if (rate === 0) {
            fv = payment * periods;
        } else {
            fv = payment * ((Math.pow((1 + rate), periods) - 1) / rate);
        }
        calculatorResultDiv.textContent = `Result: Future Value of Annuity = ${formatCurrency(fv)}`;
        calculatorResultDiv.style.color = '#28a745';
    } catch (error) {
        calculatorResultDiv.textContent = `Error: ${error.message}`;
        calculatorResultDiv.style.color = 'red';
    }
}

// --- Investment Dashboard Logic (now part of Investment Hub) ---
const investmentListUL = document.getElementById('investment-list');
const invNameInput = document.getElementById('inv-name');
const invTypeInput = document.getElementById('inv-type');
const invInitialInput = document.getElementById('inv-initial');
const invCurrentInput = document.getElementById('inv-current');
const invDateInput = document.getElementById('inv-date');

let selectedInvestmentIndex = -1; // -1 means no investment is selected

function displayInvestments() {
    investmentListUL.innerHTML = ''; // Clear existing list items

    if (investments.length === 0) {
        investmentListUL.innerHTML = '<li class="no-investments-message">No investments added yet. Use the form above!</li>';
        updateDashboardChart(); // Clear chart if no investments
        return;
    }

    investments.forEach((inv, index) => {
        const listItem = document.createElement('li');
        listItem.dataset.index = index; // Store index for easy access
        listItem.onclick = () => selectInvestment(index);

        const roi = calculateROIValue(inv.initial, inv.current, 0); // Assuming 0 total cost for list display ROI
        const roiClass = roi >= 0 ? 'text-green' : 'text-red';

        listItem.innerHTML = `
            <div class="item-details">
                <strong>${inv.name} (${inv.type})</strong>
                <span>Initial: ${formatCurrency(inv.initial)} | Current: ${formatCurrency(inv.current)}</span>
                <span>Acquired: ${inv.date_acquired} | ROI: <span class="${roiClass}">${roi.toFixed(2)}%</span></span>
            </div>
            <div class="actions">
                <button onclick="editInvestment(${index})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteInvestment(${index})"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        investmentListUL.appendChild(listItem);
    });

    // Re-select if an item was previously selected and still exists
    if (selectedInvestmentIndex !== -1 && investments[selectedInvestmentIndex]) {
        investmentListUL.children[selectedInvestmentIndex].classList.add('selected');
    } else {
        selectedInvestmentIndex = -1; // Reset if selected item was deleted
    }

    updateDashboardChart();
}

function selectInvestment(index) {
    // Deselect previous
    if (selectedInvestmentIndex !== -1 && investmentListUL.children[selectedInvestmentIndex]) {
        investmentListUL.children[selectedInvestmentIndex].classList.remove('selected');
    }

    // Select new
    selectedInvestmentIndex = index;
    if (investmentListUL.children[selectedInvestmentIndex]) {
        investmentListUL.children[selectedInvestmentIndex].classList.add('selected');
    }
    
    // Load data into form
    const inv = investments[index];
    invNameInput.value = inv.name;
    invTypeInput.value = inv.type;
    invInitialInput.value = inv.initial;
    invCurrentInput.value = inv.current;
    invDateInput.value = inv.date_acquired;
}

function clearInvestmentInputs() {
    invNameInput.value = '';
    invTypeInput.value = '';
    invInitialInput.value = '';
    invCurrentInput.value = '';
    invDateInput.value = '';
    // Deselect any selected item
    if (selectedInvestmentIndex !== -1 && investmentListUL.children[selectedInvestmentIndex]) {
        investmentListUL.children[selectedInvestmentIndex].classList.remove('selected');
    }
    selectedInvestmentIndex = -1;
}

function addInvestment() {
    const name = invNameInput.value.trim();
    const type = invTypeInput.value.trim();
    const initial = parseFloat(invInitialInput.value);
    const current = parseFloat(invCurrentInput.value);
    const dateAcquired = invDateInput.value;

    if (!name || !type || isNaN(initial) || isNaN(current) || initial < 0 || current < 0 || !dateAcquired) {
        alert("Please fill all fields correctly. Initial/Current values must be positive numbers.");
        return;
    }

    // Check for duplicate name (simple client-side validation)
    if (investments.some(inv => inv.name.toLowerCase() === name.toLowerCase())) {
        alert("An investment with this name already exists. Please choose a unique name or update the existing one.");
        return;
    }

    const newInvestment = {
        id: Date.now(), // Simple unique ID
        name,
        type,
        initial,
        current,
        date_acquired: dateAcquired
    };
    investments.push(newInvestment);
    displayInvestments();
    clearInvestmentInputs();
    alert("Investment added successfully!");
}

function updateInvestment() {
    if (selectedInvestmentIndex === -1) {
        alert("Please select an investment from the list to update.");
        return;
    }

    const name = invNameInput.value.trim();
    const type = invTypeInput.value.trim();
    const initial = parseFloat(invInitialInput.value);
    const current = parseFloat(invCurrentInput.value);
    const dateAcquired = invDateInput.value;

    if (!name || !type || isNaN(initial) || isNaN(current) || initial < 0 || current < 0 || !dateAcquired) {
        alert("Please fill all fields correctly for update. Initial/Current values must be positive numbers.");
        return;
    }

    // Check for duplicate name for other investments
    const existingIndex = investments.findIndex((inv, idx) => inv.name.toLowerCase() === name.toLowerCase() && idx !== selectedInvestmentIndex);
    if (existingIndex !== -1) {
        alert("An investment with this name already exists. Please choose a unique name or update the existing one.");
        return;
    }

    investments[selectedInvestmentIndex] = {
        ...investments[selectedInvestmentIndex], // Keep existing ID
        name,
        type,
        initial,
        current,
        date_acquired: dateAcquired
    };
    displayInvestments();
    clearInvestmentInputs();
    alert("Investment updated successfully!");
}

function deleteInvestment(indexToDelete) {
    // If called from button in list item, indexToDelete is provided
    // If called from global delete button, use selectedInvestmentIndex
    const idx = (typeof indexToDelete === 'number') ? indexToDelete : selectedInvestmentIndex;

    if (idx === -1 || !investments[idx]) {
        alert("Please select an investment to delete.");
        return;
    }

    if (confirm(`Are you sure you want to delete "${investments[idx].name}"? This cannot be undone.`)) {
        investments.splice(idx, 1); // Remove from array
        displayInvestments();
        clearInvestmentInputs(); // Clear form after deletion
        alert("Investment deleted successfully!");
    }
}

// --- Chart.js Integration for Dashboard ---
function updateDashboardChart() {
    const ctx = document.getElementById('investmentChart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (myChart) {
        myChart.destroy();
    }

    if (investments.length === 0) {
        // Clear canvas if no investments to display
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
        return;
    }

    const labels = investments.map(inv => inv.name);
    const initialData = investments.map(inv => inv.initial);
    const currentData = investments.map(inv => inv.current);

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Initial Value ($)',
                data: initialData,
                backgroundColor: 'rgba(52, 152, 219, 0.7)', // Primary blue
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            },
            {
                label: 'Current Value ($)',
                data: currentData,
                backgroundColor: 'rgba(46, 204, 113, 0.7)', // Secondary green
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow canvas to resize freely
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Investment',
                        color: '#555'
                    },
                    grid: {
                        display: false // Hide x-axis grid lines
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value ($)',
                        color: '#555'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            return formatCurrency(value); // Format Y-axis labels as currency
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Initial vs. Current Investment Values',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#333'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#555'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}


// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Open the home page by default
    document.querySelector('.nav-button.active').click(); 
});
