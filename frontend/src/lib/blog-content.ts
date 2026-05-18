export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readMinutes: number;
  publishedAt: string;
  coverImage: string;
  content: string[];
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'toeic-roadmap-650',
    title: 'Lo trinh TOEIC 650+ cho nguoi can tang diem co he thong',
    excerpt:
      'Khung hoc theo tuan de giu nhip Listening, Reading, tu vung va mock test ma khong bi vo ke hoach.',
    category: 'Study Plan',
    author: 'IVYTS Editorial',
    readMinutes: 6,
    publishedAt: '2026-05-10',
    coverImage:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    content: [
      'Bat dau bang viec chia muc tieu thanh 3 lop: vocabulary foundation, question handling speed va ky luat lam de deu. Nguoi hoc thuong that bai khong vi thieu tai lieu, ma vi thieu chu ky hoc lap lai va do luong.',
      'Trong 4 tuan dau, uu tien tu vung co tan suat cao, nghe cau ngan va bai doc don. Sau do moi tang len bo de co thoi gian va phan reading passage.',
      'Moi tuan nen co it nhat 1 lan lam mini test, 1 lan sua loi ky, va 1 buoi tong hop loi lap lai. Day la cach nhanh nhat de score di len on dinh.',
    ],
  },
  {
    slug: 'listening-mistakes-you-repeat',
    title: '5 loi listening ma hoc vien TOEIC lap lai nhieu nhat',
    excerpt:
      'Khong phai hoc vien nghe kem, ma thuong la dang nghe sai cach: nghe qua nhieu, sua qua it, va bo qua distractor.',
    category: 'Listening',
    author: 'IVYTS Coaching Team',
    readMinutes: 5,
    publishedAt: '2026-05-08',
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    content: [
      'Loi dau tien la nghe lien tuc ma khong danh dau thoi diem mat track. Neu khong biet minh mat tu dau, ban se khong sua duoc.',
      'Loi thu hai la hoc vien chi nghe dap an dung, bo qua nhung distractor da danh lua minh. TOEIC listening thuong danh vao phan tu khoa gan am hoac thong tin xuat hien som hon dap an that.',
      'Loi cuoi cung la khong luu lai bo loi sai. Mot so cau sai lap lai theo mau, va neu khong gom lai theo nhom, ban se tiep tuc gap lai dung loi cu.',
    ],
  },
  {
    slug: 'reading-speed-framework',
    title: 'Framework doc nhanh ma van giu duoc do chinh xac trong TOEIC Reading',
    excerpt:
      'Khong can doc het moi dong. Can mot he thong scan thong tin va loai tru dap an co ky luat.',
    category: 'Reading',
    author: 'IVYTS Academic Lab',
    readMinutes: 7,
    publishedAt: '2026-05-05',
    coverImage:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    content: [
      'Buoc 1 la doc cau hoi truoc de xac dinh dang thong tin can tim: thoi gian, dia diem, ly do, nguoi lien quan, hay paraphrase.',
      'Buoc 2 la scan van ban theo cum thong tin, khong doc tu dau den cuoi nhu mot bai van thong thuong. Ban dang tim du lieu de ra quyet dinh, khong phai doc de thuong thuc.',
      'Buoc 3 la loai tru dap an dua tren bang chung trong van ban, khong dua tren cam giac. Neu bo dap an ma khong co ly do ro, kha nang sai van con rat cao.',
    ],
  },
];
