import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkKey}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#a78bfa',
          colorBackground: '#050505',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorInputBackground: '#0a0a0a',
          colorInputText: '#ffffff',
          colorNeutral: '#1f1f1f',
          borderRadius: '0.75rem',
          fontFamily: '"Geist Variable", Inter, system-ui, sans-serif',
        },
        elements: {
          modalBackdrop: 'bg-black/80 backdrop-blur-md',
          card:
            'border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.16),transparent_30%),#050505] shadow-2xl shadow-brand-700/20',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton:
            'border border-dark-500 bg-dark-700 text-white hover:bg-dark-600',
          socialButtonsBlockButtonText: 'text-white font-semibold',
          dividerLine: 'bg-dark-500',
          dividerText: 'text-gray-500',
          formFieldLabel: 'text-gray-300',
          formFieldInput:
            'rounded-xl border-dark-500 bg-dark-700 text-white placeholder:text-gray-500 focus:border-brand-500 focus:ring-brand-500',
          formButtonPrimary:
            'rounded-xl bg-brand-500 font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-400',
          footerActionText: 'text-gray-400',
          footerActionLink: 'font-semibold text-violet-300 hover:text-white',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-violet-300 hover:text-white',
          userButtonPopoverCard:
            'border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.32),transparent_36%),#050505] text-white shadow-2xl shadow-brand-700/20',
          userButtonPopoverActionButton:
            'text-gray-200 hover:bg-white/10 hover:text-white',
          userButtonPopoverActionButtonText: 'text-white',
          userButtonPopoverActionButtonIcon: 'text-white',
          userButtonPopoverCustomItemButton:
            'text-white opacity-100 hover:bg-white/10 hover:text-white',
          userButtonPopoverCustomItemButtonIconBox: 'text-white opacity-100',
          userButtonPopoverActionItemButtonIcon: 'text-white opacity-100',
          userPreviewMainIdentifier: 'text-white',
          userPreviewSecondaryIdentifier: 'text-gray-400',
          userButtonPopoverFooter: 'border-t border-white/10 bg-black',
          userProfileRoot:
            'bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.42),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(109,40,217,0.36),transparent_30%),#2e1065] text-white',
          userProfilePage:
            'bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.28),transparent_36%),#3b0764] text-white',
          userProfileNavbar:
            'bg-[linear-gradient(180deg,rgba(126,34,206,0.96),rgba(59,7,100,0.98)),#3b0764] text-white',
          userProfileNavbarButton:
            'text-gray-200 hover:bg-white/10 hover:text-white data-[active=true]:bg-violet-500/20 data-[active=true]:text-violet-100',
          profileSectionTitle: 'text-white',
          profileSectionContent: 'text-gray-100',
          profilePage: 'bg-transparent text-white',
          profileSection: 'border-white/10',
          profileSectionPrimaryButton: 'text-violet-200 hover:text-white',
          profileSectionItem: 'border-white/10 text-white',
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
