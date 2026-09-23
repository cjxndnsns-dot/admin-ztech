const { clearCookie, json } = require('./_admin_common');
exports.handler = async (event) => json({success:true},200,{'Set-Cookie':clearCookie()});
