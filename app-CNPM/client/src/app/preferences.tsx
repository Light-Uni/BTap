/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppLanguage = "vi" | "en";
export type AppTheme = "light" | "dark";

export const LANGUAGE_FLAG_IMAGES: Record<AppLanguage, string> = {
  vi: "https://old-stdportal.tdtu.edu.vn/images/Flag_of_Vietnam.png",
  en: "https://old-stdportal.tdtu.edu.vn/images/Flag_of_the_United_Kingdom.png",
};

type TranslationKey =
  | "app.name"
  | "app.subtitle"
  | "common.language"
  | "common.theme"
  | "common.light"
  | "common.dark"
  | "common.logout"
  | "common.notifications"
  | "common.close"
  | "auth.hero.line1"
  | "auth.hero.line2"
  | "auth.hero.subtitle"
  | "auth.hero.cta"
  | "auth.login"
  | "auth.register"
  | "auth.username"
  | "auth.password"
  | "auth.fullName"
  | "auth.email"
  | "auth.confirmPassword"
  | "auth.forgotPassword"
  | "auth.backToLogin"
  | "auth.forgotTitle"
  | "auth.forgotCopy"
  | "auth.forgotSubmit"
  | "auth.forgotLoading"
  | "auth.forgotError"
  | "auth.forgotSentTitle"
  | "auth.forgotSentPrefix"
  | "auth.forgotSentSuffix"
  | "auth.resetTitle"
  | "auth.resetCopy"
  | "auth.newPassword"
  | "auth.resetInvalidLink"
  | "auth.resetRequired"
  | "auth.resetMismatch"
  | "auth.resetError"
  | "auth.resetSubmit"
  | "auth.resetLoading"
  | "auth.resetDoneTitle"
  | "auth.resetDoneCopy"
  | "auth.loginSubmit"
  | "auth.loginLoading"
  | "auth.registerSubmit"
  | "auth.registerLoading"
  | "auth.requiredUsername"
  | "auth.requiredPassword"
  | "auth.invalidLogin"
  | "auth.requiredRegister"
  | "auth.passwordMismatch"
  | "auth.registerFailed"
  | "auth.unknownError"
  | "auth.registerSuccess"
  | "nav.dashboard"
  | "nav.medicine"
  | "nav.medicineRequest"
  | "nav.inventory"
  | "nav.stockHistory"
  | "nav.stockExport"
  | "nav.stockImport"
  | "nav.audit"
  | "nav.auditCreate"
  | "nav.profile"
  | "nav.medicineRequestCreate"
  | "role.requester"
  | "role.storekeeper"
  | "role.manager"
  | "dashboard.title"
  | "dashboard.totalSkus"
  | "dashboard.totalBatches"
  | "dashboard.nearExpiry"
  | "dashboard.expired"
  | "dashboard.totalStock"
  | "dashboard.quickActions"
  | "dashboard.skuManaged"
  | "dashboard.batchInStock"
  | "dashboard.needsAttention"
  | "dashboard.handleNow"
  | "quick.warehouseMap"
  | "quick.handleExport"
  | "quick.handleImport"
  | "quick.createImportNotice"
  | "quick.addMedicine"
  | "quick.createAudit"
  | "quick.createRequest";

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  vi: {
    "app.name": "Pharma WMS",
    "app.subtitle": "Kho thuốc",
    "common.language": "Ngôn ngữ",
    "common.theme": "Giao diện",
    "common.light": "Sáng",
    "common.dark": "Tối",
    "common.logout": "Đăng xuất",
    "common.notifications": "Thông báo",
    "common.close": "Đóng",
    "auth.hero.line1": "Pharma WMS ",
    "auth.hero.line2": "Hệ thống quản lý kho thuốc",
    "auth.hero.subtitle":
      "Quản lý thuốc, nhập xuất kho, kiểm kê và báo cáo",
    "auth.hero.cta": "Truy cập hệ thống",
    "auth.login": "Đăng nhập",
    "auth.register": "Đăng ký",
    "auth.username": "Tên đăng nhập",
    "auth.password": "Mật khẩu",
    "auth.fullName": "Họ và tên",
    "auth.email": "Email",
    "auth.confirmPassword": "Xác nhận mật khẩu",
    "auth.forgotPassword": "Quên mật khẩu?",
    "auth.backToLogin": "Quay lại đăng nhập",
    "auth.forgotTitle": "Quên mật khẩu",
    "auth.forgotCopy": "Nhập email của bạn để nhận liên kết đặt lại mật khẩu.",
    "auth.forgotSubmit": "Gửi liên kết",
    "auth.forgotLoading": "Đang gửi...",
    "auth.forgotError": "Không thể gửi email đặt lại mật khẩu.",
    "auth.forgotSentTitle": "Đã gửi email",
    "auth.forgotSentPrefix": "Kiểm tra hộp thư",
    "auth.forgotSentSuffix": "để đặt lại mật khẩu.",
    "auth.resetTitle": "Đặt lại mật khẩu",
    "auth.resetCopy": "Nhập mật khẩu mới cho tài khoản của bạn.",
    "auth.newPassword": "Mật khẩu mới",
    "auth.resetInvalidLink": "Liên kết đặt lại mật khẩu không hợp lệ.",
    "auth.resetRequired": "Vui lòng nhập đầy đủ mật khẩu mới.",
    "auth.resetMismatch": "Mật khẩu xác nhận không khớp.",
    "auth.resetError": "Không thể đặt lại mật khẩu. Vui lòng yêu cầu gửi lại email mới.",
    "auth.resetSubmit": "Cập nhật mật khẩu",
    "auth.resetLoading": "Đang cập nhật...",
    "auth.resetDoneTitle": "Đã cập nhật",
    "auth.resetDoneCopy": "Bạn có thể đăng nhập bằng mật khẩu mới.",
    "auth.loginSubmit": "Vào hệ thống",
    "auth.loginLoading": "Đang đăng nhập...",
    "auth.registerSubmit": "Xác nhận",
    "auth.registerLoading": "Đang xử lý...",
    "auth.requiredUsername": "Vui lòng nhập tài khoản",
    "auth.requiredPassword": "Vui lòng nhập mật khẩu",
    "auth.invalidLogin": "Sai tài khoản hoặc mật khẩu",
    "auth.requiredRegister": "Vui lòng nhập đầy đủ thông tin",
    "auth.passwordMismatch": "Mật khẩu không khớp",
    "auth.registerFailed": "Đăng ký thất bại",
    "auth.unknownError": "Lỗi không xác định",
    "auth.registerSuccess": "Đăng ký thành công. Vui lòng đăng nhập.",
    "nav.dashboard": "Tổng quan",
    "nav.medicine": "Danh sách thuốc",
    "nav.medicineRequest": "Yêu cầu lấy thuốc",
    "nav.inventory": "Kho thuốc",
    "nav.stockHistory": "Lịch sử kho",
    "nav.stockExport": "Yêu cầu xuất kho",
    "nav.stockImport": "Thông báo nhập kho",
    "nav.audit": "Kiểm kê",
    "nav.auditCreate": "Tạo đợt kiểm kê",
    "nav.profile": "Hồ sơ cá nhân",
    "nav.medicineRequestCreate": "Tạo yêu cầu lấy thuốc",
    "role.requester": "Trình dược viên",
    "role.storekeeper": "Thủ kho",
    "role.manager": "Quản lý kho",
    "dashboard.title": "Tổng quan kho",
    "dashboard.totalSkus": "Tổng mặt hàng",
    "dashboard.totalBatches": "Tổng lô hàng",
    "dashboard.nearExpiry": "Lô cận date",
    "dashboard.expired": "Lô hết hạn",
    "dashboard.totalStock": "Tổng tồn kho (đơn vị)",
    "dashboard.quickActions": "Thao tác nhanh",
    "dashboard.skuManaged": "SKU đang quản lý",
    "dashboard.batchInStock": "lô có tồn kho",
    "dashboard.needsAttention": "lô hàng cần chú ý",
    "dashboard.handleNow": "Cần xử lý ngay",
    "quick.warehouseMap": "Sơ đồ kho",
    "quick.handleExport": "Xử lý xuất kho",
    "quick.handleImport": "Xử lý nhập kho",
    "quick.createImportNotice": "Gửi thông báo nhập kho",
    "quick.addMedicine": "Thêm thuốc",
    "quick.createAudit": "Tạo đợt kiểm kê",
    "quick.createRequest": "Tạo yêu cầu",
  },
  en: {
    "app.name": "Pharma WMS",
    "app.subtitle": "Medicine warehouse",
    "common.language": "Language",
    "common.theme": "Theme",
    "common.light": "Light",
    "common.dark": "Dark",
    "common.logout": "Log out",
    "common.notifications": "Notifications",
    "common.close": "Close",
    "auth.hero.line1": "A management system for",
    "auth.hero.line2": "efficient medicine warehouses",
    "auth.hero.subtitle":
      "Manage medicines, stock movement, audits, and reports for pharmacists, storekeepers, and managers",
    "auth.hero.cta": "Access system",
    "auth.login": "Log in",
    "auth.register": "Sign up",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.fullName": "Full name",
    "auth.email": "Email",
    "auth.confirmPassword": "Confirm password",
    "auth.forgotPassword": "Forgot password?",
    "auth.backToLogin": "Back to login",
    "auth.forgotTitle": "Forgot password",
    "auth.forgotCopy": "Enter your email to receive a password reset link.",
    "auth.forgotSubmit": "Send link",
    "auth.forgotLoading": "Sending...",
    "auth.forgotError": "Unable to send the password reset email.",
    "auth.forgotSentTitle": "Email sent",
    "auth.forgotSentPrefix": "Check",
    "auth.forgotSentSuffix": "to reset your password.",
    "auth.resetTitle": "Reset password",
    "auth.resetCopy": "Enter a new password for your account.",
    "auth.newPassword": "New password",
    "auth.resetInvalidLink": "The password reset link is invalid.",
    "auth.resetRequired": "Please enter and confirm your new password.",
    "auth.resetMismatch": "The confirmation password does not match.",
    "auth.resetError": "Unable to reset your password. Please request a new email.",
    "auth.resetSubmit": "Update password",
    "auth.resetLoading": "Updating...",
    "auth.resetDoneTitle": "Password updated",
    "auth.resetDoneCopy": "You can now log in with your new password.",
    "auth.loginSubmit": "Enter system",
    "auth.loginLoading": "Logging in...",
    "auth.registerSubmit": "Confirm",
    "auth.registerLoading": "Processing...",
    "auth.requiredUsername": "Please enter your username",
    "auth.requiredPassword": "Please enter your password",
    "auth.invalidLogin": "Incorrect username or password",
    "auth.requiredRegister": "Please fill in all required information",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.registerFailed": "Registration failed",
    "auth.unknownError": "Unknown error",
    "auth.registerSuccess": "Registration successful. Please log in.",
    "nav.dashboard": "Dashboard",
    "nav.medicine": "Medicine list",
    "nav.medicineRequest": "Medicine requests",
    "nav.inventory": "Inventory",
    "nav.stockHistory": "Stock history",
    "nav.stockExport": "Export requests",
    "nav.stockImport": "Import notices",
    "nav.audit": "Audit",
    "nav.auditCreate": "Create audit session",
    "nav.profile": "Profile",
    "nav.medicineRequestCreate": "Create medicine request",
    "role.requester": "Pharmacist",
    "role.storekeeper": "Storekeeper",
    "role.manager": "Warehouse manager",
    "dashboard.title": "Warehouse overview",
    "dashboard.totalSkus": "Total SKUs",
    "dashboard.totalBatches": "Total batches",
    "dashboard.nearExpiry": "Near expiry",
    "dashboard.expired": "Expired batches",
    "dashboard.totalStock": "Total stock (units)",
    "dashboard.quickActions": "Quick actions",
    "dashboard.skuManaged": "managed SKUs",
    "dashboard.batchInStock": "batches in stock",
    "dashboard.needsAttention": "batches need attention",
    "dashboard.handleNow": "Needs immediate action",
    "quick.warehouseMap": "Warehouse map",
    "quick.handleExport": "Handle export",
    "quick.handleImport": "Handle import",
    "quick.createImportNotice": "Create import notice",
    "quick.addMedicine": "Add medicine",
    "quick.createAudit": "Create audit session",
    "quick.createRequest": "Create request",
  },
};

