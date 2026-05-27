package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.course.CourseRepository;
import com.ivyts.backend.domain.enrollment.EnrollmentRepository;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.mocktest.MockTestRepository;
import com.ivyts.backend.domain.mocktest.MockTestStatus;
import com.ivyts.backend.domain.order.Order;
import com.ivyts.backend.domain.order.OrderRepository;
import com.ivyts.backend.domain.order.OrderStatus;
import com.ivyts.backend.domain.post.BlogPostRepository;
import com.ivyts.backend.domain.post.BlogPostStatus;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRepository;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
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

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MockTestRepository mockTestRepository;
    private final BlogPostRepository blogPostRepository;
    private final OrderRepository orderRepository;
    private final AdminMapper adminMapper;

    public AdminService(
        UserRepository userRepository,
        CourseRepository courseRepository,
        EnrollmentRepository enrollmentRepository,
        MockTestRepository mockTestRepository,
        BlogPostRepository blogPostRepository,
        OrderRepository orderRepository,
        AdminMapper adminMapper
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.mockTestRepository = mockTestRepository;
        this.blogPostRepository = blogPostRepository;
        this.orderRepository = orderRepository;
        this.adminMapper = adminMapper;
    }

    public Map<String, Object> getStats(AuthUser authUser) {
        ensureAdmin(authUser);
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.findAll().stream().filter(user -> user.getRole() == UserRole.STUDENT).count();
        long totalTeachers = userRepository.findAll().stream().filter(user -> user.getRole() == UserRole.TEACHER).count();
        long totalAdmins = userRepository.findAll().stream().filter(user -> user.getRole() == UserRole.ADMIN).count();
        long publishedCourses = courseRepository.findAll().stream().filter(Course::isPublished).count();
        long publishedMockTests = mockTestRepository.findByStatus(MockTestStatus.PUBLISHED).size();
        long publishedPosts = blogPostRepository.countByStatus(BlogPostStatus.PUBLISHED);
        long totalEnrollments = enrollmentRepository.count();
        long completedEnrollments = enrollmentRepository.findAll().stream().filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.COMPLETED).count();
        List<Order> paidOrders = orderRepository.findByStatus(OrderStatus.PAID);
        double totalRevenue = paidOrders.stream().mapToDouble(Order::getAmount).sum();
        long completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments * 100.0) / totalEnrollments) : 0;

        Map<String, Object> users = new LinkedHashMap<>();
        users.put("total", totalUsers);
        users.put("students", totalStudents);
        users.put("teachers", totalTeachers);
        users.put("admins", totalAdmins);

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
        data.put("users", users);
        data.put("content", content);
        data.put("enrollments", enrollments);
        data.put("revenue", revenue);
        return data;
    }

    public List<Map<String, Object>> getRevenueChart(AuthUser authUser) {
        ensureAdmin(authUser);
        List<MonthBucket> months = buildMonthRange(6);
        Instant fromDate = months.getFirst().date();
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();
        months.forEach(month -> buckets.put(month.key(), new RevenueBucket(month.label(), 0, 0)));

        for (Order order : orderRepository.findByStatus(OrderStatus.PAID)) {
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
        Instant fromDate = months.getFirst().date();
        Map<String, EnrollmentBucket> buckets = new LinkedHashMap<>();
        months.forEach(month -> buckets.put(month.key(), new EnrollmentBucket(month.label(), 0, 0)));

        enrollmentRepository.findAll().forEach(enrollment -> {
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
        return userRepository.findAll().stream()
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
            userRepository.findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
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

        userRepository.save(user);
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
        userRepository.save(user);
        return adminMapper.toAdminUserView(user, getOwnedCourseCountForUser(user));
    }

    private long getOwnedCourseCountForUser(User user) {
        if (user.getRole() == UserRole.STUDENT) {
            return enrollmentRepository.findByStudentAndStatusInOrderByCreatedAtDesc(
                user.getId(),
                List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
            ).size();
        }
        return courseRepository.findByOwner(user.getId()).size();
    }

    private User findUserOrThrow(String userId) {
        return userRepository.findById(userId)
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
