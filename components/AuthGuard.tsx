'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('locker_user_id');
    
    if (!userId) {
      // If no ID found, kick them to signup
      router.push('/signup');
    } else {
      // If ID exists, let them see the feed
      setIsAuthorized(true);
    }
  }, [router]);

  // While checking, show nothing (or a loading spinner)
  if (!isAuthorized) {
    return null; 
  }

  return <>{children}</>;
}