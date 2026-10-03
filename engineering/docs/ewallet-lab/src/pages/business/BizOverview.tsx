import { Crumb, Note, PageLink } from '../../components';
import { Status } from './parts';

const LIVE: [string, string, string][] = [
  ['Nạp tiền / rút tiền (ngân hàng liên kết)', 'biz-payments', 'Nạp/rút, chuyển tiền & thanh toán'],
  ['Chuyển tiền cho người dùng khác', 'biz-payments', 'Nạp/rút, chuyển tiền & thanh toán'],
  ['Chuyển khoản ra ngân hàng', 'biz-payments', 'Nạp/rút, chuyển tiền & thanh toán'],
  ['Nhận tiền bằng mã QR / quét QR để chuyển', 'biz-payments', 'Nạp/rút, chuyển tiền & thanh toán'],
  ['Thanh toán hoá đơn', 'biz-payments', 'Nạp/rút, chuyển tiền & thanh toán'],
  ['Link nhận tiền', 'biz-requests', 'Nhận tiền, nhắc trả & lì xì'],
  ['Nhắc trả tiền', 'biz-requests', 'Nhận tiền, nhắc trả & lì xì'],
  ['Giật lì xì (1 người nhận)', 'biz-requests', 'Nhận tiền, nhắc trả & lì xì'],
  ['Quản lý chi tiêu (báo cáo tuần/tháng)', 'biz-personal', 'Chi tiêu, điểm thưởng, quỹ & trả sau'],
  ['Điểm thưởng', 'biz-personal', 'Chi tiêu, điểm thưởng, quỹ & trả sau'],
  ['Quỹ nhóm', 'biz-personal', 'Chi tiêu, điểm thưởng, quỹ & trả sau'],
  ['Ví Trả Sau (mô phỏng)', 'biz-personal', 'Chi tiêu, điểm thưởng, quỹ & trả sau'],
  ['Giới hạn giao dịch mỗi lần & theo tháng', 'biz-limits', 'Giới hạn & an toàn giao dịch'],
];

export default function BizOverview() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Tổng quan']} />
      <h1>Nghiệp vụ sản phẩm</h1>
      <p className="lede">
        Không gian này dành cho người muốn hiểu <strong>quy tắc nào chi phối từng tính năng và vì sao</strong> — không
        phải cách cài đặt kỹ thuật (phần đó ở Developer space). Mọi quy tắc ở đây được dịch lại từ tài liệu thiết kế
        backend của dự án, kèm căn cứ (thông tin MoMo công bố, văn bản của Ngân hàng Nhà nước, hoặc "tự thiết kế" khi không
        có nguồn).
      </p>
      <Note icon="!" kind="warn">
        <p>
          Ewallet Lab là bản mô phỏng học tập theo kiểu ví điện tử MoMo — không phải sản phẩm thật, không có ngân hàng,
          nhà cung cấp hoá đơn hay đối tác thật nào phía sau. Số liệu lấy từ nguồn thật chỉ để học cách các quy tắc vận
          hành.
        </p>
      </Note>

      <h2>Nên đọc trước</h2>
      <p>
        <PageLink to="biz-limits">Giới hạn &amp; an toàn giao dịch</PageLink> — các hạn mức áp dụng xuyên suốt mọi giao
        dịch tiền ra khỏi ví. Đây là phần nghiệp vụ quan trọng nhất: một giao dịch có thể hợp lệ ở tính năng của nó nhưng
        vẫn bị chặn ở tầng hạn mức.
      </p>

      <h2>Tính năng hiện có</h2>
      <table className="biz-table">
        <thead>
          <tr>
            <th>Tính năng</th>
            <th>Trạng thái</th>
            <th>Xem quy tắc</th>
          </tr>
        </thead>
        <tbody>
          {LIVE.map(([name, to, group]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>
                <Status live />
              </td>
              <td>
                <PageLink to={to}>{group}</PageLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Những gì chưa làm (Ví Gia Đình, Túi Thần Tài, xác thực bổ sung cho giao dịch lớn, nạp điện thoại, mua vé…) và lý
        do: xem <PageLink to="biz-coming-soon">Sắp có</PageLink>.
      </p>
    </section>
  );
}
