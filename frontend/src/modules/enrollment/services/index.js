import { applicationService } from './application.service';
import { materialService } from './material.service';
import { portalService } from './portal.service';
import { publicationService } from './publication.service';
import { schoolService } from './school.service';
import { verificationService } from './verification.service';

export {
  applicationService,
  materialService,
  portalService,
  publicationService,
  schoolService,
  verificationService,
};

const enrollmentService = {
  ...portalService,
  ...schoolService,
  ...applicationService,
  ...verificationService,
  ...materialService,
  ...publicationService,
};

export default enrollmentService;
