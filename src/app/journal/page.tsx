import { articles } from '@/lib/journal-data';
import { JournalGrid } from '@/components/customer/JournalGrid';

export const metadata = { title: 'Journal · MARIASCLUB™' };

export default function JournalPage() {
  return <JournalGrid articles={articles} />;
}
