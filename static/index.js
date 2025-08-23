function decimalToBinary(number) {
    let num2 = 0
    let place = 1
    while (number > 0) {
        let reminder = number % 2
        num2 += reminder * place
        number = Math.floor(number / 2)
        place *= 10
    }
    return num2
}

function decimalToOctal(number) {
    let num2 = 0
    let place = 1
    while (number > 0) {
        let reminder = number % 8
        num2 += reminder * place
        number = Math.floor(number / 8)
        place *= 10
    }
    return num2
}

function decimalToHexadecimals(number) {
    let num2 = ""

    while (number > 0) {
        let reminder = number % 16
        if (reminder === 10) {
            reminder = "A"
        } else if (reminder === 11) {
            reminder = "B"
        } else if (reminder === 12) {
            reminder = "C"
        } else if (reminder === 13) {
            reminder = "D"
        } else if (reminder === 14) {
            reminder = "E"
        } else if (reminder === 15) {
            reminder = "F"
        }
        num2 = reminder + num2
        number = Math.floor(number / 16)
    }
    return num2
}

function binaryToDecimals(number) {
    let number_str = number.toString()
    let length = number_str.length - 1
    let index = 0

    let num2 = 0

    while (length > -1) {
        let reminder = number_str[index]
        num2 += Number(reminder) * Math.pow(2, length);
        length -= 1
        index += 1
    }
    return num2
}

function octalToDecimals(number) {
    let number_str = number.toString()
    let length = number_str.length - 1
    let index = 0

    let num2 = 0

    while (length > -1) {
        let reminder = number_str[index]
        num2 += Number(reminder) * Math.pow(8, length);
        length -= 1
        index += 1
    }
    return num2
}

function hexadecimalToDecimal(number) {
    let number_str = number.toString()
    let length = number_str.length - 1
    let index = 0

    let num2 = 0

    while (length > -1) {
        let reminder = number_str[index]
        if (reminder === "A") {
            reminder = 10
        } else if (reminder === "B") {
            reminder = 11
        } else if (reminder === "C") {
            reminder = 12
        } else if (reminder === "D") {
            reminder = 13
        } else if (reminder === "E") {
            reminder = 14
        } else if (reminder === "F") {
            reminder = 15
        }
        num2 += Number(reminder) * Math.pow(16, length);
        length -= 1
        index += 1
    }
    return num2
}

function numberConverter() {
    let input = document.getElementById("input").value;
    let output = document.getElementById("output").value;
    let num1 = document.getElementById("input_number").value

    if (input === "decimal" && output === "binary") {
        document.getElementById("output_number").value = decimalToBinary(num1)
            || 0
        console.log("Shadow the hedgehog")
    }

    if (input === "decimal" && output === "octal") {
        document.getElementById("output_number").value = decimalToOctal(num1)
            || 0
        console.log("Sonic the hedgehog")
    }

    if (input === "decimal" && output === "hexadecimal") {
        document.getElementById("output_number").value = decimalToHexadecimals(num1)
            || 0
        console.log("Silver the hedgehog")
    }

    if (input === "binary" && output === "decimal") {
        document.getElementById("output_number").value = binaryToDecimals(num1)
            || 0
        console.log("Amy Rose")
    }

    if (input === "binary" && output === "octal") {
        let num2 = binaryToDecimals(num1)
        document.getElementById("output_number").value = decimalToOctal(num2) || 0
        console.log("Knuckles")
    }

    if (input === "binary" && output === "hexadecimal") {
        let num2 = binaryToDecimals(num1);  // Wandelt die Binärzahl in Dezimal um
        document.getElementById("output_number").value = decimalToHexadecimals(num2) || 0
        console.log("Tails")
    }

    if (input === "octal" && output === "decimal") {
        document.getElementById("output_number").value = octalToDecimals(num1)
            || 0
        console.log("Blaze")
    }

    if (input === "octal" && output === "binary") {
        let num2 = octalToDecimals(num1)
        document.getElementById("output_number").value = decimalToBinary(num2) || 0
        console.log("Espio")
    }

    if (input === "octal" && output === "hexadecimal") {
        let num2 = octalToDecimals(num1)
        document.getElementById("output_number").value = decimalToHexadecimals(num2) || 0
        console.log("Big the cat")
    }

    if (input === "hexadecimal" && output === "decimal") {
        document.getElementById("output_number").value = hexadecimalToDecimal(num1)
            || 0
        console.log("Eggman")
    }

    if (input === "hexadecimal" && output === "binary") {
        let num2 = hexadecimalToDecimal(num1)
        document.getElementById("output_number").value = decimalToBinary(num2) || 0
        console.log("Stone")
    }

    if (input === "hexadecimal" && output === "octal") {
        let num2 = hexadecimalToDecimal(num1)
        document.getElementById("output_number").value = decimalToOctal(num2) || 0
        console.log("Cream")
    }
}

let currentInputHandler = null;

function applyInputValidation(input) {
    const inputField = document.getElementById("input_number");
    let output = document.getElementById("output").value;

    if (currentInputHandler) {
        inputField.removeEventListener("input", currentInputHandler);
    }

    let handler = null;

    if (input === "binary") {
        handler = function () {
            inputField.value = inputField.value.replace(/[^01]/g, '');
            inputField.pattern = '[01]*';
        };
    } else if (input === "octal") {
        handler = function () {
            inputField.value = inputField.value.replace(/[^0-7]/g, '');
            inputField.pattern = '[0-7]*';
        };
    } else if (input === "decimal") {
        handler = function () {
            inputField.value = inputField.value.replace(/[^0-9]/g, '');
            inputField.pattern = '[0-9]*';
        };
    } else if (input === "hexadecimal") {
        handler = function () {
            inputField.value = inputField.value.replace(/[^0-9A-F]/g, '');
            inputField.pattern = '[0-9A-F]*';
        };
    }

    if (handler) {
        inputField.addEventListener("input", handler);
        currentInputHandler = handler;
    }
}

