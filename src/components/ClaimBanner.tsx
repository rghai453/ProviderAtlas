import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface ClaimBannerProps {
  npi: string;
}

export function ClaimBanner({ npi }: ClaimBannerProps): React.ReactNode {
  return (
    <Card className="border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/50">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-emerald-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Is this your practice?</p>
            <p className="text-sm text-emerald-700/80">
              Claim this profile to update your information and connect with patients.
            </p>
          </div>
        </div>
        <Link
          href={`mailto:claim@provideratlas.com?subject=Claim NPI ${npi}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-background px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-muted"
        >
          Claim Profile
        </Link>
      </CardContent>
    </Card>
  );
}
