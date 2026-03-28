import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: HomeIcon },
  { to: ROUTES.customers, label: 'Customers', icon: UserGroupIcon },
  { to: ROUTES.projects, label: 'Projects', icon: ClipboardDocumentListIcon },
  { to: ROUTES.settings, label: 'Settings', icon: Cog6ToothIcon },
]

function NavItems({ onClose }: { onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              isActive
                ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <WrenchScrewdriverIcon className="h-6 w-6 text-sky-600" />
        <span className="font-bold text-slate-900 dark:text-slate-100 text-base">Hammertime</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavItems onClose={onClose} />
      </div>
    </div>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-200"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-64 flex-col">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <SidebarContent onClose={onClose} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:shrink-0">
        <SidebarContent />
      </div>
    </>
  )
}
