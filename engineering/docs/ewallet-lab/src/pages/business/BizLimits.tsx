import { Crumb, Note } from '../../components';
import { Feature } from './parts';

export default function BizLimits() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Quy tắc xuyên suốt']} />
      <h1>Giới hạn &amp; an toàn giao dịch</h1>
      <p className="lede">
        Mọi giao dịch đưa tiền ra khỏi ví đều phải đi qua <strong>hai tầng hạn mức độc lập</strong>. Chúng khác nhau về
        bản chất và về nguồn gốc: tầng 1 theo số MoMo công bố, tầng 2 theo quy định pháp luật. Một giao dịch có thể qua
        tầng 1 nhưng vẫn bị chặn ở tầng 2.
      </p>

      <Feature
        name="Tầng 1 — Hạn mức mỗi lần giao dịch"
        what="Mỗi giao dịch đơn lẻ không được vượt một mức trần, tuỳ loại giao dịch."
        rules={[
          <>Chuyển tiền cho người dùng khác (ví → ví): tối đa <strong>100.000.000đ/lần</strong>.</>,
          <>Rút tiền về ngân hàng, chuyển khoản ra ngân hàng: tối đa <strong>50.000.000đ/lần</strong>.</>,
          <>Nạp tiền từ ngân hàng liên kết: tối đa <strong>50.000.000đ/lần</strong>.</>,
          <>Mọi lần ghi sổ ví đều không vượt <strong>200.000.000đ</strong> (bằng số dư ví tối đa MoMo công bố).</>,
          <>
            Góp quỹ nhóm dùng chung trần với chuyển tiền (100.000.000đ/lần). Lì xì có khoảng riêng: 1.000đ –
            20.000.000đ/lần.
          </>,
        ]}
        source={
          <>
            hạn mức MoMo công bố (momo.vn — hạn mức giao dịch mỗi ngày, hạn mức nạp/rút). Lưu ý: MoMo công bố đây là hạn
            mức <em>theo ngày</em>; lab áp dụng như <em>mỗi lần</em> và chưa cộng dồn theo ngày.
          </>
        }
      />

      <Feature
        name="Tầng 2 — Hạn mức cộng dồn theo tháng"
        what="Tổng tiền chuyển đi + thanh toán + rút tiền của một ví trong một tháng dương lịch không được vượt 100.000.000đ."
        rules={[
          <>
            Tính <strong>chung một "giỏ"</strong> cho chuyển tiền, thanh toán hoá đơn và rút/chuyển khoản ra ngân hàng — ví
            dụ đã rút 40 triệu và trả hoá đơn 40 triệu thì chỉ còn chuyển được 20 triệu trong tháng đó.
          </>,
          <>Tiền vào ví (nạp tiền, nhận tiền, hoàn tiền) không bị tính.</>,
          <>"Tháng" là tháng dương lịch: hạn mức làm mới vào ngày 1 hằng tháng, không phải 30 ngày trượt.</>,
          <>
            Trả nợ Ví Trả Sau <strong>không</strong> bị tính vào hạn mức này, vì luật loại trừ việc "trả nợ vay đến hạn/quá
            hạn tại tổ chức tín dụng".
          </>,
          <>
            Luật cho phép mức cao hơn (300.000.000đ/tháng) với một số dịch vụ thiết yếu (điện, nước, học phí…). Lab{' '}
            <strong>không áp dụng</strong> mức này vì hoá đơn trong lab là giả lập, không phân loại chắc chắn được dịch vụ
            nào là thiết yếu. Lab chọn mức 100 triệu cho tất cả vì an toàn hơn.
          </>,
        ]}
        source="Điều 26 Thông tư 40/2024/TT-NHNN, sửa đổi bởi Thông tư 41/2025/TT-NHNN — quy định pháp luật thật, không phải số do MoMo tự đặt."
      />

      <Feature
        name="Xác thực bổ sung cho giao dịch lớn"
        live={false}
        what="Giao dịch lớn phải qua thêm một bước xác nhận, kể cả khi chưa chạm hai tầng hạn mức ở trên."
        rules={[
          <>
            Theo yêu cầu đã lên kế hoạch: một giao dịch trên 10.000.000đ, hoặc tổng giao dịch trong ngày từ 20.000.000đ trở
            lên, phải xác thực bổ sung (lab dự định mô phỏng bằng một bước xác nhận, không dùng sinh trắc học thật).
          </>,
          <>Chưa có trong mã nguồn của nhánh chính — nên hiện chưa được áp dụng cho giao dịch nào.</>,
        ]}
        source="Quyết định 2345/QĐ-NHNN (theo mô tả trong yêu cầu issue #15; chưa có trong tài liệu thiết kế của nhánh chính)."
      />

      <h2>Một khoản tiền chỉ được xử lý đúng một lần</h2>
      <p>
        Một quy tắc ngầm nhưng quan trọng: khi nhiều thao tác xảy ra cùng lúc (ví dụ bấm "Trả" nhiều lần, hoặc hai người
        cùng nhận một lì xì), hệ thống <strong>giữ chỗ trạng thái trước rồi mới chuyển tiền</strong>: chỉ đúng một thao
        tác được thực hiện, các thao tác còn lại nhận thông báo "đang xử lý / đã xử lý". Nếu bước chuyển tiền thất bại,
        trạng thái được trả lại như cũ. Quy tắc này áp dụng cho link nhận tiền, nhắc trả, lì xì, Ví Trả Sau, đổi điểm
        thưởng và quỹ nhóm.
      </p>
      <Note icon="i">
        <p>
          Đây không phải lý thuyết: dự án đã từng gặp lỗi khi 8 yêu cầu thanh toán cùng lúc đều thành công, làm tiền bị
          chuyển nhiều lần. Quy tắc trên là cách sửa, và từ đó được bắt buộc cho mọi tính năng mới có di chuyển tiền.
        </p>
      </Note>
    </section>
  );
}
