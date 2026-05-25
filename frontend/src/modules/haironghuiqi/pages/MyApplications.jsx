import React, { useState, useEffect } from 'react';
import { Trash2, FileText, Info } from 'lucide-react';
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
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((app) => app.id));
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
    <div className="w-screen min-h-screen bg-gray-50 pb-32">
      {/* Main Content */}
      <main className="px-4 pt-6 max-w-2xl mx-auto w-full">
        {/* Hero Section / Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-1">我的资金方案</h2>
          <p className="text-sm text-gray-600">查看和管理您的待处理申请。</p>
        </div>

        {/* Status Overview Card */}
        <div className="bg-blue-900 rounded-xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs opacity-80 mb-1 uppercase tracking-wider font-semibold">方案进度</p>
            <p className="text-2xl font-bold mb-4">{applications.length} 个待处理申请</p>
            <div className="flex gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">准备提交</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
            <FileText size={120} className="text-white" />
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4" id="product-container">
            {applications.map((application) => (
              <label
                key={application.id}
                className="group relative block bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all hover:border-blue-900 cursor-pointer active:scale-[0.98]"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(application.id)}
                  onChange={() => handleSelectApplication(application.id)}
                  className="absolute opacity-0 w-0 h-0"
                />
                <div className="flex gap-4">
                  {/* Checkbox Visual */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 border-2 rounded flex items-center justify-center transition-colors mt-1 ${
                      selectedIds.includes(application.id)
                        ? 'bg-blue-900 border-blue-900'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedIds.includes(application.id) && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Application Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                          {application.Institution?.name}
                        </p>
                        <h3 className="text-base font-semibold text-blue-900">
                          {application.Product?.name}
                        </h3>
                      </div>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2">
                        待提交
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {application.Product?.description || '暂无说明'}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                      <Info size={16} className="text-blue-900 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 italic">
                        {application.requirementDescription || '暂无需求说明'}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
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
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${
                selectedIds.length === applications.length && applications.length > 0
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
              }`}
            >
              {selectedIds.length === applications.length && applications.length > 0 && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={selectedIds.length === applications.length && applications.length > 0}
              onChange={handleSelectAll}
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