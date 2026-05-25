import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { maskUserInfo } from '../../../utils/maskUtils';
import applicationService from '../services/applicationService';
import userWorkUnitService from '../services/userWorkUnitService';

/**
 * 申请弹窗组件
 * 显示用户信息和申请文案
 */
const ApplicationModal = ({ isOpen, onClose, product, institution, applicationType, onSuccess, onError }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requirementDescription, setRequirementDescription] = useState('');
  const [editingWorkUnit, setEditingWorkUnit] = useState(false);
  const [tempWorkUnit, setTempWorkUnit] = useState('');

  // 测试用户数据
  const testUser = {
    name: '张三',
    phone: '13813975432',
    idCard: '320621200108092347',
    workUnit: '海安市融媒体中心',
  };

  // 获取用户信息
  useEffect(() => {
    if (!isOpen) return;

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        // TODO: 调用用户服务获取用户信息
        // const response = await userService.getUserInfo();
        // setUserInfo(response);

        // 暂时使用测试用户
        let userInfoData = testUser;

        // 尝试从数据库获取保存的工作单位
        try {
          const userId = 'test-user-id';
          const savedWorkUnit = await userWorkUnitService.getUserWorkUnit(userId);
          if (savedWorkUnit && savedWorkUnit.workUnit) {
            userInfoData = { ...userInfoData, workUnit: savedWorkUnit.workUnit };
          }
        } catch (error) {
          console.error('获取保存的工作单位失败:', error);
          // 如果获取失败，使用测试用户的工作单位
        }

        setUserInfo(userInfoData);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取失败，使用测试用户
        setUserInfo(testUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [isOpen]);

  // 当userInfo、product、institution变化时，自动生成需求说明
  useEffect(() => {
    if (userInfo && product && institution) {
      const generatedDescription = `我是${userInfo.name}，来自${userInfo.workUnit}，现在申请${institution.name}的${product.name}产品。我的联系方式是${userInfo.phone}。`;
      setRequirementDescription(generatedDescription);
    }
  }, [userInfo, product, institution]);

  if (!isOpen) return null;

  const maskedUser = userInfo ? maskUserInfo(userInfo) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(24, 28, 30, 0.4)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          boxShadow: '0px 20px 40px rgba(0, 26, 72, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-900 rounded-full"></div>
            <h2 className="font-semibold text-lg text-blue-900">
              {applicationType === 'apply' ? '立即申请' : '预约咨询'}
            </h2>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition-colors active:scale-95"
            onClick={onClose}
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Section 1: Personal Information */}
          {maskedUser && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-blue-900 rounded-full"></div>
                <h3 className="font-semibold text-sm text-blue-900 uppercase tracking-wider">个人信息</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 ml-1">姓名</label>
                  <input
                    type="text"
                    value={maskedUser.name}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 ml-1">手机号</label>
                  <input
                    type="tel"
                    value={maskedUser.phone}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-gray-600 ml-1">身份证号</label>
                  <input
                    type="text"
                    value={maskedUser.idCard}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-600 ml-1">工作单位</label>
                    {!editingWorkUnit && (
                      <button
                        onClick={() => {
                          setEditingWorkUnit(true);
                          setTempWorkUnit(userInfo.workUnit || '');
                        }}
                        className="text-xs text-blue-900 hover:underline font-semibold"
                      >
                        编辑
                      </button>
                    )}
                  </div>
                  {editingWorkUnit ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempWorkUnit}
                        onChange={(e) => setTempWorkUnit(e.target.value)}
                        placeholder="请输入工作单位"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-900 focus:border-blue-900 focus:ring-0 outline-none"
                      />
                      <button
                        onClick={async () => {
                          try {
                            const userId = 'test-user-id';
                            await userWorkUnitService.upsertUserWorkUnit(userId, tempWorkUnit);
                            setUserInfo({ ...userInfo, workUnit: tempWorkUnit });
                            setEditingWorkUnit(false);
                          } catch (error) {
                            console.error('保存工作单位失败:', error);
                          }
                        }}
                        className="px-4 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-semibold whitespace-nowrap"
                      >
                        保存
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={userInfo.workUnit || '未设置'}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 text-sm"
                    />
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Section 2: Application Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-blue-900 rounded-full"></div>
              <h3 className="font-semibold text-sm text-blue-900 uppercase tracking-wider">申请信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 ml-1">产品</label>
                  <input
                    type="text"
                    value={product.name}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 text-sm"
                  />
                </div>
              )}
              {institution && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 ml-1">机构</label>
                  <input
                    type="text"
                    value={institution.name}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 text-sm"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Requirements Description */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-blue-900 rounded-full"></div>
              <h3 className="font-semibold text-sm text-blue-900 uppercase tracking-wider">需求说明</h3>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 ml-1">具体需求与问题</label>
              <textarea
                value={requirementDescription}
                onChange={(e) => setRequirementDescription(e.target.value)}
                placeholder="请描述您的财务目标或任何想在咨询中解决的具体问题..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-900 focus:border-blue-900 focus:ring-0 outline-none resize-none"
              />
              <div className="text-xs text-gray-500 text-right">
                {requirementDescription.length}/500
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            className="w-full sm:w-auto px-6 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="w-full sm:w-auto px-8 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              try {
                setSubmitting(true);
                // TODO: 获取当前用户ID，暂时使用测试用户ID
                const userId = 'test-user-id';

                await applicationService.createApplication({
                  userId,
                  institutionId: institution.id,
                  productId: product.id,
                  userName: userInfo.name,
                  userPhone: userInfo.phone,
                  userIdCard: userInfo.idCard,
                  userWorkUnit: userInfo.workUnit,
                  applicationType,
                  requirementDescription,
                });

                // 调用onSuccess回调
                onSuccess && onSuccess();
                setTimeout(() => {
                  onClose();
                }, 2000);
              } catch (error) {
                console.error('创建申请失败:', error);
                onError && onError(error.message || '加入资金方案失败');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '加入资金方案'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;