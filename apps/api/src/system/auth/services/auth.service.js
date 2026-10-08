const jwt = require('jsonwebtoken');
const env = require('../../../config/env');
const { UnauthorizedError } = require('../../../common/utils/error');

const normalizeRoles = (roles = []) => (
  [...new Set(roles.filter((role) => typeof role === 'string' && role.trim()))]
);

const normalizeSchoolIds = (schoolIds = []) => (
  [...new Set(schoolIds
    .filter((id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim()))
    .map((id) => id.trim()))]
);

const issueDevelopmentToken = ({ userId, displayName, roles, schoolIds }) => jwt.sign(
  {
    type: 'access',
    name: displayName || userId,
    roles: normalizeRoles(roles),
    schoolIds: normalizeSchoolIds(schoolIds),
  },
  env.JWT_SECRET,
  {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }
);

const verifyAccessToken = (token) => {
  try {
    const claims = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    if (claims.type !== 'access' || !claims.sub || (claims.demo && !env.ENABLE_PUBLIC_DEMO)) {
      throw new UnauthorizedError('Invalid access token');
    }

    return {
      id: claims.sub,
      displayName: claims.name || claims.sub,
      roles: normalizeRoles(claims.roles),
      schoolIds: normalizeSchoolIds(claims.schoolIds),
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError('Invalid or expired access token');
  }
};

const issuePublicDemoToken = () => {
  const { NotFoundError } = require('../../../common/utils/error');
  if (!env.ENABLE_PUBLIC_DEMO) throw new NotFoundError();
  return jwt.sign({type:'access',demo:true,name:'演示用户',roles:['reader','parent','citizen'],schoolIds:[]}, env.JWT_SECRET, {
    subject:'test-parent-001',expiresIn:'1h',issuer:env.JWT_ISSUER,audience:env.JWT_AUDIENCE,
  });
};

module.exports = { issueDevelopmentToken, issueAccessToken: issueDevelopmentToken, issuePublicDemoToken, verifyAccessToken };
