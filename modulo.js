/* Disegno del modulo di iscrizione come immagine (usato da modulo.html).
   d = {tipo:'si'|'no', nome, luogo, nascita, indirizzo, citta, tel, email, corsi:[codici], data} */

const TUTTI_CORSI = CORSI.flatMap(c => c.c.map(x => ({cat:c.n, cod:x[0], tit:x[1], doc:x[2], giorno:x[3]})));

/* dati <-> testo compatto da mettere nel link (dopo il #, non arriva a nessun server) */
function codificaDati(o){
  const b = new TextEncoder().encode(JSON.stringify(o)); let s = '';
  b.forEach(x => s += String.fromCharCode(x));
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodificaDati(t){
  const s = atob(t.replace(/-/g,'+').replace(/_/g,'/'));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(s, c => c.charCodeAt(0))));
}

function righe(ctx, testo, maxW){
  const parole = testo.split(' '), out = []; let r = '';
  parole.forEach(p => { const prova = r ? r + ' ' + p : p;
    if (ctx.measureText(prova).width > maxW && r){ out.push(r); r = p; } else r = prova; });
  if (r) out.push(r); return out;
}

function disegnaModulo(d, logo){
  const W = 1080, M = 60, F = 'Segoe UI, Roboto, Arial, sans-serif';
  const lista = TUTTI_CORSI.filter(c => d.corsi.includes(c.cod));
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  // altezza stimata con margine abbondante, poi si ritaglia
  c.width = W; c.height = 1300 + lista.length * 130;
  ctx.fillStyle = '#fbf9f4'; ctx.fillRect(0,0,W,c.height);

  // intestazione
  ctx.fillStyle = '#1f6f5c'; ctx.fillRect(0,0,W,230);
  ctx.fillStyle = '#fff'; ctx.fillRect(M, 40, 320, 150);
  if (logo && logo.complete && logo.naturalWidth){
    const h = 130, w = logo.naturalWidth * h / logo.naturalHeight;
    ctx.drawImage(logo, M + (320 - w)/2, 50, w, h);
  }
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
  ctx.font = `700 46px ${F}`; ctx.fillText('MODULO DI ISCRIZIONE', 420, 105);
  ctx.font = `700 46px ${F}`; ctx.fillText('SOCIO', 420, 160);
  ctx.font = `400 30px ${F}`; ctx.fillText('L.U.T.E. Milazzo · Anno 2026/2027', 420, 205);

  let y = 300;
  ctx.fillStyle = '#22302c'; ctx.font = `400 28px ${F}`;
  righe(ctx, "Il/La sottoscritto/a chiede l'iscrizione alla L.U.T.E. di Milazzo per l'anno di attività 2026/2027 e dichiara:", W - 2*M)
    .forEach(r => { ctx.fillText(r, M, y); y += 40; });
  y += 20;

  const dati = d.tipo === 'si' ? [
    ['Nuovo socio', 'SÌ – prima iscrizione'],
    ['Cognome e Nome', d.nome], ['Nato/a a', d.luogo], ['il', d.nascita],
    ['Indirizzo', d.indirizzo], ['Città', d.citta],
    ['Tel./Cell.', d.tel], ['Email', d.email]
  ] : [
    ['Nuovo socio', 'NO – già socio'],
    ['Cognome e Nome', d.nome], ['Data di nascita', d.nascita]
  ];
  dati.forEach(([k, v]) => {
    ctx.fillStyle = '#4f605b'; ctx.font = `600 28px ${F}`; ctx.fillText(k, M, y);
    ctx.fillStyle = '#000'; ctx.font = `600 34px ${F}`;
    const rr = righe(ctx, (v || '—').trim() || '—', W - 2*M - 300);
    rr.forEach((r, i) => ctx.fillText(r, M + 300, y + i*44));
    y += 44 * rr.length + 8;
    ctx.strokeStyle = '#cfd9d5'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(M, y - 20); ctx.lineTo(W - M, y - 20); ctx.stroke();
    y += 22;
  });

  // corsi
  y += 20;
  ctx.fillStyle = '#144a3d'; ctx.fillRect(M, y, W - 2*M, 64);
  ctx.fillStyle = '#fff'; ctx.font = `700 32px ${F}`;
  ctx.fillText(`Corsi che intendo frequentare (${lista.length})`, M + 20, y + 44);
  y += 100;
  lista.forEach(k => {
    ctx.fillStyle = '#1f6f5c'; ctx.fillRect(M, y - 30, 36, 36);
    ctx.fillStyle = '#fff'; ctx.font = `700 30px ${F}`; ctx.fillText('✓', M + 6, y);
    ctx.fillStyle = '#000'; ctx.font = `700 32px ${F}`;
    const rr = righe(ctx, `${k.cod} – ${k.tit}`, W - 2*M - 60);
    rr.forEach((r, i) => ctx.fillText(r, M + 56, y + i*42));
    y += 42 * rr.length;
    ctx.fillStyle = '#4f605b'; ctx.font = `400 26px ${F}`;
    ctx.fillText(`${k.doc} · ${k.giorno}`, M + 56, y); y += 56;
  });

  // consenso e data
  y += 10;
  ctx.fillStyle = '#22302c'; ctx.font = `400 26px ${F}`;
  righe(ctx, "☑ Autorizzo il trattamento dei dati personali per le finalità associative, ai sensi del Reg. UE 2016/679 (GDPR).", W - 2*M)
    .forEach(r => { ctx.fillText(r, M, y); y += 38; });
  y += 30;
  ctx.font = `600 30px ${F}`; ctx.fillText('Data: ' + d.data, M, y);
  y += 40;
  ctx.fillStyle = '#4f605b'; ctx.font = `400 22px ${F}`;
  ctx.fillText('Modulo inviato dal cellulare tramite l\'app di iscrizione L.U.T.E.', M, y);
  y += 40;

  // ritaglio all'altezza effettiva
  const out = document.createElement('canvas'); out.width = W; out.height = y;
  out.getContext('2d').drawImage(c, 0, 0);
  return out;
}
