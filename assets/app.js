// SmartCalc Hub logic
(function(){
  const $ = sel => document.querySelector(sel);
  // Year
  $('#year').textContent = new Date().getFullYear();

  // ----- Basic Calculator -----
  const disp = $('#calc-display');
  const keys = document.querySelectorAll('.keys button');

  function append(val){ disp.value += val; }
  function clearDisp(){ disp.value = ''; }
  function back(){ disp.value = disp.value.slice(0,-1); }
  function sqrt(){ 
    try {
      const v = safeEval(disp.value);
      disp.value = Math.sqrt(v).toString();
    } catch(e){ disp.value = 'Error'; }
  }
  function eq(){
    try {
      disp.value = safeEval(disp.value).toString();
    } catch(e){ disp.value = 'Error'; }
  }

  // Safer evaluator: allow digits, operators, parentheses, decimal point, ** for power
  function safeEval(expr){
    if(!expr) return 0;
    const ok = /^[0-9+\-*/().\s^*]+$/i.test(expr);
    if(!ok) throw new Error('Bad chars');
    // Replace '^' with '**' if user typed it
    expr = expr.replace(/\^/g,'**');
    // Use Function instead of eval; still evaluate arithmetic only
    // eslint-disable-next-line no-new-func
    return Function('return (' + expr + ')')();
  }

  keys.forEach(b=>{
    const val = b.getAttribute('data-val');
    const act = b.getAttribute('data-act');
    if(val){
      b.addEventListener('click', ()=> append(val));
    } else if(act){
      const map = {clear:clearDisp, back:back, sqrt:sqrt, eq:eq};
      b.addEventListener('click', map[act]);
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (e)=>{
    const k = e.key;
    if(/[0-9+\-*/().]/.test(k)) append(k);
    else if(k==='Enter') eq();
    else if(k==='Backspace') back();
    else if(k==='Escape') clearDisp();
    else if(k==='^') append('**');
  });

  // ----- BMI -----
  $('#bmi-btn').addEventListener('click', ()=>{
    const h = parseFloat($('#bmi-h').value);
    const w = parseFloat($('#bmi-w').value);
    if(!(h>0 && w>0)) return $('#bmi-out').textContent = 'Please enter valid height and weight.';
    const m = h/100;
    const bmi = w/(m*m);
    let cat = 'Normal';
    if(bmi<18.5) cat='Underweight';
    else if(bmi<25) cat='Normal';
    else if(bmi<30) cat='Overweight';
    else cat='Obesity';
    $('#bmi-out').textContent = `BMI: ${bmi.toFixed(2)} (${cat})`;
  });

  // ----- Age -----
  $('#age-btn').addEventListener('click', ()=>{
    const dobStr = $('#age-dob').value;
    if(!dobStr) return $('#age-out').textContent = 'Please select your date of birth.';
    const dob = new Date(dobStr);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();
    if(days < 0){
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if(months < 0){ years -= 1; months += 12; }
    $('#age-out').textContent = `${years} years, ${months} months, ${days} days.`;
  });

  // ----- Percentage / Discount -----
  function num(v){ return parseFloat(v); }
  function getVP(){
    return [num($('#pct-value').value), num($('#pct-percent').value)];
  }
  $('#pct-of').addEventListener('click', ()=>{
    const [v,p] = getVP();
    if(isNaN(v)||isNaN(p)) return $('#pct-out').textContent = 'Enter value and percent.';
    $('#pct-out').textContent = `${p}% of ${v} = ${(v*p/100).toFixed(2)}`;
  });
  $('#pct-inc').addEventListener('click', ()=>{
    const [v,p] = getVP();
    if(isNaN(v)||isNaN(p)) return $('#pct-out').textContent = 'Enter value and percent.';
    $('#pct-out').textContent = `Increase: ${(v*(1+p/100)).toFixed(2)}`;
  });
  $('#pct-dec').addEventListener('click', ()=>{
    const [v,p] = getVP();
    if(isNaN(v)||isNaN(p)) return $('#pct-out').textContent = 'Enter value and percent.';
    $('#pct-out').textContent = `Decrease: ${(v*(1-p/100)).toFixed(2)}`;
  });
  $('#pct-discount').addEventListener('click', ()=>{
    const [v,p] = getVP();
    if(isNaN(v)||isNaN(p)) return $('#pct-out').textContent = 'Enter value and percent.';
    const save = (v*p/100);
    $('#pct-out').textContent = `Discounted price: ${(v-save).toFixed(2)} (You save ${save.toFixed(2)})`;
  });

  // ----- EMI -----
  $('#emi-btn').addEventListener('click', ()=>{
    const P = parseFloat($('#emi-principal').value);
    const annual = parseFloat($('#emi-rate').value);
    const n = parseInt($('#emi-months').value,10);
    if(!(P>0 && annual>=0 && n>0)) return $('#emi-out').textContent = 'Please enter valid inputs.';
    const r = annual/12/100;
    const factor = Math.pow(1+r, n);
    const emi = P * r * factor / (factor - 1);
    const total = emi * n;
    const interest = total - P;
    $('#emi-out').innerHTML = `
      <div>Monthly EMI: <strong>${emi.toFixed(2)}</strong></div>
      <div>Total Interest: <strong>${interest.toFixed(2)}</strong></div>
      <div>Total Payment: <strong>${total.toFixed(2)}</strong></div>
    `;
  });
})();