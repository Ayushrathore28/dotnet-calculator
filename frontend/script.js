
const expression = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const message = document.getElementById("message");
const buttons = document.querySelector(".buttons");

// Tumhara .NET backend URL
const API_URL = "https://ayush-calculator-api.onrender.com/api/calculator";

let currentExpression = "";

// Calculator par expression update karna
function updateExpression() {
    expression.value = currentExpression;
}

// Clear calculator
function clearCalculator() {
    currentExpression = "";
    updateExpression();
    resultDisplay.textContent = "0";
    message.textContent = "Ready to calculate";
}

// Last character delete karna
function deleteLastCharacter() {
    currentExpression = currentExpression.slice(0, -1);
    updateExpression();
}

// Operator ko .NET backend ke operation name mein badalna
function getOperation(operator) {
    switch (operator) {
        case "+":
            return "add";
        case "-":
            return "subtract";
        case "*":
            return "multiply";
        case "/":
            return "divide";
        default:
            return null;
    }
}

// Backend se calculation karwana
async function calculateResult() {
    const pattern =
        /^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*$/;

    const match = currentExpression.match(pattern);

    if (!match) {
        message.textContent = "Example: 5+3 ya 10/2";
        return;
    }

    const a = Number(match[1]);
    const operator = match[2];
    const b = Number(match[3]);
    const operation = getOperation(operator);

    if (operator === "/" && b === 0) {
        message.textContent = "Cannot divide by zero";
        return;
    }

    message.textContent = "Calculating...";
    
    try {
        const url =
            `${API_URL}?a=${encodeURIComponent(a)}` +
            `&b=${encodeURIComponent(b)}` +
            `&operation=${encodeURIComponent(operation)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.result === undefined || data.result === null) {
            throw new Error("Result backend se nahi mila");
        }

        // Sirf result dikhana hai, poora object nahi
        resultDisplay.textContent = String(data.result);
        message.textContent = "Calculated by .NET backend";

        // Agli calculation ke liye result ko expression bana do
        currentExpression = String(data.result);
        updateExpression();

    } catch (error) {
        console.error("Calculator error:", error);
        message.textContent =
            "Backend connect nahi hua. .NET API check karo.";
    }
}

// Screen ke buttons par click handle karna
if (buttons) {
    buttons.addEventListener("click", function (event) {
        const button = event.target.closest("button");

        if (!button || !buttons.contains(button)) {
            return;
        }

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearCalculator();
        } else if (action === "delete") {
            deleteLastCharacter();
        } else if (action === "calculate") {
            calculateResult();
        } else if (value !== undefined) {
            currentExpression += value;
            updateExpression();
            message.textContent = "Ready to calculate";
        }
    });
}

// Keyboard support: numbers aur operators type karna
document.addEventListener("keydown", function (event) {
    // Agar kisi doosre input mein typing ho rahi hai to interfere mat karo
    if (
        event.target instanceof HTMLElement &&
        event.target.matches("input:not(#expression), textarea")
    ) {
        return;
    }

    const key = event.key;

    // Numbers, decimal aur operators
    if (/^[0-9.+*/-]$/.test(key)) {
        currentExpression += key;
        updateExpression();
        message.textContent = "Ready to calculate";
    }

    // Enter ya = dabane par calculation
    else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
    }

    // Backspace se last character delete
    else if (key === "Backspace") {
        event.preventDefault();
        deleteLastCharacter();
    }

    // Escape se calculator clear
    else if (key === "Escape") {
        clearCalculator();
    }
});
