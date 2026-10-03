# Ewallet Lab — Developer & Business Docs

Docs site cho [`ewallet-lab`](../../backend/projects/ewallet-lab/), với 2 "space" chuyển qua lại bằng
nút ở đầu sidebar:

- **Developer** (mặc định): Overview, Architecture, In-house services (API reference), Partners &
  specs, Frontend, Deployment, Roadmap.
- **Business**: nghiệp vụ sản phẩm cho người không đọc code — quy tắc nào chi phối từng tính năng, vì
  sao, căn cứ nào (issue #17).

Built with React + Vite (not the earlier hand-written HTML — see "Why React" below). Data-driven
so it scales: adding a page is "one entry in `src/nav.ts` + one component registered in
`src/pages/index.tsx`", no other file changes.

## Run

```bash
npm install
npm run dev       # http://localhost:5173, hot reload
npm run build     # outputs dist/ — plain static files, deployable anywhere (Cloudflare Pages, S3, nginx...)
npm run preview   # serve the dist/ build locally
```

## Structure

```
src/
  nav.ts            single source of truth for sidebar + valid routes (both spaces)
  pages/index.tsx    id -> page component registry (must match nav.ts ids)
  pages/*.tsx        one component per page (Developer space)
  pages/business/    Business space pages (ids prefixed "biz-") + shared Feature/Status parts
  components.tsx     shared content pieces (Note, Ep, FieldsTable, FlowDiagram, RoadmapItem...)
  NavContext.tsx      lets any page link to another (<PageLink to="...">) without prop-drilling
  App.tsx             layout (sidebar, mobile menu, theme toggle) + hash router
  styles.css          ported from the original static site, class names unchanged
```

## Developer / Business spaces (issue #17) — quyết định thiết kế

- **Id scheme — chọn phương án (a) của issue**: vẫn 1 registry `PAGES` phẳng + 1 hash router, nhưng
  id trang Business **bắt buộc có tiền tố `biz-`** (`biz-overview`, `biz-limits`...). Sidebar là
  hàm của space: `navFor(space)` trả `DEV_NAV_GROUPS` hoặc `BIZ_NAV_GROUPS`. Vì tiền tố là bắt buộc,
  2 space **không thể** đụng id của nhau (không có 2 trang khác nhau cùng trỏ `#overview`).
- **Space không mã hoá riêng trong hash, mà suy ra từ id**: `spaceOf(id)` = Business nếu id bắt đầu
  bằng `biz-`. Nhờ vậy link Business **share được trực tiếp** (`#biz-limits` luôn mở Business space),
  và mọi link Developer cũ (`#overview`, `#svc-wallet`...) giữ nguyên hành vi. Không chọn dạng
  `#business/overview` vì sẽ phải đổi format hash của mọi link Developer hiện có.
- **State + persist**: không thêm router/state library. Theo đúng pattern `theme`: space hiện tại lưu
  `localStorage` (`ewallet-lab-docs-space`). Khi mở trang **không có hash** thì vào space dùng lần
  trước (mặc định Developer); có hash hợp lệ thì hash quyết định. Chuyển space thì quay lại trang
  đã xem gần nhất trong space đó (chỉ trong phiên, `useRef`).
- **Nội dung Business**: mỗi quy tắc phải truy được về đúng mục trong backend `DESIGN.md`
  (`src/pages/business/*`). Ví Gia Đình (#12), Túi Thần Tài (#13) và xác thực bổ sung (#15) gắn nhãn
  **"Sắp có"**: issue #17 liệt kê chúng là "đã có", nhưng code và mục DESIGN.md của chúng **không có
  trên nhánh chính** — theo đúng quy tắc "không có trong code thì phải gắn Sắp có". Thêm tính năng
  mới thì cập nhật cả trang Business tương ứng.

## Why React (not the original static HTML)

The first version was a single hand-written `index.html` with manual `data-page`/`data-target`
attributes. It worked, but every new page meant writing a full HTML section by hand with no type
safety. This version keeps the exact same visual design (CSS ported near-verbatim) but makes
content additions mechanical and type-checked — the tradeoff is a `npm install`/build step where
there wasn't one before.

## Deploying

`npm run build`'s `dist/` output is a plain static site (no server-side code, no env vars) — fine
for Cloudflare Pages, GitHub Pages, S3+CloudFront, or just committing `dist/` somewhere. Cloudflare
Pages: connect the repo, set the build command to `npm run build` and the output directory to
`engineering/docs/ewallet-lab/dist` (or run the build yourself and use direct-upload / `wrangler
pages deploy dist`).

Cập nhật docs này song song mỗi khi `ewallet-lab` có service/tính năng mới — theo nguyên tắc đã lưu
là luôn có docs đi kèm service (xem `always_build_developer_docs_with_services` trong memory).
