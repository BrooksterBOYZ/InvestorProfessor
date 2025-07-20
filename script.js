// JavaScript for tab switching (analogous to ttk.Notebook)
function openTab(evt, tabId) {
    var i, tabcontent, tabbuttons;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tabbuttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
    }
    document.getElementById(tabId).style.display = "block";
    evt.currentTarget.className += " active";
}

// JavaScript for dynamic calculator inputs and calculation
const calculatorInputsDiv = document.getElementById('calculator-inputs');
const calculatorResultDiv = document.getElementById('calculator-result');

// Function to show inputs based on selected calculator
function showCalculatorInputs() {
    const selectedCalc = document.getElementById('calc-type-select').value;
    calculatorInputsDiv.innerHTML = ''; // Clear previous inputs
    calculatorResultDiv.textContent = 'Result: '; // Clear previous result

    let htmlContent = '';

    if (selectedCalc === 'compound_interest') {
        htmlContent = `
            <div class="form-group tooltip-container">
                <label for="principal">Principal ($):</label>
                <input type="number" id="principal" value="10000" min="0">
                <span class="tooltiptext">Initial amount of money invested.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="annual_rate">Annual Rate (%):</label>
                <input type="number" id="annual_rate" value="5" min="0">
                <span class="tooltiptext">Yearly interest rate as a percentage.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="years">Years:</label>
                <input type="number" id="years" value="10" min="0">
                <span class="tooltiptext">Number of years invested.</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="compound_per_year">Compound Per Year:</label>
                <input type="number" id="compound_per_year" value="12" min="1">
                <span class="tooltiptext">How many times interest is compounded per year (e.g., 1 for annually, 12 for monthly).</span>
            </div>
            <button class="btn-calculate" onclick="calculateCompoundInterest()">Calculate Compound Interest</button>
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
                <span class="tooltiptext">Any additional costs (fees, maintenance).</span>
            </div>
            <button class="btn-calculate" onclick="calculateROI()">Calculate ROI</button>
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
                <span class="tooltiptext">Interest rate per compounding period (e.g., 0.5 for 0.5% monthly).</span>
            </div>
            <div class="form-group tooltip-container">
                <label for="periods">Number of Periods:</label>
                <input type="number" id="periods" value="120" min="0">
                <span class="tooltiptext">Total number of payment periods.</span>
            </div>
            <button class="btn-calculate" onclick="calculateAnnuityFV()">Calculate Annuity FV</button>
        `;
    }
    calculatorInputsDiv.innerHTML = htmlContent;
}

// Calculation functions in JavaScript
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
        if (compoundPerYear === 0) { // Simple interest if compounding is 0
            amount = principal * (1 + annualRate * years);
        } else {
            amount = principal * Math.pow((1 + annualRate / compoundPerYear), (compoundPerYear * years));
        }
        calculatorResultDiv.textContent = `Result: Final Amount = $${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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

        const netProfit = finalValue - initialInvestment - totalCost;
        const roi = (netProfit / initialInvestment) * 100;
        calculatorResultDiv.textContent = `Result: ROI = ${roi.toFixed(2)}%`;
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

        if (isNaN(payment) || isNaN(rate) || isNaN(periods) || payment < 0 || rate < 0 || periods < 0) {
            throw new Error("Invalid input. Please ensure all fields are numeric and positive.");
        }

        let fv;
        if (rate === 0) {
            fv = payment * periods;
        } else {
            fv = payment * ((Math.pow((1 + rate), periods) - 1) / rate);
        }
        calculatorResultDiv.textContent = `Result: Future Value of Annuity = $${fv.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } catch (error) {
        calculatorResultDiv.textContent = `Error: ${error.message}`;
        calculatorResultDiv.style.color = 'red';
    }
}

// Initialize the calculator inputs on page load
document.addEventListener('DOMContentLoaded', showCalculatorInputs);
