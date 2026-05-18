import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-stroke bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.35em] text-teal-300 uppercase">IVYTS 1997</p>
          <h3 className="mt-4 text-3xl font-black tracking-tight text-white">
            English learning CRM cho TOEIC, IELTS va lop hoc online co tien do ro rang.
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Khoa hoc, mock test, learning progress va inbox noi bo duoc gom trong mot he thong cho hoc vien, giang vien va admin.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">Dieu huong</h4>
          <div className="mt-5 grid gap-3 text-sm">
            <Link to="/courses" className="text-slate-400 transition hover:text-white">Khoa hoc</Link>
            <Link to="/mock-test" className="text-slate-400 transition hover:text-white">Luyen thi</Link>
            <Link to="/blog" className="text-slate-400 transition hover:text-white">Bai viet</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">Tai nguyen</h4>
          <div className="mt-5 grid gap-3 text-sm">
            <Link to="/portfolio" className="text-slate-400 transition hover:text-white">Giang vien va feedback</Link>
            <Link to="/blog" className="text-slate-400 transition hover:text-white">Study guides</Link>
            <Link to="/admin/login" className="text-slate-400 transition hover:text-white">Admin portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
