# API thống kê

Hai endpoint dùng cơ chế xác thực hiện có, trả JSON `{ "data": ... }`:

- `GET /api/v1/statistics/tasks?range=week&date=2026-10-14`
- `GET /api/v1/statistics/pomodoro?range=month&date=2026-10-14`

## Query chung

| Tham số            | Ý nghĩa                                                         |
| ------------------ | --------------------------------------------------------------- |
| `range`            | `week` (mặc định) hoặc `month`                                  |
| `date`             | Ngày bất kỳ trong kỳ, `YYYY-MM-DD`; mặc định hôm nay            |
| `utcOffsetMinutes` | Độ lệch UTC cố định, mặc định `420` (Việt Nam), từ -720 đến 840 |

Tuần bắt đầu thứ Hai. Tháng là tháng dương lịch. Khoảng tính bao gồm `period.start`, không bao gồm `period.endExclusive`. Offset cố định không tự đổi theo DST. Query không hợp lệ trả HTTP 400.

## Task

Phạm vi: task chưa xóa trong list chưa xóa do người dùng sở hữu hoặc có membership `accept` chưa xóa. Đây là thống kê task trong các list người dùng có quyền truy cập, bao gồm task con; schema không lưu người được giao task nên không phân loại theo người thực hiện.

Task thuộc kỳ theo `rule.end_date`, nếu thiếu dùng `rule.start_date`, cuối cùng dùng `task.created_at`. `summary` và `byPriority` dùng tập task này. Riêng `completedInRange` và trung bình hoàn thành dùng ngày hoàn thành thực tế, kể cả task có hạn ngoài kỳ.

| Trường `summary`                    | Ý nghĩa                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `totalTasks`                        | Tổng task thuộc kỳ                                                                              |
| `completedTasks`, `incompleteTasks` | Trạng thái `done` và chưa hoàn thành                                                            |
| `pendingTasks`, `wontDoTasks`       | Chưa hoàn thành tách theo `pending` và `won't do`                                               |
| `overdueTasks`                      | Task pending đã quá hạn tại thời điểm gọi API                                                   |
| `completedOnTime`, `completedLate`  | Task done có thời điểm hoàn thành trước/bằng hoặc sau hạn                                       |
| `completedWithoutDeadline`          | Task done không có hạn                                                                          |
| `completedUnknownTime`              | Task done có hạn nhưng thiếu `done_at`                                                          |
| `completionRate`                    | Phần trăm completedTasks / totalTasks, 0 khi rỗng                                               |
| `completedInRange`                  | Task done có done_at trong kỳ                                                                   |
| `averageCompletedPerDay`            | completedInRange / tổng số ngày trong kỳ                                                        |
| `averageCompletionHours`            | Trung bình từ created_at đến done_at của task hoàn thành trong kỳ; null nếu không có mẫu hợp lệ |

Hạn dùng end_date + endTimer, hoặc start_date + timer khi thiếu end_date. Timer là giây từ đầu ngày theo offset. Nếu không có timer, hạn là cuối ngày. `done_at` của `won't do` không được tính là hoàn thành. Dữ liệu phản ánh trạng thái hiện tại, không tái dựng lịch sử trạng thái.

`daily` chứa đủ ngày, kể cả ngày không có task: `date`, `totalTasks`, `completedTasks`, `incompleteTasks`, `completedInRange`. Ba số đầu đếm theo ngày thuộc kỳ; completedInRange đếm theo ngày hoàn thành.

`byPriority` luôn chứa bốn mức 1–4 với `priority`, `totalTasks`, `completedTasks`, `incompleteTasks`; thiếu rule/priority dùng mức 4.

## Pomodoro

Chỉ lấy session của người dùng đăng nhập, chưa xóa, có `start` trong kỳ. Toàn bộ session được gán vào ngày bắt đầu, kể cả session qua nửa đêm. Schema không có trạng thái hoàn thành/hủy phiên nên không suy diễn các trạng thái này.

`summary` trả `totalSessions`, `totalFocusMinutes`, `totalPauseMinutes`, `averageFocusMinutesPerSession`, `averageFocusMinutesPerDay`, `activeDays` (có thời gian tập trung > 0), `bestDay` (ngày tập trung nhiều nhất; null nếu rỗng).

Thời gian tập trung = tổng `progress.duration` (mili giây), chuyển sang phút. Không dùng `totalDuration` vì frontend hiện tính thời gian thực tế từ progress. Thời gian nghỉ = khoảng từ progress đầu đến cuối (kèm duration cuối) trừ tổng duration, tối thiểu 0; không tính nghỉ ngoài khoảng được ghi lại.

`daily` chứa `date`, `sessions`, `focusMinutes`, `pauseMinutes` với đầy đủ ngày. `byTask` chứa `taskId`, `sessions`, `focusMinutes`; taskId null là phiên không gắn task. Thời lượng giữ độ chính xác đến bước trả kết quả, làm tròn hai chữ số thập phân.

`summary.totalTasks` là số taskId khác nhau được dùng trong các phiên của kỳ, không tính nhóm chưa gắn nhiệm vụ. Task đã xóa hoặc không còn quyền truy cập vẫn được tính theo ID trong lịch sử phiên, nhưng không trả tên.

`byTask` bổ sung `taskName` (null nếu task đã xóa/không còn quyền truy cập), `pauseMinutes` và `totalMinutes` (tập trung + nghỉ), xếp theo số phiên giảm dần rồi thời gian tập trung giảm dần. Tên task chỉ được đọc từ list chưa xóa mà người dùng sở hữu hoặc có membership accept chưa xóa.
