function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // <footer className="border-t border-stone-200 bg-white px-8 py-4 text-center text-xs text-slate-500">
    //   © {currentYear} Golden Loom Myanmar. All rights reserved.
    // </footer>
    <footer className="flex h-12 shrink-0 items-center justify-center border-t border-stone-200 bg-white px-4 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} Golden Loom Myanmar. All rights reserved.
    </footer>
  );
}

export default Footer;
