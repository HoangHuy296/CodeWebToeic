package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.mocktest.MockTestStatus;
import com.ivyts.backend.domain.order.Order;
import com.ivyts.backend.domain.order.OrderStatus;
import com.ivyts.backend.domain.post.BlogPostStatus;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.coursestore.CourseStore;
import com.ivyts.backend.service.enrollmentstore.EnrollmentStore;
import com.ivyts.backend.service.mockteststore.MockTestStore;
import com.ivyts.backend.service.orderstore.OrderStore;
import com.ivyts.backend.service.poststore.PostStore;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.web.admin.AdminMapper;
import com.ivyts.backend.web.admin.dto.UpdateAdminUserRequest;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserStore userStore;
    private final CourseStore courseStore;
    private final EnrollmentStore enrollmentStore;
    private final MockTestStore mockTestStore;
    private final PostStore postStore;
    private final OrderStore orderStore;
    private final AdminMapper adminMapper;

    public AdminService(
        UserStore userStore,
        CourseStore courseStore,
        EnrollmentStore enrollmentStore,
        MockTestStore mockTestStore,
        PostStore postStore,
        OrderStore orderStore,
        AdminMapper adminMapper
    ) {
        this.userStore = userStore;
        this.courseStore = courseStore;
        this.enrollmentStore = enrollmentStore;
        this.mockTestStore = mockTestStore;
        this.postStore = postStore;
        this.orderStore = orderStore;
        this.adminMapper = adminMapper;
    }

    public Map<String, Object> getStats(AuthUser authUser) {
        ensureAdmin(authUser);
        List<User> allUsers = userStore.findAll();
        List<Course> courses = courseStore.findAll();
        var enrollmentsData = enrollmentStore.findAll();
        var mockTests = mockTestStore.findAll();
        var posts = postStore.findAll();
        List<Order> paidOrders = orderStore.findByStatus(OrderStatus.PAID);

        long totalUsers = allUsers.size();
        long totalStudents = allUsers.stream().filter(user -> user.getRole() == UserRole.STUDENT).count();
        long totalTeachers = allUsers.stream().filter(user -> user.getRole() == UserRole.TEACHER).count();
        long totalAdmins = allUsers.stream().filter(user -> user.getRole() == UserRole.ADMIN).count();
        long publishedCourses = courses.stream().filter(Course::isPublished).count();
        long publishedMockTests = mockTests.stream().filter(mockTest -> mockTest.getStatus() == MockTestStatus.PUBLISHED).count();
        long publishedPosts = posts.stream().filter(post -> post.getStatus() == BlogPostStatus.PUBLISHED).count();
        long totalEnrollments = enrollmentsData.size();
        long completedEnrollments = enrollmentsData.stream().filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.COMPLETED).count();
        double totalRevenue = paidOrders.stream().mapToDouble(Order::getAmount).sum();
        long completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments * 100.0) / totalEnrollments) : 0;

        Map<String, Object> usersData = new LinkedHashMap<>();
        usersData.put("total", totalUsers);
        usersData.put("students", totalStudents);
        usersData.put("teachers", totalTeachers);
        usersData.put("admins", totalAdmins);

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("publishedCourses", publishedCourses);
        content.put("publishedMockTests", publishedMockTests);
        content.put("publishedPosts", publishedPosts);

        Map<String, Object> enrollments = new LinkedHashMap<>();
        enrollments.put("total", totalEnrollments);
        enrollments.put("completed", completedEnrollments);
        enrollments.put("completionRate", completionRate);

        Map<String, Object> revenue = new LinkedHashMap<>();
        revenue.put("total", Math.round(totalRevenue));
        revenue.put("currency", "VND");
        revenue.put("paidOrders", paidOrders.size());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("users", usersData);
        data.put("content", content);
        data.put("enrollments", enrollments);
        data.put("revenue", revenue);
        return data;
    }

    public List<Map<String, Object>> getRevenueChart(AuthUser authUser) {
        ensureAdmin(authUser);
        List<MonthBucket> months = buildMonthRange(6);
        Instant fromDate = months.isEmpty() ? Instant.now() : months.get(0).date();
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();
        months.forEach(month -> buckets.put(month.key(), new RevenueBucket(month.label(), 0, 0)));

        for (Order order : orderStore.findByStatus(OrderStatus.PAID)) {
            Instant sourceDate = order.getPaidAt() != null ? order.getPaidAt() : order.getCreatedAt();
            if (sourceDate == null || sourceDate.isBefore(fromDate)) {
                continue;
            }
            String key = monthKey(sourceDate);
            RevenueBucket bucket = buckets.get(key);
            if (bucket != null) {
                bucket.revenue += Math.round(order.getAmount());
                bucket.orders += 1;
            }
        }

        return buckets.values().stream().map(RevenueBucket::toMap).toList();
    }

    public List<Map<String, Object>> getEnrollmentChart(AuthUser authUser) {
        ensureAdmin(authUser);
        List<MonthBucket> months = buildMonthRange(6);
        Instant fromDate = months.isEmpty() ? Instant.now() : months.get(0).date();
        Map<String, EnrollmentBucket> buckets = new LinkedHashMap<>();
        months.forEach(month -> buckets.put(month.key(), new EnrollmentBucket(month.label(), 0, 0)));

        enrollmentStore.findAll().forEach(enrollment -> {
            if (enrollment.getCreatedAt() == null || enrollment.getCreatedAt().isBefore(fromDate)) {
                return;
            }
            EnrollmentBucket bucket = buckets.get(monthKey(enrollment.getCreatedAt()));
            if (bucket != null) {
                bucket.enrollments += 1;
                if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
                    bucket.completed += 1;
                }
            }
        });

        return buckets.values().stream().map(EnrollmentBucket::toMap).toList();
    }

    public List<Map<String, Object>> listUsers(AuthUser authUser) {
        ensureAdmin(authUser);
        return userStore.findAll().stream()
            .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(user -> adminMapper.toAdminUserView(user, getOwnedCourseCountForUser(user)))
            .toList();
    }

    public Map<String, Object> getUser(String userId, AuthUser authUser) {
        ensureAdmin(authUser);
        User user = findUserOrThrow(userId);
        return adminMapper.toAdminUserView(user, getOwnedCourseCountForUser(user));
    }

    public Map<String, Object> updateUser(String userId, UpdateAdminUserRequest request, AuthUser authUser) {
        ensureAdmin(authUser);
        User user = findUserOrThrow(userId);

        if (request.email() != null) {
            userStore.findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
                .filter(existing -> !existing.getId().equals(userId))
                .ifPresent(existing -> { throw new ApiException(HttpStatus.CONFLICT, "Email already exists"); });
            user.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        }
        if (Boolean.FALSE.equals(request.isActive()) && userId.equals(authUser.userId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own admin account");
        }

        if (request.fullName() != null) user.setFullName(request.fullName().trim());
        if (request.role() != null) user.setRole(UserRole.valueOf(request.role().trim().toUpperCase(Locale.ROOT)));
        if (request.avatarUrl() != null) user.setAvatarUrl(blankToNull(request.avatarUrl()));
        if (request.phone() != null) user.setPhone(blankToNull(request.phone()));
        if (request.bio() != null) user.setBio(blankToNull(request.bio()));
        if (request.isActive() != null) user.setActive(request.isActive());

        userStore.save(user);
        return adminMapper.toAdminUserView(user, getOwnedCourseCountForUser(user));
    }

    public Map<String, Object> deactivateUser(String userId, AuthUser authUser) {
        ensureAdmin(authUser);
        User user = findUserOrThrow(userId);
        if (userId.equals(authUser.userId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own admin account");
        }

        user.setActive(false);
        user.setRefreshToken(null);
        userStore.save(user);
        return adminMapper.toAdminUserView(user, getOwnedCourseCountForUser(user));
    }

    private long getOwnedCourseCountForUser(User user) {
        if (user.getRole() == UserRole.STUDENT) {
            return enrollmentStore.findByStudentAndStatusInOrderByCreatedAtDesc(
                    user.getId(),
                    List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
                )
                .stream()
                .map(enrollment -> enrollment.getCourse())
                .filter(courseId -> courseId != null && !courseId.isBlank())
                .distinct()
                .count();
        }
        return courseStore.findByOwner(user.getId()).size();
    }

    private User findUserOrThrow(String userId) {
        return userStore.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void ensureAdmin(AuthUser authUser) {
        if (authUser.role() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    private List<MonthBucket> buildMonthRange(int months) {
        List<MonthBucket> data = new ArrayList<>();
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        for (int index = months - 1; index >= 0; index -= 1) {
            ZonedDateTime current = now.minusMonths(index);
            data.add(new MonthBucket(
                String.format(Locale.ROOT, "%d-%02d", current.getYear(), current.getMonthValue()),
                current.getMonth().name().substring(0, 1) + current.getMonth().name().substring(1, 3).toLowerCase(Locale.ROOT) + " " + current.getYear(),
                current.toInstant()
            ));
        }
        return data;
    }

    private String monthKey(Instant instant) {
        ZonedDateTime current = instant.atZone(ZoneOffset.UTC);
        return String.format(Locale.ROOT, "%d-%02d", current.getYear(), current.getMonthValue());
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record MonthBucket(String key, String label, Instant date) {}

    private static final class RevenueBucket {
        private final String month;
        private long revenue;
        private int orders;

        private RevenueBucket(String month, long revenue, int orders) {
            this.month = month;
            this.revenue = revenue;
            this.orders = orders;
        }

        private Map<String, Object> toMap() {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("month", month);
            data.put("revenue", revenue);
            data.put("orders", orders);
            return data;
        }
    }

    private static final class EnrollmentBucket {
        private final String month;
        private int enrollments;
        private int completed;

        private EnrollmentBucket(String month, int enrollments, int completed) {
            this.month = month;
            this.enrollments = enrollments;
            this.completed = completed;
        }

        private Map<String, Object> toMap() {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("month", month);
            data.put("enrollments", enrollments);
            data.put("completed", completed);
            return data;
        }
    }
}
