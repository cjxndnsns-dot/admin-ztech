'use strict';
(function(){
let csrf='';
const $=id=>document.getElementById(id);
const msg=(el,t,c)=>{el.textContent=t;el.className='msg '+(c||'')};
async function api(url,opt={}){opt.credentials='same-origin';opt.headers=Object.assign({'Accept':'application/json','Content-Type':'application/json'},opt.headers||{});const r=await fetch(url,opt);const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.message||'Lỗi máy chủ');return d}
function showApp(){ $('login').classList.add('hidden');$('app').classList.remove('hidden');load(); }
async function check(){try{const d=await api('/api/admin-session',{headers:{'Content-Type':'application/json'}});if(d.success){csrf=d.csrf;showApp()}}catch(_){}}
$('loginBtn').onclick=async()=>{const m=$('loginMsg');try{$('loginBtn').disabled=true;msg(m,'⟳ ĐANG XÁC THỰC...');const d=await api('/api/admin-login',{method:'POST',body:JSON.stringify({username:$('username').value,password:$('password').value})});csrf=d.csrf;msg(m,'✓ ĐĂNG NHẬP THÀNH CÔNG','ok');showApp()}catch(e){msg(m,'✗ '+e.message,'err')}finally{$('loginBtn').disabled=false}};
$('password').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginBtn').click()});
async function load(){try{const d=await api('/api/admin-list-keys');const keys=d.keys||[];$('count').textContent=keys.length+' key';if(!keys.length){$('table').innerHTML='<div class="empty">Chưa có key nào.</div>';return}const h='<div class="item head"><div>KEY</div><div>TÊN</div><div>TRẠNG THÁI</div><div>THIẾT BỊ</div><div>HẾT HẠN</div></div>';const rows=keys.map(k=>{const exp=k.expiry?new Date(k.expiry).toLocaleDateString('vi-VN'):'Vĩnh viễn';return '<div class="item"><div class="key">'+esc(k.key)+'</div><div>'+esc(k.name)+'</div><div><span class="badge">'+(k.active?'ACTIVE':'OFF')+'</span></div><div>'+k.devices+(k.deviceLimit?' / '+k.deviceLimit:'')+'</div><div>'+exp+'</div></div>'}).join('');$('table').innerHTML=h+rows}catch(e){$('table').innerHTML='<div class="empty">'+esc(e.message)+'</div>'}}
$('refresh').onclick=load;
$('create').onclick=async()=>{const m=$('createMsg');try{$('create').disabled=true;msg(m,'⟳ ĐANG TẠO KEY...');const d=await api('/api/admin-create-key',{method:'POST',headers:{'X-CSRF-Token':csrf},body:JSON.stringify({name:$('name').value,days:$('days').value,deviceLimit:$('limit').value})});msg(m,'✓ KEY MỚI: '+d.key,'ok');await load();}catch(e){msg(m,'✗ '+e.message,'err')}finally{$('create').disabled=false}};
$('logout').onclick=async()=>{await fetch('/api/admin-logout',{method:'POST',credentials:'same-origin'});location.reload()};
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
check();
})();
