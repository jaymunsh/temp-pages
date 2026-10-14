'use strict';

// All amounts are the patient's out-of-pocket quotes, not the hospital's gross charges.
function calculateBudget(values, days) {
  if (!Number.isInteger(days) || days < 1 || days > 3650) throw new RangeError('Invalid days');
  for (const key of ['medical', 'care', 'room', 'extra', 'living', 'once']) {
    if (typeof values[key] !== 'number' || !Number.isFinite(values[key]) || values[key] < 0 || values[key] > 1e9) {
      throw new RangeError('Invalid amount: ' + key);
    }
  }
  const medical = Math.round(values.medical * days / 30);
  const care = Math.round(values.care * days);
  const room = Math.round(values.room * days);
  const extra = Math.round(values.extra * days / 30);
  const living = Math.round(values.living * days / 30);
  const once = Math.round(values.once);
  return { medical, care, room, extra, living, once, total: medical + care + room + extra + living + once };
}

if (typeof document !== 'undefined') {
  const money = value => value.toLocaleString('ko-KR') + '원';
  const fields = ['medical', 'care', 'room', 'extra', 'living', 'once'];
  const form = document.getElementById('budget-form');
  const result = document.getElementById('budget-result');
  const status = document.getElementById('budget-status');
  let mode = 'quote';

  function renderBudget() {
    if (!form.checkValidity() || fields.some(key => document.getElementById(key).value.trim() === '')) {
      result.hidden = true;
      status.textContent = '모든 금액을 0 이상의 숫자로 입력해 주세요. 비용이 없는 항목은 0을 입력하세요.';
      return;
    }
    const values = Object.fromEntries(fields.map(key => [key, Number(document.getElementById(key).value)]));
    try {
      const days = Number(document.getElementById('days').value);
      const budget = calculateBudget(values, days);
      result.hidden = false;
      document.getElementById('budget-total').textContent = money(budget.total);
      document.getElementById('budget-period').textContent = days + '일 예상 지출 · 환급 차감 전';
      for (const key of fields) document.getElementById('out-' + key).textContent = money(budget[key]);
      for (const duration of [30, 90, 180]) document.getElementById('total-' + duration).textContent = money(calculateBudget(values, duration).total);
      const resultSummary = days + '일 예상 지출 ' + money(budget.total) + '. ';
      status.textContent = resultSummary + (mode === 'example' ? '가상 계산 예시입니다. 병원 가격이나 평균 시세가 아닙니다.' : '입력한 금액을 바탕으로 계산했습니다. 빈 견적을 0으로 대신 입력하면 예산이 과소 계산될 수 있습니다.');
    } catch (_) {
      result.hidden = true;
      status.textContent = '금액은 0~10억 원, 기간은 1~3,650일 범위로 입력해 주세요.';
    }
  }

  form.addEventListener('input', () => { mode = 'quote'; renderBudget(); });
  document.querySelectorAll('[data-days]').forEach(button => button.addEventListener('click', () => {
    document.getElementById('days').value = button.dataset.days;
    renderBudget();
  }));
  document.getElementById('load-example').addEventListener('click', () => {
    const example = { medical: 900000, care: 100000, room: 0, extra: 200000, living: 100000, once: 150000 };
    for (const key of fields) document.getElementById(key).value = example[key];
    document.getElementById('days').value = 30;
    mode = 'example';
    renderBudget();
  });
  document.getElementById('clear-budget').addEventListener('click', () => {
    form.reset();
    mode = 'quote';
    result.hidden = true;
    status.textContent = '병원 견적을 입력하면 계산됩니다. 확인하지 않은 항목은 먼저 병원에 문의해 주세요.';
  });

  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
  const search = document.getElementById('hospital-search');
  const region = document.getElementById('hospital-region');
  function filterHospitals() {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('#hospital-table tbody tr').forEach(row => {
      const show = (region.value === '전체' || row.dataset.region === region.value) && row.textContent.toLowerCase().includes(query);
      row.hidden = !show;
      if (show) count++;
    });
    document.getElementById('hospital-count').textContent = count + '개 기관';
    document.getElementById('no-hospitals').hidden = count !== 0;
  }
  search.addEventListener('input', filterHospitals);
  region.addEventListener('change', filterHospitals);
  // Print the whole directory and FAQ, then restore the user's screen state.
  let detailsState = null;
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('#hospital-table tbody tr').forEach(row => { row.hidden = false; });
    if (detailsState === null) {
      detailsState = Array.from(document.querySelectorAll('details'), element => ({ element, open: element.open }));
    }
    detailsState.forEach(({ element }) => { element.open = true; });
  });
  window.addEventListener('afterprint', () => {
    filterHospitals();
    if (detailsState !== null) detailsState.forEach(({ element, open }) => { element.open = open; });
    detailsState = null;
  });
}
