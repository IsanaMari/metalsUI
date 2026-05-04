import { Atom, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/config';

export const Footer = () => (
  <footer className="mt-auto border-t border-border bg-surface">
    <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
      <div className="flex items-center gap-2 text-text-muted">
        <Atom size={14} className="text-accent" />
        <span className="font-mono text-xs">
          &copy; {new Date().getFullYear()} Tokenized Elements — All rights reserved
        </span>
      </div>

      <nav className="flex items-center gap-6">
        <Link
          to={ROUTES.TABLE}
          className="font-mono text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          Marketplace
        </Link>
        <a
          href="#"
          className="font-mono text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          Docs
        </a>
        <a
          href="#"
          className="font-mono text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          Audits
        </a>
        <div className="flex items-center gap-3 pl-2">
          <a href="#" className="text-text-muted transition-colors hover:text-text-primary" aria-label="GitHub">
            <Github size={14} />
          </a>
          <a href="#" className="text-text-muted transition-colors hover:text-text-primary" aria-label="Twitter">
            <Twitter size={14} />
          </a>
        </div>
      </nav>
    </div>
  </footer>
);
