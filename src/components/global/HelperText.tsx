import { ThemedText } from '@/components/global/themed-text';

export default function HelperText({ children }: { children: string }) {
  return (
    <ThemedText style={{ marginTop: 6, fontSize: 10, color: '#FF3030' }}>{children}</ThemedText>
  );
}