function reverseInput() {
    event.preventDefault()
    let input = document.getElementById("input").value;
    let output = document.getElementById("output").value;
    let num1 = document.getElementById("input_number").value;
    let num2 = document.getElementById("output_number").value;

    document.getElementById("output").value = input
    document.getElementById("input").value = output
    document.getElementById("output_number").value = num1
    document.getElementById("input_number").value = num2

    numberConverter()
    applyInputValidation(output)
    updateOutputOptions()
    steps()
}

// Function to update output options based on the selected input
function updateOutputOptions() {
    let input = document.getElementById("input").value; // Get the selected input value
    let outputSelect = document.getElementById("output"); // Reference the output select element
    let options = outputSelect.querySelectorAll("option"); // Get all options in the output select

    options.forEach(option => {
        // If input is the same as option value, hide that option
        if (input === option.value) {
            option.style.display = "none";  // Hide option if it matches the input value
        } else {
            option.style.display = "block"; // Show other options
        }
    });
}

// Run the function when the page loads to set initial visibility
window.addEventListener('load', function () {
    updateOutputOptions();  // Ensure the options are updated when the page load
    steps()
    site_map()
});

window.addEventListener('change', function () {
    numberConverter()
    steps()
    site_map()
});

function numberBaseToNumbers(number) {
    if (number === "binary") {
        return 2
    }
    if (number === "octal") {
        return 8
    }
    if (number === "hexadecimal") {
        return 16
    }
    if (number === "decimal") {
        return 10
    }
}

let input_full = false

function steps() {
    let input_number = document.getElementById("input_number").value;
    let output_number = document.getElementById("output_number").value;

    let input = document.getElementById("input").value;
    let output = document.getElementById("output").value;

    let side_map = document.getElementById("side_map");
    let textarea = document.getElementById("textarea");

    const newSelection = document.createElement("section");
    const article = document.getElementById("calculator")
    const h2 = document.createElement("h2");
    const div1 = document.createElement("div");

    const number_base1 = document.createElement("sub");
    const number_base2 = document.createElement("sub");
    const number1 = document.createTextNode(`${numberBaseToNumbers(input)}`);
    const number2 = document.createTextNode(`${numberBaseToNumbers(output)}`);

    number_base1.appendChild(number1);
    number_base2.appendChild(number2);
    const convert_result = document.createElement("p");
    const convert_number1 = document.createTextNode(`(${input_number})`);
    const convert_number2 = document.createTextNode(` = (${output_number})`);

    h2.textContent = "Steps:";
    convert_result.appendChild(convert_number1);
    convert_result.appendChild(number_base1);
    convert_result.appendChild(convert_number2);
    convert_result.appendChild(number_base2);
    newSelection.appendChild(div1);
    newSelection.appendChild(h2);
    newSelection.appendChild(convert_result);

    convert_result.id = "convert_numbers"
    newSelection.id = "steps"

    if (input_number !== '' && input_full === false) {
        article.appendChild(newSelection);
        console.log("shadow")
        input_full = true;
        textarea.parentNode.insertBefore(newSelection, textarea.nextSibling);

    } else if (input_number !== '' && input_full === true) {
        const existingConvertResult = document.getElementById("convert_numbers");
        existingConvertResult.textContent = '';

        // Re-append the updated content (subscripts included)
        existingConvertResult.appendChild(convert_number1);
        existingConvertResult.appendChild(number_base1);
        existingConvertResult.appendChild(convert_number2);
        existingConvertResult.appendChild(number_base2);

    } else {
        const existingSection = document.getElementById("steps");
        if (existingSection) {
            article.removeChild(existingSection);
            console.log("shadow removed");
        }
        input_full = false;  // Reset input_full
    }
}

function site_map() {
    let input = document.getElementById("input").value;
    let input_number = document.getElementById("input_number").value;

    let decimal_value = document.getElementById("decimal");
    let binary_value = document.getElementById("binary");
    let octal_value = document.getElementById("octal");
    let hexadecimal_value = document.getElementById("hexadecimal");

    if (input === "decimal") {
        decimal_value.value = input_number;
        binary_value.value = decimalToBinary(input_number);
        octal_value.value = decimalToOctal(input_number);
        hexadecimal_value.value = decimalToHexadecimals(input_number);
    }
    else if (input === "binary") {
        let decimal_num = binaryToDecimals(input_number)
        decimal_value.value = decimal_num;
        binary_value.value = input_number;
        octal_value.value = decimalToOctal(decimal_num);
        hexadecimal_value.value = decimalToHexadecimals(decimal_num);
    }
    else if (input === "octal") {
        let decimal_num = octalToDecimals(input_number)
        decimal_value.value = decimal_num;
        binary_value.value = decimalToBinary(decimal_num);
        octal_value.value = input_number;
        hexadecimal_value.value = decimalToHexadecimals(decimal_num);
    }
    else if (input === "hexadecimal") {
        let decimal_num = hexadecimalToDecimal(input_number)
        decimal_value.value = decimal_num;
        binary_value.value = decimalToBinary(decimal_num);
        octal_value.value = decimalToOctal(decimal_num);
        hexadecimal_value.value = input_number;
    }
}