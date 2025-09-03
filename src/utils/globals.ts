import { useToast } from "@/components/ui/toast"
import { format, formatDistanceToNow, isAfter, subDays } from "date-fns";
let toast: ReturnType<typeof useToast> | null = null

export function initToast() {
  toast = useToast()
}

export function showToast(title: string, description?: string, variant: "default" | "destructive" = "default") {
  if (!toast) {
    console.warn("Toast not initialized. Make sure to call initToast() in App.vue or main.ts.")
    return
  }

  toast.toast({
    title,
    description,
    variant,
  })
}


export function formatDate(date?: string) {
  if (!date) return '';
  const dateObj = new Date(date);
  const sevenDaysAgo = subDays(new Date(), 7);

  if (isAfter(dateObj, sevenDaysAgo)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  return format(dateObj, "dd/MM/yyyy, HH:mm");
};

interface PaginationMeta {
  current_page?: number;
  last_page?: number;
}

interface PaginationItem {
  type: 'page' | 'ellipsis';
  value?: number;
}

export function calculateDisplayedPages(paginationMeta: PaginationMeta): PaginationItem[] {
  const total = paginationMeta.last_page || 1;
  const current = paginationMeta.current_page || 1;
  const maxPagesToShow = 5;
  const siblingCount = Math.floor((maxPagesToShow - 3) / 2);

  if (total <= maxPagesToShow) {
    return Array.from({ length: total }, (_, i) => ({
      type: 'page',
      value: i + 1
    }));
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const shouldShowLeftDots = leftSibling > 2;
  const shouldShowRightDots = rightSibling < total - 1;

  const result: PaginationItem[] = [];

  result.push({ type: 'page', value: 1 });

  if (shouldShowLeftDots) {
    result.push({ type: 'ellipsis' });
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1) {
      result.push({ type: 'page', value: i });
    }
  }

  if (shouldShowRightDots) {
    result.push({ type: 'ellipsis' });
  }

  if (rightSibling < total) {
    result.push({ type: 'page', value: total });
  }

  return result;
}