/**
 * 脱敏工具函数
 */

/**
 * 脱敏姓名：显示第一个字，其他用*表示
 * @param {string} name - 姓名
 * @returns {string} 脱敏后的姓名
 */
export const maskName = (name) => {
  if (!name || name.length === 0) return name;
  return name[0] + '*'.repeat(name.length - 1);
};

/**
 * 脱敏身份证号：显示前6位和后4位
 * @param {string} idCard - 身份证号
 * @returns {string} 脱敏后的身份证号
 */
export const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 10) return idCard;
  return idCard.substring(0, 6) + '*'.repeat(idCard.length - 10) + idCard.substring(idCard.length - 4);
};

/**
 * 脱敏手机号：显示前3位和后4位
 * @param {string} phone - 手机号
 * @returns {string} 脱敏后的手机号
 */
export const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone;
  return phone.substring(0, 3) + '*'.repeat(phone.length - 7) + phone.substring(phone.length - 4);
};

/**
 * 脱敏工作单位：显示前3个字和后3个字
 * @param {string} workUnit - 工作单位
 * @returns {string} 脱敏后的工作单位
 */
export const maskWorkUnit = (workUnit) => {
  if (!workUnit || workUnit.length <= 6) return workUnit;
  return workUnit.substring(0, 3) + '*'.repeat(workUnit.length - 6) + workUnit.substring(workUnit.length - 3);
};

/**
 * 脱敏用户信息对象
 * @param {object} userInfo - 用户信息对象
 * @returns {object} 脱敏后的用户信息对象
 */
export const maskUserInfo = (userInfo) => {
  if (!userInfo) return userInfo;

  return {
    name: maskName(userInfo.name),
    phone: maskPhone(userInfo.phone),
    idCard: maskIdCard(userInfo.idCard),
    workUnit: maskWorkUnit(userInfo.workUnit),
  };
};