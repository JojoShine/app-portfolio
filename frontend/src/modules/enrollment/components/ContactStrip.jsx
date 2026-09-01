import { PhoneFill } from 'antd-mobile-icons';

export const ContactStrip = () => (
  <section className="contact-strip" aria-label="招生咨询电话">
    <header><PhoneFill /><strong>咨询电话</strong><small>工作日 09:00-17:00</small></header>
    <div className="contact-strip__phones">
      <a href="tel:12345"><span>综合咨询</span><strong>12345</strong></a>
      <a href="tel:051886000001"><span>幼儿园入学</span><strong>0518-86000001</strong></a>
      <a href="tel:051886000002"><span>幼升小报名</span><strong>0518-86000002</strong></a>
      <a href="tel:051886000003"><span>小升初报名</span><strong>0518-86000003</strong></a>
    </div>
  </section>
);
