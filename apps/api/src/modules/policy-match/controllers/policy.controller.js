const service=require('../services/policy.service');
const response=require('../../../common/response');
exports.list=async(req,res)=>res.json(response.success(await service.list(req.validated.subjectType)));
exports.detail=async(req,res)=>res.json(response.success(await service.detail(req.validated.id)));
exports.benefits=async(req,res)=>res.json(response.success(await require('../services/benefit.service').get(req.user.id,req.validated.id)));
exports.favorites=async(req,res)=>res.json(response.success(await service.favorites(req.user.id)));
exports.favorite=async(req,res)=>res.json(response.success(await service.favorite(req.user.id,req.validated.id,req.method==='PUT')));
