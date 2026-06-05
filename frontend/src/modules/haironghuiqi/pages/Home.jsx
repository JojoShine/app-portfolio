import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Scale, Building2, Shield, TrendingUp, Settings, MessageSquare, Grid, Send, Info, Trash2, Home } from 'lucide-react';
import bgImage from '../assets/home/bg_new.png';
import logoImage from '../assets/home/logo.png';
import haironghuiqiLogo from '../assets/home/haironghuiqi.png';
import product1 from '../assets/home/1.png';
import product2 from '../assets/home/2.png';
import product3 from '../assets/home/3.png';
import product4 from '../assets/home/4.png';
import product5 from '../assets/home/5.png';
import applicationService from '../services/applicationService';
import productService from '../services/productService';
import ApplicationModal from '../components/ApplicationModal';
import Notification from '../components/Notification';

/**
 * 海融惠企首页 - 支持模块模式和对话模式切换
 * 默认是模块模式，用户可以切换到对话模式
 */
const HaironghuiqiHome = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  const [collectionCount, setCollectionCount] = useState(0);
  const [mode, setMode] = useState('conversational'); // 'module' | 'conversational' - 默认对话模式
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'user',
      content: '海融惠企的明星产品有哪些？',
    },
    {
      type: 'ai',
      content: '为您查询到以下明星产品：',
      products: [], // 将从数据库加载
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationType, setApplicationType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [noticeBar, setNoticeBar] = useState({ show: false, message: '', type: 'success' });
  const chatEndRef = useRef(null);

  // 获取用户的申请数量
  useEffect(() => {
    const fetchApplicationCount = async () => {
      try {
        // TODO: 从userService获取用户信息，暂时使用默认值
        const userId = 'test-user-id';
        const result = await applicationService.getUserApplications(userId, { page: 1, pageSize: 1 });
        if (result && result.pagination) {
          setCollectionCount(result.pagination.total);
        }
      } catch (error) {
        console.error('获取申请数量失败:', error);
        setCollectionCount(0);
      }
    };

    fetchApplicationCount();
  }, []);

  // 获取明星产品（hero产品）
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getProductList({ page: 1, pageSize: 10 });
        
        // handleListResponse 直接返回数组，不需要 .data
        // 注意：数据库字段可能是 isFeatured 或 is_featured
        const featured = products.filter(product => 
          product.isFeatured === true || product.is_featured === true
        ).slice(0, 3);
        
        if (featured.length > 0) {
          // 更新聊天历史中的产品列表
          setChatHistory(prev => prev.map((msg, index) => {
            if (index === 1 && msg.type === 'ai') {
              return {
                ...msg,
                products: featured.map(p => ({
                  id: p.id,
                  name: p.name,
                  rate: p.minAnnualRate ? `${p.minAnnualRate}%` : (p.maxLoanAmount ? `${p.maxLoanAmount}万` : '详情咨询'),
                })),
              };
            }
            return msg;
          }));
        }
      } catch (error) {
        console.error('获取明星产品失败:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // 当聊天历史更新或切换到对话模式时，自动滚动到底部
  useEffect(() => {
    if (mode === 'conversational') {
      // 使用 setTimeout 确保 DOM 已渲染完成
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatHistory, mode]);

  // 切换模式
  const toggleMode = () => {
    setMode(mode === 'module' ? 'conversational' : 'module');
  };

  // 清除对话（保留初始对话）
  const clearChat = () => {
    setChatHistory([
      {
        type: 'user',
        content: '海融惠企的明星产品有哪些？',
      },
      {
        type: 'ai',
        content: '为您查询到以下明星产品：',
        products: [], // 将从数据库加载
      },
    ]);
    
    // 重新获取明星产品
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getProductList({ page: 1, pageSize: 10 });
        const featured = products.filter(product => 
          product.isFeatured === true || product.is_featured === true
        ).slice(0, 3);
        
        if (featured.length > 0) {
          setChatHistory(prev => prev.map((msg, index) => {
            if (index === 1 && msg.type === 'ai') {
              return {
                ...msg,
                products: featured.map(p => ({
                  id: p.id,
                  name: p.name,
                  rate: p.minAnnualRate ? `${p.minAnnualRate}%` : (p.maxLoanAmount ? `${p.maxLoanAmount}万` : '详情咨询'),
                })),
              };
            }
            return msg;
          }));
        }
      } catch (error) {
        console.error('获取明星产品失败:', error);
      }
    };
    
    fetchFeaturedProducts();
  };

  // 处理聊天输入
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // 添加用户消息
    const userMessage = chatInput;
    const newHistory = [...chatHistory, { type: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setChatInput('');

    try {
      // 调用后端关键词匹配接口
      const products = await productService.searchProductsByKeywords(userMessage, 3);
      
      // 构建 AI 回复
      let aiResponse;
      if (products && products.length > 0) {
        // 有匹配的产品
        aiResponse = {
          type: 'ai',
          content: `为您找到 ${products.length} 个相关产品：`,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            rate: p.minAnnualRate ? `${p.minAnnualRate}%` : (p.maxLoanAmount ? `${p.maxLoanAmount}万` : '详情咨询'),
          })),
        };
      } else {
        // 没有匹配到产品，引导用户去选择模式
        aiResponse = {
          type: 'ai',
          content: '抱歉，没有找到与您需求匹配的产品。建议您切换到选择模式，浏览更多金融产品。',
          products: [],
        };
      }
      
      setChatHistory([...newHistory, aiResponse]);
    } catch (error) {
      console.error('搜索产品失败:', error);
      // 出错时显示默认回复
      setChatHistory([
        ...newHistory,
        {
          type: 'ai',
          content: '抱歉，服务暂时不可用。请稍后重试或切换到选择模式浏览产品。',
          products: [],
        },
      ]);
    }
  };

  // 产品分类数据
  const products = [
    { id: 1, image: product1, title: '金融政策', subtitle: '金融政策惠民', category: 'policy' },
    { id: 2, image: product2, title: '银行', subtitle: '便民金融相随', category: 'bank' },
    { id: 3, image: product3, title: '保险', subtitle: '普惠万家安康', category: 'insurance' },
    { id: 4, image: product4, title: '证券', subtitle: '守护投资收益', category: 'securities' },
    { id: 5, image: product5, title: '其他金融', subtitle: '安全融通无忧', category: 'other' },
  ];

  const handleProductClick = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product.category === 'policy') {
      // 导航到金融政策页面（后续开发）
      navigate('/haironghuiqi/policy');
    } else {
      // 导航到业务查询页面，并传递分类参数
      navigate(`/haironghuiqi/service-search?category=${product.category}`);
    }
  };

  // 处理明星产品预约咨询
  const handleProductConsult = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
    });
    
    setApplicationType('consult');
    setIsModalOpen(true);
  };

  return (
    <div className="haironghuiqi-home w-full h-screen overflow-hidden bg-blue-900">
      {/* 首页返回按钮 - Home icon */}
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors active:scale-95"
        title="返回首页"
      >
        <Home size={18} className="text-white" />
      </button>

      {/* 背景 - fixed */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          zIndex: 0,
        }}
      />

      {/* 背景叠加效果 - 严格按照code.html的设计 */}
      <div className="fixed inset-0 bg-blue-900/40 mix-blend-multiply" style={{ zIndex: 1 }} />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900/60 via-transparent to-blue-900/80" style={{ zIndex: 1 }} />

      {/* 主内容区域 */}
      <main className={`relative z-10 px-[3vw] sm:px-[4vw] pt-[2vh] sm:pt-[3vh] pb-[15vh] sm:pb-[18vh] ${mode === 'conversational' ? 'overflow-hidden h-screen flex flex-col' : 'overflow-y-auto min-h-screen hide-scrollbar'}`}>
        {/* Logo - 顶部（两种模式共有） */}
        <div className="flex justify-center mb-[3vh] sm:mb-[5vh] pt-[2vh] sm:pt-[3vh]">
          <img
            src={logoImage}
            alt="海融惠企"
            className="h-[4vh] sm:h-[6vh] object-contain"
            style={{
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>

        {/* 欢迎部分（两种模式共有） */}
        <section className="mb-[2vh] sm:mb-[3vh]">
          <img src={haironghuiqiLogo} alt="海融惠企" className="h-[2.5vh] sm:h-[3.5vh] mb-[1vh] sm:mb-[1.5vh]" />
          <p className="text-white/80 text-[1.4vh] sm:text-[1.6vh] w-2/3 leading-relaxed">一站式金融服务平台，汇聚银行、保险、证券等多类金融机构，为您提供专业的金融解决方案和优质的金融产品。</p>
        </section>

        {/* 模块模式显示 */}
        {mode === 'module' && (
          <div className="module-display">
            {/* 产品分类网格 - 严格按照code.html的布局 */}
            <div className="grid grid-cols-2 gap-3">
              {/* Financial Policy - 占据2列 */}
              <button
                onClick={() => handleProductClick(1)}
                className="col-span-2 glass-card rounded-xl p-[2vh] sm:p-[3vh] flex flex-col justify-between items-start h-[18vh] sm:h-[22vh] shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="bg-yellow-400/80 text-gray-800 p-[1.5vh] sm:p-[2vh] rounded-lg mb-[1vh] sm:mb-[1.5vh] group-hover:scale-110 transition-transform">
                  <Scale size="3vh" className="sm:size-[3.5vh]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[2vh] sm:text-[2.2vh]">{products[0].title}</p>
                  <p className="text-white/70 text-[1.4vh] sm:text-[1.6vh] mt-[0.5vh] sm:mt-[1vh] leading-relaxed">了解最新的金融政策动向，获取政策解读和指导，帮助您更好地理解金融监管环境。</p>
                </div>
              </button>

              {/* Banking - 占据1列 */}
              <button
                onClick={() => handleProductClick(2)}
                className="col-span-1 glass-card rounded-xl p-[1.5vh] sm:p-[2vh] flex flex-col items-center justify-center h-[16vh] sm:h-[20vh] shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="bg-blue-900 p-[1.5vh] sm:p-[2vh] rounded-full mb-[1vh] sm:mb-[1.5vh]">
                  <Building2 size="3vh" className="sm:size-[3.5vh] text-white" />
                </div>
                <span className="text-white font-semibold text-[1.6vh] sm:text-[1.8vh] line-clamp-2">{products[1].title}</span>
                <p className="text-white/70 text-[1.3vh] sm:text-[1.4vh] mt-[0.3vh] sm:mt-[0.5vh]">{products[1].subtitle}</p>
              </button>

              {/* Insurance - 占据1列 */}
              <button
                onClick={() => handleProductClick(3)}
                className="col-span-1 glass-card rounded-xl p-[1.5vh] sm:p-[2vh] flex flex-col items-center justify-center h-[16vh] sm:h-[20vh] shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="bg-blue-900 p-[1.5vh] sm:p-[2vh] rounded-full mb-[1vh] sm:mb-[1.5vh]">
                  <Shield size="3vh" className="sm:size-[3.5vh] text-white" />
                </div>
                <span className="text-white font-semibold text-[1.6vh] sm:text-[1.8vh] line-clamp-2">{products[2].title}</span>
                <p className="text-white/70 text-[1.3vh] sm:text-[1.4vh] mt-[0.3vh] sm:mt-[0.5vh]">{products[2].subtitle}</p>
              </button>

              {/* Securities - 占据1列 */}
              <button
                onClick={() => handleProductClick(4)}
                className="col-span-1 glass-card rounded-xl p-[1.5vh] sm:p-[2vh] flex flex-col items-center justify-center h-[16vh] sm:h-[20vh] shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="bg-blue-900 p-[1.5vh] sm:p-[2vh] rounded-full mb-[1vh] sm:mb-[1.5vh]">
                  <TrendingUp size="3vh" className="sm:size-[3.5vh] text-white" />
                </div>
                <span className="text-white font-semibold text-[1.6vh] sm:text-[1.8vh] line-clamp-2">{products[3].title}</span>
                <p className="text-white/70 text-[1.3vh] sm:text-[1.4vh] mt-[0.3vh] sm:mt-[0.5vh]">{products[3].subtitle}</p>
              </button>

              {/* Other Services - 占据1列 */}
              <button
                onClick={() => handleProductClick(5)}
                className="col-span-1 glass-card rounded-xl p-[1.5vh] sm:p-[2vh] flex flex-col items-center justify-center h-[16vh] sm:h-[20vh] shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="bg-blue-900 p-[1.5vh] sm:p-[2vh] rounded-full mb-[1vh] sm:mb-[1.5vh]">
                  <Settings size="3vh" className="sm:size-[3.5vh] text-white" />
                </div>
                <span className="text-white font-semibold text-[1.6vh] sm:text-[1.8vh] line-clamp-2">{products[4].title}</span>
                <p className="text-white/70 text-[1.3vh] sm:text-[1.4vh] mt-[0.3vh] sm:mt-[0.5vh]">{products[4].subtitle}</p>
              </button>
            </div>

            {/* 模式切换按钮 - 模块模式下 */}
            <div className="mt-[3vh] sm:mt-[4vh] flex justify-center">
              <button
                onClick={toggleMode}
                className="flex items-center gap-[1vh] sm:gap-[1.2vh] px-[3vw] sm:px-[4vw] py-[1vh] sm:py-[1.2vh] rounded-full bg-white/5 border border-white/10 text-white/70 text-[1.4vh] sm:text-[1.5vh] hover:bg-white/10 transition-colors"
              >
                <MessageSquare size="1.8vh" className="sm:size-[2vh]" />
                切换到对话模式
              </button>
            </div>
          </div>
        )}

        {/* 选择模式 - 购物车浮动按钮 */}
        {mode === 'module' && (
          <div className="fixed bottom-[10vh] sm:bottom-[12vh] right-[4vw] sm:right-[6vw] z-50">
            <button
              onClick={() => {
                navigate('/haironghuiqi/my-applications');
              }}
              className="relative w-[6vh] h-[6vh] sm:w-[8vh] sm:h-[8vh] bg-blue-900 hover:bg-blue-800 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-90"
              style={{
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3), 0 10px 20px rgba(15, 23, 42, 0.2)',
              }}
            >
              <ShoppingCart size="3vh" className="sm:size-[4vh] text-white" />
              {/* 角标 */}
              {collectionCount > 0 && (
                <div className="absolute -top-[0.8vh] -right-[0.8vh] sm:-top-[1vh] sm:-right-[1vh] bg-red-500 text-white text-[1.2vh] sm:text-[1.3vh] font-bold w-[2.5vh] h-[2.5vh] sm:w-[3vh] sm:h-[3vh] rounded-full flex items-center justify-center border-2 border-blue-900">
                  {collectionCount}
                </div>
              )}
            </button>
          </div>
        )}

        {/* 对话模式显示 */}
        {mode === 'conversational' && (
          <div className="conversational-display flex-1 min-h-0">
            {/* Chat History Area - 可滚动 */}
            <div className="h-full overflow-y-auto space-y-3 pt-3 pb-[60px] sm:pb-[80px] hide-scrollbar">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start w-full'}`}>
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} ${message.type === 'ai' ? 'w-full' : ''}`}>
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <MessageSquare size={14} className="text-gray-800" />
                        </div>
                        <span className="text-white/60 text-xs">海融匹配助手</span>
                      </div>
                    )}
                    <div
                      className="glass-card rounded-xl p-3 sm:p-4 w-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        maxWidth: '100%',
                      }}
                    >
                      <p className="text-white text-sm sm:text-base mb-3">{message.content}</p>
                      
                      {/* Horizontal Scroll Matched Products */}
                      {message.products && message.products.length > 0 && (
                        <div className="flex gap-2 sm:gap-3 overflow-x-auto hide-scroll pb-2 -mx-1 px-1 hide-scrollbar">
                          {message.products.map((product, idx) => (
                            <div
                              key={idx}
                              onClick={() => navigate(`/haironghuiqi/product/${product.id}`)}
                              className="min-w-[140px] max-w-[140px] sm:min-w-[180px] sm:max-w-[180px] bg-white/10 rounded-lg p-3 sm:p-4 border border-white/10 flex flex-col flex-shrink-0 cursor-pointer hover:bg-white/20 transition-colors"
                            >
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-2">
                                <TrendingUp size={18} className="sm:size-5 text-white" />
                              </div>
                              <p className="text-white text-sm sm:text-sm font-semibold mb-1 truncate">{product.name}</p>
                              <p className="text-yellow-400 font-bold text-base sm:text-base mb-2">{product.rate}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductConsult(product);
                                }}
                                className="mt-auto w-full py-2 sm:py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm sm:text-sm font-semibold rounded-lg transition-colors active:scale-95"
                              >
                                预约咨询
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* 用于自动滚动的空元素 */}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* 对话模式 - 输入框区域 (独立于对话显示区) */}
      {mode === 'conversational' && (
        <div className="fixed bottom-2 sm:bottom-3 left-[3vw] sm:left-[4vw] right-[3vw] sm:right-[4vw] z-30">
          {/* 购物车浮动按钮 - 输入框上方 */}
          <div className="absolute -top-16 sm:-top-20 right-0">
            <button
              onClick={() => {
                navigate('/haironghuiqi/my-applications');
              }}
              className="relative w-12 h-12 sm:w-14 sm:h-14 bg-blue-900 hover:bg-blue-800 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-90"
              style={{
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3), 0 10px 20px rgba(15, 23, 42, 0.2)',
              }}
            >
              <ShoppingCart size={20} className="sm:size-6 text-white" />
              {/* 角标 */}
              {collectionCount > 0 && (
                <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center border-2 border-blue-900">
                  {collectionCount}
                </div>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 sm:py-3.5 px-4 sm:px-5 pr-12 text-white placeholder-white/50 focus:outline-none resize-none min-h-[60px] sm:min-h-[70px] max-h-[100px] sm:max-h-[120px] text-sm sm:text-base leading-relaxed"
              placeholder="输入您的需求..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="text-white hover:text-blue-300 transition-colors absolute right-3 bottom-3"
            >
              <Send size={18} className="sm:size-5" />
            </button>
          </div>

          {/* 模式切换按钮 - 对话模式下 */}
          <div className="mt-2 sm:mt-3 flex justify-center gap-2 sm:gap-3">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs sm:text-sm hover:bg-white/10 transition-colors"
            >
              <Trash2 size={14} className="sm:size-4" />
              清除对话
            </button>
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs sm:text-sm hover:bg-white/10 transition-colors"
            >
              <Grid size={14} className="sm:size-4" />
              切换为选择模式
            </button>
          </div>

          {/* 温馨提示 */}
          <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5 sm:gap-2">
            <Info size={14} className="sm:size-4 text-yellow-400" />
            <p className="text-white/70 text-xs sm:text-sm text-center">
              您也可以切换到选择模式，直接高效浏览和检索产品
            </p>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification show={noticeBar.show} message={noticeBar.message} type={noticeBar.type} />

      {/* 申请弹窗 */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        institution={null}
        applicationType={applicationType}
        onSuccess={() => {
          setNoticeBar({ show: true, message: '加入资金方案成功', type: 'success' });
          setTimeout(() => setNoticeBar({ show: false, message: '', type: 'success' }), 3000);
        }}
        onError={(errorMessage) => {
          setNoticeBar({ show: true, message: errorMessage, type: 'error' });
          setTimeout(() => setNoticeBar({ show: false, message: '', type: 'error' }), 3000);
        }}
      />
    </div>
  );
};

export default HaironghuiqiHome;
