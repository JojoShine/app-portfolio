const service=require('../services/matching.service');
const response=require('../../../common/response');
exports.create=async(req,res)=>res.json(response.success(await service.create(req.user.id,req.validated.subjectType)));
exports.list=async(req,res)=>res.json(response.success(await service.list(req.user.id,req.validated.subjectType)));
exports.detail=async(req,res)=>res.json(response.success(await service.detail(req.user.id,req.validated.id)));
