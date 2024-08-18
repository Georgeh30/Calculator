// Obtener referencia al botón de cambio de tema
const themeToggle = document.getElementById('themeToggle');

// Alternar tema y guardar la preferencia en localStorage
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
});

// Obtener elementos
const screen = document.getElementById('screen');
const buttons = document.querySelectorAll('.btn');
const clearButton = document.getElementById('clear');
const deleteButton = document.getElementById('delete');
const equalButton = document.getElementById('equal');

let screenValue = "";

// Añadir eventos a los botones
buttons.forEach(button => {
    if (!button.id) {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            // Evitar operadores consecutivos o iniciar con un operador
            if (isOperator(value) && (screenValue === "" || isOperator(screenValue.slice(-1)))) {
                return;
            }

            // Evitar agregar más de un punto decimal en un número
            if (value === '.' && screenValue === '') {
                return; // No permite punto decimal al inicio
            }
            if (value === '.') {
                // Verificar si ya existe un punto en el último número
                const lastNumber = screenValue.split(/[\+\-\*\/]/).pop();
                if (lastNumber.includes('.')) {
                    return;
                }
            }

            // Agregar valor a la pantalla
            screenValue += value;
            screen.textContent = screenValue;
        });
    }
});

// Evento para el botón de igual
equalButton.addEventListener('click', () => {
    try {
        // Evaluar la expresión de forma segura
        screen.textContent = evaluateExpression(screenValue);
        screenValue = screen.textContent;
    } catch (err) {
        screen.textContent = "Error";
        screenValue = "";
    }
});

// Evento para el botón de limpiar
clearButton.addEventListener('click', () => {
    screenValue = "";
    screen.textContent = "";
});

// Evento para el botón de retroceso
deleteButton.addEventListener('click', () => {
    if (screenValue.length > 0) {
        screenValue = screenValue.slice(0, -1);
        screen.textContent = screenValue;
    }
});

// Función para verificar si es un operador
function isOperator(value) {
    return ['+', '-', '*', '/'].includes(value);
}

// Función para evaluar expresiones matemáticas de forma segura
function evaluateExpression(expression) {
    // Reemplazar caracteres no seguros y validar la expresión
    const sanitizedExpression = expression
        .replace(/[^-()\d/*+.]/g, '')  // Remover caracteres no permitidos
        .replace(/(\.\d+)(?=.*\.\d)/g, '$1');  // Remover puntos repetidos

    // Validar y detectar errores como divisiones por cero
    if (isDivisionByZero(sanitizedExpression)) {
        throw new Error("Division by zero");
    }

    // Evaluar la expresión
    try {
        // Usar `Function` en lugar de `eval` para mayor seguridad
        const result = Function('"use strict";return (' + sanitizedExpression + ')')();
        
        // Detectar si el resultado es Infinity o -Infinity
        if (!isFinite(result)) {
            throw new Error("Math Error");
        }

        return result;
    } catch (err) {
        throw new Error("Error in expression");
    }
}

// Función para verificar si hay una división por cero
function isDivisionByZero(expression) {
    // Verificar si hay divisiones por cero en la expresión
    const divisionByZeroPattern = /\/0(?![\d])/; // Mejorado para evitar coincidencias falsas
    return divisionByZeroPattern.test(expression);
}
