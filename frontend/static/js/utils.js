
// frontend/static/js/utils.js - shared helpers

function showToast(message, type='info', duration=4000) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id='toast-container'; document.body.appendChild(c); }
  const icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ'}</span><span>${message}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

async function api(path, options={}) {
  const defaults = {headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},credentials:'same-origin'};
  const merged = {...defaults,...options,headers:{...defaults.headers,...(options.headers||{})}};
  try {
    const res = await fetch(path, merged);
    const data = await res.json();
    return {ok:res.ok, status:res.status, data};
  } catch(e) { return {ok:false, status:0, data:{success:false,message:'Network error'}}; }
}
const apiGet = p => api(p);
const apiPost = (p,b) => api(p,{method:'POST',body:JSON.stringify(b)});
const apiPut = (p,b) => api(p,{method:'PUT',body:JSON.stringify(b)});
const apiDelete = p => api(p,{method:'DELETE'});

function formatCurrency(n) {
  return '\u20b9' + Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function formatDate(s) {
  if (!s) return '\u2014';
  const d = new Date(s);
  return d.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function formatDateOnly(s) {
  if (!s) return '\u2014';
  return new Date(s).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function orderStatusBadge(status) {
  const m={pending:'warning',confirmed:'info',preparing:'info',ready:'primary',delivered:'success',cancelled:'error'};
  const i={pending:'\u23f3',confirmed:'\u2713',preparing:'\ud83c\udf73',ready:'\ud83d\udd14',delivered:'\u2705',cancelled:'\u2715'};
  return `<span class="badge badge-${m[status]||'muted'}">${i[status]||''} ${status}</span>`;
}
function paymentStatusBadge(status) {
  const m={pending:'warning',completed:'success',failed:'error',refunded:'info'};
  return `<span class="badge badge-${m[status]||'muted'}">${status}</span>`;
}
function vegDot(isVeg) {
  return `<span class="veg-dot ${isVeg?'veg':'non-veg'}" title="${isVeg?'Vegetarian':'Non-Veg'}"></span>`;
}
function imgError(el) { el.src='/static/images/placeholder.jpg'; el.onerror=null; }

async function refreshCartBadge() {
  try {
    const {data} = await apiGet('/api/cart/');
    const count = data.data?.count||0;
    document.querySelectorAll('.cart-badge').forEach(b=>{
      b.textContent=count; b.style.display=count>0?'flex':'none';
    });
  } catch(e){}
}

async function getCurrentUser() {
  const {ok,data} = await apiGet('/api/auth/me');
  return ok ? data : null;
}
async function logout() { await apiPost('/api/auth/logout',{}); window.location.href='/'; }
async function staffLogout() { await apiPost('/api/auth/staff/logout',{}); window.location.href='/admin/login'; }

function setLoading(btn, loading) {
  if (loading) { btn._orig=btn.innerHTML; btn.innerHTML='<span class="spinner"></span>'; btn.disabled=true; }
  else { btn.innerHTML=btn._orig||btn.innerHTML; btn.disabled=false; }
}
function showFieldError(el, msg) {
  el.classList.add('error');
  let e=el.parentElement.querySelector('.form-error');
  if (!e) { e=document.createElement('p'); e.className='form-error'; el.parentElement.appendChild(e); }
  e.textContent=msg;
}
function clearFieldError(el) {
  el.classList.remove('error');
  el.parentElement.querySelector('.form-error')?.remove();
}
function clearAllErrors(form) { form.querySelectorAll('.form-input.error').forEach(clearFieldError); }

window.addEventListener('scroll',()=>{
  const nav=document.querySelector('.navbar');
  if(nav) nav.classList.toggle('scrolled', window.scrollY>20);
});

document.addEventListener('DOMContentLoaded',()=>{
  const ham=document.querySelector('.nav-hamburger'), links=document.querySelector('.nav-links');
  if(ham&&links){
    ham.addEventListener('click',()=>links.classList.toggle('open'));
    document.addEventListener('click',e=>{ if(!ham.contains(e.target)&&!links.contains(e.target)) links.classList.remove('open'); });
  }
  if(document.querySelector('.cart-badge')) refreshCartBadge();
});