const domPhraseTranslations: Array<[string, string]> = [
  ["Pharma WMS", "Pharma WMS"],
  ["Kho thuốc", "Medicine warehouse"],
  ["Tổng quan", "Dashboard"],
  ["Tổng quan kho", "Warehouse overview"],
  ["Danh sách thuốc", "Medicine list"],
  ["Yêu cầu lấy thuốc", "Medicine requests"],
  ["Tạo yêu cầu lấy thuốc", "Create medicine request"],
  ["Kho thuốc", "Inventory"],
  ["Quản lý kho", "Inventory management"],
  ["Lịch sử kho", "Stock history"],
  ["Yêu cầu xuất kho", "Export requests"],
  ["Thông báo nhập kho", "Import notices"],
  ["Kiểm kê kho", "Stock audit"],
  ["Kiểm kê", "Audit"],
  ["Tạo đợt kiểm kê", "Create audit session"],
  ["Hồ sơ cá nhân", "Profile"],
  ["Sơ đồ kho", "Warehouse map"],
  ["Sơ đồ Kho Dược", "Pharmacy warehouse map"],
  ["Quản lý vị trí, trạng thái tủ thuốc theo phòng và tầng", "Manage medicine cabinet locations and statuses by room and floor"],
  ["Tổng mặt hàng", "Total SKUs"],
  ["Tổng lô hàng", "Total batches"],
  ["Lô cận date", "Near-expiry batches"],
  ["Lô hết hạn", "Expired batches"],
  ["Tổng tồn kho (đơn vị)", "Total stock (units)"],
  ["Thao tác nhanh", "Quick actions"],
  ["SKU đang quản lý", "managed SKUs"],
  ["lô có tồn kho", "batches in stock"],
  ["lô hàng cần chú ý", "batches need attention"],
  ["Cần xử lý ngay", "Needs immediate action"],
  ["Xử lý xuất kho", "Handle export"],
  ["Xử lý nhập kho", "Handle import"],
  ["Gửi thông báo nhập kho", "Create import notice"],
  ["Thêm thuốc", "Add medicine"],
  ["Tạo yêu cầu", "Create request"],
  ["Đăng nhập", "Log in"],
  ["Đăng ký", "Sign up"],
  ["Tên đăng nhập", "Username"],
  ["Mật khẩu", "Password"],
  ["Họ và tên", "Full name"],
  ["Xác nhận mật khẩu", "Confirm password"],
  ["Quên mật khẩu?", "Forgot password?"],
  ["Vào hệ thống", "Enter system"],
  ["Đang đăng nhập...", "Logging in..."],
  ["Đang xử lý...", "Processing..."],
  ["Xác nhận", "Confirm"],
  ["Vui lòng nhập tài khoản", "Please enter your username"],
  ["Vui lòng nhập mật khẩu", "Please enter your password"],
  ["Sai tài khoản hoặc mật khẩu", "Incorrect username or password"],
  ["Vui lòng nhập đầy đủ thông tin", "Please fill in all required information"],
  ["Mật khẩu không khớp", "Passwords do not match"],
  ["Đăng ký thất bại", "Registration failed"],
  ["Lỗi không xác định", "Unknown error"],
  ["Đăng ký thành công. Vui lòng đăng nhập.", "Registration successful. Please log in."],
  ["Hệ thống quản lý giúp", "A management system for"],
  ["kho thuốc hiệu quả", "efficient medicine warehouses"],
  ["Quản lý thuốc, nhập xuất kho, kiểm kê và báo cáo cho Dược sĩ, Thủ kho và Quản lý", "Manage medicines, stock movement, audits, and reports for pharmacists, storekeepers, and managers"],
  ["Truy cập hệ thống", "Access system"],
  ["Cuộn xuống", "Scroll down"],
  ["Quên mật khẩu", "Forgot password"],
  ["Nhập email của bạn để nhận liên kết đặt lại mật khẩu", "Enter your email to receive a password reset link"],
  ["Quay lại đăng nhập", "Back to login"],
  ["đăng nhập", "login"],
  ["Gửi liên kết", "Send link"],
  ["Đang gửi...", "Sending..."],
  ["Gửi liên kết đặt lại", "Send reset link"],
  ["Đã gửi email!", "Email sent!"],
  ["Đã gửi email", "Email sent"],
  ["Kiểm tra hộp thư", "Check the inbox"],
  ["để đặt lại mật khẩu.", "to reset your password."],
  ["Đặt lại mật khẩu", "Reset password"],
  ["Nhập mật khẩu mới cho tài khoản của bạn.", "Enter a new password for your account."],
  ["Mật khẩu mới", "New password"],
  ["Liên kết đặt lại mật khẩu không hợp lệ.", "The password reset link is invalid."],
  ["Vui lòng nhập đầy đủ mật khẩu mới.", "Please enter and confirm your new password."],
  ["Mật khẩu xác nhận không khớp.", "The confirmation password does not match."],
  ["Không thể đặt lại mật khẩu. Vui lòng yêu cầu gửi lại email mới.", "Unable to reset your password. Please request a new email."],
  ["Cập nhật mật khẩu", "Update password"],
  ["Đang cập nhật...", "Updating..."],
  ["Đã cập nhật", "Password updated"],
  ["Bạn có thể đăng nhập bằng mật khẩu mới.", "You can now log in with your new password."],
  ["Không thể gửi email đặt lại mật khẩu.", "Unable to send the password reset email."],
  ["Trình dược viên", "Pharmacist"],
  ["Thủ kho", "Storekeeper"],
  ["Quản lý kho", "Warehouse manager"],
  ["Đăng xuất", "Log out"],
  ["Thông báo", "Notifications"],
  ["Ngôn ngữ", "Language"],
  ["Giao diện", "Theme"],
  ["Sáng", "Light"],
  ["Tối", "Dark"],
  ["Tìm kiếm...", "Search..."],
  ["Chọn thuốc và số lượng, gửi yêu cầu xuất kho", "Select medicines and quantities, then submit an export request"],
  ["Mặt hàng", "Items"],
  ["Thêm thuốc", "Add medicine"],
  ["*Chỉ hiển thị thuốc có trong kho", "*Only medicines currently in stock are shown"],
  ["Thêm vào yêu cầu", "Add to request"],
  ["Danh sách thuốc yêu cầu", "Requested medicines"],
  ["Kiểm tra lại trước khi gửi", "Review before submitting"],
  ["Xóa tất cả", "Clear all"],
  ["Chưa có thuốc nào trong yêu cầu", "No medicines in this request yet"],
  ["Tổng số lượng", "Total quantity"],
  ["Gửi yêu cầu xuất kho", "Submit export request"],
  ["Gửi yêu cầu thành công!", "Request sent successfully!"],
  ["Trả thuốc", "Return medicine"],
  ["Chọn thuốc, số lượng và lý do trả trước khi gửi yêu cầu", "Select the medicine, quantity, and return reason before submitting"],
  ["Loại thuốc trả", "Return items"],
  ["Thêm thuốc cần trả", "Add medicine to return"],
  ["Mỗi yêu cầu có thể chứa nhiều loại thuốc.", "Each request can include multiple medicines."],
  ["Số lượng trả", "Return quantity"],
  ["Lý do trả thuốc", "Return reason"],
  ["Ví dụ: Dùng không hết, hết hạn sử dụng...", "Example: Unused quantity, expired medicine..."],
  ["Thêm vào danh sách trả", "Add to return list"],
  ["Danh sách thuốc trả", "Return medicine list"],
  ["Kiểm tra lại trước khi gửi yêu cầu", "Review before submitting the request"],
  ["Chưa có thuốc nào cần trả", "No medicines to return yet"],
  ["Tổng số lượng trả", "Total return quantity"],
  ["Gửi yêu cầu trả thuốc", "Submit return request"],
  ["Đã gửi yêu cầu trả thuốc!", "Return request sent!"],
  ["Lỗi khi gửi yêu cầu trả thuốc", "Failed to submit return request"],
  ["Không có lý do", "No reason provided"],
  ["Tạm ngừng nhập kho", "Import paused"],
  ["Loại thuốc", "Medicine type"],
  ["-- Chọn thuốc --", "-- Select medicine --"],
  ["Chọn thuốc", "Select medicine"],
  ["Tìm kiếm và tra cứu thuốc trong hệ thống", "Search and look up medicines in the system"],
  ["Tìm theo tên, mô tả...", "Search by name or description..."],
  ["Hiển thị", "Showing"],
  ["thuốc", "medicines"],
  ["Không tìm thấy thuốc nào", "No medicines found"],
  ["Cập nhật thông tin thuốc", "Update medicine information"],
  ["Ảnh thuốc", "Medicine image"],
  ["Tên thuốc", "Medicine name"],
  ["Mô tả", "Description"],
  ["Mô tả ngắn về thuốc", "Short medicine description"],
  ["Hủy", "Cancel"],
  ["Huỷ", "Cancel"],
  ["Lưu", "Save"],
  ["Xác nhận xoá", "Confirm deletion"],
  ["Bạn có chắc muốn xoá thuốc", "Are you sure you want to delete medicine"],
  ["Xoá", "Delete"],
  ["Tổng quan và danh sách lô thuốc trong kho", "Overview and batch list in stock"],
  ["Tổng lô", "Total batches"],
  ["Tồn kho", "Stock"],
  ["Gần hết hạn", "Near expiry"],
  ["Hết hạn", "Expired"],
  ["Tìm theo tên hoặc mã lô...", "Search by name or batch code..."],
  ["Đang tải dữ liệu kho...", "Loading inventory data..."],
  ["Mã lô", "Batch code"],
  ["Tên thuốc", "Medicine name"],
  ["Số lượng", "Quantity"],
  ["Hạn sử dụng", "Expiry date"],
  ["Trạng thái", "Status"],
  ["Vị trí", "Location"],
  ["Không có lô thuốc nào", "No batches found"],
  ["Mã lô", "Batch code"],
  ["Ghi chú", "Note"],
  ["Ghi chú thêm...", "Additional note..."],
  ["Gửi", "Send"],
  ["Gửi thông báo nhập", "Send import notice"],
  ["Đã gửi thông báo nhập", "Import notice sent"],
  ["Không thể gửi thông báo nhập", "Unable to send import notice"],
  ["Vui lòng chọn thuốc", "Please select a medicine"],
  ["Vui lòng chọn thuốc!", "Please select a medicine!"],
  ["Vui lòng nhập số lượng", "Please enter a quantity"],
  ["Số lượng phải lớn hơn 0", "Quantity must be greater than 0"],
  ["Vui lòng chọn nhà cung cấp", "Please select a supplier"],
  ["Vui lòng chọn ngày giao dự kiến", "Please select the expected delivery date"],
  ["Thuốc", "Medicine"],
  ["Nhà cung cấp", "Supplier"],
  ["-- Chọn nhà cung cấp --", "-- Select supplier --"],
  ["Ngày giao dự kiến", "Expected delivery date"],
  ["Vui lòng chọn hạn sử dụng!", "Please select an expiry date!"],
  ["Đã gửi yêu cầu nhập kho!", "Import request sent!"],
  ["Mã lô sẽ được hệ thống tự động tạo khi gửi yêu cầu.", "The batch code will be generated automatically when the request is submitted."],
  ["Tiêu huỷ lô", "Dispose batch"],
  ["Tiêu huỷ", "Disposal"],
  ["Không thể tải danh sách lô hết hạn", "Unable to load expired batches"],
  ["Vui lòng chọn lô cần tiêu huỷ", "Please select a batch to dispose"],
  ["Số lượng không hợp lệ", "Invalid quantity"],
  ["Vui lòng nhập lý do tiêu huỷ", "Please enter a disposal reason"],
  ["Tiêu huỷ lô thuốc thành công", "Batch disposed successfully"],
  ["Lỗi khi tiêu huỷ", "Failed to dispose batch"],
  ["Tiêu huỷ lô thuốc hết hạn", "Dispose expired batch"],
  ["Chọn lô đã hết hạn để thực hiện tiêu huỷ", "Select an expired batch to dispose"],
  ["Đang tải danh sách lô hết hạn...", "Loading expired batches..."],
  ["Không có lô thuốc nào đã hết hạn cần tiêu huỷ", "No expired batches need disposal"],
  ["Chọn", "Select"],
  ["Tồn", "Stock"],
  ["Số lượng tiêu huỷ", "Disposal quantity"],
  ["Vị trí lô", "Batch location"],
  ["Lý do tiêu huỷ", "Disposal reason"],
  ["Ví dụ: Lô thuốc hết hạn sử dụng, bao bì hỏng...", "Example: expired batch, damaged packaging..."],
  ["Xác nhận tiêu huỷ", "Confirm disposal"],
  ["Chưa đăng nhập", "Not logged in"],
  ["An toàn", "Safe"],
  ["Còn hạn", "Valid"],
  ["Cận date", "Near expiry"],
  ["Trống", "Empty"],
  ["ĐẦY", "FULL"],
  ["Đánh dấu đầy", "Marked full"],
  ["Tủ này hiện đang trống", "This cabinet is currently empty"],
  ["Tên thuốc / Mã lô", "Medicine / Batch code"],
  ["Hạn dùng", "Expiry"],
  ["Tủ đang được đánh dấu đầy", "Cabinet is marked as full"],
  ["Đánh dấu trạng thái tủ", "Mark cabinet status"],
  ["Đang cập nhật...", "Updating..."],
  ["Bỏ đánh dấu đầy", "Unmark full"],
  ["Đánh dấu đã đầy", "Mark as full"],
  ["Tổng tủ", "Total cabinets"],
  ["Đang dùng", "In use"],
  ["Đang tải sơ đồ kho...", "Loading warehouse map..."],
  ["Thử lại", "Retry"],
  ["Kho mát", "Cold storage"],
  ["Kho thường", "Standard storage"],
  ["Kho kiểm soát đặc biệt", "Controlled storage"],
  ["Kho đặc biệt", "Controlled storage"],
  ["Tầng 1 - Kho mát", "Floor 1 - Cold storage"],
  ["Tầng 2 - Kho thường", "Floor 2 - Standard storage"],
  ["Tầng 3 - Kho kiểm soát đặc biệt", "Floor 3 - Controlled storage"],
  ["Đánh dấu đầy", "Marked full"],
  ["Hiệu suất sử dụng tầng", "Floor utilization"],
  ["Hiệu suất sử dụng", "Utilization"],
  ["Chưa có thuốc nào được gán vị trí ở tầng này", "No medicines have been assigned on this floor"],
  ["Tầng", "Floor"],
  ["Phòng", "Room"],
  ["Tủ", "Cabinet"],
  ["Theo dõi lịch sử xuất / nhập kho", "Track import/export history"],
  ["Nhập kho", "Import"],
  ["Xuất kho", "Export"],
  ["Đang tải lịch sử...", "Loading history..."],
  ["Mã log", "Log ID"],
  ["Ngày", "Date"],
  ["Loại", "Type"],
  ["Hành động", "Action"],
  ["Không có lịch sử", "No history"],
  ["Xem chi tiết", "View details"],
  ["Chi tiết", "Details"],
  ["Sản phẩm", "Product"],
  ["Đóng", "Close"],
  ["Hoàn tất", "Completed"],
  ["Đang chờ", "Pending"],
  ["Đã huỷ", "Cancelled"],
  ["Từ chối", "Rejected"],
  ["Thiếu thuốc", "Shortage"],
  ["Dư số lượng", "Excess quantity"],
  ["Chờ xử lý", "Pending"],
  ["Đã duyệt", "Approved"],
  ["Hoàn thành", "Completed"],
  ["Thất bại", "Failed"],
  ["Lịch sử yêu cầu và tạo yêu cầu mới", "Request history and create new requests"],
  ["Tất cả trạng thái", "All statuses"],
  ["Tất cả loại", "All types"],
  ["Lấy thuốc", "Take medicine"],
  ["Trả thuốc", "Return medicine"],
  ["kết quả", "results"],
  ["Mã yêu cầu", "Request ID"],
  ["Số loại thuốc", "Medicine types"],
  ["Ngày tạo", "Created date"],
  ["Không có yêu cầu nào", "No requests found"],
  ["Chi tiết", "Details"],
  ["Đang tải...", "Loading..."],
  ["Không có dữ liệu", "No data"],
  ["Yêu cầu / Thực nhận", "Requested / Received"],
  ["Đã huỷ yêu cầu", "Request cancelled"],
  ["Lỗi khi huỷ yêu cầu", "Failed to cancel request"],
  ["Ghi chú / Lý do", "Note / Reason"],
  ["Xác nhận huỷ yêu cầu", "Confirm request cancellation"],
  ["Bạn có chắc chắn muốn huỷ yêu cầu nhập kho này không? Hành động này không thể hoàn tác.", "Are you sure you want to cancel this import request? This action cannot be undone."],
  ["Bỏ qua", "Skip"],
  ["Đang huỷ...", "Cancelling..."],
  ["Đồng ý huỷ", "Confirm cancellation"],
  ["Tiêu huỷ", "Disposal"],
  ["Yêu cầu", "Request"],
  ["Lý do", "Reason"],
  ["Thực nhận", "Received"],
  ["Ghi chú:", "Note:"],
  ["Tổng yêu cầu", "Total requests"],
  ["Đã xử lý", "Processed"],
  ["Nguồn", "Source"],
  ["Tổng SL", "Total qty"],
  ["Chưa có yêu cầu nào", "No requests yet"],
  ["QL kho", "Manager"],
  ["Người dùng", "User"],
  ["Hoàn trả", "Return"],
  ["Đã nhập", "Received"],
  ["Đã từ chối", "Rejected"],
  ["Xử lý", "Process"],
  ["Thuốc", "Medicine"],
  ["Số lượng YC", "Requested qty"],
  ["Số lượng thực nhận", "Actual received quantity"],
  ["Vị trí lưu trữ (Tầng - Phòng - Tủ)", "Storage location (Floor - Room - Cabinet)"],
  ["Tình trạng nhận hàng", "Receiving status"],
  ["Đủ hàng", "Full"],
  ["Thiếu hàng", "Partial"],
  ["Dư số lượng", "Excess quantity"],
  ["Mô tả tình trạng thiếu hàng...", "Describe the shortage..."],
  ["Mô tả tình trạng dư hàng...", "Describe the excess..."],
  ["Từ chối nhập lô", "Reject batch import"],
  ["Từ chối lô hàng", "Reject batch"],
  ["Nhập lý do từ chối (bắt buộc)...", "Enter rejection reason (required)..."],
  ["Xác nhận từ chối", "Confirm rejection"],
  ["Quản lý request nhập / hoàn trả từ quản lý & người dùng", "Manage import/return requests from managers and users"],
  ["Yêu cầu chờ xử lý", "Pending requests"],
  ["Danh sách xuất", "Export list"],
  ["lô đã chọn", "selected batches"],
  ["Xóa tất cả", "Clear all"],
  ["Từ chối yêu cầu xuất kho", "Reject export request"],
  ["Xác nhận xuất kho", "Confirm export"],
  ["Còn thiếu:", "Still missing:"],
  ["Xuất kho hoàn tất (Có thiếu hàng)", "Export completed with shortage"],
  ["Chi tiết thiếu hàng:", "Shortage details:"],
  ["Đã xuất thực tế:", "Actually exported:"],
  ["Đã hiểu, quay lại", "Got it, go back"],
  ["Không xuất được lô nào", "No batches were exported"],
  ["Tạo đợt kiểm kê", "Create audit session"],
  ["Nhập số lượng thực tế cho từng lô thuốc", "Enter actual quantity for each batch"],
  ["Quay lại", "Back"],
  ["Xác nhận tạo đợt", "Confirm creation"],
  ["Tổng chênh lệch", "Total difference"],
  ["Lô lệch", "Different batches"],
  ["Hệ thống", "System"],
  ["Số thực tế", "Actual quantity"],
  ["Thực tế", "Actual"],
  ["Chênh lệch", "Difference"],
  ["Đang tải danh sách lô...", "Loading batch list..."],
  ["Báo cáo kiểm kê", "Audit report"],
  ["Quản lý các đợt kiểm kê kho thuốc", "Manage medicine warehouse audit sessions"],
  ["Từ ngày", "From date"],
  ["Đến ngày", "To date"],
  ["ID đợt kiểm kê", "Audit session ID"],
  ["Thời gian tạo", "Created time"],
  ["Số lô", "Batches"],
  ["Chưa có đợt kiểm kê nào", "No audit sessions yet"],
  ["Đã duyệt", "Confirmed"],
  ["Đang mở", "Open"],
  ["Xem", "View"],
  ["Bắt đầu kiểm kê", "Start audit"],
  ["Xác nhận hoàn tất", "Confirm completion"],
  ["Tổng số lô", "Total batches"],
  ["Số lô lệch", "Different batches"],
  ["Không thể tải dữ liệu sơ đồ kho. Vui lòng thử lại.", "Cannot load warehouse map data. Please try again."],
  ["Không thể tải danh sách thuốc trong tủ", "Unable to load medicines in this cabinet"],
  ["Đã đánh dấu tủ đầy", "Cabinet marked as full"],
  ["Đã bỏ đánh dấu tủ đầy", "Cabinet full mark removed"],
  ["Không thể cập nhật trạng thái tủ", "Unable to update cabinet status"],
  ["Vị trí đích phải khác vị trí hiện tại", "The destination must be different from the current location"],
  ["Số lượng dời không hợp lệ", "Invalid move quantity"],
  ["Dời tủ thành công", "Cabinet move completed"],
  ["Không thể dời tủ", "Unable to move cabinet stock"],
  ["Cập nhật số lượng thành công", "Quantity updated successfully"],
  ["Không thể cập nhật số lượng", "Unable to update quantity"],
  ["Tủ thuốc", "Medicine cabinet"],
  ["Tủ đã đầy", "Cabinet is full"],
  ["Đánh dấu tủ đầy", "Mark cabinet as full"],
  ["Đang tải danh sách thuốc...", "Loading medicine list..."],
  ["Tủ này hiện chưa có thuốc.", "This cabinet currently has no medicines."],
  ["Thao tác", "Actions"],
  ["Dời tủ", "Move cabinet stock"],
  ["Chỉnh sửa số lượng", "Edit quantity"],
  ["Dời thuốc:", "Move medicine:"],
  ["Số lượng dời", "Move quantity"],
  ["Vị trí đích", "Destination"],
  ["Xác nhận dời", "Confirm move"],
  ["Điều chỉnh số lượng:", "Adjust quantity:"],
  ["Thông tin cá nhân", "Personal information"],
  ["Xem và cập nhật thông tin tài khoản", "View and update account information"],
  ["Đang tải thông tin...", "Loading profile..."],
  ["Họ tên", "Full name"],
  ["Số điện thoại", "Phone number"],
  ["Vai trò", "Role"],
  ["Địa chỉ", "Address"],
  ["Đang lưu...", "Saving..."],
  ["Lưu thay đổi", "Save changes"],
  ["Đổi mật khẩu", "Change password"],
  ["Cập nhật mật khẩu bảo mật tài khoản", "Update your account password"],
  ["Mật khẩu hiện tại", "Current password"],
  ["Nhập mật khẩu hiện tại", "Enter current password"],
  ["Tối thiểu 6 ký tự", "At least 6 characters"],
  ["Xác nhận mật khẩu mới", "Confirm new password"],
  ["Nhập lại mật khẩu mới", "Re-enter new password"],
  ["Đang đổi...", "Changing..."],
  ["Không thể tải thông tin cá nhân.", "Unable to load profile information."],
  ["Vui lòng nhập họ tên và email.", "Please enter your full name and email."],
  ["Cập nhật thông tin thành công.", "Profile updated successfully."],
  ["Cập nhật thông tin thất bại.", "Failed to update profile."],
  ["Vui lòng nhập đầy đủ thông tin.", "Please fill in all required information."],
  ["Mật khẩu mới phải có ít nhất 6 ký tự.", "New password must be at least 6 characters."],
  ["Đổi mật khẩu thành công.", "Password changed successfully."],
  ["Đổi mật khẩu thất bại.", "Failed to change password."],
  ["Lỗi tải dữ liệu kho", "Failed to load inventory data"],
  ["Lỗi khi gửi yêu cầu", "Failed to send request"],
  ["Đã gửi yêu cầu nhập kho!", "Import request sent!"],
  ["Lỗi tải danh sách nhập kho", "Failed to load import requests"],
  ["Vui lòng nhập ghi chú từ chối!", "Please enter a rejection note!"],
  ["Đã từ chối lô hàng!", "Batch rejected!"],
  ["Lỗi khi từ chối", "Failed to reject"],
  ["Vị trí này đã được đánh dấu là đầy! Vui lòng chọn vị trí khác.", "This location is marked as full. Please select another location."],
  ["Xác nhận nhận hàng thành công!", "Receiving confirmed successfully!"],
  ["Lỗi khi xác nhận nhận hàng", "Failed to confirm receiving"],
  ["Lỗi tải lịch sử kho", "Failed to load stock history"],
  ["Lỗi tải lịch sử yêu cầu", "Failed to load request history"],
  ["Lỗi tải danh sách lô", "Failed to load batch list"],
  ["Đã tạo đợt kiểm kê!", "Audit session created!"],
  ["Lỗi khi tạo kiểm kê", "Failed to create audit"],
  ["Xác nhận đợt kiểm kê thành công!", "Audit session confirmed successfully!"],
  ["Lỗi xác nhận kiểm kê", "Failed to confirm audit"],
  ["Lỗi tải chi tiết phiên kiểm kê", "Failed to load audit session details"],
];

