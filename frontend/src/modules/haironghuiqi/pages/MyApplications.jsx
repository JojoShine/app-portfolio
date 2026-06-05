import React, { useState, useEffect } from 'react';
import { Trash2, FileText, Award } from 'lucide-react';
import featuredImage from '../assets/service_search/isFeatured.png';
import { Dialog, NoticeBar } from 'antd-mobile';
import applicationService from '../services/applicationService';

/**
 * 我的资金方案页面
 * 显示用户的资金方案列表，支持勾选、提交、删除等操作
 */
const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // TODO: 获取当前用户ID，暂时使用测试用户ID
  const userId = 'test-user-id';

  // 获取申请列表
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const result = await applicationService.getUserApplications(userId, { page: 1, pageSize: 100 });
        setApplications(result.items || []);
      } catch (error) {
        console.error('获取申请列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userId]);

  // 处理勾选
  const handleSelectApplication = (applicationId) => {
    // 如果已经提交，不允许勾选
    const application = applications.find(app => app.id === applicationId);
    if (application && application.status === 'submitted') {
      return;
    }
    
    setSelectedIds((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    // 只选择未提交的申请
    const unsubmittedApps = applications.filter(app => app.status !== 'submitted');
    
    if (selectedIds.length === unsubmittedApps.length && unsubmittedApps.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unsubmittedApps.map((app) => app.id));
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setNotification({ show: true, message: '请先选择要提交的申请', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      return;
    }

    try {
      setSubmitting(true);
      await applicationService.submitApplications(selectedIds);
      setNotification({ show: true, message: '申请提交成功', type: 'success' });
      setSelectedIds([]);
      // 重新获取申请列表
      const result = await applicationService.getUserApplications(userId, { page: 1, pageSize: 100 });
      setApplications(result.items || []);
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('提交申请失败:', error);
      setNotification({ show: true, message: '提交申请失败', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // 处理删除
  const handleDelete = async (applicationId) => {
    Dialog.confirm({
      title: '删除申请',
      content: '确定要删除这个申请吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await applicationService.deleteApplication(applicationId);
          setApplications((prev) => prev.filter((app) => app.id !== applicationId));
          setSelectedIds((prev) => prev.filter((id) => id !== applicationId));
          setNotification({ show: true, message: '申请删除成功', type: 'success' });
          setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
        } catch (error) {
          console.error('删除申请失败:', error);
          setNotification({ show: true, message: '删除申请失败', type: 'error' });
          setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
        }
      },
    });
  };

  return (
    <div className="w-full min-h-screen pb-[8vh]" style={{ background: 'linear-gradient(180deg, #eef2f7 0%, #f8fafc 50%, #eef2f7 100%)' }}>
      {/* Main Content */}
      <main className="px-[4vw] pt-[2vh] max-w-2xl mx-auto w-full">
        {/* Status Overview Card */}
        <div className="rounded-xl p-4 mb-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-wider font-semibold mb-0.5">方案进度</p>
              <p className="text-xl font-bold">{applications.filter(app => app.status !== 'submitted').length} 个待处理申请</p>
            </div>
            <span className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold">准备提交</span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none">
            <FileText size={80} className="text-white" />
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4" id="product-container">
            {applications.map((application) => {
              const isFeatured = application.Product?.isFeatured;
              return (
              <label
                key={application.id}
                className={`group relative block rounded-xl p-4 transition-all hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] ${
                  isFeatured ? 'border border-blue-800 shadow-lg' : ''
                }`}
                style={
                  isFeatured
                    ? {
                        position: 'relative',
                        overflow: 'hidden',
                      }
                    : {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.9) 100%)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(200,215,240,0.5)',
                        boxShadow: '0 4px 20px rgba(30,58,138,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                      }
                }
              >
                {/* 明星产品背景 */}
                {isFeatured && (
                  <>
                    <img
                      src={featuredImage}
                      alt={application.Product?.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-blue-900/20"></div>
                  </>
                )}

                <div className={`flex gap-4 ${isFeatured ? 'relative z-10' : ''}`}>
                  {/* Checkbox - 仅在未提交时显示 */}
                  {application.status !== 'submitted' && (
                    <>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="absolute opacity-0 w-0 h-0 z-10"
                      />
                      <div className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors mt-0.5 ${
                        selectedIds.includes(application.id)
                          ? 'bg-blue-900 border-blue-900'
                          : 'border-gray-300'
                      }`}>
                        {selectedIds.includes(application.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </>
                  )}

                  {/* Application Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
                          isFeatured ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {application.Institution?.name}
                        </p>
                        <h3 className={`text-base font-semibold flex items-center gap-1.5 ${
                          isFeatured ? 'text-white' : 'text-blue-900'
                        }`}>
                          {application.Product?.name}
                          {isFeatured && (
                            <Award size={16} className="text-amber-400" />
                          )}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                        isFeatured ? 'bg-amber-400/20 text-amber-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {application.status === 'submitted' ? '已提交' : '待提交'}
                      </span>
                    </div>
                    {/* 产品要素信息 */}
                    <div className="flex gap-2 mb-2">
                      <div className={`flex-1 rounded-lg px-2 py-2 text-center ${
                        isFeatured
                          ? 'bg-white/10'
                          : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
                      }`}>
                        <p className={`text-[10px] mb-0.5 ${
                          isFeatured ? 'text-white/60' : 'text-gray-400'
                        }`}>最高额度</p>
                        <p className={`font-bold text-xs ${
                          isFeatured ? 'text-amber-400' : 'text-blue-800'
                        }`}>
                          {application.Product?.maxLoanAmount ? `${application.Product.maxLoanAmount}万` : '-'}
                        </p>
                      </div>
                      <div className={`flex-1 rounded-lg px-2 py-2 text-center ${
                        isFeatured
                          ? 'bg-white/10'
                          : 'bg-gradient-to-br from-indigo-50 to-indigo-100/50'
                      }`}>
                        <p className={`text-[10px] mb-0.5 ${
                          isFeatured ? 'text-white/60' : 'text-gray-400'
                        }`}>期限</p>
                        <p className={`font-bold text-xs ${
                          isFeatured ? 'text-amber-400' : 'text-indigo-800'
                        }`}>
                          {application.Product?.maxLoanTerm ? `${application.Product.maxLoanTerm}年` : '-'}
                        </p>
                      </div>
                      <div className={`flex-1 rounded-lg px-2 py-2 text-center ${
                        isFeatured
                          ? 'bg-white/10'
                          : 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                      }`}>
                        <p className={`text-[10px] mb-0.5 ${
                          isFeatured ? 'text-white/60' : 'text-gray-400'
                        }`}>年化率</p>
                        <p className={`font-bold text-xs ${
                          isFeatured ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                          {application.Product?.minAnnualRate ? `${application.Product.minAnnualRate}%` : '-'}
                        </p>
                      </div>
                    </div>
                    <div className={`my-2 ${
                      isFeatured ? 'border-t border-white/10' : 'border-t border-gray-100'
                    }`} />
                    <p className={`text-xs ${
                      isFeatured ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      需求：{application.requirementDescription || '暂无需求说明'}
                    </p>
                  </div>
                </div>
              </label>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无申请</p>
          </div>
        )}
      </main>

      {/* Notification */}
      {notification.show && (
        <NoticeBar
          content={notification.message}
          color={notification.type === 'success' ? 'success' : 'error'}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
          }}
        />
      )}

      {/* Fixed Submission Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <label className={`flex items-center gap-2 ${applications.filter(app => app.status !== 'submitted').length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <div
              className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${
                selectedIds.length === applications.filter(app => app.status !== 'submitted').length && applications.filter(app => app.status !== 'submitted').length > 0
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
              }`}
            >
              {selectedIds.length === applications.filter(app => app.status !== 'submitted').length && applications.filter(app => app.status !== 'submitted').length > 0 && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={selectedIds.length === applications.filter(app => app.status !== 'submitted').length && applications.filter(app => app.status !== 'submitted').length > 0}
              onChange={handleSelectAll}
              disabled={applications.filter(app => app.status !== 'submitted').length === 0}
              className="hidden"
            />
            <span className="text-sm font-semibold text-gray-700">全选</span>
          </label>

          {/* Delete Button */}
          {selectedIds.length > 0 && (
            <button
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm flex items-center gap-2"
              onClick={() => {
                Dialog.confirm({
                  title: '删除申请',
                  content: `确定要删除选中的 ${selectedIds.length} 个申请吗？`,
                  confirmText: '删除',
                  cancelText: '取消',
                  onConfirm: async () => {
                    try {
                      for (const id of selectedIds) {
                        await applicationService.deleteApplication(id);
                      }
                      setApplications((prev) => prev.filter((app) => !selectedIds.includes(app.id)));
                      setSelectedIds([]);
                      setNotification({ show: true, message: '申请删除成功', type: 'success' });
                      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
                    } catch (error) {
                      console.error('删除申请失败:', error);
                      setNotification({ show: true, message: '删除申请失败', type: 'error' });
                      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
                    }
                  },
                });
              }}
            >
              <Trash2 size={18} />
              删除
            </button>
          )}

          <button
            className="ml-auto px-8 py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            onClick={handleSubmit}
            disabled={submitting || selectedIds.length === 0}
          >
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>处理中...</span>
              </>
            ) : (
              <>
                <span>提交意愿</span>
                <span>{selectedIds.length > 0 && `(${selectedIds.length})`}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MyApplications;