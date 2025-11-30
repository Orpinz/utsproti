// File: script.js
(function(){
  // Simple in-browser dataset (small) — each entry has numeric features and label
  // Features: [activity (1-3), preferenceIndex (0..n-1), goalIndex]
  const dataset = [
    {x:[1,0,0], menu:'Salad Sayur + Telur Rebus', nutrition:{cal:320,protein:18,carb:30,fat:12}}, // ringan, diet, maintain
    {x:[1,1,1], menu:'Smoothie Buah + Greek Yogurt', nutrition:{cal:280,protein:15,carb:40,fat:6}}, // ringan, manis, lose
    {x:[2,3,2], menu:'Dada Ayam + Oatmeal', nutrition:{cal:520,protein:45,carb:50,fat:12}}, // sedang, protein, gain
    {x:[3,3,2], menu:'Steak Dada + Quinoa', nutrition:{cal:680,protein:60,carb:55,fat:20}}, // berat, protein, gain
    {x:[2,4,0], menu:'Tumis Sayur + Tahu', nutrition:{cal:410,protein:22,carb:45,fat:10}}, // sedang, vegetarian, maintain
    {x:[2,1,0], menu:'Oatmeal Madu + Susu Rendah Lemak', nutrition:{cal:390,protein:14,carb:60,fat:6}},
    {x:[3,2,0], menu:'Soto Dada Ayam (rendah minyak)', nutrition:{cal:460,protein:30,carb:35,fat:18}},
    {x:[1,4,0], menu:'Gado-gado Sayur (porsi kecil)', nutrition:{cal:350,protein:12,carb:30,fat:16}},
    {x:[2,0,1], menu:'Salad Tuna + Buncis', nutrition:{cal:360,protein:28,carb:20,fat:12}}
  ];

  // Map preference and goal to indices
  const prefs = ['diet','manis','pedas','protein','vegetarian'];
  const goals = ['maintain','lose','gain'];

  // Utility: Euclidean distance
  function dist(a,b){
    let s=0; for(let i=0;i<a.length;i++){ s += (a[i]-b[i])**2; } return Math.sqrt(s);
  }

  // KNN (k=3)
  function knnPredict(xInput,k=3){
    const neighbors = dataset.map(d=>({d,dist:dist(xInput,d.x)}))
      .sort((a,b)=>a.dist-b.dist)
      .slice(0,k);
    // majority by menu label (simple voting)
    const counts = {};
    for(const n of neighbors){ counts[n.d.menu] = (counts[n.d.menu]||0) + 1; }
    // pick top
    const top = Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
    // choose the nutrition of the nearest neighbor that matches top
    const chosen = neighbors.find(n=>n.d.menu===top).d;
    return {menu:top,nutrition:chosen.nutrition,neighbors};
  }

  // DOM hooks
  const form = document.getElementById('form');
  const resultEl = document.getElementById('result');
  const nutritionEl = document.getElementById('nutrition');
  const historyEl = document.getElementById('history');
  const datasetPreview = document.getElementById('dataset-preview');

  // show dataset preview
  datasetPreview.textContent = dataset.map(d=> JSON.stringify(d)).join('\n');

  // history in-memory
  let history = [];

  function renderHistory(){
    historyEl.innerHTML = '';
    for(const it of history.slice().reverse()){
      const li = document.createElement('li');
      li.textContent = `${it.time} — ${it.name||'User'}: ${it.menu} (kal ${it.nutrition.cal})`;
      historyEl.appendChild(li);
    }
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value,10)||25;
    const gender = document.getElementById('gender').value;
    const activity = parseInt(document.getElementById('activity').value,10);
    const preference = document.getElementById('preference').value;
    const goal = document.getElementById('goal').value;

    // encode preference and goal
    const pIdx = prefs.indexOf(preference);
    const gIdx = goals.indexOf(goal);
    const x = [activity, pIdx, gIdx];

    const pred = knnPredict(x,3);

    resultEl.innerHTML = `<strong>Rekomendasi:</strong> ${pred.menu}`;
    nutritionEl.innerHTML = `Perkiraan nutrisi — Kalori: ${pred.nutrition.cal} kkal · Protein: ${pred.nutrition.protein} g · Karbohidrat: ${pred.nutrition.carb} g · Lemak: ${pred.nutrition.fat} g`;

    history.push({time:new Date().toLocaleString(), name, menu:pred.menu, nutrition:pred.nutrition});
    if(history.length>50) history.shift();
    renderHistory();

    // scroll to result
    resultEl.scrollIntoView({behavior:'smooth', block:'center'});
  });

  document.getElementById('clear').addEventListener('click', function(){
    history = [];
    renderHistory();
  });

})();
