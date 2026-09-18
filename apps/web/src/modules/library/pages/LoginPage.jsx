import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';
import axios from 'axios';
import { appConfig } from '../../../app/config/env';
import useSessionStore from '../../../shared/auth/sessionStore';
import { PageHeader } from '../components/LibraryLayout';

export default function LoginPage() {
  const navigate = useNavigate(); const location = useLocation(); const setAccessToken = useSessionStore((state) => state.setAccessToken);
  const login = async () => { const response = await axios.post(`${appConfig.apiBaseUrl}/auth/development-token`, { userId: 'test-parent-001', displayName: '王芳', roles: ['reader'] }); setAccessToken(response.data.data.accessToken); navigate(location.state?.from || '/library/profile', { replace: true }); };
  return <main className="lib-page lib-login"><PageHeader title="读者登录" /><section><span>书香海安</span><h1>登录并绑定读者证</h1><p>当前为本地开发体验环境，将使用预置读者身份登录。</p><Button block color="primary" onClick={login}>使用演示读者证登录</Button></section></main>;
}
