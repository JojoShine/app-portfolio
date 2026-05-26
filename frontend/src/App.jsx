import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HaironghuiqiModule from './modules/haironghuiqi/pages/index';
import './App.css';

function App() {
  // 根据环境判断basename
  const basename = import.meta.env.PROD ? '/app-portfolio' : '/'

  return (
    <Router basename={basename}>
      <Routes>
        {/* 首页 - 应用门面 */}
        <Route path="/" element={<Home />} />

        {/* 海融惠企模块 */}
        <Route path="/haironghuiqi/*" element={<HaironghuiqiModule />} />

        {/* 404页面 */}
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-600">页面不存在</p></div>} />
      </Routes>
    </Router>
  );
}

export default App;

