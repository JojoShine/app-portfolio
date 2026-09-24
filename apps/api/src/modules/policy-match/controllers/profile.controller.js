const service=require('../services/profile.service');
const response=require('../../../common/response');
exports.get=async(req,res)=>res.json(response.success(await service.get(req.user.id,req.validated.subjectType)));
exports.save=async(req,res)=>res.json(response.success(await service.save(req.user.id,req.validated.subjectType,req.validated.input)));
