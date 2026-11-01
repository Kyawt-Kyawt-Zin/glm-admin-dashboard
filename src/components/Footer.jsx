function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
      © {currentYear} Golden Loom Myanmar. All rights reserved.
    </footer>
  );
}

export default Footer;
