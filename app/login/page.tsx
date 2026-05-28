import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-navy flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-mikkal-glow pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-charcoal border border-brand-border flex items-center justify-center">
            <span className="font-display font-bold text-xl text-brand-cyan">M</span>
          </div>
          <span className="font-display font-bold text-3xl text-brand-white">Mikkal</span>
        </div>
        <SignIn 
          routing="hash"
          forceRedirectUrl="/dashboard"
          signUpUrl="/login"
        />
      </div>
    </main>
  )
}