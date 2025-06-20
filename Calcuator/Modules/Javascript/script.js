let expression = '';
let holdInterval = null;
let wasLongPress = false;
let lastAnswer = '';

function appendValue(value) {
  const display = document.getElementById('display');
  display.classList.remove('error', 'success');
  expression += value;
  display.value = expression;
  updateLivePreview();
}

function clearInput() {
  expression = '';
  const display = document.getElementById('display');
  display.value = '';
  display.classList.remove('error', 'success');

  // Clear history
  const historyLog = document.getElementById('historyLog');
  if (historyLog) historyLog.innerHTML = '';
  updateLivePreview();
}

function backspace() {
  const display = document.getElementById('display');
  expression = expression.slice(0, -1);
  display.value = expression;
  display.classList.remove('error', 'success');
  updateLivePreview();
}

function calculateResult() {
  const display = document.getElementById('display');
  const historyLog = document.getElementById('historyLog');

  try {
    if (expression.trim() === '') return;

    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/(\d)\(/g, '$1*(')   // 2(3) => 2*(3)
      .replace(/\)(\d)/g, ')*$1')   // (3)4 => (3)*4
      .replace(/\)\(/g, ')*(');     // (3)(4) => (3)*(4)

    const result = eval(sanitized);

    if (!isFinite(result)) {
      display.value = 'Math Error';
      display.classList.add('error');
      expression = '';
    } else {
      display.value = "Answer = " + result;
      display.classList.add('success');
      lastAnswer = result;

      // Add to history
      if (historyLog) {
        const logEntry = document.createElement('p');
        logEntry.textContent = `${expression} = ${result}`;
        historyLog.appendChild(logEntry);
        historyLog.scrollTop = historyLog.scrollHeight;
      }

      expression = result.toString();
    }

  } catch {
    display.value = 'Syntax Error';
    display.classList.add('error');
    expression = '';
  }
}

function appendAns() {
  appendValue(lastAnswer.toString());
}

// Long-press and click handling
window.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.buttons');

  buttons.forEach((btn) => {
    const value = btn.dataset.value;
    const action = btn.dataset.action;

    const trigger = () => {
      if (action === 'clear') {
        clearInput();
      } else if (action === 'backspace') {
        backspace();
      } else if (action === 'equal') {
        calculateResult();
      } else if (value !== undefined) {
        appendValue(value);
      }
    };

    let pressTimer;

    const startHold = () => {
      wasLongPress = false;
      pressTimer = setTimeout(() => {
        wasLongPress = true;
        holdInterval = setInterval(trigger, 100);
      }, 300);
    };

    const stopHold = () => {
      clearTimeout(pressTimer);
      clearInterval(holdInterval);
    };

    // Mouse
    btn.addEventListener('mousedown', startHold);
    btn.addEventListener('mouseup', stopHold);
    btn.addEventListener('mouseleave', stopHold);

    // Touch
    btn.addEventListener('touchstart', startHold);
    btn.addEventListener('touchend', stopHold);

    // Click (only if not long press)
    btn.addEventListener('click', () => {
      if (!wasLongPress) {
        trigger();
      }
    });
  });
});

// Keyboard Support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','(',')','.', '%'];

  if (allowedKeys.includes(key)) {
    appendValue(key);
  } else if (key === 'Enter') {
    e.preventDefault();
    calculateResult();
  } else if (key === 'Backspace') {
    e.preventDefault();
    backspace();
  } else if (key.toLowerCase() === 'c') {
    clearInput();
  }
});


// Live result preview
function updateLivePreview() {
  const preview = document.getElementById('livePreview');
  const display = document.getElementById('display');

  try {
    if (!expression.trim()) {
      preview.textContent = '';
      return;
    }

    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/(\d)\(/g, '$1*(')
      .replace(/\)(\d)/g, ')*$1')
      .replace(/\)\(/g, ')*(');

    const result = eval(sanitized);
    if (!isNaN(result) && isFinite(result)) {
      preview.textContent = expression + ' = '  + result;
    } else {
      preview.textContent = '';
    }
  } catch {
    preview.textContent = '';
  }
}
