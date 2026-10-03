import type { ComponentType } from 'react';
import Architecture from './Architecture';
import Conventions from './Conventions';
import DeployK8s from './DeployK8s';
import FrontendDesign from './FrontendDesign';
import MomoSpec from './MomoSpec';
import Overview from './Overview';
import PartnerBank from './PartnerBank';
import Roadmap from './Roadmap';
import SvcTopup from './SvcTopup';
import SvcUser from './SvcUser';
import SvcWallet from './SvcWallet';
import TopupFlow from './TopupFlow';
import WebClient from './WebClient';
import BizComingSoon from './business/BizComingSoon';
import BizLimits from './business/BizLimits';
import BizOverview from './business/BizOverview';
import BizPayments from './business/BizPayments';
import BizPersonal from './business/BizPersonal';
import BizRequests from './business/BizRequests';

/** id -> page component. Every id here must also appear in src/nav.ts (and vice versa). */
export const PAGES: Record<string, ComponentType> = {
  overview: Overview,
  conventions: Conventions,
  architecture: Architecture,
  'topup-flow': TopupFlow,
  'svc-user': SvcUser,
  'svc-wallet': SvcWallet,
  'svc-topup': SvcTopup,
  'partner-bank': PartnerBank,
  'momo-spec': MomoSpec,
  'web-client': WebClient,
  'frontend-design': FrontendDesign,
  'deploy-k8s': DeployK8s,
  roadmap: Roadmap,
  // Business space (issue #17) — ids reserved with the "biz-" prefix, see nav.ts spaceOf().
  'biz-overview': BizOverview,
  'biz-limits': BizLimits,
  'biz-payments': BizPayments,
  'biz-requests': BizRequests,
  'biz-personal': BizPersonal,
  'biz-coming-soon': BizComingSoon,
};
