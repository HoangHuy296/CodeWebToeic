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
  {
    slug: 'business-email-tone-checklist',
    title: 'Checklist giu tone email chuyen nghiep trong moi truong CRM',
    excerpt:
      'Mot khung nhanh de kiem tra tone, do ro y va call-to-action trong email cong viec bang tieng Anh.',
    category: 'Business English',
    author: 'IVYTS Coaching Team',
    readMinutes: 5,
    publishedAt: '2026-05-03',
    coverImage:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    content: [
      'Email cong viec tot khong can qua hoa my. Dieu quan trong la nguoi nhan hieu ban muon gi, can hanh dong gi va khi nao can phan hoi.',
      'Hay kiem tra lai subject line, opening line va cau ket. Neu ba diem nay ro rang, kha nang email bi hieu sai se giam rat nhieu.',
      'Cuoi cung, dung quen doc lai tone. Trong business English, mot cau qua truc tiep hoac qua dai dong deu lam chat luong giao tiep giam di.',
    ],
  },
  {
    slug: 'ielts-speaking-self-review',
    title: 'Cach tu review IELTS Speaking de thay ro loi lap lai',
    excerpt:
      'Khong can cho den buoi chua bai. Hoc vien van co the tu review theo 4 diem: fluency, range, grammar va pronunciation.',
    category: 'Speaking',
    author: 'IVYTS Academic Lab',
    readMinutes: 6,
    publishedAt: '2026-05-01',
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    content: [
      'Buoc dau tien la ghi am cau tra loi ngan, khong can lam qua dai. Muc tieu la de nghe lai xem minh lap tu nao, dung filler nao qua nhieu va dong y co bi dut quang hay khong.',
      'Sau do, doi chieu voi mot checklist ngan. Moi lan tu review, chi nen tap trung vao 1-2 tieu chi thay vi sua het cung luc.',
      'Neu lam deu, hoc vien se thay ro cac loi lap lai va chuan bi tot hon truoc khi vao speaking mock thật.',
    ],
  },
  {
    slug: 'grammar-revision-by-error-log',
    title: 'On ngu phap bang error log de tranh hoc lai nhieu ma van quen',
    excerpt:
      'Error log giup bien moi cau sai thanh mot diem hoc lai co he thong thay vi doc dap an roi bo qua.',
    category: 'Grammar',
    author: 'IVYTS Editorial',
    readMinutes: 5,
    publishedAt: '2026-04-28',
    coverImage:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
    content: [
      'Moi khi sai cau ngu phap, hay ghi lai 3 thu: dang cau hoi, ly do sai va dau hieu de nhan ra lan sau. Chi can ngan gon, nhung phai deu.',
      'Sau 1-2 tuan, nhin lai error log se thay nhom loi lap lai: verb forms, lien tu, word form hay bi dong. Day moi la noi can dau tu thoi gian on lai.',
      'Hoc ngu phap bang error log giup tiet kiem thoi gian va tang ty le dung tren cau hoi cung dang.',
    ],
  },
  {
    slug: 'toeic-mini-test-review-loop',
    title: 'Vong lap mini test va review loi sai de tang score nhanh hon',
    excerpt:
      'Mini test chi co gia tri khi hoc vien sua lai loi sai theo chu ky, khong phai lam de lien tuc.',
    category: 'Mock Test',
    author: 'IVYTS Coaching Team',
    readMinutes: 4,
    publishedAt: '2026-04-25',
    coverImage:
      'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6',
    content: [
      'Mini test nen duoc dung nhu mot buoc do nhiet do, khong phai thay the toan bo viec hoc. Sau moi bai, can co mot buoi review ngan de tach loi ra thanh nhom.',
      'Neu chi lam bai moi ma khong sua loi, diem co the dao dong nhung rat kho tang ben vung. Vong lap tot nhat la: lam bai, review, on lai, lam lai bai cung dang.',
      'Chinh chu ky lap lai nay moi giup hoc vien thay duoc tien bo that tren dashboard va ket qua bai lam.',
    ],
  },
];
