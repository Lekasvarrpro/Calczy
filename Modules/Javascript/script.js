/* ====== STATE ====== */
let expression = "";
let lastAnswer = "";

/* ====== ELEMENTS ====== */
const display = document.getElementById("display");
const historyLog = document.getElementById("historyLog");
const livePreview = document.getElementById("livePreview");
const calculator = document.querySelector(".calculator");

/* ====== CORE FUNCTIONS ====== */
function appendValue(value) {
  display.classList.remove("error", "success");
  expression += value;
  display.value = expression;
  updateLivePreview();
}

function clearInput() {
  expression = "";
  display.value = "";
  display.classList.remove("error", "success");
  livePreview.textContent = "";
  if (historyLog) historyLog.innerHTML = "";
}

function backspace() {
  expression = expression.slice(0, -1);
  display.value = expression;
  display.classList.remove("error", "success");
  updateLivePreview();
}

function sanitizeExpression(exp) {
  return exp
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/(\d)\(/g, "$1*(")
    .replace(/\)(\d)/g, ")*$1")
    .replace(/\)\(/g, ")*(");
}

function calculateResult() {
  try {
    if (!expression.trim()) return;

    const sanitized = sanitizeExpression(expression);
    const result = eval(sanitized);

    if (!isFinite(result)) throw new Error("Math Error");

    display.value = `Ans = ${result}`;
    display.classList.add("success");
    lastAnswer = result;

    if (historyLog) {
      const p = document.createElement("p");
      p.textContent = `${expression} = ${result}`;
      historyLog.appendChild(p);
      historyLog.scrollTop = historyLog.scrollHeight;
    }

    expression = result.toString();
  } catch {
    display.value = "Error";
    display.classList.add("error");
    expression = "";
    livePreview.textContent = "";
  }
}

/* ====== LIVE PREVIEW ====== */
function updateLivePreview() {
  try {
    if (!expression.trim()) {
      livePreview.textContent = "";
      return;
    }

    const sanitized = sanitizeExpression(expression);
    const result = eval(sanitized);

    if (isFinite(result)) {
      livePreview.textContent = `${expression} = ${result}`;
    } else {
      livePreview.textContent = "";
    }
  } catch {
    livePreview.textContent = "";
  }
}

/* ====== BUTTON HANDLING ====== */
document.querySelectorAll(".btn").forEach((btn) => {
  const value = btn.dataset.value;
  const action = btn.dataset.action;

  btn.addEventListener("click", () => {
    if (action === "clear") clearInput();
    else if (action === "backspace") backspace();
    else if (action === "equal") calculateResult();
    else if (value) appendValue(value);
  });
});

/* ====== KEYBOARD SUPPORT ====== */
window.addEventListener("keydown", (e) => {
  const allowed = "0123456789+-*/().%";

  if (allowed.includes(e.key)) {
    appendValue(e.key);
  } else if (e.key === "Enter") {
    e.preventDefault();
    calculateResult();
  } else if (e.key === "Backspace") {
    e.preventDefault();
    backspace();
  } else if (e.key.toLowerCase() === "c") {
    clearInput();
  }
});

/* ====== 3D PARALLAX EFFECT (DESKTOP ONLY) ====== */
if (window.innerWidth > 768 && calculator) {
  document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 35;
    const y = (window.innerHeight / 2 - e.clientY) / 35;

    calculator.style.transform = `
      rotateY(${x}deg)
      rotateX(${y}deg)
    `;

    calculator.style.boxShadow = `
      ${-x * 2}px ${y * 2}px 40px rgba(0,245,255,0.35),
      0 25px 50px rgba(0,0,0,0.9)
    `;
  });

  document.addEventListener("mouseleave", () => {
    calculator.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}