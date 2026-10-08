import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';
import { identityCapability } from '../../../shared/capabilities/identity';
import { PageHeader } from '../components/LibraryLayout';

export default function LoginPage() {
  const navigate = useNavigate(); const location = useLocation();
  const login = async () => { await identityCapability.ensureLocalSession(); navigate(location.state?.from || '/library/profile', { replace: true }); };
  return <main className="lib-page lib-login"><PageHeader title="读者登录" /><section><span>书香海安</span><h1>登录并绑定读者证</h1><p>演示站使用预置读者身份，正式服务请通过外层应用登录。</p><Button block color="primary" onClick={login}>进入读者服务</Button></section></main>;
}
