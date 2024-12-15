// Unicode fraction mapping for parsing
const FRACTION_MAP = {
    '½': 0.5,
    '⅓': 0.333,
    '⅔': 0.667,
    '¼': 0.25,
    '¾': 0.75,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 0.167,
    '⅚': 0.833,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875
};

function decimalToFraction(decimal) {
    if (decimal % 1 === 0) return decimal; // Return whole numbers as is
    
    const tolerance = 1.0E-6; // Handle floating point precision
    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = decimal;
    
    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    return `${h1}/${k1}`;
}

function parseInputAmount(amount) {
    if (typeof amount === 'number') return amount;
    
    const amountStr = amount.toString().trim();
    
    // Check for mixed numbers with Unicode fractions (e.g., "1 ½")
    const mixedMatch = amountStr.match(/^(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
    if (mixedMatch) {
        const whole = parseInt(mixedMatch[1]);
        const fraction = FRACTION_MAP[mixedMatch[2]];
        return whole + fraction;
    }
    
    // Check for single Unicode fractions
    if (FRACTION_MAP[amountStr]) {
        return FRACTION_MAP[amountStr];
    }
    
    // Handle plain numbers
    return parseFloat(amountStr);
}

function formatFraction(decimal) {
    if (decimal % 1 === 0) return decimal.toString();
    
    const wholePart = Math.floor(decimal);
    const fractionalPart = decimal - wholePart;
    
    // Reverse mapping for fraction symbols
    const fractionSymbols = {
        0.125: '⅛',
        0.25: '¼',
        0.333: '⅓',
        0.375: '⅜',
        0.5: '½',
        0.625: '⅝',
        0.667: '⅔',
        0.75: '¾',
        0.875: '⅞'
    };
    
    // Find closest fraction
    let closest = Object.entries(fractionSymbols).reduce((closest, [dec, symbol]) => {
        return Math.abs(fractionalPart - parseFloat(dec)) < Math.abs(fractionalPart - parseFloat(closest[0])) 
            ? [dec, symbol] 
            : closest;
    }, ['1', '1']);
    
    if (Math.abs(fractionalPart - parseFloat(closest[0])) < 0.01) {
        return wholePart ? `${wholePart} ${closest[1]}` : closest[1];
    }
    
    // Fallback to decimal for uncommon fractions
    return decimal.toFixed(2);
}

function updateIngredients() {
    const activeButton = document.querySelector('.multiplier-btn.active');
    const multiplier = parseFloat(activeButton.dataset.multiplier);
    const ingredientsList = document.querySelector('.ingredients-list');
    const originalServings = parseFloat(ingredientsList.dataset.originalServings);
    
    const ingredients = ingredientsList.getElementsByTagName('li');
    
    for (let ingredient of ingredients) {
        // Skip headers and items without data-amount
        if (ingredient.classList.contains('ingredients-header') || !ingredient.dataset.amount) {
            continue;
        }
        
        const originalAmount = parseInputAmount(ingredient.dataset.amount);
        const newAmount = originalAmount * multiplier / originalServings;
        const formattedAmount = formatFraction(newAmount);
        const text = ingredient.textContent;
        const updatedText = text.replace(/[\d\s½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?=\s*(?:cup|teaspoon|tablespoon|ounce|pound|g|ml|tbsp|tsp|oz|lb|gram|milliliter|pieces?|slices?|cups|teaspoons|tablespoons|ounces|pounds|grams|milliliters|tbsps|tsps|ozs|lbs)\b)/i, formattedAmount + ' ');
        ingredient.textContent = updatedText;
    }
}

// Add event listeners for multiplier buttons
document.addEventListener('DOMContentLoaded', function() {
    const multiplierBtns = document.querySelectorAll('.multiplier-btn');
    
    multiplierBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            multiplierBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update ingredients
            updateIngredients();
        });
    });
});