const exactDomTranslations = new Map(domPhraseTranslations);

const translateDomText = (value: string) => {
  if (!value.trim()) return value;

  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  let core = value.trim();

  const exact = exactDomTranslations.get(core);
  if (exact) return `${leading}${exact}${trailing}`;

  for (const [vi, en] of domPhraseTranslations) {
    core = core.replaceAll(vi, en);
  }

  core = core
    .replace(/\bThuốc #/g, "Medicine #")
    .replace(/\bKho (\d+)/g, "Warehouse $1")
    .replace(/\bTầng (\d+)/g, "Floor $1")
    .replace(/\bPhòng ([A-Z])/g, "Room $1")
    .replace(/\bTủ (M\d+)/g, "Cabinet $1")
    .replace(/(\d+)\s*lô\b/g, "$1 batches")
    .replace(/(\d+)\s*đơn vị\b/g, "$1 units")
    .replace(/(\d+)\s*đv\b/g, "$1 units")
    .replace(/\bY\/c:/g, "Req:")
    .replace(/\bThực nhận:/g, "Received:")
    .replace(/\bthiếu\b/g, "missing")
    .replace(/\bdư\b/g, "excess");

  return `${leading}${core}${trailing}`;
};

const textOriginals = new WeakMap<Text, string>();
const textLastTranslated = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Record<string, string>>();
const attrLastTranslated = new WeakMap<Element, Record<string, string>>();
const translatableAttributes = ["placeholder", "title", "aria-label"] as const;

const shouldSkipTextNode = (node: Text) => {
  const parent = node.parentElement;
  if (!parent) return true;
  return Boolean(
    parent.closest(
      "script, style, code, pre, .material-symbols-outlined, .icon-fill",
    ),
  );
};

const translateElementTree = (root: ParentNode, language: AppLanguage) => {
  const translateTextNode = (node: Text) => {
    if (shouldSkipTextNode(node)) return;

    const current = node.nodeValue ?? "";
    const last = textLastTranslated.get(node);
    const knownOriginal = textOriginals.get(node);

    if (language === "vi") {
      if (last !== undefined && current === last && knownOriginal !== undefined) {
        node.nodeValue = knownOriginal;
      } else {
        textOriginals.set(node, current);
      }
      textLastTranslated.delete(node);
      return;
    }

    const original =
      !knownOriginal || (last !== undefined && current !== last)
        ? current
        : knownOriginal;

    textOriginals.set(node, original);

    const next = translateDomText(original);
    if (current !== next) node.nodeValue = next;
    textLastTranslated.set(node, next);
  };

  const translateElementAttrs = (element: Element) => {
    const originals = { ...(attrOriginals.get(element) ?? {}) };
    const lastTranslated = { ...(attrLastTranslated.get(element) ?? {}) };

    translatableAttributes.forEach((attr) => {
      if (!element.hasAttribute(attr)) return;

      const current = element.getAttribute(attr) ?? "";
      const previousOriginal = originals[attr];
      const previousTranslated = lastTranslated[attr];

      if (language === "vi") {
        if (
          previousTranslated !== undefined &&
          current === previousTranslated &&
          previousOriginal !== undefined
        ) {
          element.setAttribute(attr, previousOriginal);
        } else {
          originals[attr] = current;
        }
        delete lastTranslated[attr];
        return;
      }

      const original =
        !previousOriginal ||
        (previousTranslated !== undefined && current !== previousTranslated)
          ? current
          : previousOriginal;

      originals[attr] = original;

      const next = translateDomText(original);
      if (current !== next) element.setAttribute(attr, next);
      lastTranslated[attr] = next;
    });

    attrOriginals.set(element, originals);
    attrLastTranslated.set(element, lastTranslated);
  };

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );

  if (root instanceof Element) translateElementAttrs(root);

  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node as Text);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      translateElementAttrs(node as Element);
    }
    node = walker.nextNode();
  }
};

