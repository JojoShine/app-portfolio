import { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'antd-mobile';
import { PhoneFill } from 'antd-mobile-icons';
import { useContacts } from '../hooks/useContacts';

export const ContactEntry = ({ stageId }) => {
  const [visible, setVisible] = useState(false);
  const { contacts, error } = useContacts(visible);
  const preferred = contacts.find((contact) => contact.id === stageId);
  const ordered = preferred ? [preferred, ...contacts.filter((contact) => contact.id !== stageId)] : contacts;
  const hasCallableContact = ordered.some((contact) => contact.dial);

  return (
    <>
      <button className="contact-entry" type="button" aria-label="电话咨询" aria-haspopup="dialog" aria-expanded={visible} onClick={() => setVisible(true)}>
        <PhoneFill /><span>电话咨询</span>
      </button>
      <Popup visible={visible} getContainer={() => document.querySelector('.enrollment-app')} onMaskClick={() => setVisible(false)} onClose={() => setVisible(false)} showCloseButton bodyClassName="enrollment-contact-popup">
        <section className="contact-panel" role="dialog" aria-modal="true" aria-labelledby="contact-panel-title">
          <h2 id="contact-panel-title">招生电话咨询</h2>
          <p>{error || (hasCallableContact ? '点击号码即可拨打' : '请在服务时间内联系咨询点')}</p>
          <div className="contact-panel__list">
            {ordered.map((contact) => {
              const ContactTag = contact.dial ? 'a' : 'div';
              return (
              <ContactTag key={contact.id} {...(contact.dial ? { href: `tel:${contact.dial}`, 'aria-label': `拨打${contact.label} ${contact.number}` } : {})}>
                <span>{contact.label}{contact.id === preferred?.id && <small>当前学段</small>}<strong>{contact.number}</strong></span>
                {contact.dial && <PhoneFill />}
              </ContactTag>
              );
            })}
          </div>
        </section>
      </Popup>
    </>
  );
};

ContactEntry.propTypes = { stageId: PropTypes.string };
