const { ADMIN_USER, validPassword, makeAdminSession, setCookie, json } = require('./_admin_common');
let attempts = new Map();
exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return json({success:false,message:'Method không hợp lệ'},405);
  let body={}; try{body=JSON.parse(event.body||'{}')}catch(_){return json({success:false,message:'Dữ liệu không hợp lệ'},400)}
  const user=String(body.username||'').trim(); const pass=String(body.password||'');
  const ip=String(event.headers?.['x-nf-client-connection-ip']||event.headers?.['x-forwarded-for']||'unknown').split(',')[0].trim();
  const now=Date.now(); const a=attempts.get(ip)||{n:0,until:0};
  if(a.until>now) return json({success:false,message:'Thử lại sau ít phút'},429,{'Retry-After':String(Math.ceil((a.until-now)/1000))});
  if(user!==ADMIN_USER || !validPassword(pass)) {
    a.n++; if(a.n>=5){a.n=0;a.until=now+5*60} attempts.set(ip,a);
    return json({success:false,message:'Sai tài khoản hoặc mật khẩu'},401);
  }
  attempts.delete(ip);
  const s=makeAdminSession();
  return json({success:true,csrf:s.csrf,expires:s.exp},200, {'Set-Cookie':setCookie(s.token)});
};
