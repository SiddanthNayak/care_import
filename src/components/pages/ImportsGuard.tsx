import { navigate } from "raviger";
import { useEffect, useState } from "react";

import { request } from "@/apis/request";

interface ImportsGuardProps {
  facilityId: string;
  children: React.ReactNode;
}

interface CurrentUser {
  id: string;
  is_superuser?: boolean;
}

export default function ImportsGuard({
  facilityId,
  children,
}: ImportsGuardProps) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const user = await request<CurrentUser>(
          "/api/v1/users/getcurrentuser/",
          { method: "GET" },
        );

        if (isMounted) {
          setIsAllowed(Boolean(user?.is_superuser));
        }
      } catch (error) {
        if (isMounted) {
          setIsAllowed(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAllowed === false) {
      navigate(`/facility/${facilityId}`, { replace: true });
    }
  }, [facilityId, isAllowed]);

  if (isAllowed === null) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        Checking access…
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