type PreferencesContextValue = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (key: TranslationKey) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type AppAlert = {
  id: number;
  message: string;
  tone: "success" | "warning" | "error" | "info";
};

const getAlertTone = (message: string): AppAlert["tone"] => {
  const lower = message.toLowerCase();
  if (
    lower.includes("lỗi") ||
    lower.includes("thất bại") ||
    lower.includes("không thể") ||
    lower.includes("failed") ||
    lower.includes("error")
  ) {
    return "error";
  }

  if (
    lower.includes("vui lòng") ||
    lower.includes("thiếu") ||
    lower.includes("đầy") ||
    lower.includes("please") ||
    lower.includes("missing")
  ) {
    return "warning";
  }

  if (
    lower.includes("thành công") ||
    lower.includes("đã ") ||
    lower.includes("success") ||
    lower.includes("confirmed")
  ) {
    return "success";
  }

  return "info";
};

const getStoredLanguage = (): AppLanguage => {
  if (typeof window === "undefined") return "vi";
  return localStorage.getItem("app-language") === "en" ? "en" : "vi";
};

const getStoredTheme = (): AppTheme => {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("app-theme") === "dark" ? "dark" : "light";
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getStoredLanguage);
  const [theme, setThemeState] = useState<AppTheme>(getStoredTheme);
  const [appAlert, setAppAlert] = useState<AppAlert | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("app-language", language);
  }, [language]);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    let applying = false;
    let frame = 0;

    const applyTranslation = () => {
      applying = true;
      translateElementTree(root, language);
      applying = false;
    };

    const scheduleTranslation = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyTranslation();
      });
    };

    applyTranslation();

    const observer = new MutationObserver(() => {
      if (applying) return;
      scheduleTranslation();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatableAttributes],
    });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [language]);

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message?: unknown) => {
      const text = String(message ?? "");
      const translatedText = language === "en" ? translateDomText(text) : text;
      setAppAlert({
        id: Date.now(),
        message: translatedText,
        tone: getAlertTone(translatedText),
      });
    };

    return () => {
      window.alert = nativeAlert;
    };
  }, [language]);

  useEffect(() => {
    if (!appAlert) return;

    const timeoutId = window.setTimeout(() => {
      setAppAlert((current) =>
        current?.id === appAlert.id ? null : current,
      );
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [appAlert]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      theme,
      setLanguage: setLanguageState,
      setTheme: setThemeState,
      toggleLanguage: () =>
        setLanguageState((current) => (current === "vi" ? "en" : "vi")),
      toggleTheme: () =>
        setThemeState((current) => (current === "light" ? "dark" : "light")),
      t: (key) => translations[language][key],
    }),
    [language, theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
      {appAlert && (
        <div
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "72px 16px 16px",
            pointerEvents: "none",
          }}
        >
          <div
            key={appAlert.id}
            role="alertdialog"
            aria-modal="true"
            aria-label={language === "en" ? "Notification" : "Thông báo"}
            style={{
              width: "min(420px, 100%)",
              background: "var(--surface-container-lowest)",
              border: "1px solid var(--outline-variant)",
              borderLeft: `5px solid ${
                appAlert.tone === "success"
                  ? "#4CA1AF"
                  : appAlert.tone === "warning"
                    ? "#F59E0B"
                    : appAlert.tone === "error"
                      ? "var(--error)"
                      : "var(--primary)"
              }`,
              borderRadius: 12,
              boxShadow: "0 24px 60px rgba(25, 28, 30, 0.24)",
              padding: 18,
              display: "grid",
              gridTemplateColumns: "36px 1fr auto",
              gap: 12,
              alignItems: "flex-start",
              pointerEvents: "auto",
              animation: "fadeIn 0.18s ease",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  appAlert.tone === "success"
                    ? "rgba(5, 150, 105, 0.12)"
                    : appAlert.tone === "warning"
                      ? "rgba(245, 158, 11, 0.14)"
                      : appAlert.tone === "error"
                        ? "rgba(186, 26, 26, 0.12)"
                        : "rgba(0, 40, 142, 0.12)",
                color:
                  appAlert.tone === "success"
                    ? "#4CA1AF"
                    : appAlert.tone === "warning"
                      ? "#B45309"
                      : appAlert.tone === "error"
                        ? "var(--error)"
                        : "var(--primary)",
                fontSize: 21,
              }}
            >
              {appAlert.tone === "success"
                ? "check_circle"
                : appAlert.tone === "warning"
                  ? "warning"
                  : appAlert.tone === "error"
                    ? "error"
                    : "info"}
            </span>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--on-surface)",
                  marginBottom: 4,
                }}
              >
                {language === "en" ? "Notification" : "Thông báo"}
              </div>
              <div
                style={{
                  color: "var(--on-surface-variant)",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {appAlert.message}
              </div>
            </div>
            <button
              type="button"
              aria-label={language === "en" ? "Close" : "Đóng"}
              onClick={() => setAppAlert(null)}
              style={{
                width: 32,
                height: 32,
                border: "none",
                borderRadius: 8,
                background: "var(--surface-container-low)",
                color: "var(--on-surface-variant)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                close
              </span>
            </button>
          </div>
        </div>
      )}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
