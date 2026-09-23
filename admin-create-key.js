const { requireAdmin, json, unauthorized, firebaseReadKeys, firebaseWriteKey, newKey } = require('./_admin_common');
exports.handler = async (event) => {
  if(event.httpMethod!=='POST') return json({success:false,message:'Method không hợp lệ'},405);
  const s=requireAdmin(event,true); if(!s) return unauthorized();
  let body={}; try{body=JSON.parse(event.body||'{}')}catch(_){return json({success:false,message:'Dữ liệu không hợp lệ'},400)}
  const name=String(body.name||'ZTECH').trim().slice(0,64) || 'ZTECH';
  const days=Math.max(0,Math.min(3650,Number(body.days)||0));
  const deviceLimit=Math.max(0,Math.min(1000,Number(body.deviceLimit)||0));
  try {
    const all=await firebaseReadKeys();
    let key;
    for(let i=0;i<8;i++){const candidate=newKey();if(!all || !Object.prototype.hasOwnProperty.call(all,candidate)){key=candidate;break;}}
    if(!key) return json({success:false,message:'Không tạo được key mới'},500);
    const expiry=days>0 ? Date.now()+days*86400000 : null;
    const data={active:true,name,expiry,deviceLimit,devices:[]};
    const r=await firebaseWriteKey(key,data);
    if(!r.ok) return json({success:false,message:'Firebase từ chối tạo key'},502);
    return json({success:true,key,data});
  } catch(e) { console.error('admin-create-key',e); return json({success:false,message:'Không kết nối được Firebase'},502); }
};
