import React, { useState, useEffect } from 'react';
import { Card, Empty, Dialog, NoticeBar } from 'antd-mobile';
import Checkbox from '../../../components/ui/Checkbox';
import applicationService from '../services/applicationService';

/**
 * 我的申请页面
 * 显示用户的申请列表，支持勾选、提交、删除等操作
 */
const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noticeBar, setNoticeBar] = useState({ show: false, message: '', type: 'success' });

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
      alert('请先选择要提交的申请');
      return;
    }

    try {
      setSubmitting(true);
      await applicationService.submitApplications(selectedIds);
      alert('申请提交成功');
      setSelectedIds([]);
      // 重新获取申请列表
      const result = await applicationService.getUserApplications(userId, { page: 1, pageSize: 100 });
      setApplications(result.items || []);
    } catch (error) {
      console.error('提交申请失败:', error);
      alert('提交申请失败');
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
          setNoticeBar({ show: true, message: '申请删除成功', type: 'success' });
          setTimeout(() => setNoticeBar({ show: false, message: '', type: 'success' }), 3000);
        } catch (error) {
          console.error('删除申请失败:', error);
          setNoticeBar({ show: true, message: '删除申请失败', type: 'fail' });
          setTimeout(() => setNoticeBar({ show: false, message: '', type: 'fail' }), 3000);
        }
      },
    });
  };

  return (
    <div className="w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8', paddingBottom: '8vh' }}>
      {/* NoticeBar */}
      {noticeBar.show && (
        <NoticeBar
          content={noticeBar.message}
          color={noticeBar.type === 'success' ? 'success' : 'error'}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
          }}
        />
      )}

      {/* 申请列表 */}
      <div className="px-[4vw] py-[2vh]">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5vh 0' }}>
            <p style={{ fontSize: '3.5vw', color: '#999999' }}>加载中...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-[2vh]">
            {applications.map((application) => (
              <Card key={application.id} style={{ padding: '3vw' }}>
                <div style={{ display: 'flex', gap: '2vw', alignItems: 'flex-start' }}>
                  {/* 勾选框 */}
                  <Checkbox
                    checked={selectedIds.includes(application.id)}
                    onChange={() => handleSelectApplication(application.id)}
                  />

                  {/* 申请信息 */}
                  <div style={{ flex: 1 }}>
                    {/* 第一部分：产品名称 + 机构名称 + 产品说明 */}
                    <div style={{ marginBottom: '2vh', paddingBottom: '2vh', borderBottom: '1px solid #EEEEEE' }}>
                      <h3 style={{ fontSize: '4vw', color: '#333333', margin: 0, marginBottom: '0.5vh', fontWeight: 'bold' }}>
                        {application.Product?.name}
                      </h3>
                      <p style={{ fontSize: '3vw', color: '#999999', margin: 0, marginBottom: '1vh' }}>
                        {application.Institution?.name}
                      </p>
                      <p style={{ fontSize: '3vw', color: '#333333', margin: 0, lineHeight: '1.5' }}>
                        {application.Product?.description || '暂无说明'}
                      </p>
                    </div>

                    {/* 第二部分：需求说明 */}
                    <div>
                      <p style={{ fontSize: '2.8vw', color: '#999999', margin: 0, marginBottom: '0.5vh' }}>
                        需求说明
                      </p>
                      <p style={{ fontSize: '3vw', color: '#333333', margin: 0, lineHeight: '1.5' }}>
                        {application.requirementDescription || '暂无说明'}
                      </p>
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    style={{
                      padding: '0.4vh 2vw',
                      fontSize: '2.8vw',
                      backgroundColor: '#ffffff',
                      color: '#ff0000',
                      border: '1px solid #ff0000',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '0.5vh',
                    }}
                    onClick={() => handleDelete(application.id)}
                  >
                    删除
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="暂无申请" style={{ padding: '5vh 0' }} />
        )}
      </div>

      {/* 底部操作栏 - fixed */}
      <div
        className="fixed bottom-0 left-0 right-0 px-[4vw] py-[1vh] bg-white border-t border-gray-200"
        style={{ display: 'flex', gap: '2vw', alignItems: 'center' }}
      >
        <Checkbox
          checked={selectedIds.length === applications.length && applications.length > 0}
          onChange={handleSelectAll}
        >
          全选
        </Checkbox>
        <button
          style={{
            padding: '0.8vh 2vw',
            fontSize: '3vw',
            backgroundColor: '#0283EB',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
          onClick={handleSubmit}
          disabled={submitting || selectedIds.length === 0}
        >
          {submitting ? '提交中...' : '提交申请'}
        </button>
      </div>
    </div>
  );
};

export default MyApplications;
