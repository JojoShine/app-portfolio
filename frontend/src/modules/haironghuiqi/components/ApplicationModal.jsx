import React, { useState, useEffect } from 'react';
import { maskUserInfo } from '../../../utils/maskUtils';
import applicationService from '../services/applicationService';
import userWorkUnitService from '../services/userWorkUnitService';
import TextArea from '../../../components/ui/TextArea';

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '3vw',
          maxWidth: '80vw',
          width: '80vw',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <h3 style={{ fontSize: '4vw', color: '#333333', margin: 0, marginBottom: '2vh' }}>
          {applicationType === 'apply' ? '立即申请' : '预约咨询'}
        </h3>

        {/* 用户信息 */}
        {maskedUser && (
          <div style={{ marginBottom: '2vh', paddingBottom: '2vh', borderBottom: '1px solid #E0E0E0' }}>
            <h4 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
              个人信息
            </h4>
            <div style={{ marginBottom: '1vh' }}>
              <p style={{ fontSize: '3vw', color: '#515151', margin: 0, marginBottom: '0.5vh' }}>
                姓名
              </p>
              <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                {maskedUser.name}
              </p>
            </div>
            <div style={{ marginBottom: '1vh' }}>
              <p style={{ fontSize: '3vw', color: '#515151', margin: 0, marginBottom: '0.5vh' }}>
                身份证号
              </p>
              <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                {maskedUser.idCard}
              </p>
            </div>
            <div style={{ marginBottom: '1vh' }}>
              <p style={{ fontSize: '3vw', color: '#515151', margin: 0, marginBottom: '0.5vh' }}>
                手机号
              </p>
              <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                {maskedUser.phone}
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5vh' }}>
                <p style={{ fontSize: '3vw', color: '#515151', margin: 0 }}>
                  工作单位
                </p>
                {!editingWorkUnit && (
                  <button
                    onClick={() => {
                      setEditingWorkUnit(true);
                      setTempWorkUnit(userInfo.workUnit || '');
                    }}
                    style={{
                      fontSize: '2.5vw',
                      color: '#0283EB',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    编辑
                  </button>
                )}
              </div>
              {editingWorkUnit ? (
                <div style={{ display: 'flex', gap: '1vw' }}>
                  <input
                    type="text"
                    value={tempWorkUnit}
                    onChange={(e) => setTempWorkUnit(e.target.value)}
                    placeholder="请输入工作单位"
                    style={{
                      flex: 1,
                      padding: '0.5vh 1vw',
                      fontSize: '3vw',
                      border: '1px solid #CCCCCC',
                      borderRadius: '4px',
                    }}
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
                    style={{
                      padding: '0.5vh 1.5vw',
                      fontSize: '2.8vw',
                      backgroundColor: '#0283EB',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    保存
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                  {userInfo.workUnit || '未设置'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 申请信息 */}
        <div style={{ marginBottom: '2vh', paddingBottom: '2vh', borderBottom: '1px solid #E0E0E0' }}>
          <h4 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
            申请信息
          </h4>
          {product && (
            <div style={{ marginBottom: '1vh' }}>
              <p style={{ fontSize: '3vw', color: '#515151', margin: 0, marginBottom: '0.5vh' }}>
                产品
              </p>
              <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                {product.name}
              </p>
            </div>
          )}
          {institution && (
            <div>
              <p style={{ fontSize: '3vw', color: '#515151', margin: 0, marginBottom: '0.5vh' }}>
                机构
              </p>
              <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                {institution.name}
              </p>
            </div>
          )}
        </div>

        {/* 需求说明 */}
        <div style={{ marginBottom: '2vh', paddingBottom: '2vh', borderBottom: '1px solid #E0E0E0' }}>
          <h4 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
            需求说明
          </h4>
          <TextArea
            value={requirementDescription}
            onChange={(val) => setRequirementDescription(val)}
            placeholder="请输入需求说明"
            rows={5}
            showCount
            maxLength={500}
          />
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: '2vw', justifyContent: 'flex-end' }}>
          <button
            style={{
              padding: '0.4vh 2vw',
              fontSize: '2.8vw',
              backgroundColor: '#ffffff',
              color: '#0283EB',
              border: '1px solid #0283EB',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            style={{
              padding: '0.4vh 2vw',
              fontSize: '2.8vw',
              backgroundColor: '#0283EB',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
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