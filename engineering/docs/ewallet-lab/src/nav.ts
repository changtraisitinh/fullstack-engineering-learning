/**
 * Single source of truth for the sidebar AND the router. To add a new page:
 *   1. Add one entry here, in the right space (DEV_NAV_GROUPS or BIZ_NAV_GROUPS).
 *      Business page ids MUST start with "biz-" — see spaceOf().
 *   2. Add `"your-id": YourComponent` to the registry in src/pages/index.tsx.
 * That's it — App.tsx renders both the sidebar and the active page purely from
 * these lists plus the registry; no other file needs to change.
 *
 * Two "spaces" (issue #17): Developer (the original docs) and Business (product
 * business rules, written for non-engineers). One flat id namespace for the
 * router, with a reserved "biz-" prefix, so a page id alone tells which space it
 * belongs to — see the README's "Developer / Business spaces" section.
 */
export type NavItem = {
  id: string;
  label: string;
  soon?: boolean;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type Space = 'developer' | 'business';

export const DEV_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'overview', label: 'Introduction' },
      { id: 'conventions', label: 'Conventions & disclaimer' },
    ],
  },
  {
    label: 'Architecture',
    items: [
      { id: 'architecture', label: 'System design' },
      { id: 'topup-flow', label: 'Top-up data flow' },
    ],
  },
  {
    label: 'In-house services',
    items: [
      { id: 'svc-user', label: 'user-service' },
      { id: 'svc-wallet', label: 'wallet-service' },
      { id: 'svc-topup', label: 'topup-service' },
    ],
  },
  {
    label: 'Partners & specs',
    items: [
      { id: 'partner-bank', label: 'mock-bank-gateway' },
      { id: 'momo-spec', label: 'MoMo spec references' },
    ],
  },
  {
    // Room to grow — add a page per topic (testing, accessibility, ...) rather
    // than growing one page into a catch-all.
    label: 'Frontend',
    items: [
      { id: 'web-client', label: 'Microfrontend architecture' },
      { id: 'frontend-design', label: 'Design & UI system' },
    ],
  },
  {
    // Local-K8s today; room for a real-EKS page once one exists for real.
    label: 'Deployment',
    items: [{ id: 'deploy-k8s', label: 'Kubernetes (local)' }],
  },
  {
    label: "What's next",
    items: [{ id: 'roadmap', label: 'Roadmap', soon: true, badge: '2 planned' }],
  },
];

export const BIZ_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [{ id: 'biz-overview', label: 'Business space là gì' }],
  },
  {
    label: 'Quy tắc xuyên suốt',
    items: [{ id: 'biz-limits', label: 'Giới hạn & an toàn giao dịch', badge: 'Quan trọng' }],
  },
  {
    label: 'Theo nhóm tính năng',
    items: [
      { id: 'biz-payments', label: 'Nạp/rút, chuyển tiền & thanh toán' },
      { id: 'biz-requests', label: 'Nhận tiền, nhắc trả & lì xì' },
      { id: 'biz-personal', label: 'Chi tiêu, điểm thưởng, quỹ & trả sau' },
    ],
  },
  {
    label: 'Sắp có',
    items: [{ id: 'biz-coming-soon', label: 'Chưa làm & lý do', soon: true }],
  },
];

/** Default page of each space. Developer stays the site default — old links/behavior unchanged. */
export const DEFAULT_PAGE = 'overview';
export const DEFAULT_PAGE_BY_SPACE: Record<Space, string> = {
  developer: DEFAULT_PAGE,
  business: 'biz-overview',
};

export function navFor(space: Space): NavGroup[] {
  return space === 'business' ? BIZ_NAV_GROUPS : DEV_NAV_GROUPS;
}

/** A page's space is derived from its id, so a shared #biz-... link always opens Business. */
export function spaceOf(id: string): Space {
  return id.startsWith('biz-') ? 'business' : 'developer';
}

export function isKnownPage(id: string): boolean {
  return navFor(spaceOf(id)).some((g) => g.items.some((i) => i.id === id));
}
