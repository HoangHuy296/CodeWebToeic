import bcrypt from 'bcrypt';
import mongoose, { type Types } from 'mongoose';
import { connectDatabase } from '../config/database.js';
import {
  BlogPost,
  Course,
  Enrollment,
  Lesson,
  Message,
  MockTest,
  Order,
  Question,
  TestSubmission,
  User,
} from '../models/index.js';

const PASSWORD = 'Password@123';
const SALT_ROUNDS = 10;

function monthOffset(months: number, day = 5): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, day, 9, 0, 0));
}

function createAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

function createYoutubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function createYoutubeVideo(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function createToeicQuestion(
  mockTestId: Types.ObjectId,
  order: number,
  prompt: string,
  correctAnswer: 'A' | 'B' | 'C' | 'D',
  options: [string, string, string, string],
  explanation: string,
  section: 'listening' | 'reading',
  level: 'easy' | 'medium' | 'hard',
  points = 1,
) {
  return {
    mockTest: mockTestId,
    section,
    prompt,
    explanation,
    options: [
      { key: 'A', text: options[0], isCorrect: correctAnswer === 'A' },
      { key: 'B', text: options[1], isCorrect: correctAnswer === 'B' },
      { key: 'C', text: options[2], isCorrect: correctAnswer === 'C' },
      { key: 'D', text: options[3], isCorrect: correctAnswer === 'D' },
    ],
    correctAnswer,
    points,
    order,
    level,
  };
}

async function clearDatabase() {
  await Promise.all([
    TestSubmission.deleteMany({}),
    Question.deleteMany({}),
    MockTest.deleteMany({}),
    Enrollment.deleteMany({}),
    Order.deleteMany({}),
    Lesson.deleteMany({}),
    Course.deleteMany({}),
    BlogPost.deleteMany({}),
    Message.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function runSeed() {
  await connectDatabase();
  await clearDatabase();

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  const [admin, teacherOne, teacherTwo, studentOne, studentTwo, studentThree] = await User.create([
    {
      fullName: 'IVYTS Admin',
      email: 'admin@ivyts.dev',
      passwordHash,
      role: 'admin',
      phone: '0901000001',
      avatarUrl: createAvatar('ivyts-admin'),
      bio: 'Quan tri van hanh nen tang IVYTS 1997, phu trach dashboard, duyet khoa hoc va chat luong noi dung.',
      isActive: true,
      ownedCourseIds: [],
    },
    {
      fullName: 'Tran Minh Quan',
      email: 'teacher@ivyts.dev',
      passwordHash,
      role: 'teacher',
      phone: '0901000002',
      avatarUrl: createAvatar('tran-minh-quan-toeic'),
      bio: 'TOEIC coach 8+ nam kinh nghiem, chuyen lo trinh 450-750+, phan tich loi sai va tang toc Reading.',
      isActive: true,
      ownedCourseIds: [],
    },
    {
      fullName: 'Le Ha My',
      email: 'teacher2@ivyts.dev',
      passwordHash,
      role: 'teacher',
      phone: '0901000005',
      avatarUrl: createAvatar('le-ha-my-ielts'),
      bio: 'IELTS instructor chuyen Speaking va Writing, thiet ke lop hoc theo phong cach coaching 1-1 va task-based learning.',
      isActive: true,
      ownedCourseIds: [],
    },
    {
      fullName: 'Nguyen Lan Anh',
      email: 'student1@ivyts.dev',
      passwordHash,
      role: 'student',
      phone: '0901000003',
      avatarUrl: createAvatar('nguyen-lan-anh'),
      bio: 'Sinh vien nam 3 can dat TOEIC 650 de xet tot nghiep.',
      isActive: true,
      ownedCourseIds: [],
    },
    {
      fullName: 'Pham Khoa Nguyen',
      email: 'student2@ivyts.dev',
      passwordHash,
      role: 'student',
      phone: '0901000004',
      avatarUrl: createAvatar('pham-khoa-nguyen'),
      bio: 'Nhan su van phong dang luyen IELTS de chuan bi ho so du hoc.',
      isActive: true,
      ownedCourseIds: [],
    },
    {
      fullName: 'Do Bao Chau',
      email: 'student3@ivyts.dev',
      passwordHash,
      role: 'student',
      phone: '0901000006',
      avatarUrl: createAvatar('do-bao-chau'),
      bio: 'Hoc sinh cap 3 can mot lo trinh co ky luat de tang tu vung va speaking confidence.',
      isActive: true,
      ownedCourseIds: [],
    },
  ]);

  const courses = await Course.create([
    {
      title: 'TOEIC Foundation 450+',
      slug: 'toeic-foundation-450-plus',
      shortDescription: 'Lo trinh nen tang cho nguoi moi bat dau, giai quyet grammar core, vocabulary va nghe doc can ban.',
      description:
        'Khoa hoc tap trung xay lai tu duy hoc TOEIC dung cach trong 8 tuan: grammar backbone, daily listening habit, scanning reading va quy trinh review loi sai.',
      category: 'TOEIC',
      level: 'beginner',
      price: 2490000,
      salePrice: 1790000,
      thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      introVideo: {
        videoUrl: createYoutubeVideo('ysz5S6PUM-U'),
        videoProvider: 'youtube',
        duration: 210,
        thumbnail: createYoutubeThumbnail('ysz5S6PUM-U'),
      },
      materials: [
        {
          title: 'TOEIC 8-week study planner',
          fileUrl: 'https://example.com/materials/toeic-foundation-study-planner.pdf',
          fileType: 'pdf',
        },
        {
          title: 'Vocabulary tracker template',
          fileUrl: 'https://example.com/materials/toeic-foundation-vocab-tracker.xlsx',
          fileType: 'xlsx',
        },
      ],
      owner: teacherOne._id,
      lessonCount: 4,
      totalDuration: 2640,
      tags: ['toeic', 'foundation', '450+', 'grammar', 'listening'],
      benefits: ['Xay lai nen tang tu vung va ngu phap', 'Biet cach review sau moi buoi hoc', 'Co lesson preview va template theo doi tien do'],
      isPublished: true,
      reviewStatus: 'approved',
      publishedAt: monthOffset(3, 8),
    },
    {
      title: 'TOEIC Sprint 650+',
      slug: 'toeic-sprint-650-plus',
      shortDescription: 'Lo trinh tang toc 8 tuan cho hoc vien da co nen tang va can but pha len moc 650+.',
      description:
        'Khoa hoc day practice theo block, review theo loai loi va chien luoc time-boxing giup hoc vien tăng toc Reading, giam bay distractor Listening.',
      category: 'TOEIC',
      level: 'intermediate',
      price: 3290000,
      salePrice: 2490000,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      introVideo: {
        videoUrl: createYoutubeVideo('jNQXAC9IVRw'),
        videoProvider: 'youtube',
        duration: 240,
        thumbnail: createYoutubeThumbnail('jNQXAC9IVRw'),
      },
      materials: [
        {
          title: 'Sprint score tracker',
          fileUrl: 'https://example.com/materials/toeic-sprint-score-tracker.xlsx',
          fileType: 'xlsx',
        },
      ],
      owner: teacherOne._id,
      lessonCount: 4,
      totalDuration: 3120,
      tags: ['toeic', '650+', 'practice', 'full test'],
      benefits: ['Chien luoc giai de 2 gio', 'Framework phan tich loi sai', 'Luyen bo de theo level'],
      isPublished: true,
      reviewStatus: 'approved',
      publishedAt: monthOffset(1, 12),
    },
    {
      title: 'IELTS Launchpad 5.5+',
      slug: 'ielts-launchpad-5-5-plus',
      shortDescription: 'Khoa hoc IELTS tong quan cho nguoi can xay lai 4 ky nang va dat band 5.5+. ',
      description:
        'Launchpad la lo trinh co cau truc cho hoc vien can can bang 4 ky nang, tap trung vao vocabulary theo topic, speaking confidence va writing task response.',
      category: 'IELTS',
      level: 'beginner',
      price: 3890000,
      salePrice: 2990000,
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      introVideo: {
        videoUrl: createYoutubeVideo('aqz-KE-bpKQ'),
        videoProvider: 'youtube',
        duration: 260,
        thumbnail: createYoutubeThumbnail('aqz-KE-bpKQ'),
      },
      materials: [
        {
          title: 'IELTS weekly roadmap',
          fileUrl: 'https://example.com/materials/ielts-launchpad-roadmap.pdf',
          fileType: 'pdf',
        },
      ],
      owner: teacherTwo._id,
      lessonCount: 4,
      totalDuration: 3180,
      tags: ['ielts', '5.5+', 'speaking', 'writing'],
      benefits: ['Lich hoc 12 tuan ro rang', 'Task-based speaking drills', 'Co checklist tu hoc hang ngay'],
      isPublished: true,
      reviewStatus: 'approved',
      publishedAt: monthOffset(2, 15),
    },
    {
      title: 'IELTS Writing Intensive 6.5+',
      slug: 'ielts-writing-intensive-6-5-plus',
      shortDescription: 'Draft khoa hoc Writing chuyen sau, dang cho admin review truoc khi publish.',
      description:
        'Khoa hoc giup hoc vien nang Task 1 va Task 2 theo template linh hoat, phan tich coherence, lexical resource va essay planning.',
      category: 'IELTS',
      level: 'advanced',
      price: 4590000,
      thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80',
      introVideo: {
        videoUrl: createYoutubeVideo('M7lc1UVf-VE'),
        videoProvider: 'youtube',
        duration: 300,
        thumbnail: createYoutubeThumbnail('M7lc1UVf-VE'),
      },
      materials: [
        {
          title: 'Essay idea bank',
          fileUrl: 'https://example.com/materials/ielts-writing-idea-bank.pdf',
          fileType: 'pdf',
        },
      ],
      owner: teacherTwo._id,
      lessonCount: 2,
      totalDuration: 1560,
      tags: ['ielts', 'writing', 'draft'],
      benefits: ['Dung de test teacher review flow'],
      isPublished: false,
      reviewStatus: 'changes_requested',
      reviewNote: 'Can bo sung sample essay va rubric ro hon cho Task 2.',
    },
    {
      title: 'TOEIC Elite Packaging Draft',
      slug: 'toeic-elite-packaging-draft',
      shortDescription: 'Ban draft nang cao de test workflow teacher CRUD, admin reject va publish.',
      description:
        'Noi dung duoc giu o trang thai draft de kiem tra day du workflow phan quyen, review note, notification-bell va course packaging UI.',
      category: 'TOEIC',
      level: 'advanced',
      price: 4690000,
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      introVideo: {
        videoUrl: createYoutubeVideo('ScMzIvxBSi4'),
        videoProvider: 'youtube',
        duration: 320,
        thumbnail: createYoutubeThumbnail('ScMzIvxBSi4'),
      },
      materials: [],
      owner: teacherOne._id,
      lessonCount: 2,
      totalDuration: 1440,
      tags: ['toeic', 'advanced', 'draft'],
      benefits: ['Dung de test publish flow', 'Phu hop de demo notification review'],
      isPublished: false,
      reviewStatus: 'pending_review',
    },
  ]);

  const teacherOneCourses = courses.filter((course) => course.owner.toString() === teacherOne._id.toString());
  const teacherTwoCourses = courses.filter((course) => course.owner.toString() === teacherTwo._id.toString());

  await Promise.all([
    User.findByIdAndUpdate(teacherOne._id, {
      $set: {
        ownedCourseIds: teacherOneCourses.map((course) => course._id),
      },
    }),
    User.findByIdAndUpdate(teacherTwo._id, {
      $set: {
        ownedCourseIds: teacherTwoCourses.map((course) => course._id),
      },
    }),
  ]);

  const [foundationCourse, sprintCourse, ieltsCourse, writingDraftCourse, eliteDraftCourse] = courses;

  const lessons = await Lesson.create([
    {
      course: foundationCourse._id,
      title: 'Lesson 1 - TOEIC map va score scale',
      slug: 'toeic-foundation-map-score-scale',
      description: 'Tong quan format bai thi, score scale va thoi gian hoc 8 tuan.',
      content: 'Hoc vien lam quen cau truc de thi va xay target score thuc te theo dau vao.',
      video: {
        videoUrl: createYoutubeVideo('ysz5S6PUM-U'),
        videoProvider: 'youtube',
        duration: 540,
        thumbnail: createYoutubeThumbnail('ysz5S6PUM-U'),
      },
      order: 1,
      isPreview: true,
      materials: [
        {
          title: 'Target score worksheet',
          fileUrl: 'https://example.com/materials/toeic-foundation-target-score.pdf',
          fileType: 'pdf',
        },
      ],
    },
    {
      course: foundationCourse._id,
      title: 'Lesson 2 - Grammar backbone cho Part 5',
      slug: 'toeic-foundation-grammar-backbone',
      description: 'He thong thi, tu loai, menh de quan he va cac dang bai de mat diem.',
      content: 'Phan tach grammar thanh cac bucket de hoc nhanh va nho lau.',
      video: {
        videoUrl: createYoutubeVideo('jNQXAC9IVRw'),
        videoProvider: 'youtube',
        duration: 630,
        thumbnail: createYoutubeThumbnail('jNQXAC9IVRw'),
      },
      order: 2,
      isPreview: false,
      materials: [],
    },
    {
      course: foundationCourse._id,
      title: 'Lesson 3 - Listening habit va keyword detection',
      slug: 'toeic-foundation-listening-habit',
      description: 'Xay thoi quen nghe ngan hang ngay va nhan dien tu khoa.',
      content: 'Tap trung vao Part 1, Part 2, shadowing nhe va checklist review.',
      video: {
        videoUrl: createYoutubeVideo('aqz-KE-bpKQ'),
        videoProvider: 'youtube',
        duration: 720,
        thumbnail: createYoutubeThumbnail('aqz-KE-bpKQ'),
      },
      order: 3,
      isPreview: false,
      materials: [],
    },
    {
      course: foundationCourse._id,
      title: 'Lesson 4 - Reading setup cho nguoi moi',
      slug: 'toeic-foundation-reading-setup',
      description: 'Scanning, timeline va quy trinh lam bai khong bi rot thoi gian.',
      content: 'Cach doc nhanh va nhan dien thong tin de tra loi dung trong Part 6 va Part 7.',
      video: {
        videoUrl: createYoutubeVideo('M7lc1UVf-VE'),
        videoProvider: 'youtube',
        duration: 750,
        thumbnail: createYoutubeThumbnail('M7lc1UVf-VE'),
      },
      order: 4,
      isPreview: false,
      materials: [],
    },
    {
      course: sprintCourse._id,
      title: 'Lesson 1 - Time boxing Reading 650+',
      slug: 'toeic-sprint-time-boxing-reading',
      description: 'Rut ngan thoi gian cho Part 7 va tranh sup do cuoi gio.',
      content: 'Ap dung time boxing theo passage type va muc tieu so cau.',
      video: {
        videoUrl: createYoutubeVideo('ScMzIvxBSi4'),
        videoProvider: 'youtube',
        duration: 780,
        thumbnail: createYoutubeThumbnail('ScMzIvxBSi4'),
      },
      order: 1,
      isPreview: false,
      materials: [],
    },
    {
      course: sprintCourse._id,
      title: 'Lesson 2 - Listening trap va paraphrase bank',
      slug: 'toeic-sprint-listening-trap',
      description: 'Nhan dien bay distractor, paraphrase va biet luc nao can bo qua.',
      content: 'Luyen theo bo de va tach theo tung loai loi nghe pho bien.',
      video: {
        videoUrl: createYoutubeVideo('ysz5S6PUM-U'),
        videoProvider: 'youtube',
        duration: 780,
        thumbnail: createYoutubeThumbnail('ysz5S6PUM-U'),
      },
      order: 2,
      isPreview: false,
      materials: [],
    },
    {
      course: sprintCourse._id,
      title: 'Lesson 3 - Error log va review de',
      slug: 'toeic-sprint-error-log-review',
      description: 'Xay error log theo cau sai, nguyen nhan sai va hanh dong sua.',
      content: 'Day la bai quan trong de hoc vien khong lap lai cung mot loi.',
      video: {
        videoUrl: createYoutubeVideo('jNQXAC9IVRw'),
        videoProvider: 'youtube',
        duration: 780,
        thumbnail: createYoutubeThumbnail('jNQXAC9IVRw'),
      },
      order: 3,
      isPreview: false,
      materials: [],
    },
    {
      course: sprintCourse._id,
      title: 'Lesson 4 - Full test execution day',
      slug: 'toeic-sprint-full-test-execution',
      description: 'Mo phong ngay thi va quy trinh tam ly truoc, trong va sau full test.',
      content: 'Hoc vien hoc cach giu nhịp, dieu tiet nang luong va review dung sau de.',
      video: {
        videoUrl: createYoutubeVideo('aqz-KE-bpKQ'),
        videoProvider: 'youtube',
        duration: 780,
        thumbnail: createYoutubeThumbnail('aqz-KE-bpKQ'),
      },
      order: 4,
      isPreview: false,
      materials: [],
    },
    {
      course: ieltsCourse._id,
      title: 'Lesson 1 - IELTS map va target band',
      slug: 'ielts-launchpad-map-target-band',
      description: 'Tong quan 4 ky nang va cach dat target band phu hop.',
      content: 'Hoc vien duoc chia muc tieu 12 tuan va ky luat tu hoc hang ngay.',
      video: {
        videoUrl: createYoutubeVideo('M7lc1UVf-VE'),
        videoProvider: 'youtube',
        duration: 720,
        thumbnail: createYoutubeThumbnail('M7lc1UVf-VE'),
      },
      order: 1,
      isPreview: true,
      materials: [],
    },
    {
      course: ieltsCourse._id,
      title: 'Lesson 2 - Speaking confidence routines',
      slug: 'ielts-launchpad-speaking-confidence',
      description: 'Routine 15 phut moi ngay de nói tron cau, ro logic va it ngap ngung.',
      content: 'Thuc hanh topic cards, paraphrase va discourse markers.',
      video: {
        videoUrl: createYoutubeVideo('ScMzIvxBSi4'),
        videoProvider: 'youtube',
        duration: 810,
        thumbnail: createYoutubeThumbnail('ScMzIvxBSi4'),
      },
      order: 2,
      isPreview: false,
      materials: [],
    },
    {
      course: ieltsCourse._id,
      title: 'Lesson 3 - Writing Task 1 structure',
      slug: 'ielts-launchpad-writing-task-1-structure',
      description: 'Nho nhanh mo bai, overview va body cho chart co ban.',
      content: 'Hoc vien luyen nhan dien xu huong va mo ta du lieu ngan gon.',
      video: {
        videoUrl: createYoutubeVideo('ysz5S6PUM-U'),
        videoProvider: 'youtube',
        duration: 810,
        thumbnail: createYoutubeThumbnail('ysz5S6PUM-U'),
      },
      order: 3,
      isPreview: false,
      materials: [],
    },
    {
      course: ieltsCourse._id,
      title: 'Lesson 4 - Topic vocabulary system',
      slug: 'ielts-launchpad-topic-vocabulary-system',
      description: 'Cach gom tu vung theo topic va giai quyet lexical resource.',
      content: 'Xay phrase bank de dung duoc ca Speaking va Writing.',
      video: {
        videoUrl: createYoutubeVideo('jNQXAC9IVRw'),
        videoProvider: 'youtube',
        duration: 840,
        thumbnail: createYoutubeThumbnail('jNQXAC9IVRw'),
      },
      order: 4,
      isPreview: false,
      materials: [],
    },
    {
      course: writingDraftCourse._id,
      title: 'Lesson 1 - Task 2 idea generation',
      slug: 'ielts-writing-intensive-task-2-idea-generation',
      description: 'Draft lesson cho workflow review.',
      content: 'Idea bank va outline 10 phut.',
      video: {
        videoUrl: createYoutubeVideo('aqz-KE-bpKQ'),
        videoProvider: 'youtube',
        duration: 780,
        thumbnail: createYoutubeThumbnail('aqz-KE-bpKQ'),
      },
      order: 1,
      isPreview: false,
      materials: [],
    },
    {
      course: writingDraftCourse._id,
      title: 'Lesson 2 - Coherence va paragraph control',
      slug: 'ielts-writing-intensive-coherence-control',
      description: 'Draft lesson chua bo sung sample essay day du.',
      content: 'Phan tich linkers, topic sentence va support details.',
      video: {
        videoUrl: createYoutubeVideo('M7lc1UVf-VE'),
        videoProvider: 'youtube',
        duration: 780,
        thumbnail: createYoutubeThumbnail('M7lc1UVf-VE'),
      },
      order: 2,
      isPreview: false,
      materials: [],
    },
    {
      course: eliteDraftCourse._id,
      title: 'Lesson 1 - Elite roadmap',
      slug: 'toeic-elite-roadmap',
      description: 'Lesson draft de admin test packaging va review notes.',
      content: 'Draft content cho khoa hoc TOEIC nang cao.',
      video: {
        videoUrl: createYoutubeVideo('ysz5S6PUM-U'),
        videoProvider: 'youtube',
        duration: 720,
        thumbnail: createYoutubeThumbnail('ysz5S6PUM-U'),
      },
      order: 1,
      isPreview: false,
      materials: [],
    },
    {
      course: eliteDraftCourse._id,
      title: 'Lesson 2 - Advanced review lab',
      slug: 'toeic-elite-advanced-review-lab',
      description: 'Lesson draft cho workflow teacher CRUD.',
      content: 'Draft content level advanced.',
      video: {
        videoUrl: createYoutubeVideo('jNQXAC9IVRw'),
        videoProvider: 'youtube',
        duration: 720,
        thumbnail: createYoutubeThumbnail('jNQXAC9IVRw'),
      },
      order: 2,
      isPreview: false,
      materials: [],
    },
  ]);

  const foundationLessons = lessons.filter((lesson) => lesson.course.toString() === foundationCourse._id.toString());
  const sprintLessons = lessons.filter((lesson) => lesson.course.toString() === sprintCourse._id.toString());
  const ieltsLessons = lessons.filter((lesson) => lesson.course.toString() === ieltsCourse._id.toString());

  await Enrollment.create([
    {
      student: studentOne._id,
      course: foundationCourse._id,
      status: 'active',
      progressPercent: 75,
      completedLessonIds: [foundationLessons[0]!._id, foundationLessons[1]!._id, foundationLessons[2]!._id],
      lessonProgress: [
        {
          lesson: foundationLessons[0]!._id,
          watchedSeconds: 540,
          isCompleted: true,
          completedAt: monthOffset(2, 10),
          lastAccessedAt: monthOffset(2, 10),
        },
        {
          lesson: foundationLessons[1]!._id,
          watchedSeconds: 630,
          isCompleted: true,
          completedAt: monthOffset(1, 7),
          lastAccessedAt: monthOffset(1, 7),
        },
        {
          lesson: foundationLessons[2]!._id,
          watchedSeconds: 720,
          isCompleted: true,
          completedAt: monthOffset(0, 14),
          lastAccessedAt: monthOffset(0, 14),
        },
        {
          lesson: foundationLessons[3]!._id,
          watchedSeconds: 350,
          isCompleted: false,
          lastAccessedAt: monthOffset(0, 18),
        },
      ],
      lastLessonId: foundationLessons[3]!._id,
      enrolledAt: monthOffset(3, 12),
      startedAt: monthOffset(3, 13),
    },
    {
      student: studentTwo._id,
      course: ieltsCourse._id,
      status: 'active',
      progressPercent: 50,
      completedLessonIds: [ieltsLessons[0]!._id, ieltsLessons[1]!._id],
      lessonProgress: [
        {
          lesson: ieltsLessons[0]!._id,
          watchedSeconds: 720,
          isCompleted: true,
          completedAt: monthOffset(1, 9),
          lastAccessedAt: monthOffset(1, 9),
        },
        {
          lesson: ieltsLessons[1]!._id,
          watchedSeconds: 810,
          isCompleted: true,
          completedAt: monthOffset(0, 6),
          lastAccessedAt: monthOffset(0, 6),
        },
        {
          lesson: ieltsLessons[2]!._id,
          watchedSeconds: 220,
          isCompleted: false,
          lastAccessedAt: monthOffset(0, 13),
        },
        {
          lesson: ieltsLessons[3]!._id,
          watchedSeconds: 0,
          isCompleted: false,
        },
      ],
      lastLessonId: ieltsLessons[2]!._id,
      enrolledAt: monthOffset(2, 18),
      startedAt: monthOffset(2, 19),
    },
    {
      student: studentThree._id,
      course: sprintCourse._id,
      status: 'completed',
      progressPercent: 100,
      completedLessonIds: sprintLessons.map((lesson) => lesson._id),
      lessonProgress: sprintLessons.map((lesson, index) => ({
        lesson: lesson._id,
        watchedSeconds: lesson.video.duration ?? 0,
        isCompleted: true,
        completedAt: monthOffset(0, 2 + index),
        lastAccessedAt: monthOffset(0, 2 + index),
      })),
      lastLessonId: sprintLessons[3]!._id,
      enrolledAt: monthOffset(1, 5),
      startedAt: monthOffset(1, 6),
      completedAt: monthOffset(0, 8),
    },
  ]);

  await Order.create([
    {
      student: studentOne._id,
      course: foundationCourse._id,
      amount: 1790000,
      currency: 'VND',
      status: 'paid',
      paymentMethod: 'momo',
      paymentProvider: 'MoMo',
      transactionId: 'TXN-IVYTS-001',
      paidAt: monthOffset(3, 12),
    },
    {
      student: studentTwo._id,
      course: ieltsCourse._id,
      amount: 2990000,
      currency: 'VND',
      status: 'paid',
      paymentMethod: 'card',
      paymentProvider: 'Stripe',
      transactionId: 'TXN-IVYTS-002',
      paidAt: monthOffset(2, 18),
    },
    {
      student: studentThree._id,
      course: sprintCourse._id,
      amount: 2490000,
      currency: 'VND',
      status: 'paid',
      paymentMethod: 'bank-transfer',
      paymentProvider: 'VCB',
      transactionId: 'TXN-IVYTS-003',
      paidAt: monthOffset(1, 5),
    },
    {
      student: studentOne._id,
      course: sprintCourse._id,
      amount: 2490000,
      currency: 'VND',
      status: 'pending',
      paymentMethod: 'bank-transfer',
      transactionId: 'TXN-IVYTS-004',
    },
  ]);

  const mockTests = await MockTest.create([
    {
      title: 'TOEIC Mini Mock 01 - Listening & Reading',
      description: 'Bo de 10 cau mo phong nhanh cho hoc vien dang hoc TOEIC 450-650, gom Listening va Reading co giai thich.',
      type: 'mini-test',
      level: 'intermediate',
      durationMinutes: 25,
      questionCount: 10,
      status: 'published',
      instructions: ['Hoan thanh trong 25 phut', 'Khong su dung tu dien', 'Review giai thich sau khi nop bai'],
      createdBy: admin._id,
      isFeatured: true,
    },
    {
      title: 'IELTS Practice Set 01 - Vocabulary & Grammar',
      description: 'Bo practice 10 cau theo phong cach IELTS foundation, tap trung paraphrase, collocation va grammar accuracy.',
      type: 'practice-set',
      level: 'beginner',
      durationMinutes: 20,
      questionCount: 10,
      status: 'published',
      instructions: ['Chon dap an dung nhat', 'Tu canh chinh thoi gian 20 phut', 'Dung bo nay de warm-up truoc khi hoc Writing va Reading'],
      createdBy: admin._id,
      isFeatured: true,
    },
  ]);

  const [toeicMockTest, ieltsMockTest] = mockTests;

  const questions = await Question.create([
    createToeicQuestion(
      toeicMockTest._id,
      1,
      'Where should the visitors wait before the presentation begins?',
      'B',
      ['In the parking lot', 'In the lobby', 'At the cafeteria', 'At the front gate'],
      'The speaker clearly says visitors should remain in the lobby until the presentation begins.',
      'listening',
      'easy',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      2,
      'What does the woman imply about the shipment?',
      'D',
      ['It was canceled', 'It arrived too early', 'It needs a new driver', 'It has not arrived yet'],
      'She mentions they are still waiting for the shipment, so it has not arrived yet.',
      'listening',
      'medium',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      3,
      'What time will the meeting most likely end?',
      'A',
      ['At 11:30', 'At 12:00', 'At 12:30', 'At 1:00'],
      'The conversation mentions a two-hour meeting starting at 9:30, so it ends at 11:30.',
      'listening',
      'medium',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      4,
      'Choose the best word: The new policy will take ____ next Monday.',
      'C',
      ['place', 'part', 'effect', 'control'],
      'The collocation is “take effect.”',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      5,
      'Choose the best word: All applicants must submit the form ____ the deadline.',
      'B',
      ['during', 'before', 'across', 'below'],
      '“Before the deadline” is the only grammatically and logically correct phrase.',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      6,
      'Choose the best word: Ms. Hanh is responsible for ____ the weekly sales report.',
      'A',
      ['preparing', 'prepare', 'prepared', 'preparation'],
      'After “for,” the gerund form “preparing” is required.',
      'reading',
      'medium',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      7,
      'According to the notice, what should employees do if they lose an ID card?',
      'D',
      ['Contact the security team by noon', 'Buy a temporary badge', 'Call the HR hotline', 'Report it to the front desk immediately'],
      'The notice instructs employees to report lost ID cards to the front desk immediately.',
      'reading',
      'medium',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      8,
      'Why was the client meeting rescheduled?',
      'C',
      ['The office was closed', 'The manager was sick', 'The client requested more time', 'The room was unavailable'],
      'The email says the client requested additional time to review the proposal.',
      'reading',
      'hard',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      9,
      'Choose the best word: Please keep this receipt for your ____.',
      'A',
      ['records', 'recorded', 'recording', 'record'],
      'The natural business phrase is “for your records.”',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      toeicMockTest._id,
      10,
      'What is suggested about the software update?',
      'B',
      ['It is optional for all users', 'It should be installed after work hours', 'It will reduce storage space', 'It requires a new password'],
      'The memo suggests installing the update after work hours to avoid interruptions.',
      'reading',
      'hard',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      1,
      'Choose the best paraphrase of "important": The role of sleep is ____ for memory.',
      'C',
      ['ordinary', 'limited', 'crucial', 'secondary'],
      '“Crucial” is the closest synonym to “important” in this context.',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      2,
      'Choose the best word: Many students feel nervous ____ they speak English in public.',
      'A',
      ['when', 'unless', 'despite', 'until'],
      '“When” correctly introduces the time clause.',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      3,
      'Choose the correct collocation: The government should ____ more attention to public transport.',
      'D',
      ['make', 'set', 'bring', 'pay'],
      'The correct collocation is “pay attention to.”',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      4,
      'Which sentence is grammatically correct?',
      'B',
      ['People is becoming more dependent on phones.', 'People are becoming more dependent on phones.', 'People becoming more dependent on phones.', 'People has become more dependent on phones.'],
      'The subject “People” takes the plural verb “are.”',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      5,
      'Choose the best linking word: Online learning is flexible; ____, it requires strong self-discipline.',
      'C',
      ['for example', 'in addition', 'however', 'therefore'],
      '“However” correctly introduces contrast.',
      'reading',
      'medium',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      6,
      'Choose the best word: Some people prefer cities because of the wider range of job ____.',
      'A',
      ['opportunities', 'occasions', 'operations', 'occupations'],
      'The natural phrase is “job opportunities.”',
      'reading',
      'medium',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      7,
      'Which sentence best supports the idea that exercise improves concentration?',
      'D',
      ['Exercise is popular among teenagers.', 'Gyms are more expensive than before.', 'Some people dislike morning workouts.', 'Regular exercise increases blood flow to the brain, helping people stay focused.'],
      'Option D directly explains why exercise improves concentration.',
      'reading',
      'medium',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      8,
      'Choose the best paraphrase of "a large number of": ____ students now study online.',
      'B',
      ['A weak number of', 'A significant number of', 'A casual number of', 'A shallow number of'],
      '“A significant number of” is the correct paraphrase.',
      'reading',
      'medium',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      9,
      'Choose the best word: Governments should invest in renewable energy to reduce air ____. ',
      'C',
      ['balance', 'climate', 'pollution', 'pattern'],
      'The phrase is “air pollution.”',
      'reading',
      'easy',
    ),
    createToeicQuestion(
      ieltsMockTest._id,
      10,
      'Which sentence is the clearest topic sentence for an essay about public transport?',
      'A',
      ['Investing in public transport can reduce traffic congestion and improve urban life.', 'Buses are painted in many colors around the world.', 'Some people buy tickets online every day.', 'Traffic lights are common in large cities.'],
      'Option A clearly states the main idea and previews supporting points.',
      'reading',
      'hard',
    ),
  ]);

  const toeicQuestions = questions.filter((question) => question.mockTest.toString() === toeicMockTest._id.toString());
  const ieltsQuestions = questions.filter((question) => question.mockTest.toString() === ieltsMockTest._id.toString());

  await TestSubmission.create([
    {
      student: studentOne._id,
      mockTest: toeicMockTest._id,
      answers: toeicQuestions.map((question, index) => ({
        question: question._id,
        selectedOption: index < 7 ? question.correctAnswer : 'A',
        isCorrect: index < 7 ? true : question.correctAnswer === 'A',
      })),
      score: 70,
      totalQuestions: 10,
      correctAnswers: 7,
      durationSeconds: 1120,
      submittedAt: monthOffset(0, 9),
    },
    {
      student: studentTwo._id,
      mockTest: ieltsMockTest._id,
      answers: ieltsQuestions.map((question, index) => ({
        question: question._id,
        selectedOption: index < 8 ? question.correctAnswer : 'B',
        isCorrect: index < 8 ? true : question.correctAnswer === 'B',
      })),
      score: 80,
      totalQuestions: 10,
      correctAnswers: 8,
      durationSeconds: 980,
      submittedAt: monthOffset(0, 11),
    },
  ]);

  await BlogPost.create([
    {
      title: '5 sai lam lam hoc TOEIC mai khong len diem',
      slug: '5-sai-lam-lam-hoc-toeic-mai-khong-len-diem',
      excerpt: 'Tong hop 5 sai lam pho bien nhat khien hoc vien hoc rat nhieu nhung score van dung yen.',
      content:
        'Bai viet chia nho tung sai lam: hoc theo cam hung, khong review error log, hoc tu vung roi rac, lam de khong canh gio va bo qua thoi quen nghe hang ngay.',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
      tags: ['toeic', 'study plan', 'mistakes'],
      author: admin._id,
      status: 'published',
      seoDescription: 'Nhung sai lam can tranh khi tu hoc TOEIC de tang diem nhanh hon.',
      publishedAt: monthOffset(1, 12),
    },
    {
      title: 'IELTS Writing Task 2: checklist 15 phut truoc khi nop bai',
      slug: 'ielts-writing-task-2-checklist-15-phut-truoc-khi-nop-bai',
      excerpt: 'Checklist ngan gon giup hoc vien soat lai coherence, grammar va lexical resource truoc khi nop bai.',
      content:
        'Noi dung huong dan hoc vien kiem tra thesis, topic sentence, linking words, article, subject-verb agreement va paragraph logic.',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      tags: ['ielts', 'writing', 'checklist'],
      author: teacherTwo._id,
      status: 'published',
      seoDescription: 'Checklist review bai IELTS Writing Task 2 nhanh va hieu qua.',
      publishedAt: monthOffset(0, 7),
    },
    {
      title: 'Checklist review sau moi full test TOEIC',
      slug: 'checklist-review-sau-moi-full-test-toeic',
      excerpt: 'Framework review ngan gon de rut kinh nghiem sau moi lan thi thu.',
      content: 'Seed content cho editorial desk va page detail.',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      tags: ['toeic', 'review', 'full test'],
      author: teacherOne._id,
      status: 'draft',
      seoDescription: 'Checklist review full test TOEIC hieu qua.',
    },
  ]);

  await Message.create([
    {
      name: 'Vo Minh Thu',
      email: 'minhthu.parent@example.com',
      phone: '0911000001',
      subject: 'Tu van lo trinh TOEIC 650+',
      content: 'Con minh dang o moc 430, can lo trinh hoc online co kiem tra tien do de thi tot nghiep trong 3 thang.',
      status: 'unread',
    },
    {
      name: 'Tran Gia Bao',
      email: 'giabao.hr@example.com',
      phone: '0911000002',
      subject: 'Hoi ve lich hoc IELTS toi',
      content: 'Cho minh hoi khoa IELTS co lich hoc sau 19h va co support cham bai Writing hang tuan khong?',
      status: 'read',
      assignedTo: admin._id,
      readAt: monthOffset(0, 11),
    },
    {
      name: 'Le Nhu Quynh',
      email: 'quynh.accounting@example.com',
      phone: '0911000003',
      subject: 'Ho tro hoa don va xac nhan thanh toan',
      content: 'Minh da thanh toan khoa hoc TOEIC va can nhan hoa don cong ty trong tuan nay.',
      status: 'replied',
      assignedTo: admin._id,
      readAt: monthOffset(0, 7),
      repliedAt: monthOffset(0, 8),
    },
    {
      name: 'Nguyen Hoang Long',
      email: 'hoanglong.student@example.com',
      phone: '0911000004',
      subject: 'Xin hoc thu IELTS Speaking',
      content: 'Minh muon dang ky hoc thu 1 buoi IELTS Speaking de xem co phu hop voi lo trinh 6.5+ khong.',
      status: 'unread',
    },
  ]);

  console.log('Seed completed successfully.');
  console.log('Admin login: admin@ivyts.dev / Password@123');
  console.log('Teacher logins: teacher@ivyts.dev / Password@123 | teacher2@ivyts.dev / Password@123');
  console.log('Student logins: student1@ivyts.dev / Password@123 | student2@ivyts.dev / Password@123 | student3@ivyts.dev / Password@123');
}

runSeed()
  .catch((error: unknown) => {
    console.error('Seed script failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
