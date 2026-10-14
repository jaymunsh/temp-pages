'use strict';

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
