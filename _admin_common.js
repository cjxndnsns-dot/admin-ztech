const crypto = require('crypto');
const FIREBASE_URL = 'https://aimlock-key-default-rtdb.firebaseio.com';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'TIEN';
const ADMIN_PASS_SALT = process.env.ADMIN_PASSWORD_SALT || '0bb47feb9929ba91d2715a1d17991754';
const ADMIN_PASS_HASH = process.env.ADMIN_PASSWORD_HASH || '0de2cac50692be82e00106b1451c675d9a17e65783ed1b98dd141ddca347b6e4f904306a386a6a67c826a840e9a4259117c68faa2b15f9af346abd416ff085fe';
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'ZTECH-ADMIN-2026-9d3f1b7a6c4e2f8a0b5d1e9c7a3f6b2d';
const COOKIE='__Host-ztech_admin'; const TTL=30*60;
function b64u(v){return Buffer.from(v).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'')}
function fromB64u(v){return Buffer.from(v.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-v.length%4)%4),'base64')}
function sign(payload){const h=b64u(JSON.stringify({alg:'HS256',typ:'ZTECH-ADMIN'}));const p=b64u(JSON.stringify(payload));const s=b64u(crypto.createHmac('sha256',ADMIN_SECRET).update(h+'.'+p).digest());return h+'.'+p+'.'+s}
function verify(token){try{const [h,p,s]=String(token||'').split('.');if(!h||!p||!s)return null;const expected=b64u(crypto.createHmac('sha256',ADMIN_SECRET).update(h+'.'+p).digest());const a=Buffer.from(s),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;const d=JSON.parse(fromB64u(p).toString('utf8'));if(d.role!=='admin'||!d.exp||d.exp*1000<=Date.now())return null;return d}catch(_){return null}}
function cookie(event){const raw=event.headers?.cookie||event.headers?.Cookie||'';const found=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));return found?decodeURIComponent(found.slice(COOKIE.length+1)):''}
function adminSession(event){return verify(cookie(event))}
function hashPassword(password){return crypto.scryptSync(String(password),ADMIN_PASS_SALT,64)}
function validPassword(password){const expected=Buffer.from(ADMIN_PASS_HASH,'hex');const actual=hashPassword(password);return expected.length===actual.length&&crypto.timingSafeEqual(expected,actual)}
function makeAdminSession(){const exp=Math.floor(Date.now()/1000)+TTL;const csrf=b64u(crypto.randomBytes(32));return{token:sign({role:'admin',exp,csrf}),csrf,exp}}
function setCookie(token){return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`}
function clearCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}
function json(data,status=200,extra={}){return{statusCode:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate','Pragma':'no-cache','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',...extra},body:JSON.stringify(data)}}
function unauthorized(){return json({success:false,message:'UNAUTHORIZED'},401)}
function requireAdmin(event,csrf=false){const s=adminSession(event);if(!s)return null;if(csrf){const supplied=event.headers?.['x-csrf-token']||event.headers?.['X-CSRF-Token']||'';if(!supplied||supplied!==s.csrf)return null}return s}
function firebaseUrl(path){const token=process.env.FIREBASE_DB_TOKEN;return FIREBASE_URL+path+(token?((path.includes('?')?'&':'?')+'auth='+encodeURIComponent(token)): '')}
async function firebaseReadKeys(){const r=await fetch(firebaseUrl('/keys.json'),{cache:'no-store'});if(!r.ok)throw new Error('Firebase HTTP '+r.status);return r.json()}
async function firebaseWriteKey(key,data){return fetch(firebaseUrl('/keys/'+encodeURIComponent(key)+'.json'),{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(data)})}
function newKey(){return 'ZTECH-'+crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{1,8}/g).join('-')}
module.exports={ADMIN_USER,validPassword,makeAdminSession,setCookie,clearCookie,adminSession,requireAdmin,json,unauthorized,firebaseReadKeys,firebaseWriteKey,newKey};
