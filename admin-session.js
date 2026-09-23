const { requireAdmin, json } = require('./_admin_common');
exports.handler = async (event) => {
  if(event.httpMethod!=='GET') return json({success:false,message:'Method không hợp lệ'},405);
  const s=requireAdmin(event,false); if(!s) return json({success:false,authenticated:false},401);
  return json({success:true,authenticated:true,expires:s.exp,csrf:s.csrf});
};
