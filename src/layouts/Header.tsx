import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Atom, Wallet, LogOut, ChevronRight } from 'lucide-react';
import { useConnect } from '@/hooks/useConnect';
import { Button, ThemeToggle } from '@/components';
import { ROUTES } from '@/constants/config';

const truncate = (addr: string) =>
  `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export const Header = () => {
  const { isConnected, address, connect, disconnect } = useConnect();
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/element/');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to={ROUTES.TABLE} className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent"
          >
            <Atom size={18} />
          </motion.div>
          <div className="hidden sm:block">
            <span className="font-mono text-sm font-bold text-text-primary tracking-tight">
              Tokenized
            </span>
            <span className="font-mono text-sm font-bold text-accent tracking-tight">
              {' '}Elements
            </span>
          </div>
        </Link>

        {/* Breadcrumb on detail page */}
        {isDetail && (
          <nav className="flex items-center gap-1 text-xs text-text-muted">
            <Link to={ROUTES.TABLE} className="hover:text-text-primary transition-colors">
              Table
            </Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">
              {location.pathname.split('/').pop()?.toUpperCase()}
            </span>
          </nav>
        )}

        {/* Wallet */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse-slow" />
                <span className="font-mono text-xs text-accent">
                  {truncate(address)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={disconnect} title="Disconnect wallet">
                <LogOut size={14} />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={connect}>
              <Wallet size={14} />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
