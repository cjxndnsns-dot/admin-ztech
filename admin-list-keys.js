const { requireAdmin, json, unauthorized, firebaseReadKeys } = require('./_admin_common');
exports.handler = async (event) => {
  if(event.httpMethod!=='GET') return json({success:false,message:'Method không hợp lệ'},405);
  if(!requireAdmin(event,false)) return unauthorized();
  try {
    const data=await firebaseReadKeys();
    const list=Object.entries(data&&typeof data==='object'?data:{}).map(([key,v])=>({
      key,name:v?.name||v?.user||'USER',active:v?.active!==false,expiry:v?.expiry??v?.expires??v?.expiration??null,
      deviceLimit:Number(v?.deviceLimit??v?.maxDevices??0)||0,devices:Array.isArray(v?.devices)?v.devices.length:(v?.devices&&typeof v.devices==='object'?Object.keys(v.devices).length:0)
    })).sort((a,b)=>a.key.localeCompare(b.key));
    return json({success:true,keys:list});
  } catch(e) { console.error('admin-list-keys',e); return json({success:false,message:'Không đọc được Firebase'},502); }
};
