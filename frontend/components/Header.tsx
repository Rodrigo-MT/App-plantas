import { useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <Appbar.Header>
      {showBack && (
        <Appbar.BackAction onPress={() => router.back()} />
      )}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}