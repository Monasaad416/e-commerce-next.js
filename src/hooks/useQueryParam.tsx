import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useQueryParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(key);

  const setValue = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!val) {
      params.delete(key);
    } else {
      params.set(key, val);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { value, setValue };
}
