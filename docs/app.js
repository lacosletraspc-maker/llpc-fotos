(function(){
  const CFG = window.LLPC_CFG;
  const BASE = `https://cdn.jsdelivr.net/gh/${CFG.owner}/${CFG.repo}@${CFG.branch}/catalogo`;
  const app = document.getElementById('app');
  const q = document.getElementById('q');
  const waBtn = document.getElementById('whats');

  waBtn.href = `https://wa.me/${CFG.whatsapp}`;
  waBtn.onclick = () => {
    const msg = encodeURIComponent('Olá! Vi o catálogo LLPC e gostaria de um orçamento 🙂');
    waBtn.href = `https://wa.me/${CFG.whatsapp}?text=${msg}`;
  };

  window.addEventListener('hashchange', route);
  q.addEventListener('input', route);
  route();

  async function route(){
    const hash = location.hash.replace(/^#/, '');
    const term = (q.value||'').trim().toLowerCase();

    if (!hash || hash === '/') {
      const sitemap = await fetchJSON(`${BASE}/sitemap.json`);
      renderTemas(sitemap.temas, term); return;
    }

    const p = hash.split('/').filter(Boolean);
    if (p[0]==='tema' && p[1]){
      const tema = p[1];
      if (p[2]) {
        const ln = p[2];
        const data = await fetchJSON(`${BASE}/${tema}/${ln}.json`);
        renderGaleria(tema, data.items, term, ln);
      } else {
        const data = await fetchJSON(`${BASE}/${tema}/index.json`);
        renderLinhas(tema, data.items, term);
      }
      return;
    }
    location.hash = '#/';
  }

  async function fetchJSON(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(url); return r.json(); }
  function groupBy(a,fn){const m={}; for(const x of a){const k=fn(x); (m[k]=m[k]||[]).push(x);} return m;}

  function renderTemas(temas, term){
    const list = term ? temas.filter(t=>t.tema.toLowerCase().includes(term)) : temas;
    app.innerHTML = `
      <div class="breadcrumbs">Você está em: <b>Temas</b></div>
      <div class="grid">
        ${list.map(t => `
          <a class="card" href="#/tema/${t.tema}">
            <img class="thumb" src="https://dummyimage.com/800x600/0d141b/9fb3c8&text=${encodeURIComponent(t.tema)}" alt="${t.tema}">
            <div class="pad"><h4>${t.tema.replaceAll('-', ' ')}</h4><p>${t.count} fotos • ${t.linhas.length} linhas</p></div>
          </a>`).join('')}
      </div>`;
  }

  function renderLinhas(tema, items, term){
    const linhas = groupBy(items, it=>it.linha || 'root');
    const keys = Object.keys(linhas).sort();
    const list = term ? keys.filter(k=>k.toLowerCase().includes(term)) : keys;
    app.innerHTML = `
      <div class="breadcrumbs"><a href="#/">Temas</a> › <b>${tema.replaceAll('-', ' ')}</b></div>
      <div class="grid">
        ${list.map(l => `
          <a class="card" href="#/tema/${tema}/${l}">
            <img class="thumb" src="https://dummyimage.com/800x600/0d141b/9fb3c8&text=${encodeURIComponent(l==='root'?'geral':l)}" alt="${l}">
            <div class="pad"><h4>${l==='root'?'geral':l.replaceAll('-', ' ')}</h4><p>${linhas[l].length} fotos</p></div>
          </a>`).join('')}
      </div>`;
  }

  function renderGaleria(tema, items, term, linha){
    const list = term ? items.filter(it =>
      (it.produto||'').toLowerCase().includes(term) ||
      (it.tags||'').toLowerCase().includes(term) ||
      (it.arquivo_original||'').toLowerCase().includes(term)
    ) : items;

    app.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/">Temas</a> › <a href="#/tema/${tema}">${tema.replaceAll('-', ' ')}</a> › <b>${(linha||'').replaceAll('-', ' ')}</b>
      </div>
      <div class="grid">${list.map(card).join('')}</div>`;
  }

  function card(it){
    const label = (it.produto || it.arquivo_sanitizado).replaceAll('-', ' ');
    const msg = encodeURIComponent(`Olá! Gostei deste item do catálogo LLPC:\nTema: ${it.tema}\nLinha: ${it.linha||'geral'}\nArquivo: ${it.arquivo_original}\nLink: ${it.cdn}`);
    const wa = `https://wa.me/${CFG.whatsapp}?text=${msg}`;
    return `
      <div class="card">
        <img class="thumb" loading="lazy" src="${it.cdn}" alt="${label}">
        <div class="pad">
          <h4 title="${label}">${label}</h4>
          <div class="row">
            <a class="chip" target="_blank" rel="noopener" href="${it.cdn}">Abrir</a>
            <a class="chip" target="_blank" rel="noopener" href="${wa}">WhatsApp</a>
          </div>
        </div>
      </div>`;
  }
})();
