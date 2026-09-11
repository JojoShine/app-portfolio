import { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'antd-mobile';
import { PhoneFill } from 'antd-mobile-icons';

const contacts = [
  { id: 'general', label: '综合咨询热线', number: '12345', dial: '12345' },
  { id: 'kindergarten', label: '幼儿园入学', number: '0518-86000001', dial: '051886000001' },
  { id: 'primary', label: '幼升小报名', number: '0518-86000002', dial: '051886000002' },
  { id: 'middle', label: '小升初报名', number: '0518-86000003', dial: '051886000003' },
];

export const ContactEntry = ({ stageId }) => {
  const [visible, setVisible] = useState(false);
  const preferred = contacts.find((contact) => contact.id === stageId);
  const ordered = preferred ? [preferred, ...contacts.filter((contact) => contact.id !== stageId)] : contacts;

  return (
    <>
      <button className="contact-entry" type="button" aria-label="电话咨询" aria-haspopup="dialog" aria-expanded={visible} onClick={() => setVisible(true)}>
        <PhoneFill /><span>电话咨询</span>
      </button>
      <Popup visible={visible} onMaskClick={() => setVisible(false)} onClose={() => setVisible(false)} showCloseButton bodyClassName="enrollment-contact-popup">
        <section className="contact-panel" role="dialog" aria-modal="true" aria-labelledby="contact-panel-title">
          <h2 id="contact-panel-title">招生电话咨询</h2>
          <p>工作日 09:00–17:00 · 点击号码即可拨打</p>
          <div className="contact-panel__list">
            {ordered.map((contact) => (
              <a key={contact.id} href={`tel:${contact.dial}`} aria-label={`拨打${contact.label} ${contact.number}`}>
                <span>{contact.label}{contact.id === preferred?.id && <small>当前学段</small>}<strong>{contact.number}</strong></span>
                <PhoneFill />
              </a>
            ))}
          </div>
        </section>
      </Popup>
    </>
  );
};

ContactEntry.propTypes = { stageId: PropTypes.string };
